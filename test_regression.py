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

        browser.close()
    httpd.shutdown()

    print()
    if failures:
        print(f"{len(failures)} av {len(SCENARIOS)} scenarioer feilet.")
        sys.exit(1)
    else:
        print(f"Alle {len(SCENARIOS)} scenarioer OK.")
        sys.exit(0)

if __name__ == "__main__":
    main()
