#!/usr/bin/env python3
"""
F28 / lag 3: språkmodell-gjennomgang av HELE plan-matrisen.

Hvorfor dette finnes
--------------------
`test_regression.py` (lag 1, v0.739) håndhever tre invarianter over metode ×
type × ovnstype: massebalanse, vaghetslint og forvarming. De fanger tre av de
fire klassene motsigelser den manuelle gjennomgangen fant i v0.736–v0.738.

Den fjerde klassen kan ikke regnes på. «Gjæren løses i vannet på forhånd» er
ikke et galt tall — det er en påstand om rekkefølge som motsier tidsplanen.
Ingen aritmetikk ser den. Det gjør en språkmodell.

Appen har allerede halve løsningen: `copyP()` legger ved en sjekk-instruksjon
når du kopierer en plan. Det som manglet var å kjøre den systematisk over alle
konfigurasjoner i stedet for den ene planen du tilfeldigvis kopierte. Det er
det dette skriptet gjør.

Dette er BEVISST ikke en del av testrunden. Den er ikke-deterministisk og kan
derfor ikke blokkere en commit — to kjøringer på samme kode kan gi ulike funn.
Kjør den på forespørsel, les funnene med skjønn, og fiks det som er ekte.

Bruk
----
    export ANTHROPIC_API_KEY=sk-ant-...        (eller kjør `ant auth login`)
    python3 review_plans.py                    # hele matrisen, med verifisering
    python3 review_plans.py --metoder poolish biga --typer newyork
    python3 review_plans.py --uten-verifisering # halv kostnad, mer støy
    python3 review_plans.py --tørrkjøring       # ingen API-kall, viser prompten

Kostnad: hele matrisen (60 konfigurasjoner) med verifisering lander typisk på
noen få dollar. `--uten-verifisering` halverer det. `--grense N` kutter antallet
konfigurasjoner når du bare vil se om oppsettet virker.

To-trinns design
----------------
1. GJENNOMGANG   — én modell leser planen og rapporterer motsigelser.
2. VERIFISERING  — en uavhengig modell forsøker å MOTBEVISE hvert funn, uten å
                   vite at det kom fra en gjennomgang. Funn som ikke overlever,
                   havner nederst i rapporten i stedet for å bli presentert som
                   ekte. Uten dette leddet drukner de reelle funnene i plausible
                   påstander, og da er hele verktøyet verdiløst.
"""
import argparse
import json
import os
import re
import sys
import http.server
import socketserver
import threading
from concurrent.futures import ThreadPoolExecutor

METODER = ["standard", "poolish", "biga", "mania", "hurtig", "kveld"]
TYPER = ["napoletana", "newyork", "langpanne", "chicago", "ingenelting"]
OVNER = ["vanlig", "pizza"]

# Fast anker, som i test_regression.py — planen skal vurderes på innholdet,
# ikke på hvilken ukedag den tilfeldigvis lander på.
ANKER = "2027-03-03T10:00:00"

MODELL = "claude-opus-5"

# ===== PROMPTER =====================================================
# Ordlyden er arvet fra sjekk-instruksjonen i `copyP()` (index.html) — den er
# uttestet: det var den som produserte funnene i v0.736–v0.738. Endringene her
# er (a) en eksplisitt avgrensning mot smaksråd og bransjenormer, som var den
# største kilden til støy, og (b) krav om ordrett sitat fra BEGGE sidene av
# motsigelsen, slik at et menneske kan avvise et falskt funn på ti sekunder.

SYSTEM_GJENNOMGANG = """\
Du gjennomgår en generert pizzaplan for INTERNE MOTSIGELSER.

En motsigelse er to steder i DETTE dokumentet som ikke begge kan være sanne:
- samme tid, temperatur eller mengde oppgitt ulikt to steder
- et steg som forutsetter noe et tidligere steg ikke har gjort
- en påstand om rekkefølge, årsak eller teknikk som motsier tidsplanen
- en ingrediens i ingredienslista som ingen steg ber deg bruke, eller omvendt
- en instruksjon som ber deg gjøre noe to ganger, eller aldri

Dette er IKKE motsigelser, og skal ikke rapporteres:
- at et tall avviker fra bransjenorm, tradisjon eller det du selv ville valgt
- smaks-, teknikk- eller utstyrspreferanser
- forslag til forbedringer, forenklinger eller tillegg
- at noe kunne vært forklart tydeligere
- at planen utelater noe den aldri lovet å dekke

Vurder utelukkende mot det som faktisk står i dokumentet. Du har ikke tilgang
til appens kildekode og skal ikke gjette på hva den «egentlig mener».

For hvert funn må du sitere ORDRETT fra begge sidene av motsigelsen. Klarer du
ikke det, er det ikke et funn — da utelater du det. Det er langt bedre å
rapportere ingenting enn å rapportere noe plausibelt som ikke holder.

Finner du ingen motsigelser, returnerer du en tom liste. Det er et helt normalt
og forventet utfall."""

