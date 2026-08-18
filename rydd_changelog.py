#!/usr/bin/env python3
"""
Månedsrydding av endringsloggen (v0.827).

Endringsloggen lastes ved hver appstart (nett-først), så hver bruker betaler
for hele historikken hver gang — målt 490 KB / 356 poster da rutinen ble
innført. Avtalen med Rune: siste måned står i full detalj i appen; eldre
måneder kondenseres til én samlepost hver, og ALLE detaljposter flyttes
TAPSFRITT hit til CHANGELOG-ARKIV.md (lesbar rett på GitHub, lastes aldri
av appen). Flytting, ikke kopi — to dommere-doktrinen brytes ikke.

Bruk (månedsrutinen, ved månedsskifte — rydd forrige hele måned):
    python3 rydd_changelog.py "juli 2026"

Skriptet gjør det mekaniske og verifiserbare:
  1. Leser changelog.js og finner alle poster med d == måneden.
  2. Krever at de ligger som én sammenhengende blokk (nyeste først-ordenen
     gjør at en hel måned alltid gjør det) — ellers stoppes alt.
  3. Skriver postene inn øverst i CHANGELOG-ARKIV.md, begge språk, tapsfritt.
  4. Klipper blokken ut av changelog.js (ren tekst-kirurgi — resten av fila
     beholder formateringen sin, så diffen er lesbar).
  5. Verifiserer: ny changelog.js parser fortsatt (node), antallet stemmer
     på gram (fjernet == arkivert), og hver arkivert versjon+punkt finnes
     ordrett i arkivfila.

Det redaksjonelle — samleposten med månedens store løft — skrives ETTERPÅ,
for hånd, inn der blokken sto. Skriptet minner om det ved suksess.
"""
import json, re, subprocess, sys, os

ROT = os.path.dirname(os.path.abspath(__file__))
LOGG = os.path.join(ROT, "changelog.js")
ARKIV = os.path.join(ROT, "CHANGELOG-ARKIV.md")


def les_changelog():
    """Parser changelog.js med node — samme tolkning som nettleseren."""
    ut = subprocess.run(
        ["node", "-e",
         "const fs=require('fs');"
         f"const src=fs.readFileSync({json.dumps(LOGG)},'utf8');"
         "const CG=new Function(src+';return CHANGELOG;')();"
         "console.log(JSON.stringify(CG));"],
        capture_output=True, text=True)
    if ut.returncode != 0:
        sys.exit(f"KLARTE IKKE PARSE changelog.js:\n{ut.stderr}")
    return json.loads(ut.stdout)


def til_markdown(poster, maaned):
    linjer = [f"## {maaned} (v{poster[-1]['v']} – v{poster[0]['v']})", ""]
    for p in poster:
        linjer.append(f"### v{p['v']}")
        for c in p["changes"]:
            linjer.append(f"- {c}")
        if p.get("changes_en"):
            linjer.append("")
            linjer.append(f"*English ({p.get('d_en', '')}):*")
            for c in p["changes_en"]:
                linjer.append(f"- {c}")
        linjer.append("")
    return "\n".join(linjer)


def main():
    if len(sys.argv) != 2:
        sys.exit('Bruk: python3 rydd_changelog.py "<måned år>"  (f.eks. "juli 2026")')
    maaned = sys.argv[1]

    alle = les_changelog()
    valgt = [p for p in alle if p["d"] == maaned]
    if not valgt:
        sys.exit(f"Ingen poster med d == «{maaned}» — ingenting å rydde.")
    idx = [i for i, p in enumerate(alle) if p["d"] == maaned]
    if idx != list(range(idx[0], idx[0] + len(idx))):
        sys.exit(f"Postene for «{maaned}» er ikke én sammenhengende blokk — rydd manuelt.")

    kilde = open(LOGG, encoding="utf-8").read()

    # Tekst-kirurgi: klipp fra åpningskrøllen til første post i blokken, til og
    # med lukkekrøllen til siste post (pluss et eventuelt etterfølgende komma).
    merke = f'"d": "{maaned}"'
    foerste = kilde.find(merke)
    start = kilde.rfind("\n  {", 0, foerste)
    if foerste < 0 or start < 0:
        sys.exit("Fant ikke blokkstart i kildeteksten — formatet har endret seg.")
    # Slutt: siste forekomst av merket, deretter blokkens "  }" (med evt. komma).
    siste = kilde.rfind(merke)
    slutt_m = re.compile(r"\n  \},?", ).search(kilde, siste)
    if not slutt_m:
        sys.exit("Fant ikke blokkslutt i kildeteksten — formatet har endret seg.")
    slutt = slutt_m.end()
    # Ryddes en hale (vanligst): fjern også komma som nå ville stått sist.
    ny = kilde[:start] + kilde[slutt:]
    ny = re.sub(r",(\s*\];)", r"\1", ny)

    # Arkivet: nye måneder legges ØVERST (under tittelblokken), nyeste først.
    md = til_markdown(valgt, maaned)
    if os.path.exists(ARKIV):
        eksisterende = open(ARKIV, encoding="utf-8").read()
        deler = eksisterende.split("\n## ", 1)
        hode = deler[0].rstrip() + "\n\n"
        rest = ("## " + deler[1]) if len(deler) > 1 else ""
        arkiv_ny = hode + md + ("\n" + rest if rest else "")
    else:
        arkiv_ny = (
            "# Endringslogg — arkiv (UltimatePizza)\n\n"
            "Tapsfri flytting av eldre endringslogg-poster som er ryddet ut av appen\n"
            "(månedsrutinen fra v0.827: siste måned står i full detalj i appen, eldre\n"
            "måneder kondenseres der til én samlepost hver — detaljene bor her).\n"
            "Nyeste måned øverst; innen hver måned nyeste versjon først.\n\n" + md)

    open(ARKIV, "w", encoding="utf-8").write(arkiv_ny)
    open(LOGG, "w", encoding="utf-8").write(ny)

    # Verifisering — porten for selve flyttingen.
    etter = les_changelog()
    arkivtekst = open(ARKIV, encoding="utf-8").read()
    feil = []
    if len(etter) != len(alle) - len(valgt):
        feil.append(f"antall: {len(alle)} - {len(valgt)} != {len(etter)}")
    if any(p["d"] == maaned for p in etter):
        feil.append("det ligger igjen poster for måneden i changelog.js")
    for p in valgt:
        if f"### v{p['v']}" not in arkivtekst:
            feil.append(f"v{p['v']} mangler i arkivet")
        for c in p["changes"] + p.get("changes_en", []):
            if f"- {c}" not in arkivtekst:
                feil.append(f"v{p['v']}: et punkt mangler ordrett i arkivet")
                break
    if feil:
        sys.exit("VERIFISERING FEILET — rull tilbake med git checkout:\n  " +
                 "\n  ".join(feil))

    print(f"OK: {len(valgt)} poster ({maaned}, v{valgt[-1]['v']}–v{valgt[0]['v']}) "
          f"flyttet til CHANGELOG-ARKIV.md og fjernet fra changelog.js.")
    print("HUSK: skriv samleposten for måneden inn i changelog.js der blokken sto, "
          "og kjør test_regression.py før fletting.")


if __name__ == "__main__":
    main()
