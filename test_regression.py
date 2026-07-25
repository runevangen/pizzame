#!/usr/bin/env python3
"""
Regresjonstest for Pizzaplanlegger sin beregningsmotor (oppskrift + tidsplan).

Hensikt: fryser dagens forventede tall for et sett faste scenarioer (alle
metoder, noen pizzatyper, noen meltyper) slik at en fremtidig kodeendring
som utilsiktet endrer et tall, blir fanget opp automatisk i stedet for at
noen må oppdage det manuelt i appen.

Bruk:
    python3 test_regression.py [sti-til-index.html]

Hvis en test feiler, sjekk om endringen var TILSIKTET (da oppdaterer du
EXPECTED under) eller en reell regresjon (da har du nettopp fanget en bug
før den nådde brukeren).

Scenarioene dekker: Standard, Poolish (romtemperatur + kjøleskap-variant),
Biga, Mania-poolish, Hurtigdeig, Kveldsdeig, og én ikke-napoletansk type
(Chicago) for å fange opp feil i type-spesifikke tabeller også.
"""
import sys, os, json, subprocess, time, http.server, threading, socketserver
from playwright.sync_api import sync_playwright

ANCHOR = "2026-08-01T18:00:00"  # fast, deterministisk ankertidspunkt (mode='start')

SCENARIOS = [
    {"name":"standard_napoletana", "method":"standard","type":"napoletana","mel":500,"hydro":65,"cold":48,"temp":22,"meltype":"doppio_zero"},
    {"name":"poolish_roomtemp",    "method":"poolish","type":"napoletana","mel":500,"hydro":65,"poolishCold":False,"poolishH":14,"cold":24,"temp":22,"meltype":"doppio_zero"},
    {"name":"poolish_cold",        "method":"poolish","type":"napoletana","mel":500,"hydro":65,"poolishCold":True,"poolishH":36,"cold":48,"temp":22,"meltype":"couco"},
    {"name":"poolish_cold_short",  "method":"poolish","type":"napoletana","mel":500,"hydro":65,"poolishCold":True,"poolishH":12,"cold":24,"temp":22,"meltype":"doppio_zero"},
    {"name":"poolish_cold_long",   "method":"poolish","type":"napoletana","mel":500,"hydro":65,"poolishCold":True,"poolishH":48,"cold":24,"temp":22,"meltype":"couco"},
    {"name":"biga",                "method":"biga","type":"napoletana","mel":500,"hydro":65,"bigaH":18,"cold":48,"temp":22,"meltype":"doppio_zero"},
    {"name":"mania",               "method":"mania","type":"napoletana","mel":500,"temp":22},
    {"name":"hurtig",              "method":"hurtig","type":"napoletana","mel":500,"hydro":65,"hurtigH":4,"temp":22},
    {"name":"kveld",               "method":"kveld","type":"napoletana","mel":500,"hydro":65,"kveldH":10,"temp":22},
    {"name":"chicago_biga",        "method":"biga","type":"chicago","mel":600,"hydro":60,"bigaH":18,"cold":72,"temp":22,"meltype":"vanlig_hvetemel"},
]

# Forventede tall lastes fra companion-filen baseline_results.json (samme mappe),
# ikke hardkodet her — se load_full_baseline() under.

def load_full_baseline():
    path = os.path.join(os.path.dirname(__file__), "baseline_results.json")
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def run_scenario(page, sc):
    setup = "S.mode='start';"
    for k, v in sc.items():
        if k == "name":
            continue
        if isinstance(v, str):
            setup += f"S.{k}='{v}';"
        elif isinstance(v, bool):
            setup += f"S.{k}={str(v).lower()};"
        else:
            setup += f"S.{k}={v};"
    stepfn = ("hurtigSteps(anchor).steps" if sc["method"] == "hurtig"
              else "kveldSteps(anchor).steps" if sc["method"] == "kveld"
              else "rawSteps(anchor)")
    return page.evaluate(f"""(() => {{
      {setup}
      const anchor = new Date('{ANCHOR}');
      const steps = {stepfn};
      const recipe = S.method==='mania' ? maniaRecipe() : R();
      return {{
        recipe,
        firstStep: {{title: steps[0].title, iso: new Date(steps[0].at).toISOString()}},
        lastStep: {{title: steps[steps.length-1].title, iso: new Date(steps[steps.length-1].at).toISOString()}},
        stepCount: steps.length,
        stepTitles: steps.map(s=>s.title)
      }};
    }})()""")