SYSTEM_VERIFISERING = """\
Du er skeptiker. Du får en pizzaplan og en PÅSTAND om at planen motsier seg
selv. Oppgaven din er å forsøke å MOTBEVISE påstanden.

Gå gjennom dette i rekkefølge:
1. Står de siterte tekstene faktisk i dokumentet, ordrett? Er et sitat oppdiktet
   eller omskrevet, er påstanden motbevist.
2. Kan begge tekstene være sanne samtidig — for eksempel fordi de gjelder ulike
   steg, ulike tidspunkter, ulike deler av deigen, eller fordi den ene er et
   generelt råd og den andre en konkret instruksjon?
3. Er dette egentlig en smaks- eller normvurdering forkledd som en motsigelse?

Standarden er streng: du konkluderer med at påstanden holder KUN hvis begge
tekstene står der ordrett og de umulig kan være sanne samtidig. Er du i tvil,
er påstanden motbevist. Falske funn koster mer enn tapte funn her, fordi et
verktøy som rapporterer støy blir slått av."""

SKJEMA_GJENNOMGANG = {
    "type": "object",
    "properties": {
        "funn": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "oppsummering": {
                        "type": "string",
                        "description": "Én setning: hva motsier hva.",
                    },
                    "sitat_a": {
                        "type": "string",
                        "description": "Ordrett sitat fra den ene siden av motsigelsen.",
                    },
                    "sitat_b": {
                        "type": "string",
                        "description": "Ordrett sitat fra den andre siden.",
                    },
                    "hvorfor_uforenlige": {
                        "type": "string",
                        "description": "Hvorfor de to ikke kan være sanne samtidig.",
                    },
                    "konsekvens": {
                        "type": "string",
                        "description": "Hva som faktisk går galt for den som følger planen.",
                    },
                    "alvorlighet": {
                        "type": "string",
                        "enum": ["høy", "middels", "lav"],
                        "description": "høy = deigen blir feil; middels = du blir forvirret eller mister tid; lav = skjønnhetsfeil.",
                    },
                },
                "required": [
                    "oppsummering",
                    "sitat_a",
                    "sitat_b",
                    "hvorfor_uforenlige",
                    "konsekvens",
                    "alvorlighet",
                ],
                "additionalProperties": False,
            },
        }
    },
    "required": ["funn"],
    "additionalProperties": False,
}

SKJEMA_VERIFISERING = {
    "type": "object",
    "properties": {
        "holder": {
            "type": "boolean",
            "description": "true kun hvis påstanden overlevde forsøket på å motbevise den.",
        },
        "begrunnelse": {
            "type": "string",
            "description": "Kort: hvorfor den holder, eller hva som motbeviser den.",
        },
        "sitater_finnes": {
            "type": "boolean",
            "description": "Står begge de siterte tekstene ordrett i dokumentet?",
        },
    },
    "required": ["holder", "begrunnelse", "sitater_finnes"],
    "additionalProperties": False,
}


# ===== PLANUTTREKK ==================================================
# copyP() legger en instruksjon foran planen, skrevet for et menneske som limer
# den inn i en chat MED nettilgang. Fra v0.749 ber den om å slå opp lignende
# oppskrifter på nett. Modellen her har ingen nettilgang, så den instruksjonen
# ville bare gitt oppdiktede sammenligninger — og skriptet har uansett sin egen
# systemprompt. Derfor klippes innledningen vekk: planen starter på versjonslinja.
PLAN_START = re.compile(r"^UltimatePizza v", re.M)


def uten_instruksjon(plan):
    """Planteksten uten innledningen copyP() skriver for menneskelig bruk."""
    m = PLAN_START.search(plan)
    return plan[m.start():] if m else plan