def run_behavioral_tests(page):
    """
    Tester som ikke passer inn i frys-tallene-mønsteret over — de sjekker
    ATFERD (hvilket valg søket gjør), ikke bare rene tall. Hver av disse
    kom fra en reell bug funnet og fikset i samtalen.
    """
    results = []

    # Bug: kryss-metode-søket (Beta-fanen) må foretrekke Kveldsdeig for et
    # stramt fredag-mål, siden ingen Poolish/Biga-kombinasjon rekker det uten
    # konflikt. Fant dette manuelt tidligere — fryser det som en ekte test nå.
    r = page.evaluate("""(() => {
      const anchor = nextWeekdayAt(5,19,0);
      const results = searchAllMethods(anchor);
      return { topLabel: results[0].label, topViolations: results[0].violations };
    })()""")
    ok = (r['topLabel'] == 'Kveldsdeig' and r['topViolations'] == 0)
    results.append(('search_prefers_kveld_for_tight_friday', ok, r))

    # Bug: søket foreslo en gang oppstart FØR dagens dato (umulig å følge).
    # Sjekk at ALDRI noe forslag har startIso i fortiden.
    r2 = page.evaluate("""(() => {
      const anchor = new Date(Date.now() + 2*24*3600000);
      const results = searchAllMethods(anchor);
      const top = results[0];
      return { startIso: top.startIso, feasible: top.feasible, nowIso: new Date().toISOString() };
    })()""")
    from datetime import datetime, timezone
    start_dt = datetime.fromisoformat(r2['startIso'].replace('Z', '+00:00'))
    now_dt = datetime.fromisoformat(r2['nowIso'].replace('Z', '+00:00'))
    ok2 = (start_dt >= now_dt and r2['feasible'] is True)
    results.append(('search_never_suggests_past_start', ok2, r2))

    # v5.64: stegpunktene i wizarden skal være klikkbare BEGGE veier, ikke
    # bare tilbake til besøkte steg. Simulerer et ekte DOM-klikk på steg 3
    # sitt punkt mens man står på steg 1 — det punktet hadde tidligere ikke
    # noe onclick i det hele tatt.
    r3 = page.evaluate("""() => {
      wizGoto(1);
      const dots = document.querySelectorAll('#wiz-timeline > div > div');
      const dot3 = dots[4];
      dot3.click();
      const afterForward = window._wizStep;
      dots0 = document.querySelectorAll('#wiz-timeline > div > div');
      dots0[0].click();
      const afterBack = window._wizStep;
      return { afterForward, afterBack };
    }""")
    ok3 = (r3['afterForward'] == 3 and r3['afterBack'] == 1)
    results.append(('wizard_step_dots_clickable_both_directions', ok3, r3))

    # v5.69: ±-knapper lagt til rundt de fire Finjuster-sliderne (Mel/Hydrering/
    # Kjøleskap/Temperatur). Sjekker at et klikk på hver "+"-knapp faktisk
    # øker riktig S-verdi med riktig steg, og at sliderens egen .value følger med.
    r4 = page.evaluate("""() => {
      S.method='standard'; S.type='napoletana'; S.meltype='doppio_zero';
      S.mel=500; S.hydro=65; S.cold=48; S.temp=22;
      mobShowTab('settings'); wizGoto('finjuster');
      syncMobControls();
      const before = {mel:S.mel, hydro:S.hydro, cold:S.cold, temp:S.temp};
      stepMobSlider('mob-msl', 100, mobUMel);
      stepMobSlider('mob-hsl', 1, mobUHydro);
      stepMobSlider('mob-csl', 6, mobUCold);
      stepMobSlider('mob-tsl', 2, mobUTemp);
      const after = {mel:S.mel, hydro:S.hydro, cold:S.cold, temp:S.temp};
      const sliderVals = {
        mel: document.getElementById('mob-msl').value,
        hydro: document.getElementById('mob-hsl').value,
        cold: document.getElementById('mob-csl').value,
        temp: document.getElementById('mob-tsl').value
      };
      return {before, after, sliderVals};
    }""")
    ok4 = (
      r4['after']['mel'] == r4['before']['mel'] + 100 and
      r4['after']['hydro'] == r4['before']['hydro'] + 1 and
      r4['after']['cold'] == r4['before']['cold'] + 6 and
      r4['after']['temp'] == r4['before']['temp'] + 2 and
      int(r4['sliderVals']['mel']) == r4['after']['mel'] and
      int(r4['sliderVals']['hydro']) == r4['after']['hydro'] and
      int(r4['sliderVals']['cold']) == r4['after']['cold'] and
      int(r4['sliderVals']['temp']) == r4['after']['temp']
    )
    results.append(('finjuster_slider_step_buttons_work', ok4, r4))

    # v5.70: dynamisk "hvorfor"-boks under metodevalg-kortene skal oppdatere
    # tittel og tekst for alle seks metoder når kortet klikkes.
    r5 = page.evaluate("""() => {
      mobShowTab('settings'); wizGoto(2); mobMethodCards();
      const methods = ['standard','poolish','biga','mania','hurtig','kveld'];
      const results = {};
      methods.forEach(m => {
        S.method = m; mobMethodCards();
        results[m] = {
          title: document.getElementById('mob-method-why-title').textContent,
          text: document.getElementById('mob-method-why-text').textContent
        };
      });
      return results;
    }""")
    ok5 = all(
      r5[m]['text'] and len(r5[m]['text']) > 20 and r5[m]['title'].startswith('Hvorfor')
      for m in ['standard','poolish','biga','mania','hurtig','kveld']
    ) and len(set(r5[m]['text'] for m in r5)) == 6  # alle seks tekstene er ulike
    results.append(('method_why_box_updates_per_method', ok5, r5))

    # v5.71: kjøleskapsblokken på steg 3 skal ligge ØVERST — rett under
    # statuslinjen og FØR stegets tittel — fordi den styrer oppstartstidspunktet
    # som statuslinjen viser. Sjekker DOM-rekkefølgen direkte, at den fortsatt
    # skjules for metodene uten kjølefase, og at den fjernede Juster-teksten
    # ikke har sneket seg inn igjen.
    r6 = page.evaluate("""() => {
      const step = document.getElementById('wiz-step-3');
      const cold = document.getElementById('mob-cold-wiz-wrap');
      const status = document.getElementById('wiz-status-step3');
      const title = document.getElementById('wiz-step3-title');
      const pos = (a,b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;
      mobShowTab('settings');
      const vis = {};
      ['standard','poolish','biga','mania','hurtig','kveld'].forEach(m => {
        S.method = m; wizStep3Refresh();
        vis[m] = document.getElementById('mob-cold-wiz-wrap').style.display;
      });
      return {
        coldAfterStatus: !!pos(status, cold),
        coldBeforeTitle: !!pos(cold, title),
        coldInsideStep3: step.contains(cold),
        justerHintGone: !step.innerHTML.includes('Juster åpner flere valg'),
        vis
      };
    }""")
    ok6 = (
      r6['coldAfterStatus'] and r6['coldBeforeTitle'] and
      r6['coldInsideStep3'] and r6['justerHintGone'] and
      all(r6['vis'][m] == 'block' for m in ('standard','poolish','biga','mania')) and
      all(r6['vis'][m] == 'none' for m in ('hurtig','kveld'))
    )
    results.append(('step3_cold_block_sits_below_status_bar', ok6, r6))

    # v5.72: "Da starter du"-linjene er borte, og statuslinjen viser i stedet en
    # differansebrikke når oppstart flytter seg. Tester at brikken dukker opp med
    # riktig retning og størrelse, at den AKKUMULERER over flere raske trykk
    # (tre trykk à 6t skal gi 18 t, ikke 6 t), og at ingen av de gamle
    # preview-elementene finnes igjen i dokumentet.
    r7 = page.evaluate("""() => {
      S.method='standard'; S.type='napoletana'; S.meltype='doppio_zero';
      S.mel=500; S.hydro=65; S.cold=48; S.temp=22; S.mode='end';
      mobShowTab('settings'); wizGoto(3); mobGen();
      _startDelta = null; mobGen();
      const chip = () => {
        const el = document.querySelector('#wiz-status-step3 .wiz-start-delta');
        return el ? el.textContent.trim() : '';
      };
      const before = chip();
      stepColdWiz(1);
      const afterOne = chip();
      stepColdWiz(1); stepColdWiz(1);
      const afterThree = chip();
      _startDelta = null; mobGen();
      const afterReset = chip();
      stepColdWiz(-1);
      const afterDown = chip();
      return {
        before, afterOne, afterThree, afterReset, afterDown,
        oldPreviewsGone: !document.getElementById('mob-cold-start-preview')
                      && !document.getElementById('mob-p-start-preview')
                      && !document.getElementById('mob-b-start-preview'),
        updateStartPreviewGone: typeof window.updateStartPreview === 'undefined'
      };
    }""")
    # NB: lengre kjøleskapstid = TIDLIGERE oppstart, siden planen regnes bakover
    # fra spisetidspunktet (S.mode='end'). Motsatt vei for et negativt steg.
    ok7 = (
      r7['before'] == '' and
      r7['afterOne'] == '6 t tidligere' and
      r7['afterThree'] == '18 t tidligere' and
      r7['afterReset'] == '' and
      r7['afterDown'] == '6 t senere' and
      r7['oldPreviewsGone'] and r7['updateStartPreviewGone']
    )
    results.append(('start_delta_chip_accumulates_and_shows_direction', ok7, r7))

    # v5.73: varselet om opptatt tid bygger nå på brukerens egen Pizzatid fra
    # Beta-fanen i stedet for en hardkodet man-fre 08-16-regel. Tester at
    # predikatet følger timeplanen, at "Mine faste tidspunkter" bruker samme
    # kilde, og at fallbacken før timeplanen er lastet er den GAMLE regelen og
    # ikke "alt er ledig" (som ville skjult ekte konflikter ved oppstart).
    r8 = page.evaluate("""() => {
      const saved = window._pizzatidSchedule;
      const wd = [['16:00','23:30'],['06:30','08:00']];
      const we = [['06:00','23:00'], null];
      const out = {};

      window._pizzatidSchedule = null;
      out.fallbackMon14 = outsidePizzatid(14,0,1);
      out.fallbackMon18 = outsidePizzatid(18,0,1);
      out.fallbackSat14 = outsidePizzatid(14,0,6);

      window._pizzatidSchedule = {mon:wd,tue:wd,wed:wd,thu:wd,fri:wd,sat:we,sun:we};
      out.defaultMon14 = outsidePizzatid(14,0,1);
      out.defaultMon18 = outsidePizzatid(18,0,1);

      window._pizzatidSchedule = {mon:[['06:00','23:00'],null],tue:wd,wed:wd,thu:wd,fri:wd,sat:we,sun:we};
      out.customMon14 = outsidePizzatid(14,0,1);
      out.myFreeFollowsSameSource = inMyFreeWindows(14,0,1);

      out.hasBusyWindow = ACTIVE_STEP_TIME_WINDOWS.some(w => w.id === 'busy');
      out.hardcodedWorkWindowGone = !ACTIVE_STEP_TIME_WINDOWS.some(w => w.id === 'work');
      out.perUserEndpoint = loadPizzatidSchedule.toString().includes('userId=');

      window._pizzatidSchedule = saved;
      return out;
    }""")
    ok8 = (
      r8['fallbackMon14'] is True and r8['fallbackMon18'] is False and
      r8['fallbackSat14'] is False and
      r8['defaultMon14'] is True and r8['defaultMon18'] is False and
      r8['customMon14'] is False and r8['myFreeFollowsSameSource'] is True and
      r8['hasBusyWindow'] and r8['hardcodedWorkWindowGone'] and r8['perUserEndpoint']
    )
    results.append(('busy_time_warning_follows_user_pizzatid', ok8, r8))

    return results


def run_render_layer_tests(page, baseline):
    """
    Fryser HTML-utdataen fra oppskrift-rad-rendringen (recipeRowsHTML +
    baseIngredientRows), for både PC og mobil, for to metoder som har ulikt
    antall hale-rader (standard: kjøleskap+romtemp+ovn; hurtig: steking+
    romtemp+ovn på PC, kun steking på mobil). Lagt til i forbindelse med
    v5.62-sammenslåingen av recipeRowsHTML/mobRecipeRowsHTML, som var det
    laget uten testdekning i den arkitektoniske gjennomgangen 24.07.2026.
    """
    results = []
    cases = [
        ("standard_pc", "standard", False, "#p-recipe .rec"),
        ("standard_mobil", "standard", True, "#mob-recipe-content .mob-rec"),
        ("hurtig_pc", "hurtig", False, "#p-recipe .rec"),
        ("hurtig_mobil", "hurtig", True, "#mob-recipe-content .mob-rec"),
        ("kveld_pc", "kveld", False, "#p-recipe .rec"),
        ("kveld_mobil", "kveld", True, "#mob-recipe-content .mob-rec"),
    ]
    for key, method, mob, selector in cases:
        setup = f"""() => {{
          S.mode='start'; S.type='napoletana'; S.method='{method}';
          S.mel=500; S.hydro=65; S.cold=48; S.temp=22; S.meltype='doppio_zero';
          S.hurtigH=4; S.kveldH=10;
          setLayout('{"mob" if mob else "pc"}');
        }}"""
        page.evaluate(setup)
        html = page.eval_on_selector(selector, "el => el.innerHTML")
        expected = baseline.get("_render_layer", {}).get(key)
        ok = (html == expected)
        results.append((f"render_{key}_matches_baseline", ok, {"got_len": len(html or ""), "expected_len": len(expected or "")}))

    # PC/mobil 1:1-invariant (Runes krav 24.07.2026): innholdet (rader, labels,
    # verdier) skal være identisk — kun CSS-klassenavn (rrow/mob-rrow osv.) og
    # et harmløst tomt class=""-attributt på mobil-siden skal skille dem.
    import re as _re
    def _normalize(html):
        html = (html or '').replace('mob-rrow', 'rrow').replace('mob-rval', 'rval')
        html = html.replace(' class=""', '')
        return _re.sub(r'\s+', ' ', html).strip()
    for method in ("standard", "hurtig", "kveld"):
        pc_html = baseline.get("_render_layer", {}).get(f"{method}_pc")
        mob_html = baseline.get("_render_layer", {}).get(f"{method}_mobil")
        ok = (_normalize(pc_html) == _normalize(mob_html))
        results.append((f"pc_mobil_1to1_{method}", ok, {"note": "innhold må matche på tvers av platform"}))
    return results