def hent_planer(konfigurasjoner, index_path="index.html"):
    """Kjører appen i en headless nettleser og henter ut planteksten for hver
    konfigurasjon — via `copyP()`, så teksten er NØYAKTIG den brukeren limer
    inn. Gjennomgangen ser da det brukeren ser, ikke en parallell gjengivelse
    som kan avvike."""
    from playwright.sync_api import sync_playwright

    # Feil høylytt hvis index.html ikke finnes. Uten denne sjekken serverte
    # skriptet bare katalogen det tilfeldigvis sto i, siden fikk 404, og JS-en
    # feilet med et kryptisk «S is not defined» langt nedstrøms.
    if not os.path.isfile(index_path):
        sys.exit(f"Fant ikke {index_path!r}. Kjør fra repoet, eller bruk --index <sti>.")
    index_dir = os.path.dirname(os.path.abspath(index_path)) or "."
    os.chdir(index_dir)
    httpd = socketserver.TCPServer(("", 0), http.server.SimpleHTTPRequestHandler)
    port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start()

    js = """(konfigurasjoner) => {
      const ut = [];
      let fanget = '';
      try {
        if (!navigator.clipboard) {
          Object.defineProperty(navigator, 'clipboard', {value: {}, configurable: true});
        }
        navigator.clipboard.writeText = (t) => { fanget = t; return Promise.resolve(); };
      } catch (e) {}
      for (const k of konfigurasjoner) {
        S.method = k.metode; S.type = k.type; S.oven = k.ovn; S.mode = 'start';
        S.mel = 500; S.hydro = 65; S.cold = 48; S.temp = 22; S.fridgeC = 3;
        S.gjaer = 'torr'; S.hurtigH = 4; S.kveldH = 10; S.poolishH = 14; S.bigaH = 18;
        let steg = null;
        try { steg = stepsForAnchor(new Date(ANKER_ISO)); }
        catch (e) { ut.push({...k, feil: '' + e}); continue; }
        if (!steg || !steg.length) { ut.push({...k, feil: 'ingen steg'}); continue; }
        fanget = '';
        try { copyP(steg); } catch (e) { ut.push({...k, feil: 'copyP: ' + e}); continue; }
        ut.push({...k, plan: fanget});
      }
      return ut;
    }""".replace("ANKER_ISO", f"'{ANKER}'")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(
            viewport={"width": 390, "height": 844},
            timezone_id="Europe/Oslo",
            locale="nb-NO",
        )
        page = ctx.new_page()
        page.add_init_script(
            "localStorage.setItem('pizzaUser', JSON.stringify({id:'review',name:'Review'}));"
        )
        page.goto(f"http://localhost:{port}/{os.path.basename(index_path)}")
        page.wait_for_timeout(1200)
        page.evaluate("window._planChosen=true")
        resultat = page.evaluate(js, konfigurasjoner)
        browser.close()
    httpd.shutdown()
    return resultat


def rens_plan(tekst):
    """Fjerner sjekk-instruksjonen og versjons-/tidsstempel-linja fra toppen.

    Instruksjonen erstattes av systemprompten over (to konkurrerende
    instruksjoner gjør gjennomgangen dårligere, ikke bedre), og tidsstempelet
    er ren støy som dessuten ville gjort prompten ucachbar."""
    linjer = tekst.split("\n")
    for i, linje in enumerate(linjer):
        if linje.strip() == "PIZZAPLAN" or linje.strip() == "PIZZA PLAN":
            return "\n".join(linjer[i:]).strip()
    return tekst.strip()


# ===== API ==========================================================
def lag_klient():
    import anthropic

    try:
        return anthropic.Anthropic()
    except Exception as e:
        sys.exit(
            f"Fikk ikke opprettet API-klient: {e}\n"
            "Sett ANTHROPIC_API_KEY, eller kjør `ant auth login`."
        )