def main():
    index_path = sys.argv[1] if len(sys.argv) > 1 else "index.html"
    index_dir = os.path.dirname(os.path.abspath(index_path)) or "."
    baseline = load_full_baseline()

    handler = http.server.SimpleHTTPRequestHandler
    os.chdir(index_dir)
    httpd = socketserver.TCPServer(("", 0), handler)
    port = httpd.server_address[1]
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()

    failures = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={"width": 390, "height": 844}, timezone_id="Europe/Oslo")
        page = context.new_page()
        page.add_init_script("localStorage.setItem('pizzaUser', JSON.stringify({id:'test',name:'Test'}));")
        page.goto(f"http://localhost:{port}/{os.path.basename(index_path)}")
        page.wait_for_timeout(1200)
        page.evaluate("document.getElementById('guide-modal') && (document.getElementById('guide-modal').style.display='none')")

        for sc in SCENARIOS:
            name = sc["name"]
            if name not in baseline:
                print(f"⚠️  {name}: ingen frossen baseline å sammenligne mot — hopper over")
                continue
            actual = run_scenario(page, sc)
            expected = baseline[name]
            diffs = []
            for key in ("recipe", "firstStep", "lastStep", "stepCount", "stepTitles"):
                if actual.get(key) != expected.get(key):
                    diffs.append((key, expected.get(key), actual.get(key)))
            if diffs:
                failures.append((name, diffs))
                print(f"❌ {name}: FEILET")
                for key, exp, act in diffs:
                    print(f"    {key}: forventet {exp!r}, fikk {act!r}")
            else:
                print(f"✅ {name}: OK")

        print()
        print("Atferdstester (fra tidligere funnede bugs):")
        behavioral = run_behavioral_tests(page)
        for name, ok, detail in behavioral:
            if ok:
                print(f"✅ {name}: OK")
            else:
                failures.append((name, [("detail", "OK", detail)]))
                print(f"❌ {name}: FEILET — {detail}")

        print()
        print("Rendringslag (PC + mobil, fryser HTML-utdata):")
        render_tests = run_render_layer_tests(page, baseline)
        for name, ok, detail in render_tests:
            if ok:
                print(f"✅ {name}: OK")
            else:
                failures.append((name, [("detail", "OK", detail)]))
                print(f"❌ {name}: FEILET — {detail}")

        browser.close()
    httpd.shutdown()

    print()
    total = len(SCENARIOS) + len(behavioral) + len(render_tests)
    if failures:
        print(f"{len(failures)} av {total} tester feilet.")
        sys.exit(1)
    else:
        print(f"Alle {total} tester OK.")
        sys.exit(0)

if __name__ == "__main__":
    main()