def _kall(klient, system, bruker, skjema, effort):
    """Ett strukturert kall. Returnerer (data, feilmelding)."""
    import anthropic

    try:
        svar = klient.messages.create(
            model=MODELL,
            max_tokens=16000,
            system=[{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
            thinking={"type": "adaptive"},
            output_config={
                "effort": effort,
                "format": {"type": "json_schema", "schema": skjema},
            },
            messages=[{"role": "user", "content": bruker}],
        )
    except anthropic.APIStatusError as e:
        return None, f"API-feil {e.status_code}: {e.message}"
    except anthropic.APIConnectionError as e:
        return None, f"nettverksfeil: {e}"

    # Sjekk stop_reason FØR innholdet leses — ved refusal er content tom eller
    # delvis, og en blind content[0] ville krasjet her.
    if svar.stop_reason == "refusal":
        detaljer = getattr(svar, "stop_details", None)
        kat = getattr(detaljer, "category", None) if detaljer else None
        return None, f"modellen avslo forespørselen (kategori: {kat})"
    if svar.stop_reason == "max_tokens":
        return None, "svaret ble avkortet (max_tokens) — kjør på nytt"

    tekst = next((b.text for b in svar.content if b.type == "text"), None)
    if not tekst:
        return None, "tomt svar"
    try:
        return json.loads(tekst), None
    except json.JSONDecodeError as e:
        return None, f"ugyldig JSON i svaret: {e}"


def gjennomgå(klient, oppf, effort):
    bruker = (
        f"Konfigurasjon: metode={oppf['metode']} · type={oppf['type']} · ovn={oppf['ovn']}\n\n"
        f"{uten_instruksjon(oppf['plan'])}"
    )
    data, feil = _kall(klient, SYSTEM_GJENNOMGANG, bruker, SKJEMA_GJENNOMGANG, effort)
    if feil:
        return {**oppf, "feil": feil, "funn": []}
    return {**oppf, "funn": data.get("funn", [])}


def verifiser(klient, oppf, funn, effort):
    bruker = (
        f"{uten_instruksjon(oppf['plan'])}\n\n"
        f"=== PÅSTAND SOM SKAL ETTERPRØVES ===\n"
        f"Påstand: {funn['oppsummering']}\n"
        f"Siterer: «{funn['sitat_a']}»\n"
        f"mot:     «{funn['sitat_b']}»\n"
        f"Begrunnelse gitt: {funn['hvorfor_uforenlige']}\n\n"
        f"Forsøk å motbevise denne påstanden."
    )
    data, feil = _kall(klient, SYSTEM_VERIFISERING, bruker, SKJEMA_VERIFISERING, effort)
    if feil:
        return {"holder": None, "begrunnelse": f"verifisering feilet: {feil}", "sitater_finnes": None}
    return data


# ===== RAPPORT ======================================================
def _blokk(oppf, funn, verdikt=None):
    ut = [
        f"### {oppf['metode']} / {oppf['type']} / {oppf['ovn']} — {funn['alvorlighet']}",
        "",
        f"**{funn['oppsummering']}**",
        "",
        f"> {funn['sitat_a']}",
        "",
        "står mot",
        "",
        f"> {funn['sitat_b']}",
        "",
        f"{funn['hvorfor_uforenlige']}",
        "",
        f"*Konsekvens:* {funn['konsekvens']}",
    ]
    if verdikt and verdikt.get("begrunnelse"):
        ut += ["", f"*Verifisering:* {verdikt['begrunnelse']}"]
    return "\n".join(ut) + "\n"


def lag_rapport(resultater, verifisert):
    rang = {"høy": 0, "middels": 1, "lav": 2}
    bekreftet, avvist, feilet = [], [], []

    for r in resultater:
        if r.get("feil"):
            feilet.append(r)
        for f in r.get("funn", []):
            v = verifisert.get(id(f))
            if v is None or v.get("holder") is True or v.get("holder") is None:
                bekreftet.append((r, f, v))
            else:
                avvist.append((r, f, v))

    bekreftet.sort(key=lambda x: rang.get(x[1]["alvorlighet"], 9))
    ant_konf = len([r for r in resultater if not r.get("feil")])

    ut = [
        "# Lag 3 — språkmodell-gjennomgang av plan-matrisen",
        "",
        f"Modell: `{MODELL}` · {ant_konf} konfigurasjoner gjennomgått"
        + (" · funn verifisert av en uavhengig skeptiker" if verifisert else " · UTEN verifisering"),
        "",
        "Dette er ikke-deterministisk. To kjøringer på samme kode kan gi ulike funn.",
        "Les hvert funn og vurder det selv — sitatene er der for at det skal gå raskt.",
        "",
    ]

    if not bekreftet and not avvist:
        ut += ["## Ingen motsigelser funnet", "",
               "Det er et normalt utfall, ikke et tegn på at gjennomgangen ikke kjørte.", ""]
    else:
        ut += [f"## Funn som holdt ({len(bekreftet)})", ""]
        ut += [_blokk(r, f, v) for r, f, v in bekreftet] or ["Ingen.", ""]

    if avvist:
        ut += [
            "",
            f"## Motbevist av verifiseringen ({len(avvist)})",
            "",
            "Disse ble rapportert av gjennomgangen, men falt på en uavhengig etterprøving.",
            "De står her for innsyn, ikke som noe å handle på.",
            "",
        ]
        ut += [_blokk(r, f, v) for r, f, v in avvist]

    if feilet:
        ut += ["", f"## Konfigurasjoner som ikke ble gjennomgått ({len(feilet)})", ""]
        ut += [f"- {r['metode']}/{r['type']}/{r['ovn']}: {r['feil']}" for r in feilet]
        ut += [""]

    return "\n".join(ut)


# ===== HOVEDPROGRAM =================================================
def main():
    ap = argparse.ArgumentParser(
        description="Lag 3: språkmodell-gjennomgang av plan-matrisen (kjøres på forespørsel, ikke i testrunden).",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    ap.add_argument("--metoder", nargs="+", default=METODER, choices=METODER)
    ap.add_argument("--typer", nargs="+", default=TYPER, choices=TYPER)
    ap.add_argument("--ovner", nargs="+", default=OVNER, choices=OVNER)
    ap.add_argument("--grense", type=int, help="Maks antall konfigurasjoner (for en rask prøvekjøring).")
    ap.add_argument("--uten-verifisering", action="store_true",
                    help="Hopp over skeptiker-passet. Halv kostnad, vesentlig mer støy.")
    ap.add_argument("--tørrkjøring", action="store_true",
                    help="Hent planene og vis prompten, men ikke kall API-et.")
    ap.add_argument("--effort", default="high", choices=["low", "medium", "high", "xhigh", "max"])
    ap.add_argument("--parallelle", type=int, default=4, help="Samtidige API-kall (standard 4).")
    ap.add_argument("--ut", default="lag3_rapport.md", help="Filnavn for rapporten.")
    # Ligger ved siden av skriptet i repoet, så skriptet kan kjøres fra hvor som helst.
    ap.add_argument("--index", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "index.html"))
    args = ap.parse_args()

    konfigurasjoner = [
        {"metode": m, "type": t, "ovn": o}
        for m in args.metoder
        for t in args.typer
        for o in args.ovner
    ]
    if args.grense:
        konfigurasjoner = konfigurasjoner[: args.grense]

    rapport_sti = os.path.abspath(args.ut)
    print(f"Henter {len(konfigurasjoner)} planer fra appen …", flush=True)
    planer = hent_planer(konfigurasjoner, args.index)
    gyldige = [p for p in planer if p.get("plan")]
    print(f"  {len(gyldige)} planer hentet, {len(planer) - len(gyldige)} feilet.", flush=True)

    if args.tørrkjøring:
        print("\n=== SYSTEMPROMPT (gjennomgang) ===")
        print(SYSTEM_GJENNOMGANG)
        if gyldige:
            p = gyldige[0]
            print(f"\n=== BRUKERMELDING, første konfigurasjon ({p['metode']}/{p['type']}/{p['ovn']}) ===")
            print(rens_plan(p["plan"])[:2500])
            print("\n… (avkortet i tørrkjøring)")
        print(f"\nTørrkjøring: ingen API-kall gjort. {len(gyldige)} planer ville blitt gjennomgått.")
        return 0

    for p in gyldige:
        p["plan"] = rens_plan(p["plan"])

    klient = lag_klient()

    print(f"Gjennomgår med {MODELL} (effort={args.effort}) …", flush=True)
    with ThreadPoolExecutor(max_workers=args.parallelle) as pool:
        resultater = list(pool.map(lambda p: gjennomgå(klient, p, args.effort), gyldige))
    resultater += [p for p in planer if not p.get("plan")]

    antall_funn = sum(len(r.get("funn", [])) for r in resultater)
    print(f"  {antall_funn} funn rapportert.", flush=True)

    verifisert = {}
    if antall_funn and not args.uten_verifisering:
        print("Etterprøver hvert funn med en uavhengig skeptiker …", flush=True)
        jobber = [(r, f) for r in resultater for f in r.get("funn", [])]
        with ThreadPoolExecutor(max_workers=args.parallelle) as pool:
            verdikter = list(pool.map(lambda j: verifiser(klient, j[0], j[1], args.effort), jobber))
        for (r, f), v in zip(jobber, verdikter):
            verifisert[id(f)] = v
        holdt = sum(1 for v in verdikter if v.get("holder") is not False)
        print(f"  {holdt} av {antall_funn} holdt.", flush=True)

    rapport = lag_rapport(resultater, verifisert)
    with open(rapport_sti, "w", encoding="utf-8") as fh:
        fh.write(rapport)
    print(f"\nRapport skrevet til {rapport_sti}")

    bekreftet = sum(
        1
        for r in resultater
        for f in r.get("funn", [])
        if verifisert.get(id(f), {}).get("holder") is not False
    )
    # Exit 0 uansett: dette er ikke en test, og et funn er ikke en feil før et
    # menneske har sett på det. Skriptet skal aldri kunne felle en CI-kjøring.
    print(f"{bekreftet} funn å se på." if bekreftet else "Ingen funn.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
