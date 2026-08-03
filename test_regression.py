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

    # v5.93: delt hjelper som nullstiller global tilstand testene deler —
    # _dismissedWarnings, _acceptedConflicts, _pizzatidSchedule, S, og
    # eat-dato-feltene. Rotårsaken til tre tester som feilet sent på kvelden:
    # de leste ambient mob-ed/mob-et i stedet for å sette en egen, trygt
    # fremtidig dato, og arvet dermed hva en TIDLIGERE test hadde satt der.
    # setSafeFutureEatDate(daysOut, hh) setter et trygt langt-fram tidspunkt —
    # trygt uansett S.cold (opptil 144t) og uansett hvilken time på døgnet
    # selve testsuiten kjøres.
    page.evaluate("""() => {
      window.resetTestState = function(){
        try{ _dismissedWarnings.clear(); }catch(e){}
        try{ _acceptedConflicts.clear(); }catch(e){}
        const wd=[['16:00','23:30'],['06:30','08:00']], we=[['06:00','23:00'],null];
        window._pizzatidSchedule = {mon:wd,tue:wd,wed:wd,thu:wd,fri:wd,sat:we,sun:we};
        Object.keys(DEF).forEach(k => S[k]=DEF[k]);
        window._returnTo = null;
        window._wizEnteredOnce = false;
      };
      // daysOut bør være minst ~7 for å tåle S.cold opp til 144t + margin mot
      // at suiten kjøres sent på kvelden. weekday: 0=søn..6=lør, eller null
      // for "bare N dager fram, uansett ukedag".
      window.setSafeFutureEatDate = function(daysOut, hh, weekday){
        hh = (hh==null) ? 18 : hh;
        const d = new Date();
        d.setDate(d.getDate() + daysOut);
        if (weekday != null){
          while (d.getDay() !== weekday) d.setDate(d.getDate() + 1);
        }
        d.setHours(hh, 0, 0, 0);
        const p2 = n => String(n).padStart(2,'0');
        const dEl=document.getElementById('mob-ed'), tEl=document.getElementById('mob-et');
        if (dEl) dEl.value = d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
        if (tEl) tEl.value = p2(hh)+':00';
        return d.toISOString();
      };
      // v5.93: en fast "trygg" time holdt IKKE — bakoverplanlagt miksestart
      // kan uansett havne i natten (23-06), avhengig av total varighet og
      // hvilken time "nå" faktisk er. I stedet for å gjette et tidspunkt,
      // SØKER denne etter et som faktisk gir null konflikt akkurat nå, for
      // gjeldende S/metode/pizzatid — samme prinsipp som findAnchorShift.
      window.setCleanFutureEatDate = function(daysOut){
        for (const hh of [13,14,15,12,16,11,17,10,18]){
          setSafeFutureEatDate(daysOut, hh);
          let steps=null;
          try{ steps = computeCurrentSteps(); }catch(e){ continue; }
          if (steps && !firstStepConflict(steps)) return true;
        }
        return false;
      };
    }""")

    # Bug: kryss-metode-søket (Beta-fanen) må foretrekke Kveldsdeig for et
    # stramt fredag-mål, siden ingen Poolish/Biga-kombinasjon rekker det uten
    # konflikt. Fant dette manuelt tidligere — fryser det som en ekte test nå.
    # Pinner "nå" så testen er tidsuavhengig (var flaky: resultatet avhang av
    # hvor langt unna neste fredag lå fra ekte klokke). Nå = torsdag 30. juli 2026
    # kl. 20:00; mål = fredag 31. juli 19:00 (~23t unna). Da rekker ingen fler-dagers
    # metode (Standard/Poolish/Biga trenger ≥24t → filtreres bort som ugjennomførbare),
    # og blant de som rekker vinner Kveldsdeig på lengst gjæring / null konflikt.
    r = page.evaluate("""(() => {
      const realNow = Date.now;
      Date.now = () => new Date(2026, 6, 30, 20, 0, 0).getTime();
      try {
        const anchor = new Date(2026, 6, 31, 19, 0, 0);
        const results = searchAllMethods(anchor);
        return { topLabel: results[0].label, topViolations: results[0].violations };
      } finally { Date.now = realNow; }
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
    # v5.78: kjøleskapsblokken bor nå på steg 4 (kvalitetssjekken), fortsatt
    # rett under statuslinjen. Metodestyringen er uendret.
    r6 = page.evaluate("""() => {
      const step = document.getElementById('wiz-step-check');
      const cold = document.getElementById('mob-cold-wiz-wrap');
      const status = document.getElementById('wiz-status-check');
      const check = document.getElementById('wiz-check');
      const pos = (a,b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;
      mobShowTab('settings');
      const vis = {};
      ['standard','poolish','biga','mania','hurtig','kveld'].forEach(m => {
        S.method = m; wizCheckRefresh();
        vis[m] = document.getElementById('mob-cold-wiz-wrap').style.display;
      });
      return {
        coldAfterStatus: !!pos(status, cold),
        coldAfterCheck: !!pos(check, cold),
        coldInsideCheck: step.contains(cold),
        justerHintGone: !step.innerHTML.includes('Juster åpner flere valg'),
        vis
      };
    }""")
    ok6 = (
      r6['coldAfterStatus'] and r6['coldAfterCheck'] and
      r6['coldInsideCheck'] and r6['justerHintGone'] and
      all(r6['vis'][m] == 'block' for m in ('standard','poolish','biga','mania')) and
      all(r6['vis'][m] == 'none' for m in ('hurtig','kveld'))
    )
    results.append(('cold_block_sits_below_status_bar_on_check_step', ok6, r6))

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
        const el = document.querySelector('#wiz-status-check .wiz-start-delta');
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

    # v5.74: alle varsler skal ha et kryss som skjuler dem for denne gang, med
    # nøkkel på selve konflikten. Tester at krysset finnes, at et klikk skjuler
    # varselet, at et ANNET varsel ikke ble skjult samtidig, og at samme varsel
    # dukker opp igjen når konflikten endrer innhold.
    r9 = page.evaluate("""() => {
      _dismissedWarnings.clear();
      S.type='napoletana'; S.method='hurtig'; S.mel=500; S.hydro=65;
      S.hurtigH=14; S.temp=24; S.meltype='manitoba'; S.mode='start';
      mobShowTab('plan'); mobGen();
      const boxes = () => Array.from(document.querySelectorAll('#mob-plan-content .warn-dismiss-wrap'));
      const warmBox = () => boxes().find(b => b.textContent.includes('sjekk deigen underveis'));
      const meltypeBox = () => boxes().find(b => b.textContent.includes('🌾'));
      const countBefore = boxes().length;
      const btnCount = document.querySelectorAll('#mob-plan-content .warn-dismiss-btn').length;
      const hadWarm = !!warmBox(), hadMeltype = !!meltypeBox();

      warmBox().querySelector('.warn-dismiss-btn').click();
      const afterDismiss = { count: boxes().length, warm: !!warmBox(), meltype: !!meltypeBox() };

      // Endrer temperaturen: varmt-kjøkken-varselet får ny nøkkel og skal komme
      // tilbake, mens meltype-varselet (uendret nøkkel) ikke påvirkes.
      S.temp = 26; mobGen();
      const afterChange = { count: boxes().length, warm: !!warmBox(), meltype: !!meltypeBox() };

      // Skjuler det på nytt, og bekrefter at en endring som IKKE rører nøkkelen
      // lar det forbli skjult.
      warmBox().querySelector('.warn-dismiss-btn').click();
      S.mel = 600; mobGen();
      const afterUnrelatedChange = { warm: !!warmBox() };

      _dismissedWarnings.clear(); S.temp = 24; S.mel = 500; mobGen();
      return {
        countBefore, btnCount, hadWarm, hadMeltype,
        afterDismiss, afterChange, afterUnrelatedChange,
        btnPerBox: btnCount === countBefore,
        restored: boxes().length === countBefore
      };
    }""")
    ok9 = (
      r9['countBefore'] >= 2 and r9['btnPerBox'] and
      r9['hadWarm'] and r9['hadMeltype'] and
      r9['afterDismiss']['count'] == r9['countBefore'] - 1 and
      r9['afterDismiss']['warm'] is False and
      r9['afterDismiss']['meltype'] is True and
      r9['afterChange']['warm'] is True and
      r9['afterUnrelatedChange']['warm'] is False and
      r9['restored']
    )
    results.append(('all_warnings_dismissible_keyed_on_conflict', ok9, r9))

    # v5.75: varselet skal bare tilby spaker som faktisk beveger det steget som
    # kolliderer. Scenariet er Runes eget: Langtidsdeig, spis 18:00 en tirsdag
    # -> "Ta ut av kjøleskap" havner 14:00, som er låst til steketiden (taUt =
    # bake - 240). "Juster kjøleskapstid" MÅ da være borte, og i stedet skal det
    # tilbys å spise senere, med utregnet klokkeslett.
    r10 = page.evaluate("""() => {
      resetTestState();
      S.type='napoletana'; S.method='standard'; S.mel=500; S.hydro=65;
      S.cold=48; S.temp=22; S.meltype='doppio_zero'; S.mode='end';
      // v5.93: "neste tirsdag" kunne være bare 2 dager unna, og med 48t
      // kjøleskap havnet miksestarten i FORTIDEN sent på kvelden -- da
      // avviser findAnchorShift() (korrekt) alle skift, og testen feilet.
      // +9 dager (fortsatt en tirsdag) gir minst en ukes margin uansett
      // klokkeslett testen kjøres på.
      const now=new Date();
      const d=new Date(now.getFullYear(),now.getMonth(),now.getDate(),18,0,0,0);
      d.setDate(d.getDate() + ((2 - now.getDay() + 7) % 7 || 7) + 7);
      document.getElementById('mob-ed').value = fd(d);
      document.getElementById('mob-et').value = '18:00';
      mobShowTab('plan'); mobGen();
      const c = firstStepConflict(window._steps||[]);
      const anchor = mobGetAnchor('e');
      // Det fulle varselet bor nå i wizardens Sjekk; Tidsplan viser kun et
      // nedtonet merke. Rendrer sjekken og leser kortet derfra.
      wizCheckRender();
      const box = Array.from(document.querySelectorAll('#wiz-check div[style*="FAEEDA"]'))
                       .find(x => x.textContent.includes('Et steg havner'));
      const labels = box ? Array.from(box.querySelectorAll('button')).map(x=>x.textContent.trim()) : [];
      const firstStepTitle = (window._steps||[])[0] ? window._steps[0].title : '';
      return {
        conflictStep: c ? c.step.title : null,
        coldMovesConflict: c ? leverMovesStep('cold', 24, 144, c.step.title, anchor) : null,
        coldMovesFirstStep: leverMovesStep('cold', 24, 144, firstStepTitle, anchor),
        shiftMinutes: (()=>{ const sh=findAnchorShift(anchor); return sh ? sh.minutes : null; })(),
        labels,
        hasColdBtn: labels.some(l => l.includes('Juster kjøleskapstid')),
        hasShiftBtn: labels.some(l => l.startsWith('Spis ')),
        mentionsPlanGoesUp: !!box && box.textContent.includes('hele planen går opp')
      };
    }""")
    ok10 = (
      r10['conflictStep'] == 'Ta ut av kjøleskap' and
      r10['coldMovesConflict'] is False and
      r10['coldMovesFirstStep'] is True and
      r10['shiftMinutes'] == 120 and
      r10['hasColdBtn'] is False and
      r10['hasShiftBtn'] is True and
      r10['mentionsPlanGoesUp'] is True
    )
    results.append(('warning_only_offers_levers_that_move_the_step', ok10, r10))

    # v5.76: REELL BUG — varselet ble hengende med gammelt svar når pizzatiden
    # ble endret i Beta-fanen, fordi redigeringen aldri regnet planen ut på nytt.
    # Reproduserer: lag en konflikt, gjør deg ledig på nøyaktig det tidspunktet
    # via updatePizzatidPeriod (samme kall som time-inputene bruker), og krev at
    # varselet er borte UTEN et manuelt mobGen() imellom.
    r11 = page.evaluate("""() => {
      resetTestState();
      const savedSched = window._pizzatidSchedule;
      const wd=[['16:00','23:30'],['06:30','08:00']], we=[['06:00','23:00'],null];
      window._pizzatidSchedule = {mon:wd,tue:wd,wed:wd,thu:wd,fri:wd,sat:we,sun:we};
      S.type='napoletana'; S.method='standard'; S.mel=500; S.hydro=65;
      S.cold=48; S.temp=22; S.meltype='doppio_zero'; S.mode='end';
      // v5.93: samme fiks som r10 — +7 ekstra dager for margin mot at
      // miksestarten havner i fortiden sent på kvelden.
      const now=new Date();
      const d=new Date(now.getFullYear(),now.getMonth(),now.getDate(),18,0,0,0);
      d.setDate(d.getDate() + ((2 - now.getDay() + 7) % 7 || 7) + 7);
      document.getElementById('mob-ed').value = fd(d);
      document.getElementById('mob-et').value = '18:00';
      mobShowTab('plan'); mobGen();
      // Tidsplan viser nå et nedtonet «⚠ utenfor ledig tid»-merke på steget i
      // stedet for hele kortet — redigering av pizzatid skal fjerne merket live.
      const has = () => !!document.querySelector('#mob-plan-content .conflict-flag');
      const before = has();

      // Gjør tirsdag ledig fra 06:00 — samme vei som time-feltene i Beta-fanen.
      updatePizzatidPeriod('tue', 0, 0, '06:00');
      const afterEdit = has();

      // Halvferdig periode skal ikke telle som gyldig
      window._pizzatidSchedule.tue = [['16:00',''], null];
      const halfDoneCountsAsBusy = outsidePizzatid(18,0,2);

      window._pizzatidSchedule = savedSched;
      _dismissedWarnings.clear();
      return { before, afterEdit, halfDoneCountsAsBusy,
               planTabRerenders: mobShowTab.toString().includes("t==='plan'") };
    }""")
    ok11 = (
      r11['before'] is True and
      r11['afterEdit'] is False and
      r11['halfDoneCountsAsBusy'] is True and
      r11['planTabRerenders'] is True
    )
    results.append(('pizzatid_edit_refreshes_warning_immediately', ok11, r11))

    # v5.77: hoppene fra varslene skal ikke lenger være enveisdører. Tester at
    # returlinjen dukker opp der du LANDER (ikke der du kom fra), at den svarer
    # live mens du redigerer, at den tar deg tilbake til riktig fane, og at den
    # ikke vises hvis du åpner Beta-fanen på eget initiativ.
    r12 = page.evaluate("""() => {
      const bar = () => document.getElementById('mob-return-bar');
      const shown = () => bar().classList.contains('on');
      const status = () => bar().textContent;

      _returnTo = null;
      const wd = [['16:00','23:30'],['06:30','08:00']];
      const we = [['06:00','23:00'], null];
      window._pizzatidSchedule = {mon:wd,tue:wd,wed:wd,thu:wd,fri:wd,sat:we,sun:we};

      // Åpner Beta-fanen selv: ingen returlinje.
      mobShowTab('beta');
      const selfOpened = shown();

      // Kommer fra et varsel på Steg-fanen i stedet.
      mobShowTab('plan');
      const onOriginBefore = shown();
      openPizzatidFromWarning();
      const landedTab = MOB_TABS.find(id => document.getElementById('mob-'+id).classList.contains('active'));
      const afterJump = { shown: shown(), text: status() };

      // Redigerer pizzatiden så konflikten forsvinner: linjen skal snu til grønt
      // uten at vi bytter skjerm.
      const allDay = [['00:00','23:59'], null];
      window._pizzatidSchedule = {mon:allDay,tue:allDay,wed:allDay,thu:allDay,fri:allDay,sat:allDay,sun:allDay};
      pizzatidChanged();
      const afterFix = { shown: shown(), text: status() };

      // Returnerer.
      goBackFromJump();
      const backTab = MOB_TABS.find(id => document.getElementById('mob-'+id).classList.contains('active'));
      const afterReturn = shown();

      _returnTo = null; renderReturnBar();
      return {
        selfOpened, onOriginBefore, landedTab,
        afterJump, afterFix, backTab, afterReturn,
        resolvedIsGreen: afterFix.text.includes('Alle steg ligger'),
        hasBackButton: afterJump.text.includes('Tilbake')
      };
    }""")
    ok12 = (
      r12['selfOpened'] is False and
      r12['onOriginBefore'] is False and
      r12['landedTab'] == 'beta' and
      r12['afterJump']['shown'] is True and r12['hasBackButton'] and
      r12['afterFix']['shown'] is True and r12['resolvedIsGreen'] and
      r12['backTab'] == 'plan' and r12['afterReturn'] is False
    )
    results.append(('warning_jumps_have_a_return_path', ok12, r12))

    # v5.78: wizarden har fire steg. "Når" og antall bor på steg 1 sammen med
    # pizzatypen, Finjuster er et nummerert steg, og steg 4 er kvalitetssjekken
    # som også svarer GRØNT når alt går opp — det siste er det eneste helt nye.
    r13 = page.evaluate("""() => {
      const step1 = document.getElementById('wiz-step-1');
      const step4 = document.getElementById('wiz-step-check');
      mobShowTab('settings');

      wizGoto(1);
      const seq = [];
      for (let i = 0; i < 2; i++) { wizNext(); seq.push(window._wizStep); }
      wizNext();
      const stopsAtLast = window._wizStep;
      for (let i = 0; i < 2; i++) wizBack();
      wizBack();
      const stopsAt1 = window._wizStep;

      // v5.81: Finjuster er ute av nummereringen. Den kan fortsatt vises, men
      // både Neste og Tilbake derfra leder til sjekken.
      wizGoto('finjuster');
      const finjusterShown = document.getElementById('wiz-finjuster').style.display;
      const finjusterNotNumbered = window._wizStep;
      wizNext();
      const outOfFinjuster = window._wizStep;

      // Ingen konflikt -> grønn bekreftelse.
      // Couco tåler 16-54t gjæring og 60-80% hydrering, så dette er et reelt
      // rent utgangspunkt — Doppio Zero stopper på 24t og ville selv utløst
      // meltype-varselet ved 48t kjøleskap.
      resetTestState();
      S.method='standard'; S.type='napoletana'; S.cold=48; S.mode='end';
      S.meltype='couco'; S.hydro=65;
      // v5.93: denne satte ALDRI eat-datoen selv — den arvet ambient
      // mob-ed/mob-et fra en TIDLIGERE test i samme kjøring. Søker nå etter
      // et faktisk konfliktfritt tidspunkt (se setCleanFutureEatDate).
      setCleanFutureEatDate(10);
      const allDay = [['00:00','23:59'], null];
      window._pizzatidSchedule = {mon:allDay,tue:allDay,wed:allDay,thu:allDay,fri:allDay,sat:allDay,sun:allDay};
      wizGoto(3);
      const okText = document.getElementById('wiz-check').textContent;

      // Konflikt -> sjekken skal IKKE si at planen holder.
      const none = [['12:00','12:01'], null];
      window._pizzatidSchedule = {mon:none,tue:none,wed:none,thu:none,fri:none,sat:none,sun:none};
      _dismissedWarnings.clear();
      wizCheckRefresh();
      const badText = document.getElementById('wiz-check').textContent;

      window._pizzatidSchedule = {mon:allDay,tue:allDay,wed:allDay,thu:allDay,fri:allDay,sat:allDay,sun:allDay};
      return {
        stepCount: WIZ_STEPS.length,
        seq, stopsAtLast, stopsAt1,
        finjusterShown, finjusterNotNumbered, outOfFinjuster,
        // v5.82: spørsmålsoverskriften er eneste etikett — blokken under skal
        // ikke gjenta den. Teller forekomster i begge modus.
        whenLabelOnceStart: (() => {
          mobSetMode('start');
          return (step1.textContent.match(/Du begynner nå/g) || []).length;
        })(),
        whenLabelOnceEnd: (() => {
          mobSetMode('end');
          return (step1.textContent.match(/Når vil du spise\?/g) || []).length
               + (step1.textContent.match(/Når vil du ha pizzaen ferdig\?/g) || []).length;
        })(),
        step1HasType: !!step1.querySelector('#mob-gtype'),
        step1HasCount: !!step1.querySelector('#mob-pcount-disp'),
        step1HasWhen: !!step1.querySelector('#mob-be'),
        checkHasVerdict: !!step4.querySelector('#wiz-check'),
        checkHasCold: !!step4.querySelector('#mob-cold-wiz-wrap'),
        okIsGreen: okText.includes('Planen holder'),
        badIsNotGreen: !badText.includes('Planen holder') && badText.trim().length > 0
      };
    }""")
    ok13 = (
      r13['stepCount'] == 3 and r13['seq'] == [2, 3] and
      r13['stopsAtLast'] == 3 and r13['stopsAt1'] == 1 and
      r13['finjusterShown'] == 'block' and
      r13['finjusterNotNumbered'] == 'finjuster' and
      r13['outOfFinjuster'] == 3 and
      r13['whenLabelOnceStart'] == 1 and r13['whenLabelOnceEnd'] == 1 and
      r13['step1HasType'] and r13['step1HasCount'] and r13['step1HasWhen'] and
      r13['checkHasVerdict'] and r13['checkHasCold'] and
      r13['okIsGreen'] and r13['badIsNotGreen']
    )
    results.append(('wizard_has_three_steps_with_quality_check', ok13, r13))

    # v5.78: swipe navigerer mellom stegene, men må IKKE utløses av et dra på en
    # slider (Finjuster har fire), av et vertikalt dra, eller av et dra fra
    # skjermkanten (iOS sin egen tilbake-gestikk).
    r14 = page.evaluate("""() => {
      const scr = document.getElementById('mob-settings');
      const swipe = (target, x0, y0, x1, y1) => {
        const mk = (x, y) => new Touch({identifier: 1, target, clientX: x, clientY: y});
        target.dispatchEvent(new TouchEvent('touchstart', {bubbles: true, touches: [mk(x0, y0)], changedTouches: [mk(x0, y0)]}));
        target.dispatchEvent(new TouchEvent('touchend', {bubbles: true, touches: [], changedTouches: [mk(x1, y1)]}));
        return window._wizStep;
      };
      mobShowTab('settings');

      wizGoto(2);
      const leftFromTwo = swipe(scr, 250, 300, 100, 305);
      const rightFromThree = swipe(scr, 150, 300, 300, 295);

      wizGoto(2);
      const vertical = swipe(scr, 250, 200, 235, 400);
      const fromEdge = swipe(scr, 8, 300, 200, 300);
      const tooShort = swipe(scr, 250, 300, 220, 300);

      // Dra som starter i en Finjuster-slider skal ikke bytte steg.
      wizGoto('finjuster');
      const slider = document.getElementById('mob-hsl') || document.querySelector('#wiz-finjuster input[type=range]');
      const onSlider = slider ? swipe(slider, 250, 300, 100, 302) : null;

      wizGoto(1);
      const atOne = swipe(scr, 150, 300, 300, 300);

      return {leftFromTwo, rightFromThree, vertical, fromEdge, tooShort, onSlider, atOne, hasSlider: !!slider};
    }""")
    ok14 = (
      r14['hasSlider'] and
      r14['leftFromTwo'] == 3 and r14['rightFromThree'] == 2 and
      r14['vertical'] == 2 and r14['fromEdge'] == 2 and r14['tooShort'] == 2 and
      r14['onSlider'] == 'finjuster' and r14['atOne'] == 1
    )
    results.append(('wizard_swipe_navigates_without_hijacking_sliders', ok14, r14))

    # v5.80: kvalitetssjekken dekker nå både tid og deig. Tester at et
    # meltype-problem faktisk dukker opp på steg 4, at telleren stemmer med
    # antall bokser, og at et varsel som er skjult med krysset i Steg-fanen
    # likevel VISES i sjekken — der har man nettopp bedt om dommen.
    r15 = page.evaluate("""() => {
      const check = () => document.getElementById('wiz-check');
      const boxes = () => check().querySelectorAll('div[style*="FAEEDA"]').length;
      mobShowTab('settings');

      // Rent utgangspunkt: mel som passer til gjæringstiden.
      resetTestState();
      // v5.93: allDay må settes ETTER resetTestState() — den nullstiller
      // _pizzatidSchedule til default ukedag/helg-oppsettet, som ellers
      // uten varsel overskriver denne testens tiltenkte "alt ledig".
      const allDay = [['00:00','23:59'], null];
      window._pizzatidSchedule = {mon:allDay,tue:allDay,wed:allDay,thu:allDay,fri:allDay,sat:allDay,sun:allDay};
      S.type='napoletana'; S.method='standard'; S.mode='end';
      S.mel=500; S.hydro=65; S.cold=48; S.temp=22; S.meltype='couco';
      // v5.93: som r13 — satte aldri sin egen dato, arvet ambient tilstand.
      setCleanFutureEatDate(10);
      wizGoto(3);
      const cleanText = check().textContent;

      // Mel som ikke tåler gjæringstiden -> skal dukke opp i sjekken.
      S.meltype='vanlig_hvetemel'; S.cold=96;
      // Steketid 10 doegn fram, saa v5.84-varselet om passert oppstart ikke
      // blander seg inn — denne testen handler om deig, ikke tid.
      const far = new Date(Date.now() + 10*24*3600000);
      const fp2 = n => String(n).padStart(2,'0');
      document.getElementById('mob-ed').value = far.getFullYear()+'-'+fp2(far.getMonth()+1)+'-'+fp2(far.getDate());
      document.getElementById('mob-et').value = '18:00';
      wizCheckRefresh();
      const dirtyText = check().textContent;
      const dirtyBoxes = boxes();

      // Skjul det i Steg-fanen; sjekken skal fortsatt vise det.
      mobShowTab('plan'); mobGen();
      const btn = document.querySelector('#mob-plan-content .warn-dismiss-btn');
      if (btn) btn.click();
      const hiddenInPlan = !document.querySelector('#mob-plan-content .warn-dismiss-wrap');
      mobShowTab('settings'); wizGoto(3);
      const stillInCheck = check().textContent.includes('ting å se på') || check().textContent.includes('Én ting');

      _dismissedWarnings.clear();
      S.meltype='couco'; S.cold=48;
      return {
        cleanIsGreen: cleanText.includes('Planen holder'),
        dirtyMentionsFlour: dirtyText.includes('🌾') || dirtyText.includes('gjæret'),
        dirtyHasCount: /ting å se på|Én ting/.test(dirtyText),
        dirtyBoxes, hiddenInPlan, stillInCheck,
        noCrossInCheck: check().querySelectorAll('.warn-dismiss-btn').length === 0
      };
    }""")
    ok15 = (
      r15['cleanIsGreen'] and r15['dirtyMentionsFlour'] and
      r15['dirtyHasCount'] and r15['dirtyBoxes'] >= 1 and
      r15['hiddenInPlan'] and r15['stillInCheck'] and r15['noCrossInCheck']
    )
    results.append(('quality_check_covers_dough_and_ignores_dismissals', ok15, r15))

    # v5.83: "Tidligst mulig" og metodekortenes passform hentes naa fra den ekte
    # stegbyggeren i stedet for en haandskrevet formel som manglet Kveldsdeig og
    # Mania (begge ga 0 -> "klar umiddelbart" og "passer godt" uansett). Tester
    # at alle seks metoder gir en tid i fremtiden, at Kveldsdeig IKKE lenger
    # sier "passer godt" naar man vil spise om en time, at hodet paa steg 1
    # oppdateres VED selve trykket (v5.78-buggen fra skjermbildet), og at de
    # doede datofeltene paa naa-grenen er borte.
    r16 = page.evaluate('''() => {
      const now = Date.now();
      const perMethod = {};
      ['standard','poolish','biga','mania','hurtig','kveld'].forEach(m => {
        const at = earliestBakeAt(m);
        perMethod[m] = at ? Math.round((at.getTime() - now) / 60000) : null;
      });

      S.type='napoletana'; S.mode='end';
      // Fire timer fram: nok for en 2-timers hurtigdeig, haaploest for Kveldsdeig
      // (12t kjoleskap + temperering) — saa de to notatene skal peke hver sin vei.
      const soon = new Date(now + 4*60*60000);
      const p2 = n => String(n).padStart(2,'0');
      document.getElementById('mob-ed').value =
        soon.getFullYear()+'-'+p2(soon.getMonth()+1)+'-'+p2(soon.getDate());
      document.getElementById('mob-et').value = p2(soon.getHours())+':'+p2(soon.getMinutes());
      const kveldNote = methodFitNote('kveld');
      S.hurtigH = 2; S.temp = 22; // ikke arv 14t fra varmt-kjokken-testen
      const hurtigNote = methodFitNote('hurtig');

      mobShowTab('settings'); wizGoto(1);
      mobSetMode('end');
      const lblEnd = document.getElementById('wiz-step1-when-lbl').textContent;
      mobSetMode('start');
      const lblStart = document.getElementById('wiz-step1-when-lbl').textContent;
      mobSetMode('end');

      return {
        perMethod,
        allPositive: Object.values(perMethod).every(v => v !== null && v > 0),
        kveldSaysNo: !!(kveldNote && kveldNote.dim && kveldNote.txt.includes('rekker ikke')),
        hurtigFits: !!(hurtigNote && !hurtigNote.dim),
        headerFollowsToggle: lblEnd === 'Når vil du spise?' && lblStart === 'Du begynner nå',
        deadFieldsGone: !document.getElementById('mob-sd') && !document.getElementById('mob-st')
      };
    }''')
    ok16 = (
      r16['allPositive'] and r16['kveldSaysNo'] and r16['hurtigFits'] and
      r16['headerFollowsToggle'] and r16['deadFieldsGone']
    )
    results.append(('earliest_time_comes_from_step_builder_for_all_methods', ok16, r16))

    # v5.84: bakoverplanlegging kunne gi oppstart i FORTIDEN uten et ord —
    # Runes skjermbilder: spise i morgen 18:00 gir oppstart i gaar 16:15, mens
    # hintet samtidig sier tidligst mulig 20:54. Beta-soket fikk sperren i
    # v5.52; wizardveien faar den naa. Tester at sjekken flagger det, at
    # ett-trykks-knappen flytter steketiden til noe gjennomfoerbart, og at
    # varselet forsvinner etterpaa. Og at en romslig plan IKKE flagges.
    r17 = page.evaluate('''() => {
      const allDay = [['00:00','23:59'], null];
      window._pizzatidSchedule = {mon:allDay,tue:allDay,wed:allDay,thu:allDay,fri:allDay,sat:allDay,sun:allDay};
      _dismissedWarnings.clear();
      S.type='napoletana'; S.method='standard'; S.mode='end';
      S.mel=500; S.hydro=65; S.cold=24; S.temp=22; S.meltype='doppio_zero';
      const p2 = n => String(n).padStart(2,'0');
      const setEat = d => {
        document.getElementById('mob-ed').value = d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
        document.getElementById('mob-et').value = p2(d.getHours())+':'+p2(d.getMinutes());
      };

      // Spise om 2 timer med en ~26-timers metode -> oppstart ~24t i fortiden.
      setEat(new Date(Date.now() + 2*3600000));
      mobShowTab('settings'); wizGoto(3); mobGen();
      const check = document.getElementById('wiz-check');
      const flagged = check.textContent.includes('Oppstarten har allerede passert');
      const btn = Array.from(check.querySelectorAll('button')).find(b => b.textContent.includes('i stedet'));

      let afterClick = null, eatMovedToFuture = null;
      if (btn) {
        btn.click();
        afterClick = !document.getElementById('wiz-check').textContent.includes('Oppstarten har allerede passert');
        const dv = document.getElementById('mob-ed').value, tv = document.getElementById('mob-et').value;
        eatMovedToFuture = new Date(dv+'T'+tv).getTime() > Date.now();
      }

      // Romslig plan (3 doegn fram) skal IKKE flagges.
      setEat(new Date(Date.now() + 72*3600000));
      mobGen();
      const roomyClean = !document.getElementById('wiz-check').textContent.includes('Oppstarten har allerede passert');

      return {flagged, hasBtn: !!btn, afterClick, eatMovedToFuture, roomyClean};
    }''')
    ok17 = (
      r17['flagged'] and r17['hasBtn'] and
      r17['afterClick'] is True and r17['eatMovedToFuture'] is True and
      r17['roomyClean']
    )
    results.append(('backward_plan_flags_start_in_the_past_with_fix', ok17, r17))

    # v5.86: Rune paapekte at "Steketidspunkt" (fritt soek) og "Populaere
    # tidspunkt for pizza" i Beta-fanen var to helt uavhengige soek som ikke
    # hang sammen — standardverdien i det frie soeket kunne vaere et tidspunkt
    # som alt hadde passert, og de faste tidspunktene skrev til en helt annen
    # boks. Tester at (1) standarddatoen alltid er i fremtiden selv naar
    # klokken 19:00 alt er passert i dag, og (2) et klikk paa et populaert
    # tidspunkt fyller DE SAMME feltene og skriver til DET SAMME resultatfeltet
    # som det frie soeket bruker.
    r18 = page.evaluate('''() => {
      const dEl=document.getElementById('mob-beta-ed'), tEl=document.getElementById('mob-beta-et');
      dEl.value='';
      mobShowTab('beta');
      const defaultDate = dEl.value;
      const defaultIsFuture = new Date(defaultDate+'T19:00').getTime() > Date.now();

      const shortcuts = Array.from(document.querySelectorAll('#mob-beta-faste button'));
      const firstLabel = shortcuts.length ? shortcuts[0].textContent : null;
      // Sett sentinel-verdier først, så vi robust ser at KLIKKET skriver til begge
      // felt — uavhengig av om standarddatoen tilfeldigvis er lik snarveiens dato
      // (skjer når i dag er torsdag og kl. 19 er passert → begge blir «fredag 19:00»).
      dEl.value='2000-01-01'; tEl.value='03:00';
      if (shortcuts.length) shortcuts[0].click();
      const resultText = document.getElementById('mob-beta-result').textContent;
      const fieldsUpdated = dEl.value !== '2000-01-01' && tEl.value !== '03:00';

      return {
        shortcutCount: shortcuts.length,
        firstLabel, defaultDate, defaultIsFuture,
        resultHasContent: resultText.trim().length > 0,
        fieldsUpdated
      };
    }''')
    ok18 = (
      r18['shortcutCount'] == 5 and r18['defaultIsFuture'] and
      r18['resultHasContent'] and r18['fieldsUpdated']
    )
    results.append(('beta_shortcuts_share_one_search_with_feasible_default', ok18, r18))

    # v5.87: Rune meldte at "passer godt"-teksten under metodekortene var
    # ustabil — "helt borte og kommer og gaar litt". Rotaarsak: (1)
    # syncMobControls() kalte mobMethodCards() FOeR mob-ed/mob-et fikk sine
    # standardverdier, saa foerste rendring alltid manglet fit-tekst, og (2)
    # wizGoto() hadde ingen oppfrisking for aa komme inn paa Metode-steget
    # (steg 1 og 3 hadde det), saa kortene viste alltid resultatet fra forrige
    # gang NOEN klikket et kort — ikke det som stemte med gjeldende dato.
    # Tester at kortene oppdateres LIVE naar man setter en ny dato paa steg 1
    # og navigerer til steg 2, UTEN aa klikke noe kort manuelt.
    r19 = page.evaluate('''() => {
      const allDay = [['00:00','23:59'], null];
      window._pizzatidSchedule = {mon:allDay,tue:allDay,wed:allDay,thu:allDay,fri:allDay,sat:allDay,sun:allDay};
      mobShowTab('settings');
      // Eksplisitt tilstand -- flere tester deler S, og denne skal ikke arve
      // f.eks. en lang S.cold fra en tidligere test.
      S.type='napoletana'; S.method='standard'; S.mel=500; S.hydro=65;
      S.cold=24; S.poolishH=14; S.poolishCold=false; S.temp=22; S.meltype='couco';
      const p2 = n => String(n).padStart(2,'0');
      const setEat = h => {
        const d = new Date(Date.now() + h*3600000);
        document.getElementById('mob-ed').value = d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
        document.getElementById('mob-et').value = p2(d.getHours())+':'+p2(d.getMinutes());
      };
      const poolishText = () => Array.from(document.querySelectorAll('#mob-gmet > div'))
        .find(c => c.textContent.includes('Poolish')).textContent;

      // Rikelig med tid: Poolish skal passe.
      wizGoto(1); setEat(72); mobSetMode('end'); wizGoto(2);
      const roomy = poolishText();

      // Knapt med tid: Poolish skal IKKE lenger si "passer godt", uten at
      // noe kort er klikket mellom de to maalingene.
      wizGoto(1); setEat(3); wizGoto(2);
      const tight = poolishText();

      return {
        roomySaysFits: roomy.includes('passer godt'),
        tightSaysNo: tight.includes('rekker ikke'),
        actuallyDiffered: roomy !== tight
      };
    }''')
    ok19 = r19['roomySaysFits'] and r19['tightSaysNo'] and r19['actuallyDiffered']
    results.append(('method_cards_refresh_live_when_entering_metode_step', ok19, r19))

    # v5.89: "Steg" (fanenavn) og "Holder?" (wizardstegets korte etikett) var
    # for generiske til å skille seg fra naboene sine ("Planlegging" vs "Steg",
    # og en spørsmålsetikett alene blant to substantiv-etiketter). Fryser de
    # nye navnene "Tidsplan" og "Sjekk" + at knappene som pekte til fanen
    # fulgte med, så en fremtidig endring ikke sniker de gamle navnene tilbake.
    r20 = page.evaluate("""() => {
      return {
        tabLabel: document.getElementById('mob-tab-plan').textContent.trim(),
        wizStepLabel: WIZ_STEPS.find(s => s.id === 3).label,
        finishBtnText: document.querySelector('#wiz-step-check button[onclick="wizFinish()"]')?.textContent || '',
        finjusterBackText: document.getElementById('wiz-finjuster-back-to-plan')?.textContent || ''
      };
    }""")
    ok20 = (
      r20['tabLabel'] == '📅Tidsplan' and
      r20['wizStepLabel'] == 'Sjekk' and
      'tidsplanen' in r20['finishBtnText'].lower() and
      'tidsplanen' in r20['finjusterBackText'].lower()
    )
    results.append(('tab_and_wizard_step_have_clearer_names', ok20, r20))

    # v6.21: Inngangs-gaffelen (Smart-plan vs. velg selv). Ved friskt oppstart
    # UTEN gjenopprettet oppsett møter man gaffelen (steg 0), ikke steg 1 direkte.
    # Dette er IKKE den fjernede v5.90 «Hei igjen»-skjermen: begge dører bevarer
    # full flyt (Dør B går gjennom HELE wizarden inkl. sjekken), og wiz-returning
    # finnes fortsatt ikke. Testen vokter: (a) gaffel vises ved friskt oppstart,
    # (b) «Jeg vet hva jeg vil ha» (entryPickManual) tar deg til steg 1, (c)
    # fanebytte-guarden hindrer fortsatt tilbakestilling, (d) et gjenopprettet
    # oppsett HOPPER OVER gaffelen (ikke avbryt påbegynt arbeid), (e) de gamle
    # sikringene: wiz-returning borte, ingen døde funksjoner, wizGoto kaster ikke.
    r21 = page.evaluate("""() => {
      // (a) friskt oppstart, ingen gjenopprettet oppsett → gaffel
      window._restoredSetup = false;
      window._wizEnteredOnce = false;
      mobShowTab('tips');
      mobShowTab('settings');
      const entryStep = window._wizStep;                       // 0 = gaffel
      const forkVisible = document.getElementById('wiz-entry').style.display !== 'none';
      // (a2) v6.21-feil: Dør A (Smart-plan) skjuler gaffelen og bytter fane —
      // retur til Planlegging skal vise gaffelen igjen, IKKE en blank skjerm.
      entryPickSmart();
      const forkHiddenAfterSmart = document.getElementById('wiz-entry').style.display === 'none';
      mobShowTab('tips');
      mobShowTab('settings');
      const forkBackNotBlank = document.getElementById('wiz-entry').style.display !== 'none' && window._wizStep === 0;
      // (a3) logoen tar deg tilbake til gaffelen fra en hvilken som helst fane
      mobShowTab('tips');
      goToEntryFork();
      const logoReturnsToFork = document.getElementById('mob-settings').classList.contains('active')
        && document.getElementById('wiz-entry').style.display !== 'none';
      // (b) Dør B → steg 1
      entryPickManual();
      const stepAfterManual = window._wizStep;                 // 1
      // (c) fanebytte-guarden holder
      wizGoto(2);
      mobShowTab('tips');
      mobShowTab('settings');
      const stepAfterTabSwitch = window._wizStep;              // 2
      // (d) gjenopprettet oppsett hopper over gaffelen
      window._restoredSetup = true;
      window._wizEnteredOnce = false;
      mobShowTab('tips');
      mobShowTab('settings');
      const restoredSkipsFork = window._wizStep === 1;
      let gotoThrew = false;
      try{ wizGoto(1); }catch(e){ gotoThrew = true; }
      return {
        entryStep, forkVisible, forkHiddenAfterSmart, forkBackNotBlank, logoReturnsToFork,
        stepAfterManual, stepAfterTabSwitch, restoredSkipsFork, gotoThrew,
        returningElementGone: !document.getElementById('wiz-returning'),
        noStaleFunctions: typeof window.wizDecideStart === 'undefined' && typeof window.wizUseLastConfig === 'undefined'
      };
    }""")
    ok21 = (
      r21['entryStep'] == 0 and r21['forkVisible'] and
      r21['forkHiddenAfterSmart'] and r21['forkBackNotBlank'] and r21['logoReturnsToFork'] and
      r21['stepAfterManual'] == 1 and r21['stepAfterTabSwitch'] == 2 and
      r21['restoredSkipsFork'] and not r21['gotoThrew'] and
      r21['returningElementGone'] and r21['noStaleFunctions']
    )
    results.append(('entry_fork_smart_return_not_blank_logo_returns_and_manual_to_step_1', ok21, r21))

    # v5.91: Rune sitt scenario — han vet han faktisk KAN ordne deigen kl.
    # 14:00 den dagen, men gidder ikke gå inn og redigere pizzatiden for én
    # enkelt dag. Ny "Dette er greit — fortsett likevel"-knapp på tidskonflikt-
    # varselet (kun busy/natt, ikke deigens fysiske begrensninger). Tester at
    # (1) knappen finnes for en pizzatid-konflikt, (2) et klikk bytter boksen
    # til en nøytral bekreftelse i stedet for å bare skjule den, (3) sjekken
    # sier "Planen holder — med ett godtatt forbehold" i stedet for å late som
    # ingenting skjedde ELLER late som noe fortsatt er uløst, og (4) "Angre"
    # tar deg tilbake til det ekte varselet.
    r22 = page.evaluate("""() => {
      const none = [['12:00','12:01'], null];
      window._pizzatidSchedule = {mon:none,tue:none,wed:none,thu:none,fri:none,sat:none,sun:none};
      _dismissedWarnings.clear(); _acceptedConflicts.clear();
      S.type='napoletana'; S.method='standard'; S.mode='end';
      S.mel=500; S.hydro=65; S.cold=48; S.temp=22; S.meltype='couco';
      const far = new Date(Date.now() + 10*24*3600000);
      const p2 = n => String(n).padStart(2,'0');
      document.getElementById('mob-ed').value = far.getFullYear()+'-'+p2(far.getMonth()+1)+'-'+p2(far.getDate());
      document.getElementById('mob-et').value = '18:00';
      mobShowTab('settings'); wizGoto(3);

      const check = () => document.getElementById('wiz-check');
      const before = check().innerHTML;
      const acceptBtn = Array.from(check().querySelectorAll('button'))
        .find(b => b.textContent.includes('fortsett likevel'));
      const hadAcceptBtn = !!acceptBtn;

      if (acceptBtn) acceptBtn.click();
      const afterAccept = check().innerHTML;

      const undoLink = Array.from(check().querySelectorAll('span'))
        .find(el => el.textContent.trim() === 'Angre');
      const hadUndo = !!undoLink;
      if (undoLink) undoLink.click();
      const afterUndo = check().innerHTML;

      _acceptedConflicts.clear(); _dismissedWarnings.clear();
      return {
        beforeHadWarning: before.includes('Et steg havner'),
        hadAcceptBtn,
        afterAcceptIsGreenWithCaveat: afterAccept.includes('med ett godtatt forbehold'),
        afterAcceptHasNeutralBox: afterAccept.includes('data-accepted') && afterAccept.includes('Du har godtatt'),
        afterAcceptNoLongerAmberWarning: !afterAccept.includes('Et steg havner'),
        hadUndo,
        afterUndoShowsRealWarningAgain: afterUndo.includes('Et steg havner') && !afterUndo.includes('Planen holder')
      };
    }""")
    ok22 = (
      r22['beforeHadWarning'] and r22['hadAcceptBtn'] and
      r22['afterAcceptIsGreenWithCaveat'] and r22['afterAcceptHasNeutralBox'] and
      r22['afterAcceptNoLongerAmberWarning'] and r22['hadUndo'] and
      r22['afterUndoShowsRealWarningAgain']
    )
    results.append(('accept_time_conflict_anyway_without_lying_about_it', ok22, r22))

    # (v5.92-testen pc_guide_modal_button_has_readable_contrast er fjernet i v6.36
    # sammen med selve «Kom i gang»-modalen — se changelog.)

    # v5.94: REELL BUG (Runes skjermbilde) -- currentUserName() ble kalt fra 4
    # steder (lagre bakst, legge til notat) men var aldri definert. Kastet
    # ReferenceError synkront inni JSON.stringify(), FOR fetch() i det hele
    # tatt startet -- "Kunne ikke lagre... (currentUserName is not defined)".
    # Tester at funksjonen finnes, ikke kaster med eller uten innlogget
    # bruker, og returnerer riktig navn naar en bruker er satt.
    r24 = page.evaluate("""() => {
      const saved = localStorage.getItem('pizzaUser');
      let withUserThrew = false, withoutUserThrew = false, name = null;
      localStorage.setItem('pizzaUser', JSON.stringify({id:'t1', name:'Rune'}));
      try { name = currentUserName(); } catch(e) { withUserThrew = true; }
      localStorage.removeItem('pizzaUser');
      let emptyResult = null;
      try { emptyResult = currentUserName(); } catch(e) { withoutUserThrew = true; }
      if (saved) localStorage.setItem('pizzaUser', saved); else localStorage.removeItem('pizzaUser');
      return {
        exists: typeof currentUserName === 'function',
        withUserThrew, withoutUserThrew, name, emptyResult
      };
    }""")
    ok24 = (
      r24['exists'] and not r24['withUserThrew'] and not r24['withoutUserThrew'] and
      r24['name'] == 'Rune' and r24['emptyResult'] == ''
    )
    results.append(('current_user_name_defined_and_never_throws', ok24, r24))

    # v5.95: ny "trenger du"-chiprad over stegbeskrivelsen -- viser mengdene
    # som chips i tillegg til (ikke i stedet for) prosaen, slik at man kan se
    # hva man trenger uten a lese hele teksten. Tester at chipsene finnes og
    # stemmer med de samme tallene som star i selve teksten (samme kilde-
    # variabler, kan ikke drifte fra hverandre), for bade Kveldsdeig (steget
    # fra Runes skjermbilde) og Standard, og at PC- og mobilrendring viser
    # identiske chips siden renderSteps() er delt.
    # v0.690 (skisse B): ingrediens-chips vises nå PÅ FORESPØRSEL (bak «🧾 N
    # ingredienser»). Åpne dem per steg (_openIng) og sjekk at tallene stemmer, og
    # at PC- og mobilrendring viser identiske chips siden renderSteps() er delt.
    r25 = page.evaluate("""() => {
      resetTestState();
      window._openIng=new Set([0]); window._openSub=new Set(); window._openTip=new Set();
      S.type='napoletana'; S.method='kveld'; S.kveldH=15; S.mel=500; S.hydro=65;
      S.mode='end'; S.temp=22; S.gjaer='torr';
      mobShowTab('plan'); mobGen();
      const mobStep = document.querySelector('#mob-plan-content .mob-step');
      const mobChips = mobStep ? Array.from(mobStep.querySelectorAll('.mob-needchip')).map(c=>c.textContent) : [];

      document.body.classList.remove('mob-mode'); document.body.classList.add('pc-mode');
      gen();
      const pcStep = document.querySelector('#p-plan .step');
      const pcChips = pcStep ? Array.from(pcStep.querySelectorAll('.needchip')).map(c=>c.textContent) : [];
      document.body.classList.remove('pc-mode'); document.body.classList.add('mob-mode');

      S.method='standard'; S.cold=48; window._openIng=new Set([0]);
      mobGen();
      const stdStep = document.querySelector('#mob-plan-content .mob-step');
      const stdChips = stdStep ? Array.from(stdStep.querySelectorAll('.mob-needchip')).map(c=>c.textContent) : [];
      window._openIng=new Set();
      return { mobChips, pcChips, stdChips };
    }""")
    ok25 = (
      r25['mobChips'] == ['💧 325g vann', '🫙 1.01g tørrgjær', '🌾 500g mel', '🧂 14g salt'] and
      r25['pcChips'] == r25['mobChips'] and
      len(r25['stdChips']) > 0
    )
    results.append(('step_needs_chips_correct_and_pc_mobile_parity', ok25, r25))

    # v0.688 (skisse B): Understeg og Tips vises PER STEG med små ikoner — kun på
    # steg som faktisk har innhold. Ingen global bryter lenger. Klikk et stegs
    # 📋-ikon utvider nettopp det stegets understeg (avhakbare i aktive steg), og
    # avsnittsteksten er fortsatt der som fallback når det er sammenslått.
    r26 = page.evaluate("""() => {
      resetTestState();
      window._openSub=new Set(); window._openTip=new Set(); window._checkedSubsteps.clear();
      S.type='napoletana'; S.method='standard'; S.mel=500; S.hydro=65; S.cold=24;
      S.mode='end'; S.temp=22; S.gjaer='torr';
      mobShowTab('plan'); mobGen();
      const plan=()=>document.getElementById('mob-plan-content');
      const noGlobal = !plan().innerHTML.includes('Vis understeg') && !plan().innerHTML.includes('Understeg PÅ') && !plan().innerHTML.includes('Vis forklaringer');
      const icons=[...plan().querySelectorAll('.step-detail-btn')];
      const hasIcons=icons.length>0;
      const subBtn=icons.find(b=>b.textContent.trim()==='📋');
      const listsBefore=plan().querySelectorAll('.substep-list').length;
      // v0.693: understeg ERSTATTER desc — åpner du ett stegs 📋 forsvinner nettopp
      // det stegets avsnittstekst (mob-sdesc), og sjekklista tar plassen.
      const descsBefore=plan().querySelectorAll('.mob-sdesc').length;
      if(subBtn) subBtn.click();
      const listsAfter=plan().querySelectorAll('.substep-list').length;
      const descsAfter=plan().querySelectorAll('.mob-sdesc').length;
      const expandsOne = listsAfter===listsBefore+1;
      const descReplaced = descsAfter === descsBefore - 1;
      const item=plan().querySelector('.substep-item[onclick]');
      let checkedWorks=null;
      if(item){ item.click(); checkedWorks=!!plan().querySelector('.substep-item.substep-done'); }
      window._openSub=new Set(); window._openTip=new Set(); window._checkedSubsteps.clear();
      return { noGlobal, hasIcons, expandsOne, descReplaced, checkedWorks };
    }""")
    ok26 = (r26['noGlobal'] and r26['hasIcons'] and r26['expandsOne'] and r26['descReplaced'] and r26['checkedWorks'])
    results.append(('substep_and_tips_shown_per_step_via_icons', ok26, r26))

    # v6.13 (BACKLOG F1): understeg-avhaking huskes — lastes med lagret deig
    # (openBake). (F2 «husk visning globalt» utgikk i v0.688 (skisse B): understeg
    # vises nå per steg, transient — ikke en global husket modus.)
    r26b = page.evaluate("""() => {
      resetTestState();
      window._bakesCache = [{ id:'bake_test_ff', name:'Test', status:'active',
        config:{...S}, anchorMode:'start', anchorISO:new Date().toISOString(),
        checkedSteps:[0,1], checkedIngredients:['Mel'], checkedSubsteps:['0-0','2-1'] }];
      try{ openBake('bake_test_ff'); }catch(e){}
      const loadedSubsteps = [...window._checkedSubsteps].sort();
      window._activeDeigId=null; window._checkedSubsteps=new Set();
      return { loadedSubsteps };
    }""")
    ok26b = (r26b['loadedSubsteps'] == ['0-0','2-1'])
    results.append(('substep_checkoffs_load_from_saved_dough', ok26b, r26b))

    # v6.13 (BACKLOG F3): paabegynt oppsett persisteres til localStorage og
    # rehydreres. Kun for USAGDE oppsett (no-op naar _activeDeigId er satt);
    # rene visningspreferanser holdes utenfor; "Start ny deig" + standard rydder.
    r26c = page.evaluate("""() => {
      resetTestState();
      window._activeDeigId = null;
      // ikke-standard oppsett -> persistSetup lagrer det (uten view-prefs).
      S.type='chicago'; S.method='kveld'; S.mel=750; S.hydro=60; S.mode='end';
      try{ localStorage.removeItem('pizzaSetup'); }catch(e){}
      persistSetup();
      let stored=null; try{ stored = JSON.parse(localStorage.getItem('pizzaSetup')); }catch(e){}
      const hasViewPrefs = !!stored && ('showHelp' in stored || 'showSubsteps' in stored);

      // rehydrer fra localStorage etter aa ha nullstilt S i minnet.
      Object.assign(S, DEF);
      const restored = restoreSetup();
      const after = { type:S.type, method:S.method, mel:S.mel, hydro:S.hydro, mode:S.mode };

      // lagret deig eier egen tilstand -> persistSetup skal no-oppe.
      try{ localStorage.removeItem('pizzaSetup'); }catch(e){}
      window._activeDeigId='bake_x'; S.type='langpanne'; persistSetup();
      let storedWhenActive=null; try{ storedWhenActive = localStorage.getItem('pizzaSetup'); }catch(e){}
      window._activeDeigId=null;

      // standard-oppsett -> ingenting aa gjenopprette, noekkel fjernes.
      try{ localStorage.setItem('pizzaSetup','{\\"type\\":\\"chicago\\"}'); }catch(e){}
      Object.assign(S, DEF); S.mode=DEF.mode; persistSetup();
      let afterDefault=null; try{ afterDefault = localStorage.getItem('pizzaSetup'); }catch(e){}

      try{ localStorage.removeItem('pizzaSetup'); }catch(e){}
      return { stored, hasViewPrefs, restored, after, storedWhenActive, afterDefault };
    }""")
    ok26c = (
      r26c['stored'] and r26c['stored']['type']=='chicago' and r26c['stored']['method']=='kveld' and
      r26c['stored']['mel']==750 and r26c['stored']['mode']=='end' and
      r26c['hasViewPrefs'] is False and
      r26c['restored'] and r26c['after'] == {'type':'chicago','method':'kveld','mel':750,'hydro':60,'mode':'end'} and
      r26c['storedWhenActive'] is None and r26c['afterDefault'] is None
    )
    results.append(('setup_persists_and_restores_across_reload', ok26c, r26c))

    # v0.686: F5-«nå/neste»-stripa er FJERNET (duplikerte lista + konkurrerte med
    # nå-uthevingen/Fokus). Vokt at den ikke sniker seg tilbake: funksjonene/CSS-en
    # skal være borte, og planen skal ikke inneholde en next-strip.
    r26d = page.evaluate("""() => {
      window._planChosen=true; setLayout('mob'); mobShowTab('plan'); try{mobGen();}catch(e){}
      const planHtml=(document.getElementById('mob-plan-content')||{}).innerHTML||'';
      return {
        stripeFnGone: typeof nextStepStripeHTML==='undefined',
        tickerFnGone: typeof startNextStepTicker==='undefined',
        countdownFnGone: typeof f5CountdownFromMs==='undefined',
        noStripInPlan: !planHtml.includes('next-strip'),
        scrollStillExists: typeof scrollToNextStep==='function'
      };
    }""")
    ok26d = all(r26d.get(k) for k in ['stripeFnGone','tickerFnGone','countdownFnGone','noStripInPlan','scrollStillExists'])
    results.append(('f5_next_step_stripe_removed', ok26d, r26d))

    # v5.98: REELL BUG (Rune) -- "jeg ser knappen, men ingenting skjer naar
    # jeg trykker". Ikke en klikk-feil: bryteren virket helt fint (label
    # byttet til PAA, S.showSubsteps flippet), men Kveldsdeig -- metoden Rune
    # faktisk har testet med hele denne oekten -- hadde INGEN substeps
    # skrevet ennaa. Bare Standard hadde faatt dem i v5.96/97, saa alt falt
    # tilbake til gammel tekst, og ingenting SYNLIG endret seg. Lagt til
    # substeps paa alle 4 av Kveldsdeigs egne steg (mix, form, kjoleskap,
    # temperer) -- bake-steget mangler fortsatt, samme kjente grense som
    # Standard. Tester at PAA faktisk viser understeg-lister for Kveldsdeig
    # spesifikt, ikke bare at knappen reagerer.
    r27 = page.evaluate("""() => {
      resetTestState();
      window._openSub=new Set(); window._openTip=new Set();
      S.type='napoletana'; S.method='kveld'; S.kveldH=15; S.mel=500; S.hydro=65;
      S.mode='end'; S.temp=22; S.gjaer='torr';
      mobShowTab('plan'); mobGen();
      const n = document.querySelectorAll('#mob-plan-content .mob-step').length;
      // v0.691: selve stegteksten (desc) vises som standard. v0.693: når understeg
      // åpnes ERSTATTER de desc — så etter at alle er åpnet er det ingen desc igjen.
      const descsBefore = document.querySelectorAll('#mob-plan-content .mob-sdesc').length;
      window._openSub=new Set([...Array(n).keys()]); mobGen(); // åpne alle steg per-steg
      const result = {
        descsBefore, n,
        substepLists: document.querySelectorAll('#mob-plan-content .substep-list').length,
        descsAfter: document.querySelectorAll('#mob-plan-content .mob-sdesc').length,
        firstItems: document.querySelector('#mob-plan-content .mob-step').querySelectorAll('.substep-item').length
      };
      window._openSub=new Set(); mobGen();
      return result;
    }""")
    ok27 = (
      r27['n'] == 5 and r27['descsBefore'] == 5 and r27['substepLists'] == 5 and
      r27['descsAfter'] == 0 and r27['firstItems'] == 4
    )
    results.append(('substep_coverage_extended_to_kveldsdeig', ok27, r27))

    # v5.99: "alle oppskrifter maa faa understeg" -- fullfoert hele sveipet.
    # Tester at HVER metode (Standard/Poolish/Biga/Hurtigdeig/Kveldsdeig/
    # Mania-poolish/Ingen elting) har substeps paa ABSOLUTT alle sine steg naar
    # bryteren er PAA -- null gjenvaerende avsnittstekst noe sted, inkludert
    # det delte bakestegetet (bakeSubsteps()) som var det siste gjentatte hullet
    # gjennom v5.96-98.
    r28 = page.evaluate("""() => {
      resetTestState();
      const scenarios = [
        ['standard', {cold:24}], ['poolish', {poolishH:14, cold:24}],
        ['biga', {bigaH:18, cold:24}], ['hurtig', {hurtigH:5}],
        ['kveld', {kveldH:10}], ['mania', {}]
      ];
      const out = {};
      // Åpne ALLE steg per-steg (skisse B) i stedet for en global bryter.
      const openAll=()=>{ const n=document.querySelectorAll('#mob-plan-content .mob-step').length; window._openSub=new Set([...Array(n).keys()]); mobGen(); return n; };
      scenarios.forEach(([method, extra]) => {
        window._openSub=new Set();
        S.type='napoletana'; S.method=method; S.mel=500; S.hydro=65;
        S.mode='end'; S.temp=22; S.gjaer='torr';
        Object.keys(extra).forEach(k => S[k]=extra[k]);
        mobShowTab('plan'); mobGen();
        const total = openAll();
        out[method] = {
          total,
          lists: document.querySelectorAll('#mob-plan-content .substep-list').length,
          descsLeft: document.querySelectorAll('#mob-plan-content .mob-sdesc').length
        };
      });
      window._openSub=new Set();
      S.type='ingenelting'; S.mel=500; S.hydro=75; S.mode='end'; S.temp=22; S.gjaer='torr';
      mobShowTab('plan'); mobGen();
      const total2 = openAll();
      out['ingenelting'] = {
        total: total2,
        lists: document.querySelectorAll('#mob-plan-content .substep-list').length,
        descsLeft: document.querySelectorAll('#mob-plan-content .mob-sdesc').length
      };
      window._openSub=new Set(); S.type='napoletana'; mobGen();
      return out;
    }""")
    # v0.693: understeg erstatter desc når de åpnes — så med alle understeg åpne er
    # det ingen gjenværende avsnittstekst, og hvert steg har en understeg-liste.
    ok28 = all(r28[m]['lists'] == r28[m]['total'] and r28[m]['descsLeft'] == 0 for m in r28)
    results.append(('every_method_has_full_substep_coverage', ok28, r28))

    # v0.688 (skisse B): Understeg/Tips flyttet fra globale verktøyrad-knapper til
    # PER-STEG-ikoner. Verktøyraden i Tidsplan har nå KUN Juster; ingen global
    # understeg/tips-bryter. Tips vises per steg: klikk et stegs 💡-ikon viser
    # nettopp det stegets tips-boks. Wizardens kompakte statuslinjer beholder
    # Juster inline, uten understeg/tips-rot.
    r29 = page.evaluate("""() => {
      resetTestState();
      window._openSub=new Set(); window._openTip=new Set();
      S.type='napoletana'; S.method='kveld'; S.kveldH=15; S.mel=500; S.hydro=65;
      S.mode='end'; S.temp=22; S.gjaer='torr';
      mobShowTab('plan'); mobGen();
      const plan=()=>document.getElementById('mob-plan-content');
      const juster = !!plan().querySelector('button[onclick="wizOpenFinjusterFromPlan()"]');
      const noGlobalToggles = !plan().querySelector('button[onclick="toggleSubsteps()"]') && !plan().querySelector('button[onclick="toggleHelpFromPlan()"]');
      // Tips per steg: finn et stegs Tips-ikon, klikk, verifiser tips-boks kom
      const tipsBoxesBefore = plan().querySelectorAll('.mob-stip').length;
      const tipBtn=[...plan().querySelectorAll('.step-detail-btn')].find(b=>b.textContent.trim()==='💡');
      if(tipBtn) tipBtn.click();
      const tipsBoxesAfter = plan().querySelectorAll('.mob-stip').length;

      mobShowTab('settings'); wizGoto(2);
      const wizHasJuster = !!document.querySelector('#wiz-status-step2 button[onclick="wizOpenFinjusterFromPlan()"]');
      const wizHasToggles = !!document.querySelector('#wiz-status-step2 button[onclick="toggleSubsteps()"]') || !!document.querySelector('#wiz-status-step2 button[onclick="toggleHelpFromPlan()"]');
      window._openTip=new Set();
      return { juster, noGlobalToggles, tipsBoxesBefore, tipsBoxesAfter, hadTipBtn:!!tipBtn, wizHasJuster, wizHasToggles };
    }""")
    ok29 = (
      r29['juster'] and r29['noGlobalToggles'] and r29['hadTipBtn'] and
      r29['tipsBoxesBefore'] == 0 and r29['tipsBoxesAfter'] > 0 and
      r29['wizHasJuster'] and not r29['wizHasToggles']
    )
    results.append(('plan_toolbar_juster_only_details_moved_per_step', ok29, r29))

    # v6.01: "Start ny deig"-knapp. doReset() var alltid i koden men koblet
    # til INGEN knapp -- testet direkte for bygging (26.07) og fant to reelle
    # bugs i selve funksjonen: (1) window._checkedSubsteps ble aldri tomt, (2)
    # den nullstilte kaldtid til en gammel hardkodet 1 i stedet for DEF.cold
    # (24), rett etter at Object.assign(S,DEF) allerede hadde satt den riktig
    # -- saa "nullstillingen" saa ut til aa virke men S.cold endte feil hver
    # gang. Begge fikset ved kilden. Tester hele kjeden: banner skjult paa
    # standard, vises med riktig tekst naar man er borte fra standard, og et
    # ekte knappeklikk fjerner banner + nullstiller alt + sender til steg 1.
    r30 = page.evaluate("""() => {
      resetTestState();
      mobShowTab('settings'); wizGoto(1);
      const bannerAtDefault = document.getElementById('wiz-fresh-banner').style.display;

      S.type='chicago'; S.method='kveld'; S.kveldH=15; S.mel=750; S.hydro=60;
      S.mode='end'; S.temp=24; S.gjaer='fersk';
      window._checked = new Set([0,1]);
      window._checkedSubsteps = new Set(['0-0','1-2']);
      wizGoto(2); wizGoto(1);
      const bannerAfterChange = document.getElementById('wiz-fresh-banner').style.display;
      const bannerText = document.getElementById('wiz-fresh-banner-txt').textContent;

      const btn = document.querySelector('#wiz-fresh-banner button[onclick="doReset()"]');
      const hadBtn = !!btn;
      btn.click();

      return {
        bannerAtDefault, bannerAfterChange, bannerText, hadBtn,
        wizStepAfterReset: window._wizStep,
        typeAfterReset: S.type, coldAfterReset: S.cold,
        checkedAfterReset: [...window._checked],
        checkedSubstepsAfterReset: [...window._checkedSubsteps],
        bannerAfterReset: document.getElementById('wiz-fresh-banner').style.display
      };
    }""")
    ok30 = (
      r30['bannerAtDefault'] == 'none' and r30['bannerAfterChange'] == 'flex' and
      r30['bannerText'] == 'Fortsetter: Chicago · Kveldsdeig' and r30['hadBtn'] and
      r30['wizStepAfterReset'] == 1 and r30['typeAfterReset'] == 'napoletana' and
      r30['coldAfterReset'] == 24 and r30['checkedAfterReset'] == [] and
      r30['checkedSubstepsAfterReset'] == [] and r30['bannerAfterReset'] == 'none'
    )
    results.append(('start_ny_deig_button_resets_everything_and_returns_to_step_1', ok30, r30))

    # v6.01: REELL BUG (Rune, bekreftet direkte) -- avkrysningsstatus var
    # indeksbasert, ikke innholdsbasert. Bytter pizzatype/metode midt i okten
    # lot gamle avkrysninger henge igjen paa feil steg. Tester at et klikk paa
    # den ALLEREDE valgte verdien IKKE tommer noe (ingen falsk nullstilling),
    # mens et faktisk bytte av type ELLER metode tommer alle tre tilstander,
    # bade pa mobil og PC.
    # v6.12 (BACKLOG #5): utvidet -- oven og gjaer skriver ogsaa om steg-INNHOLD
    # (steketemp/-tid, gjaertype/-mengde), saa endring av dem nullstiller na ogsaa
    # avhaking. kjokkenmaskin er BEVISST utelatt (samme logiske eltesteg, kun
    # teknikk-ordlyd) og skal fortsatt IKKE nullstille.
    r31 = page.evaluate("""() => {
      resetTestState();
      mobShowTab('settings'); wizGoto(1);
      window._checked = new Set([0,1]);
      window._checkedIngredients = new Set(['a','b']);
      window._checkedSubsteps = new Set(['0-0']);

      const currentTypePill = document.querySelector('#mob-gtype .pill.on');
      currentTypePill.click();
      const afterSameClick = { c: [...window._checked], i: [...window._checkedIngredients], s: [...window._checkedSubsteps] };

      const otherTypePill = Array.from(document.querySelectorAll('#mob-gtype .pill')).find(p => !p.classList.contains('on'));
      otherTypePill.click();
      const afterTypeChange = { c: [...window._checked], i: [...window._checkedIngredients], s: [...window._checkedSubsteps] };

      window._checked = new Set([0]);
      window._checkedSubsteps = new Set(['1-1']);
      wizGoto(2);
      const kveldCard = Array.from(document.querySelectorAll('#mob-gmet > div')).find(c => c.textContent.includes('Kveldsdeig'));
      kveldCard.click();
      const afterMethodChange = { c: [...window._checked], s: [...window._checkedSubsteps], method: S.method };

      // oven: bytte av ovntype nullstiller (steketemp/-tid endres i steketrinnet).
      wizGoto(1);
      window._checked = new Set([0,1]); window._checkedSubsteps = new Set(['2-0']);
      const otherOven = Array.from(document.querySelectorAll('#mob-govn .pill')).find(p => !p.classList.contains('on'));
      otherOven.click();
      const afterOvenChange = { c: [...window._checked], s: [...window._checkedSubsteps] };

      // oven: klikk paa allerede valgt ovntype nullstiller IKKE.
      window._checked = new Set([3]);
      document.querySelector('#mob-govn .pill.on').click();
      const afterSameOven = { c: [...window._checked] };

      // gjaer: bytte av gjaertype nullstiller (grammengde/type endres i gjaer-stegene).
      window._checked = new Set([0]); window._checkedIngredients = new Set(['x']);
      const otherGjaer = Array.from(document.querySelectorAll('#mob-ggj .pill')).find(p => !p.classList.contains('on'));
      otherGjaer.click();
      const afterGjaerChange = { c: [...window._checked], i: [...window._checkedIngredients] };

      // kjokkenmaskin: BEVISST utelatt -- endring skal IKKE nullstille.
      window._checked = new Set([4,5]);
      const otherKm = Array.from(document.querySelectorAll('#mob-gkm .pill')).find(p => !p.classList.contains('on'));
      otherKm.click();
      const afterKmChange = { c: [...window._checked] };

      return { afterSameClick, afterTypeChange, afterMethodChange, afterOvenChange, afterSameOven, afterGjaerChange, afterKmChange };
    }""")
    ok31 = (
      r31['afterSameClick']['c'] == [0,1] and r31['afterSameClick']['i'] == ['a','b'] and r31['afterSameClick']['s'] == ['0-0'] and
      r31['afterTypeChange']['c'] == [] and r31['afterTypeChange']['i'] == [] and r31['afterTypeChange']['s'] == [] and
      r31['afterMethodChange']['c'] == [] and r31['afterMethodChange']['s'] == [] and r31['afterMethodChange']['method'] == 'kveld' and
      r31['afterOvenChange']['c'] == [] and r31['afterOvenChange']['s'] == [] and
      r31['afterSameOven']['c'] == [3] and
      r31['afterGjaerChange']['c'] == [] and r31['afterGjaerChange']['i'] == [] and
      r31['afterKmChange']['c'] == [4,5]
    )
    results.append(('checkbox_progress_clears_on_content_changing_fields_only', ok31, r31))

    # v6.12 (BACKLOG #6): Hurtigdeig -- begge gjaeringsfasene (bulk ba,
    # etterheving afm) skal temp-skaleres med tf(). Foer var kun ba skalert;
    # afm sto fast, saa samme deigs to faser reagerte ulikt paa temperatur.
    # Ved 22C (tf=1) skal tallene vaere uendret (baseline urort); ved 28C
    # (tf=0.5) skal BEGGE krympe med samme faktor.
    r31b = page.evaluate("""() => {
      resetTestState();
      S.method='hurtig'; S.hurtigH=5; S.gjaer='torr';
      const anchor = new Date(2026,0,1,12,0);
      S.temp=22; const a22 = hurtigSteps(anchor);
      S.temp=28; const a28 = hurtigSteps(anchor);
      return { ba22:a22.ba, afm22:a22.afm, ba28:a28.ba, afm28:a28.afm };
    }""")
    # 22C: uendret fra formelen (ba=5*0.6*60=180, afm=(5-3-0.25)*60=105).
    baseline22 = r31b['ba22'] == 180 and r31b['afm22'] == 105
    # 28C: begge krympet (afm var lik afm22 foer fiksen -> naa mindre).
    both_shrink = r31b['ba28'] < r31b['ba22'] and r31b['afm28'] < r31b['afm22']
    # Samme skaleringsfaktor paa begge faser (innenfor avrunding).
    consistent = abs(r31b['ba28']/r31b['ba22'] - r31b['afm28']/r31b['afm22']) < 0.03
    ok31b = baseline22 and both_shrink and consistent
    results.append(('hurtig_both_ferment_phases_scale_with_temperature', ok31b, r31b))

    # BACKLOG #5 (full fiks): avhaking er na INNHOLDSBASERT. Aa dra en glidebryter
    # (mel/hydro/temp/kjol) skal fjerne haken paa steg hvis INNHOLD endret seg
    # (grammengder/temp/minutter), men beholde haken paa steg som IKKE endret seg.
    # Tester ogsaa bakoverkompatibilitet: en gammel indeks-basert hake (lagret for
    # denne endringen) lyser fortsatt, og migreres til signatur naar den toggles.
    r31c = page.evaluate("""() => {
      resetTestState();
      setLayout('mob');
      S.type='napoletana'; S.method='standard'; S.mel=500; S.hydro=65; S.cold=48; S.temp=22; S.mode='start'; S.gjaer='torr';
      mobShowTab('plan'); mobGen();
      const s500 = (window._steps||[]).slice();
      S.mel=600; mobGen();
      const s600 = (window._steps||[]).slice();
      S.mel=500; mobGen();
      // finn ett mel-avhengig steg (signatur endres) og ett mel-uavhengig steg
      let depIdx=-1, indepIdx=-1;
      for(let i=0;i<Math.min(s500.length,s600.length);i++){
        if(stepSig(s500[i])!==stepSig(s600[i])){ if(depIdx<0) depIdx=i; }
        else if(indepIdx<0) indepIdx=i;
      }
      // hak av begge (innholdsbasert) ved mel=500
      window._checked=new Set();
      toggleStepDone(depIdx); toggleStepDone(indepIdx);
      const before={dep:stepChecked(window._steps[depIdx],depIdx), indep:stepChecked(window._steps[indepIdx],indepIdx)};
      // dra mel til 600 -> dep-stegets innhold endres, indep-steget ikke
      S.mel=600; mobGen();
      const st=window._steps||[];
      const after={dep:stepChecked(st[depIdx],depIdx), indep:stepChecked(st[indepIdx],indepIdx)};
      // legacy: en gammel indeks-hake skal fortsatt vises som avhaket
      S.mel=500; mobGen();
      window._checked=new Set([indepIdx]);
      const legacyShown = stepChecked(window._steps[indepIdx], indepIdx);
      // og toggling av den fjerner den (migrerer bort fra indeks)
      toggleStepDone(indepIdx);
      const legacyClearedOff = !stepChecked(window._steps[indepIdx], indepIdx) && window._checked.size===0;
      return { depIdx, indepIdx, before, after, legacyShown, legacyClearedOff };
    }""")
    ok31c = (
      r31c['depIdx'] >= 0 and r31c['indepIdx'] >= 0 and
      r31c['before']['dep'] is True and r31c['before']['indep'] is True and
      r31c['after']['dep'] is False and r31c['after']['indep'] is True and
      r31c['legacyShown'] is True and r31c['legacyClearedOff'] is True
    )
    results.append(('checkbox_content_keyed_drops_stale_slider_changes_keeps_unaffected', ok31c, r31c))

    # v6.01: Hurtigdeig fikk et nytt forste steg (gjaer-kickstart: lunkent
    # vann + honning, ~5 min for melet tilsettes) og en semulegryn-tips paa
    # stekesteget. Tester at kjeden fortsatt henger sammen uten hull/overlapp
    # etter at et steg ble satt inn forst, og at begge nye elementene faktisk
    # finnes.
    r32 = page.evaluate("""() => {
      resetTestState();
      S.type='napoletana'; S.method='hurtig'; S.hurtigH=4; S.mel=500; S.hydro=65;
      S.mode='end'; S.temp=22; S.gjaer='torr';
      mobShowTab('plan'); mobGen();
      const steps = window._steps || [];
      let chainOk = true;
      for (let i = 0; i < steps.length - 1; i++) {
        const end = new Date(steps[i].at).getTime() + (steps[i].dur||0)*60000;
        const nextStart = new Date(steps[i+1].at).getTime();
        if (Math.abs(end - nextStart) > 60000) chainOk = false;
      }
      return {
        firstTitle: steps[0].title,
        chainOk,
        kickstartHasNeeds: !!(steps[0].needs && steps[0].needs.length),
        kickstartHasSubsteps: !!(steps[0].substeps && steps[0].substeps.length === 3),
        bakeTip: steps[steps.length-1].tip
      };
    }""")
    ok32 = (
      r32['firstTitle'] == 'Vekk gjæren (kickstart)' and r32['chainOk'] and
      r32['kickstartHasNeeds'] and r32['kickstartHasSubsteps'] and
      'semulegryn' in r32['bakeTip'].lower()
    )
    results.append(('hurtig_yeast_kickstart_and_semolina_tip', ok32, r32))

    # Poolish kjøleskapspause (v6.09): et valgfritt kaldt hold av den modne poolishen
    # skal (1) sette inn et eget pause-steg, (2) holde steketiden FAST i end-modus, og
    # (3) flytte poolish-starten tilsvarende tidligere. Auto-valget skal aldri gi flere
    # vinduskonflikter enn uten pause.
    r33 = page.evaluate("""() => {
      const anchor=new Date('2026-08-01T18:00:00');
      S.type='napoletana'; S.method='poolish'; S.poolishCold=false; S.poolishH=14;
      S.cold=48; S.mel=500; S.hydro=65; S.temp=22; S.mode='end';
      const iso=d=>new Date(d).toISOString();
      S.poolishPauseH=0; const a=stepsForAnchor(anchor);
      S.poolishPauseH=12; const c=stepsForAnchor(anchor);
      const pauseStep=c.find(s=>String(s.title).includes('Kjøleskapspause'));
      const firstDeltaMin=Math.round((new Date(a[0].at)-new Date(c[0].at))/60000);
      // auto-pause skal aldri være verre enn uten pause
      window._pizzatidSchedule=null;
      S.poolishPauseH=0; const vBase=scorePizzatidWindows(stepsForAnchor(anchor));
      const best=autoPoolishPause(); S.poolishPauseH=best; const vAuto=scorePizzatidWindows(stepsForAnchor(anchor));
      S.poolishPauseH=0;
      return {
        bakeUnchanged: iso(a[a.length-1].at)===iso(c[c.length-1].at),
        pauseStepDur: pauseStep?pauseStep.dur:null,
        poolishStartsEarlierMin: firstDeltaMin,
        extraStep: c.length===a.length+1,
        autoInRange: [6,12,18].includes(best),
        autoNotWorse: vAuto<=vBase
      };
    }""")
    ok33 = (
      r33['bakeUnchanged'] is True and
      r33['pauseStepDur'] == 720 and
      r33['poolishStartsEarlierMin'] == 720 and
      r33['extraStep'] is True and
      r33['autoInRange'] is True and
      r33['autoNotWorse'] is True
    )
    results.append(('poolish_kjoleskapspause_shifts_upstream_keeps_bake', ok33, r33))

    # v6.26: første gang (uten lagret valg) gjettes språket fra nettleser/telefon —
    # norsk (nb/nn/no) → norsk, ellers engelsk. Et lagret valg vinner alltid.
    r34 = page.evaluate("""() => {
      let saved=null; try{ saved=localStorage.getItem('pizzaLang'); }catch(e){}
      try{ localStorage.removeItem('pizzaLang'); }catch(e){}
      const out = {
        no_nb: detectDefaultLang(['nb-NO']),
        no_nn: detectDefaultLang(['nn']),
        no_plain: detectDefaultLang(['no']),
        en_us: detectDefaultLang(['en-US']),
        sv: detectDefaultLang(['sv-SE']),
        empty: detectDefaultLang(['']),
        secondaryNo: detectDefaultLang(['en-US','nb-NO'])
      };
      try{ localStorage.setItem('pizzaLang','en'); }catch(e){}
      out.savedWins = detectDefaultLang(['nb-NO']);
      try{ if(saved) localStorage.setItem('pizzaLang',saved); else localStorage.removeItem('pizzaLang'); }catch(e){}
      return out;
    }""")
    ok34 = (
      r34['no_nb'] == 'no' and r34['no_nn'] == 'no' and r34['no_plain'] == 'no' and
      r34['en_us'] == 'en' and r34['sv'] == 'en' and r34['empty'] == 'en' and
      r34['secondaryNo'] == 'no' and r34['savedWins'] == 'en'
    )
    results.append(('first_run_language_detection_norwegian_else_english_saved_wins', ok34, r34))

    # v6.37: Fokus-modus — det aktive steget i fullskjerm med stor skrift, for
    # telefonen på benken. Åpner på FØRSTE ikke-avhakede steg (ikke toppen),
    # viser understeg (avhakbare, delt fremdrift med tidsplanen), «Ferdig» haker
    # av + hopper til neste ikke-avhakede, «Forrige» blar tilbake, og lukk skjuler
    # overlegget. Vi speiler tidsplanen: har steget understeg viser vi dem i
    # stedet for desc (ingen dobbeltekst).
    r35 = page.evaluate("""() => {
      resetTestState();
      S.type='napoletana'; S.method='standard'; S.mel=500; S.hydro=65; S.cold=24;
      S.mode='end'; S.temp=22; S.gjaer='torr';
      window._checked = new Set(); window._checkedSubsteps = new Set();
      mobShowTab('plan'); mobGen();
      const total = (window._steps||[]).length;

      // hak av steg 0 -> Fokus skal åpne på steg 1 (første ikke-avhakede).
      if(window._checked.add) window._checked.add(stepSig(window._steps[0]));
      openFocus();
      const ov = document.getElementById('focus-overlay');
      const openedIdx = window._focusIdx;
      const shown = ov ? ov.style.display : 'none';
      const bodyTxt = (document.getElementById('focus-body').textContent)||'';
      const hasStepCounter = /STEG\\s+\\d+\\s+AV\\s+\\d+/.test(bodyTxt);

      // understeg vises og er avhakbare i fokus (delt _checkedSubsteps).
      const curStep = window._steps[window._focusIdx];
      const hasSubs = !!(curStep.substeps && curStep.substeps.length);
      const subsBefore = window._checkedSubsteps.size;
      if(hasSubs) focusToggleSubstep(0);
      const subsAfter = window._checkedSubsteps.size;

      // desc vises IKKE i tillegg når understeg finnes (ingen dobbeltekst).
      const focusBodyHtml = document.getElementById('focus-body').innerHTML;
      const descDup = hasSubs && focusBodyHtml.includes('font-size:19px;line-height:1.45');

      // v0.692 (skisse B): kommende steg vises som tappbar «Kommer»-stabel, og
      // focusGoto hopper til et valgt steg.
      const hasComingStack = /focusGoto\\(/.test(focusBodyHtml) && (bodyTxt.includes('Kommer') || bodyTxt.includes('Coming up'));
      const gotoTarget = Math.min(total-1, window._focusIdx+2);
      focusGoto(gotoTarget);
      const gotoWorks = window._focusIdx === gotoTarget;
      focusGoto(openedIdx); // tilbake til utgangspunktet før resten av navigasjonstesten

      // «Ferdig» haker av dette steget og hopper til neste ikke-avhakede.
      const beforeDone = window._focusIdx;
      focusMarkDone();
      const markedDone = !!(window._checked.has(stepSig(window._steps[beforeDone])) || window._checked.has(beforeDone));
      const advanced = window._focusIdx > beforeDone;

      // «Forrige» blar tilbake.
      const beforePrev = window._focusIdx;
      focusPrev();
      const wentBack = window._focusIdx === beforePrev - 1;

      closeFocus();
      const closed = document.getElementById('focus-overlay').style.display === 'none';

      // Fokus-knappen finnes i statuslinja.
      const hasFocusBtn = /onclick="openFocus\\(\\)"/.test(document.getElementById('mob-plan-content').innerHTML);

      resetTestState();
      return { total, openedIdx, shown, hasStepCounter, hasSubs, subsBefore, subsAfter,
               descDup, hasComingStack, gotoWorks, markedDone, advanced, wentBack, closed, hasFocusBtn };
    }""")
    ok35 = (
      r35['total'] > 2 and r35['openedIdx'] == 1 and r35['shown'] == 'flex' and
      r35['hasStepCounter'] and r35['hasSubs'] and
      r35['subsAfter'] == r35['subsBefore'] + 1 and r35['descDup'] is False and
      r35['hasComingStack'] and r35['gotoWorks'] and
      r35['markedDone'] and r35['advanced'] and r35['wentBack'] and
      r35['closed'] and r35['hasFocusBtn']
    )
    results.append(('focus_mode_opens_on_next_step_substeps_checkable_nav_and_close', ok35, r35))

    # v6.40: å bytte fra PC til mobil i farten ga blank skjerm — setLayout('mob')
    # aktiverte mobil-layouten og en fane, men rendret aldri fanens innhold (særlig
    # Planlegging/wizarden). Oppstarten gjorde det via wizEnterSettingsTab(); den
    # løpende byttingen gjorde det ikke. Nå rendrer setLayout den aktive fanen, så
    # skjermen har innhold uansett hvordan man havner i mobilvisning.
    r36 = page.evaluate("""() => {
      resetTestState();
      // start i PC-modus, som en bruker som har valgt PC
      document.body.classList.remove('mob-mode'); document.body.classList.add('pc-mode');
      window._wizEnteredOnce=false; window._restoredSetup=false;
      try{ setLayout('pc'); }catch(e){}
      // bytt til mobil slik «Til mobil»-knappen gjør
      try{ setLayout('mob'); }catch(e){ return {err:String(e)}; }
      const isMob=document.body.classList.contains('mob-mode');
      const activeScr=document.querySelector('.mob-screen.active');
      const activeId=activeScr?activeScr.id:null;
      const txtLen=activeScr?(activeScr.innerText||'').trim().length:-1;
      // fanen skal ha reelt innhold (ikke blank)
      const hasContent=txtLen>20;
      resetTestState();
      return { isMob, activeId, txtLen, hasContent };
    }""")
    ok36 = (r36.get('isMob') is True and r36.get('activeId') is not None
            and r36.get('hasContent') is True)
    results.append(('switch_pc_to_mobile_renders_active_tab_not_blank', ok36, r36))

    # v0.641: iOS' datofelt i Smart-plan har en innebygd «tøm»-knapp. Tømmer man
    # feltet ble det stående blankt. Nå fyller onchange->betaEnsureDate() alltid
    # tilbake en fornuftig standard-dato, så feltet aldri står tomt.
    r37 = page.evaluate("""() => {
      const d=document.getElementById('mob-beta-ed');
      if(!d) return {noField:true};
      d.value='2026-01-02';                       // en kjent verdi
      // simuler iOS-tømming: tom verdi + change
      d.value=''; betaEnsureDate();
      const refilled=d.value;
      // og at standarden er en gyldig dato
      const valid=!isNaN(new Date(refilled+'T19:00').getTime());
      return { refilled, notBlank: refilled!=='', valid };
    }""")
    ok37 = (r37.get('notBlank') is True and r37.get('valid') is True)
    results.append(('smartplan_clearing_date_refills_default_not_blank', ok37, r37))

    # v0.642: deiger er private per bruker. Man ser egne + delte (+ eldre uten
    # eier). Egne har «del med alle»-bryter; andres delte er kun se/kopier (ingen
    # slett/favoritt/bryter), og åpnes som KOPI. Admin/eier-vaktene ligger i
    # backend; her sjekkes at UI-en gjenspeiler eierskap riktig.
    r38 = page.evaluate("""() => {
      const _origFetch=window.fetchBakes;
      let _origUser=null; try{ _origUser=localStorage.getItem('pizzaUser'); }catch(e){}
      localStorage.setItem('pizzaUser', JSON.stringify({id:'user-A',name:'Rune'}));
      const cfg={type:'napoletana',method:'standard',mel:500,hydro:65,cold:24,temp:22,gjaer:'torr'};
      const mk=(id,ownerId,shared,status)=>({id,name:id,status:status||'active',favorite:false,ownerId,shared,config:cfg,anchorMode:'start',anchorISO:new Date(2026,6,31,19).toISOString(),savedBy:'X',checkedSteps:[],checkedIngredients:[],checkedSubsteps:[]});
      const list=[ mk('mine-priv','user-A',false,'active'), mk('mine-shared','user-A',true,'active'),
                   mk('other-priv','user-B',false,'active'), mk('other-shared','user-B',true,'active'),
                   mk('legacy',null,false,'finished') ];
      window.fetchBakes=async()=>list;
      const q=bakeAuthQuery();
      const d=document.createElement('div'); d.id='t-priv-deiger'; document.body.appendChild(d);
      return renderBaksterPanel('t-priv-deiger').then(()=>{
        const html=d.innerHTML;
        const out={
          q,
          myShareToggle: html.includes('Privat — del med alle'),
          myStar: /toggleFavorite\\('mine-priv'/.test(html),
          mySharedMakePrivate: html.includes('gjør privat'),
          otherPrivHidden: !html.includes('other-priv'),         // andres PRIVATE vises ikke i UI (stub gir alle, men bakeIsMine styrer seksjon; other-priv havner i delt-seksjon likevel? nei — den er ikke min og ikke delt)
          otherSharedShown: html.includes('other-shared'),
          otherNoDelete: !/deleteBakeConfirm\\('other-shared'\\)/.test(html),
          otherNoShareToggle: !/toggleShareBake\\('other-shared'/.test(html),
          sharedSection: html.includes('Delt med alle'),
          legacyManageable: /deleteBakeConfirm\\('legacy'\\)/.test(html),
        };
        d.remove();
        window.fetchBakes=_origFetch;
        try{ if(_origUser===null) localStorage.removeItem('pizzaUser'); else localStorage.setItem('pizzaUser',_origUser); }catch(e){}
        return out;
      });
    }""")
    ok38 = (r38.get('q')=='?userId=user-A' and r38.get('myShareToggle') and r38.get('myStar')
            and r38.get('mySharedMakePrivate') and r38.get('otherSharedShown')
            and r38.get('otherNoDelete') and r38.get('otherNoShareToggle')
            and r38.get('sharedSection') and r38.get('legacyManageable'))
    results.append(('deiger_private_per_user_with_share_toggle_and_view_only_shared', ok38, r38))

    # v0.644: nytt XXL-skriftnivå øverst i skalaen (zoom 1.6). Sjekk at nivået er
    # koblet opp hele veien: FS_LEVELS/FS_ZOOM, klasse, currentFontLevel, at
    # stepperen går xlarge→xxlarge og stopper der, og at segment-kontrollen har
    # fire valg.
    r39 = page.evaluate("""() => {
      const orig=currentFontLevel();
      const out={ levels:FS_LEVELS.slice(), zoom:FS_ZOOM['xxlarge'],
                  segCount:document.querySelectorAll('#mob-fs-seg .o').length };
      setFontSize('xxlarge');
      out.hasClass=document.body.classList.contains('fs-xxlarge');
      out.cur=currentFontLevel();
      // stepper: xlarge → xxlarge, og stopp på xxlarge (ikke forbi)
      setFontSize('xlarge'); stepFontSize(1); out.steppedTo=currentFontLevel();
      stepFontSize(1); out.cappedAt=currentFontLevel();
      setFontSize(orig);
      return out;
    }""")
    ok39 = (r39.get('levels')==['normal','large','xlarge','xxlarge'] and r39.get('zoom')==1.6
            and r39.get('hasClass') is True and r39.get('cur')=='xxlarge'
            and r39.get('steppedTo')=='xxlarge' and r39.get('cappedAt')=='xxlarge'
            and r39.get('segCount')==4)
    results.append(('xxl_font_level_wired_through_scale_stepper_and_control', ok39, r39))

    # v0.646: Smart-plan-velgeren bygget om — klokke og dato som to LIKE store kort
    # (.beta-field), hver med en egen formatert etikett (.beta-field-val: «19:00» /
    # «lør 1. aug») og en gjennomsiktig native-velger (.beta-field-input) oppå.
    # Sjekk struktur + at etikettene synces fra input-verdiene, inkl. dato-format.
    r40 = page.evaluate("""() => {
      const t=document.getElementById('mob-beta-et'), d=document.getElementById('mob-beta-ed');
      if(!t||!d) return {missing:true};
      const _lang=window._lang; window._lang='no';
      t.value='07:30'; d.value='2026-08-03'; betaSyncFieldLabels();  // 2026-08-03 = mandag
      const out={
        fields:document.querySelectorAll('.beta-field').length,
        vals:document.querySelectorAll('.beta-field .beta-field-val').length,
        inputs:document.querySelectorAll('.beta-field .beta-field-input').length,
        timeLabel:document.getElementById('mob-beta-et-disp').textContent,
        dateLabel:document.getElementById('mob-beta-ed-disp').textContent,
      };
      // begge kortene deler samme klasse -> lik boks-styling
      window._lang=_lang;
      return out;
    }""")
    ok40 = (r40.get('fields')==2 and r40.get('vals')==2 and r40.get('inputs')==2
            and r40.get('timeLabel')=='07:30' and r40.get('dateLabel')=='man 3. aug')
    results.append(('smartplan_picker_equal_cards_with_formatted_labels', ok40, r40))

    # v0.648: pizzatype-pillene var hardkodet norsk («Ingen elting») også i engelsk
    # modus. Nå språktilpasses de via tnShort på både mobil (mobPillGroup) og PC
    # (#gtype i syncStaticI18nUI): «Ingen elting»→«No-knead», «Langpanne»→«Sheet pan».
    r41 = page.evaluate("""() => {
      const _lang=window._lang;
      const read=()=>({
        mob:[...document.querySelectorAll('#mob-gtype .pill')].map(e=>e.textContent.replace('✓','').trim()),
        pc:[...document.querySelectorAll('#gtype .pill')].map(e=>e.textContent.trim())
      });
      window._lang='en'; try{mobPillGroup('mob-gtype','type')}catch(e){}; try{syncStaticI18nUI()}catch(e){}; const en=read();
      window._lang='no'; try{mobPillGroup('mob-gtype','type')}catch(e){}; try{syncStaticI18nUI()}catch(e){}; const no=read();
      window._lang=_lang; try{mobPillGroup('mob-gtype','type')}catch(e){}; try{syncStaticI18nUI()}catch(e){}
      return {en, no};
    }""")
    ok41 = ('No-knead' in r41['en']['mob'] and 'No-knead' in r41['en']['pc']
            and 'Sheet pan' in r41['en']['mob'] and 'Neapolitan' in r41['en']['pc']
            and 'Ingen elting' not in r41['en']['mob'] and 'Ingen elting' not in r41['en']['pc']
            and 'Ingen elting' in r41['no']['mob'] and 'Ingen elting' in r41['no']['pc'])
    results.append(('pizza_type_pills_localized_in_english_and_norwegian', ok41, r41))

    # v0.649: også gjærtype/kjøkkenmaskin/ovntype-pillene språktilpasses. PC-ovn
    # beholder temperaturen i etiketten («Pizza oven (430–450°C)»).
    r42 = page.evaluate("""() => {
      const _lang=window._lang;
      const g=sel=>[...document.querySelectorAll(sel)].map(e=>e.textContent.replace('✓','').trim());
      const snap=()=>{ ['gjaer','kjokkenmaskin','oven'].forEach(k=>{const id=k==='gjaer'?'mob-ggj':k==='kjokkenmaskin'?'mob-gkm':'mob-govn'; try{mobPillGroup(id,k)}catch(e){}}); try{syncStaticI18nUI()}catch(e){};
        return {mobGj:g('#mob-ggj .pill'),mobOvn:g('#mob-govn .pill'),pcKm:g('#gkm .pill'),pcOvn:g('#govn .pill')}; };
      window._lang='en'; const en=snap();
      window._lang='no'; const no=snap();
      window._lang=_lang; snap();
      return {en,no};
    }""")
    ok42 = (r42['en']['mobGj']==['Dry yeast','Fresh yeast']
            and r42['en']['mobOvn']==['Pizza oven','Regular oven']
            and 'Manual kneading' in r42['en']['pcKm']
            and r42['en']['pcOvn']==['Pizza oven (430–450°C)','Regular oven (max 250°C)']
            and r42['no']['mobGj']==['Tørrgjær','Fersk gjær']
            and r42['no']['pcOvn']==['Pizzaovn (430–450°C)','Vanlig ovn (maks 250°C)'])
    results.append(('yeast_machine_oven_pills_localized_pc_oven_keeps_temp', ok42, r42))

    # v0.650: guidet flyt i Smart-plan-velgeren. «Neste» felt lyser opp (is-active),
    # tatt felt får is-done, og «Finn oppskriften» går fra dempet (--forno-border)
    # til aksent (--forno-accent) når begge er tatt: klokke → dato → knapp.
    r43 = page.evaluate("""() => {
      const tf=document.getElementById('mob-beta-et-field'), df=document.getElementById('mob-beta-ed-field'), btn=document.getElementById('mob-beta-search-btn');
      if(!tf||!df||!btn) return {missing:true};
      window._betaTouched={time:false,date:false}; betaUpdateGuide();
      const st=()=>({tA:tf.classList.contains('is-active'),tD:tf.classList.contains('is-done'),
                     dA:df.classList.contains('is-active'),dD:df.classList.contains('is-done'),
                     bg:btn.style.background});
      const s0=st();
      betaTouch('time'); const s1=st();
      betaTouch('date'); const s2=st();
      window._betaTouched={time:false,date:false}; betaUpdateGuide();
      return {s0,s1,s2};
    }""")
    ok43 = (r43.get('s0',{}).get('tA') is True and r43['s0']['dA'] is False and 'border' in r43['s0']['bg']
            and r43['s1']['tD'] is True and r43['s1']['dA'] is True and r43['s1']['tA'] is False
            and r43['s2']['tD'] is True and r43['s2']['dD'] is True and 'accent' in r43['s2']['bg'])
    results.append(('smartplan_guided_flow_highlights_next_step_then_lights_button', ok43, r43))

    # v0.653: Deiger flyttet inn i «Mer» (tidligere «Info»). Fire faner igjen,
    # Deiger-innholdet bor øverst i Mer-fanen (#mob-tips), og Mer-fanen får en
    # teller-badge når du har aktive deiger.
    r44 = page.evaluate("""() => {
      try{ syncI18nUI(); }catch(e){}
      const _lang=window._lang;
      const out={
        baksterInTabs: MOB_TABS.includes('bakster'),
        noBaksterTab: !document.getElementById('mob-tab-bakster'),
        noBaksterScreen: !document.getElementById('mob-bakster'),
        merTab: !!document.getElementById('mob-tab-tips'),
        deigerInMer: !!document.querySelector('#mob-tips #mob-bakster-content'),
      };
      window._lang='no'; out.labelNo=t('tab_tips');
      window._lang='en'; out.labelEn=t('tab_tips');
      window._lang=_lang;
      window._activeDeigCount=3; updateMerTabBadge();
      const badge=document.getElementById('mob-tab-mer-badge');
      out.badge3 = !!badge && badge.textContent==='3' && badge.style.display==='block';
      window._activeDeigCount=0; updateMerTabBadge();
      out.badge0hidden = !!badge && badge.style.display==='none';
      return out;
    }""")
    ok44 = (r44.get('baksterInTabs') is False and r44.get('noBaksterTab') and r44.get('noBaksterScreen')
            and r44.get('merTab') and r44.get('deigerInMer')
            and r44.get('labelNo')=='Mer' and r44.get('labelEn')=='More'
            and r44.get('badge3') and r44.get('badge0hidden'))
    results.append(('deiger_moved_into_mer_tab_with_active_count_badge', ok44, r44))

    # v0.654: Smart-plan-søket viste hardkodede norske metodenavn («Langtidsdeig»
    # osv.) også i engelsk modus. Nå er kandidat-etikettene språktilpasset. Parvis
    # sjekk: samme scenario — norsk viser et norsk-only metodenavn, engelsk gjør IKKE.
    r45 = page.evaluate("""() => {
      const _lang=window._lang;
      const realNow=Date.now;
      // Samme pinnede stramme-fredag-scenario som Kveldsdeig-testen, så et
      // OVERSETTBART metodenavn vinner (ikke Poolish/Biga som er like i begge språk).
      Date.now=()=>new Date(2026,6,30,20,0,0).getTime();
      try{
        try{ if(!window._pizzatidSchedule) window._pizzatidSchedule=defaultPizzatidSchedule(); }catch(e){}
        const anchor=new Date(2026,6,31,19,0,0);
        window._lang='no'; const noTop=searchAllMethods(anchor)[0].label;
        window._lang='en'; const enTop=searchAllMethods(anchor)[0].label;
        return {noTop, enTop};
      } finally { Date.now=realNow; window._lang=_lang; }
    }""")
    ok45 = (r45.get('noTop')=='Kveldsdeig' and r45.get('enTop')=='Evening dough')
    results.append(('smartplan_method_suggestion_labels_localized', ok45, r45))

    # v0.655: Tidsplan er «tom» til brukeren har gjort et reelt valg. Uten et valg
    # (window._planChosen falsy) tegner mobGen et guide-tomt-state med to innganger
    # (Smart-plan → beta, Planlegg selv → settings) i stedet for en default-plan.
    # Fullført valg (f.eks. wizFinish) fyller planen med faktiske steg.
    r46 = page.evaluate("""() => {
      const _lang=window._lang, _chosen=window._planChosen, _step=window._steps;
      try{
        // (a) ikke valgt → tomt state, ingen default-plan, _steps nullstilt
        window._planChosen=false;
        window._lang='no';
        mobShowTab('plan');
        const html=document.getElementById('mob-plan-content').innerHTML;
        const emptyShown = !!document.getElementById('mob-plan-empty');
        const linksToBeta = html.includes("mobShowTab('beta')");
        const linksToSettings = html.includes("mobShowTab('settings')");
        const stepsCleared = window._steps===null;
        const gateInGen = mobGen.toString().includes('_planChosen');
        // (b) språktilpasset tomt state
        window._lang='en'; mobGen();
        const enEmpty = (document.getElementById('mob-plan-empty')||{}).textContent||'';
        // (c) fullført valg → faktisk plan, tomt-state borte
        window._lang='no';
        window._planChosen=true;
        mobGen();
        const planFilled = !document.getElementById('mob-plan-empty')
          && document.getElementById('mob-plan-content').innerHTML.length > 200
          && Array.isArray(window._steps) && window._steps.length>0;
        // (d) wizFinish setter flagget
        window._planChosen=false;
        wizFinish();
        const finishSetsChosen = window._planChosen===true;
        return {emptyShown, linksToBeta, linksToSettings, stepsCleared, gateInGen, enEmpty, planFilled, finishSetsChosen};
      } finally {
        window._lang=_lang; window._planChosen=_chosen; window._steps=_step;
      }
    }""")
    ok46 = (r46.get('emptyShown') and r46.get('linksToBeta') and r46.get('linksToSettings')
            and r46.get('stepsCleared') and r46.get('gateInGen')
            and 'No schedule yet' in r46.get('enEmpty','')
            and r46.get('planFilled') and r46.get('finishSetsChosen'))
    results.append(('tidsplan_empty_until_choice_then_guides_to_two_entries', ok46, r46))

    # v0.656: «Vis/Skjul»-veksleren i Smart-plan («Når er du ledig?») hadde en
    # statisk norsk «Vis ▾» i HTML som bare ble språktilpasset ved første trykk —
    # så engelske brukere så «VIS» → «Show». Nå setter i18n-synken den med det
    # samme. Sjekk: etter setLang('en') står lukket panel med «Show», ikke «Vis».
    r47 = page.evaluate("""() => {
      const _lang=window._lang;
      try{
        const body=document.getElementById('mob-pizzatid-body');
        if(body) body.style.display='none';           // lukket utgangstilstand
        setLang('en'); const enClosed=document.getElementById('mob-pizzatid-toggle').textContent;
        togglePizzatidMinimized(); const enOpen=document.getElementById('mob-pizzatid-toggle').textContent;
        togglePizzatidMinimized(); const enClosedAgain=document.getElementById('mob-pizzatid-toggle').textContent;
        setLang('no'); const noClosed=document.getElementById('mob-pizzatid-toggle').textContent;
        const syncInStatic = syncStaticI18nUI.toString().includes('syncPizzatidToggleLabel');
        return {enClosed, enOpen, enClosedAgain, noClosed, syncInStatic};
      } finally { setLang(_lang); }
    }""")
    ok47 = (r47.get('enClosed','').startswith('Show') and r47.get('enOpen','').startswith('Hide')
            and r47.get('enClosedAgain','').startswith('Show') and r47.get('noClosed','').startswith('Vis')
            and r47.get('syncInStatic'))
    results.append(('smartplan_free_time_toggle_localized_from_first_render', ok47, r47))

    # v0.657: det doble Deiger-inngangspunktet på mobil er fjernet. 🍽️-ikonet i
    # topplinja (mob-active-deiger-btn) er borte; aktive deiger vises kun via
    # Mer-fanens teller-badge. refreshDeigerBanner må fortsatt oppdatere badgen
    # uten å røre det fjernede ikonet, og jumpToDeiger (brukt fra plan-knappen)
    # skal fortsatt finnes.
    r48 = page.evaluate("""() => {
      const noTopbarIcon = !document.getElementById('mob-active-deiger-btn')
        && !document.getElementById('mob-active-deiger-count');
      const bannerNoIconRef = !refreshDeigerBanner.toString().includes('mob-active-deiger-btn');
      const merBadgeStillDriven = refreshDeigerBanner.toString().includes('updateMerTabBadge');
      const jumpStillExists = typeof window.jumpToDeiger==='function';
      // Mer-badgen fungerer fortsatt som eneste teller
      window._activeDeigCount=2; updateMerTabBadge();
      const badge=document.getElementById('mob-tab-mer-badge');
      const badgeWorks = !!badge && badge.textContent==='2' && badge.style.display==='block';
      window._activeDeigCount=0; updateMerTabBadge();
      const badgeHides = !!badge && badge.style.display==='none';
      return {noTopbarIcon, bannerNoIconRef, merBadgeStillDriven, jumpStillExists, badgeWorks, badgeHides};
    }""")
    ok48 = (r48.get('noTopbarIcon') and r48.get('bannerNoIconRef') and r48.get('merBadgeStillDriven')
            and r48.get('jumpStillExists') and r48.get('badgeWorks') and r48.get('badgeHides'))
    results.append(('mobile_deiger_topbar_icon_removed_mer_badge_is_single_entry', ok48, r48))

    # v0.658: versjonsnummeret i topplinja (mob-name-version) er klikkbart og
    # åpner «Hva er nytt»-endringsloggen. Klikket må stoppe propagering så det
    # ikke også utløser topplinje-tittelens goToEntryFork. Modalen skal fylles
    # med CHANGELOG-innhold og vises.
    r49 = page.evaluate("""() => {
      const ver=document.getElementById('mob-name-version');
      const wiredToChangelog = !!ver && (ver.getAttribute('onclick')||'').includes('openChangelogModal');
      const stopsProp = !!ver && (ver.getAttribute('onclick')||'').includes('stopPropagation');
      const isButton = !!ver && ver.getAttribute('role')==='button' && ver.getAttribute('tabindex')==='0';
      // åpne modalen og sjekk at den fylles + vises
      closeChangelogModal();
      openChangelogModal();
      const modal=document.getElementById('changelog-modal');
      const body=document.getElementById('changelog-modal-body');
      const shown = !!modal && modal.style.display==='flex';
      const hasLatest = !!body && body.innerHTML.includes('v'+CHANGELOG[0].v);
      closeChangelogModal();
      const closes = !!modal && modal.style.display==='none';
      return {wiredToChangelog, stopsProp, isButton, shown, hasLatest, closes};
    }""")
    ok49 = (r49.get('wiredToChangelog') and r49.get('stopsProp') and r49.get('isButton')
            and r49.get('shown') and r49.get('hasLatest') and r49.get('closes'))
    results.append(('version_number_clickable_opens_changelog', ok49, r49))

    # v0.680: kald-spaken går nå til 120t (5 døgn) — sterke mel (Manitoba Oro,
    # W340–390) tåler reelt lange kald-gjæringer, så taket er hevet fra 78 til 120.
    # Invarianten holder: COLD_MAX === sterkeste mels ferm.mx (nå 120). Eldre,
    # høyere oppsett klampes fortsatt ned ved restore, og steg-knappen stopper på
    # COLD_MAX. Overmodnings-varselet (96t total) er den ærlige bremsen i 96–120-sona.
    r50 = page.evaluate("""() => {
      const _cold=S.cold, _saved=null;
      try{
        const pcMax=document.getElementById('csl').getAttribute('max');
        const mobMax=document.getElementById('mob-csl').getAttribute('max');
        const strongestFerm=Math.max(...MELTYPER.map(m=>m.ferm.mx));
        const capMatchesStrongest = (COLD_MAX===strongestFerm) && pcMax==='120' && mobMax==='120';
        // steg-knappen klamper ved COLD_MAX
        S.cold=120; stepColdWiz(1); const stepClamped=S.cold;
        // restore klamper ned et eldre, for høyt oppsett
        const orig=localStorage.getItem('pizzaSetup');
        localStorage.setItem('pizzaSetup', JSON.stringify({cold:200}));
        restoreSetup(); const restoreClamped=S.cold;
        if(orig===null) localStorage.removeItem('pizzaSetup'); else localStorage.setItem('pizzaSetup',orig);
        return {pcMax, mobMax, strongestFerm, COLD_MAX, capMatchesStrongest, stepClamped, restoreClamped};
      } finally { S.cold=_cold; }
    }""")
    ok50 = (r50.get('capMatchesStrongest') and r50.get('COLD_MAX')==120
            and r50.get('strongestFerm')==120 and r50.get('stepClamped')==120
            and r50.get('restoreClamped')==120)
    results.append(('cold_ferment_slider_capped_at_strongest_flour_120h', ok50, r50))

    # v0.660: endringsloggen er tospråklig. Hver entry har d_en + changes_en med
    # like mange punkter som den norske, og buildChangelogHTML velger språk etter
    # window._lang (norsk fallback). Sjekk at engelsk modus faktisk viser engelsk.
    r51 = page.evaluate("""() => {
      const _lang=window._lang;
      try{
        const allBilingual = CHANGELOG.every(e =>
          typeof e.d_en==='string' && e.d_en.length>0 &&
          Array.isArray(e.changes_en) && e.changes_en.length===e.changes.length &&
          e.changes_en.every(c=>typeof c==='string' && c.length>0));
        const count = CHANGELOG.length;
        window._lang='en'; const enHtml=buildChangelogHTML();
        window._lang='no'; const noHtml=buildChangelogHTML();
        const top=CHANGELOG[0];
        const enShowsEnglish = enHtml.includes(top.changes_en[0]) && !enHtml.includes(top.changes[0]);
        const noShowsNorwegian = noHtml.includes(top.changes[0]);
        const langAware = buildChangelogHTML.toString().includes('changes_en');
        return {allBilingual, count, enShowsEnglish, noShowsNorwegian, langAware};
      } finally { window._lang=_lang; }
    }""")
    ok51 = (r51.get('allBilingual') and r51.get('count')>=190
            and r51.get('enShowsEnglish') and r51.get('noShowsNorwegian') and r51.get('langAware'))
    results.append(('changelog_is_bilingual_and_language_aware', ok51, r51))

    # v0.661: Smart-plan foreslo umulige deiger. Scenario: kl. 18:18, bake kl.
    # 19:00 samme dag (~1t fram) → ingen deig kan startes nå. Før: en ~145t
    # poolish som skulle startet 6 dager siden havnet øverst med grønn ✅, og
    # «No registered flour covers this». Nå: (a) ingen kandidat overstiger det
    # sterkeste melet (alle har et dekkende mel), og (b) når alt er umulig, står
    # den som starter NÆRMEST nå øverst — ikke den lengste fortidsdeigen.
    r52 = page.evaluate("""() => {
      const _lang=window._lang, realNow=Date.now;
      Date.now=()=>new Date(2026,7,1,18,18,0).getTime();
      try{
        if(!window._pizzatidSchedule) window._pizzatidSchedule=defaultPizzatidSchedule();
        const anchor=new Date(2026,7,1,19,0,0);
        const pool=searchAllMethods(anchor);
        const top=pool[0];
        const flourMax=Math.max(...MELTYPER.map(m=>m.ferm.mx));
        // fix (a): ingen kandidat overstiger sterkeste mel (120t) — dreper 145t-bugen
        const noneExceedFlourMax=pool.every(c=>c.totalHrs<=flourMax);
        // fix (b): blant kandidatene med færrest konflikter starter toppen nærmest nå
        const minViol=top.violations;
        const sameViol=pool.filter(c=>c.violations===minViol);
        const topStart=new Date(top.startIso).getTime();
        const topStartsClosest=sameViol.every(c=>new Date(c.startIso).getTime()<=topStart);
        const guardWired=searchAllMethods.toString().includes('flourMax') && searchAllMethods.toString().includes('usingFallback');
        // kort deig får «alle mel passer», ikke skremmende «ingen mel dekker»
        const shortMsgFixed=renderResultBlock.toString().includes('Any flour works');
        return {count:pool.length, noneExceedFlourMax, topStartsClosest, guardWired, shortMsgFixed, topHrs:Math.round(top.totalHrs)};
      } finally { Date.now=realNow; window._lang=_lang; }
    }""")
    ok52 = (r52.get('noneExceedFlourMax') and r52.get('topStartsClosest')
            and r52.get('guardWired') and r52.get('shortMsgFixed'))
    results.append(('smartplan_never_suggests_flourless_or_past_start_combos', ok52, r52))

    # v0.662: alle varsler skal ha en tydelig «Ignorer»-knapp (ikke en diskré ✕).
    # Tidsplan-varslene bruker warningWrapHTML (skjuler + huskes i økta); Smart-
    # plan-varselet får sin egen selvskjulende «Ignorer». Ingen fysisk-grense-
    # advarsel gjøres om til «godta likevel» — kun skjuling.
    r53 = page.evaluate("""() => {
      const _lang=window._lang;
      try{
        window._lang='no';
        const html=warningWrapHTML('unittest-key-abc','<div><div>Test</div></div>');
        const hasIgnorer = html.includes('>Ignorer</button>') && html.includes('warn-dismiss-btn');
        const noBareX = !html.includes('>✕<');
        const wired = html.includes('dismissWarning(');
        dismissWarning(warnKey('unittest-key-abc'));
        const afterDismiss = warningWrapHTML('unittest-key-abc','<div><div>Test</div></div>')==='';
        window._lang='en';
        const enLabel = warningWrapHTML('unittest-key-en','<div><div>Test</div></div>').includes('>Ignore</button>');
        // Smart-plan-varselet har sin egen «Ignorer» som skjuler seg selv
        const src=renderResultBlock.toString();
        const smartHasIgnore = src.includes('data-smartwarn') && src.includes(\"style.display='none'\");
        return {hasIgnorer, noBareX, wired, afterDismiss, enLabel, smartHasIgnore};
      } finally { window._lang=_lang; }
    }""")
    ok53 = (r53.get('hasIgnorer') and r53.get('noBareX') and r53.get('wired')
            and r53.get('afterDismiss') and r53.get('enLabel') and r53.get('smartHasIgnore'))
    results.append(('all_warnings_have_clear_ignore_button', ok53, r53))

    # v0.663: Smart-plan default-dato er smart. Åpner du appen tidlig nok til at en
    # ekte deig rekker (≥8t margin til i dag kl. 18:00) → i dag. Ellers → i morgen
    # kl. 18:00. Same-dag på ettermiddagen ga «rare» resultater. Tidsfeltet
    # defaulter til 18:00 (samme som resten av appen).
    r54 = page.evaluate("""() => {
      const realNow=Date.now;
      const fmt=d=>{const p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());};
      try{
        // A: tidlig morgen (08:00) → god margin → I DAG
        Date.now=()=>new Date(2026,7,3,8,0,0).getTime();
        const a=betaDefaultDate(), aExp=fmt(new Date(2026,7,3));
        // B: ettermiddag (16:00) → for kort tid → I MORGEN
        Date.now=()=>new Date(2026,7,3,16,0,0).getTime();
        const b=betaDefaultDate(), bExp=fmt(new Date(2026,7,4));
        // C: kveld etter 18 (20:00) → I MORGEN
        Date.now=()=>new Date(2026,7,3,20,0,0).getTime();
        const c=betaDefaultDate(), cExp=fmt(new Date(2026,7,4));
        // authored default (getAttribute) — .value kan være mutert av en tidligere test
        const timeDefault=document.getElementById('mob-beta-et').getAttribute('value');
        return {a,aExp,b,bExp,c,cExp,timeDefault};
      } finally { Date.now=realNow; }
    }""")
    ok54 = (r54.get('a')==r54.get('aExp') and r54.get('b')==r54.get('bExp')
            and r54.get('c')==r54.get('cExp') and r54.get('timeDefault')=='18:00')
    results.append(('smartplan_default_today_only_with_margin_else_tomorrow_1800', ok54, r54))

    # F13 (v0.664): «☰ Mer» flyttet lengst til høyre i tabbaren, byttet med
    # «🧭 Smart-plan». Ny visuell rekkefølge: Planlegging · Tidsplan · Smart-plan · Mer.
    r55 = page.evaluate("""() => {
      const order=[...document.querySelectorAll('.mob-tabbar .mob-tab')].map(el=>el.id.replace('mob-tab-',''));
      const merLast = order[order.length-1]==='tips';
      const betaBeforeMer = order.indexOf('beta') < order.indexOf('tips');
      // badgen skal fortsatt havne på Mer-fanen etter ombyttingen
      window._activeDeigCount=2; try{ updateMerTabBadge(); }catch(e){}
      const badge=document.getElementById('mob-tab-mer-badge');
      const badgeOnMer = !!badge && badge.closest('.mob-tab') && badge.closest('.mob-tab').id==='mob-tab-tips';
      window._activeDeigCount=0; try{ updateMerTabBadge(); }catch(e){}
      return {order, merLast, betaBeforeMer, badgeOnMer};
    }""")
    ok55 = (r55.get('order')==['settings','plan','beta','tips']
            and r55.get('merLast') and r55.get('betaBeforeMer') and r55.get('badgeOnMer'))
    results.append(('mer_tab_moved_rightmost_swapped_with_smartplan', ok55, r55))

    # F11 (v0.664): tips/why-paritet. Kontrakt: HVERT steg som har understeg må ha
    # en `why` (den pedagogiske «hvorfor dette steget»-teksten). Vokter alle
    # metode×type-kombinasjoner mot at et understeg-steg mangler why fremover.
    r56 = page.evaluate("""() => {
      const anchor=new Date(2026,7,10,18,0,0);
      const orig={type:S.type,method:S.method,poolishPauseH:S.poolishPauseH,poolishCold:S.poolishCold};
      const gaps=[];
      try{
        const types=['napoletana','newyork','langpanne','chicago','ingenelting'];
        const methods=['standard','hurtig','kveld','mania','poolish','biga'];
        for(const type of types){
          for(const method of methods){
            if(type==='ingenelting' && method!=='standard') continue;
            S.type=type; S.method=method; S.poolishPauseH=0;
            let steps;
            try{
              if(type!=='ingenelting' && method==='hurtig') steps=hurtigSteps(anchor).steps;
              else if(type!=='ingenelting' && method==='kveld') steps=kveldSteps(anchor).steps;
              else steps=rawSteps(anchor);
            }catch(e){ gaps.push(type+'/'+method+' ERROR '+e); continue; }
            steps.forEach((s,i)=>{
              const hasSub=Array.isArray(s.substeps)&&s.substeps.length>0;
              if(hasSub && (!s.why || !String(s.why).trim())) gaps.push(type+'/'+method+' #'+i+' '+(s.title||''));
            });
          }
        }
      } finally { S.type=orig.type;S.method=orig.method;S.poolishPauseH=orig.poolishPauseH;S.poolishCold=orig.poolishCold; }
      return {gapCount:gaps.length, gaps:gaps.slice(0,12)};
    }""")
    ok56 = (r56.get('gapCount')==0)
    results.append(('every_substep_bearing_step_has_a_why_all_methods', ok56, r56))

    # #7 (v0.665): biga-romhevingen i fixedFermOverheadHours rundes nå likt som
    # tidsplanen (rtB=Math.round(rt*1.5)) — så overgjærings-varselet og planen
    # regner samme tall, ikke et sub-minutt fra hverandre.
    r57 = page.evaluate("""() => {
      const orig={method:S.method,temp:S.temp,bigaH:S.bigaH};
      try{
        S.method='biga'; S.temp=23; S.bigaH=18;  // temp der rtM(60)*1.5 blir ikke-heltall
        const got=fixedFermOverheadHours('biga');
        const exp=S.bigaH + Math.round(rtM(60)*1.5)/60;
        const rounded=fixedFermOverheadHours.toString().includes('Math.round(rtM(60)*1.5)');
        return {got, exp, match:Math.abs(got-exp)<1e-9, rounded};
      } finally { S.method=orig.method;S.temp=orig.temp;S.bigaH=orig.bigaH; }
    }""")
    ok57 = (r57.get('match') and r57.get('rounded'))
    results.append(('biga_bulk_rise_rounded_consistently_in_overhead', ok57, r57))

    # (v0.672: F10 «Handleliste» fjernet etter brukertilbakemelding — testen borte.)

    # F8 (v0.666): søk/filter/sortering i Deiger-lista (applyDeigFilter). F9: meta-
    # linja viser nå kjøletid + hydrering, så en ferdig deigs vurdering er knyttet
    # til konkrete tall.
    r59 = page.evaluate("""() => {
      const _f=window._deigFilter;
      try{
        const list=[
          {name:'Fredagspizza', config:{method:'poolish',cold:48,hydro:65,type:'napoletana'}, rating:5, finishedAt:'2026-07-20T18:00:00Z', anchorISO:'2026-07-20T18:00:00Z', status:'finished'},
          {name:'Biga-test', config:{method:'biga',cold:24,hydro:70,type:'newyork'}, rating:3, finishedAt:'2026-07-10T18:00:00Z', anchorISO:'2026-07-10T18:00:00Z', status:'finished'},
          {name:'Hurtig hverdag', config:{method:'hurtig',hydro:62,type:'napoletana'}, rating:2, finishedAt:'2026-07-25T18:00:00Z', anchorISO:'2026-07-25T18:00:00Z', status:'finished'}
        ];
        window._deigFilter={q:'biga',method:'',sort:'newest'};
        const search=applyDeigFilter(list).map(b=>b.name);
        window._deigFilter={q:'',method:'poolish',sort:'newest'};
        const methodF=applyDeigFilter(list).map(b=>b.config.method);
        window._deigFilter={q:'',method:'',sort:'newest'};
        const newest=applyDeigFilter(list).map(b=>b.name);
        window._deigFilter={q:'',method:'',sort:'rating'};
        const byRating=applyDeigFilter(list).map(b=>b.rating);
        const _lang=window._lang;
        window._lang='no'; const metaNo=bakeMetaLine(list[0]);
        window._lang='en'; const metaEn=bakeMetaLine(list[0]);
        window._lang=_lang;
        // v0.671: kjøletid-enheten må følge språk — «48t kjøl» (no) / «48h fridge» (en)
        return {search, methodF, newestFirst:newest[0], byRating,
                metaHasCold:metaNo.includes('48t'), metaHasHyd:metaNo.includes('65%'),
                enColdUnit:metaEn.includes('48h fridge') && !metaEn.includes('48t')};
      } finally { window._deigFilter=_f; }
    }""")
    ok59 = (r59.get('search')==['Biga-test'] and r59.get('methodF')==['poolish']
            and r59.get('newestFirst')=='Hurtig hverdag' and r59.get('byRating')==[5,3,2]
            and r59.get('metaHasCold') and r59.get('metaHasHyd') and r59.get('enColdUnit'))
    results.append(('doughs_search_filter_sort_and_config_in_meta', ok59, r59))

    # F7 (v0.667): tilgjengelighet. Avhaking (steg/ingrediens/understeg) er nå ekte
    # role=checkbox med aria-checked + tastaturstøtte (Enter/Space), og den live-
    # oppdaterende statuslinja har aria-live så skjermlesere hører endringene.
    r60 = page.evaluate("""() => {
      const orig={chosen:window._planChosen,type:S.type,method:S.method,openSub:window._openSub};
      try{
        const ing=recipeRowsHTML([{k:'Mel',v:'500g'}], true);
        const sb=deigStatusBarHTML([{title:'x',at:new Date(),passive:false}], false, false);
        window._planChosen=true; S.type='napoletana'; S.method='standard';
        try{ mobGen(); }catch(e){}
        // v0.688: understeg vises per steg — åpne alle så a11y-attributtene rendres.
        const n=document.querySelectorAll('#mob-plan-content .mob-step').length;
        window._openSub=new Set([...Array(n).keys()]);
        try{ mobGen(); }catch(e){}
        const plan=document.getElementById('mob-plan-content').innerHTML;
        return {
          ingA11y: ing.includes('role=\"checkbox\"') && ing.includes('aria-checked') && ing.includes('onkeydown'),
          sbLive: sb.includes('aria-live=\"polite\"'),
          stepA11y: plan.includes('role=\"checkbox\"') && plan.includes('onkeydown=\"if(event.key'),
          substepA11y: plan.includes('substep-item') && /substep-item[^>]*role=\"checkbox\"/.test(plan)
        };
      } finally { window._planChosen=orig.chosen;S.type=orig.type;S.method=orig.method;window._openSub=orig.openSub||new Set(); }
    }""")
    ok60 = all(r60.get(k) for k in ['ingA11y','sbLive','stepA11y','substepA11y'])
    results.append(('checkboxes_keyboard_accessible_and_statusbar_aria_live', ok60, r60))

    # T-i18n (v0.668): PC-visningens statiske HTML oversettes nå — metodekort,
    # seksjonsetiketter, meny, planleggings-boks (via syncStaticI18nUI) og topnav-
    # fanene (L() i gen()). setLang re-rendrer PC-planen når PC er aktiv.
    r61 = page.evaluate("""() => {
      const _lang=window._lang;
      try{
        setLang('en');
        const g=id=>{const e=document.getElementById(id);return e?e.textContent.trim():'';};
        const method=[...document.querySelectorAll('#gmet .mc .mc-t')].map(e=>e.textContent);
        const typeLbl=((document.getElementById('gtype')||{}).previousElementSibling||{}).textContent||'';
        const en={plan:g('pc-lbl-planlegging'), menu:g('pc-menu-manual'), logout:g('pc-menu-logout'), bs:g('pc-bs-lbl'), method0:method[0], typeLbl};
        setLang('no'); const noPlan=g('pc-lbl-planlegging');
        return {en, noPlan, topnavWired:gen.toString().includes(\"L('Steg for steg','Step by step')\"), setLangRendersPc:setLang.toString().includes('gen()')};
      } finally { window._lang=_lang; try{setLang(_lang||'no');}catch(e){} }
    }""")
    e61=r61.get('en',{})
    ok61 = (e61.get('plan')=='📅 Planning' and e61.get('menu')=='📖 User guide' and e61.get('logout')=='Log out'
            and e61.get('bs')=='When do you start?' and e61.get('method0')=='Long-ferment dough'
            and e61.get('typeLbl')=='Pizza type' and r61.get('noPlan')=='📅 Planlegging'
            and r61.get('topnavWired') and r61.get('setLangRendersPc'))
    results.append(('pc_static_html_localized_including_topnav', ok61, r61))

    # v0.669: harmonisert wizard-typografi. Mobil-metodekortene manglet i «chrome
    # beholder størrelse»-zoom-lista, så de ble ~15% større enn resten (derfor så
    # meltype mindre ut). Nå er de zoom-kansellert (zoom<1), og metodekort-tittel
    # (14px) + undertekst (12px) matcher meltype-nedtrekket (14px).
    r62 = page.evaluate("""() => {
      const orig=window._planChosen;
      try{
        window._planChosen=true; setLayout('mob'); mobShowTab('settings');
        try{ wizGoto(2); }catch(e){}
        const wrap=document.getElementById('mob-gmet');
        const wrapZoom = wrap ? parseFloat(getComputedStyle(wrap).zoom) : 1;
        const src=mobMethodCards.toString();
        return {
          methodCardsZoomCancelled: wrapZoom < 0.95,
          titleAt14: src.includes('font-size:14px'),
          subAt12: src.includes('font-size:12px'),
          meltypeRuleWired: [...document.styleSheets].some(ss=>{ try{ return [...ss.cssRules].some(r=>/dropdown-select select/.test(r.selectorText||'') && /14px/.test(r.style&&r.style.fontSize||r.cssText||'')); }catch(e){ return false; } })
        };
      } finally { window._planChosen=orig; }
    }""")
    ok62 = (r62.get('methodCardsZoomCancelled') and r62.get('titleAt14') and r62.get('subAt12'))
    results.append(('wizard_typography_harmonized_method_cards_zoom_cancelled', ok62, r62))

    # v0.670: statuslinja viser nå valgt meltype (mel) sammen med oppstart og
    # steketid, så du med ett blikk ser hvilket mel planen forutsetter.
    r63 = page.evaluate("""() => {
      const _lang=window._lang, _mt=S.meltype;
      try{
        S.meltype='doppio_zero';
        const mk=()=>deigStatusBarHTML([{title:'x',at:new Date(2026,7,3,18,0,0),passive:false}], false, false);
        window._lang='no'; const no=mk();
        window._lang='en'; const en=mk();
        return { noHasFlour: no.includes('🌾 Mel:') && no.includes('Caputo Doppio Zero'),
                 enHasFlour: en.includes('🌾 Flour:') && en.includes('Caputo Doppio Zero') };
      } finally { window._lang=_lang; S.meltype=_mt; }
    }""")
    ok63 = (r63.get('noHasFlour') and r63.get('enHasFlour'))
    results.append(('status_bar_shows_selected_flour_type', ok63, r63))

    # v0.673: «lag pizza nå» satte tiden bakover. Å velge en lang metode mens
    # «Jeg begynner nå» var på, tvang appen over i steketid-modus med en standard-
    # steketid som kunne ligge i fortiden. Nå (1) respekteres start-modus (planen
    # legges framover fra nå, ingen fortids-oppstart), og (2) i steketid-modus
    # flytter ensureFeasibleBakeTime() standardtiden framover til oppstarten er mulig.
    r64 = page.evaluate("""() => {
      const orig={mode:S.mode,method:S.method,cold:S.cold,type:S.type,temp:S.temp,mt:S.meltype,lang:window._lang,chosen:window._planChosen};
      try{
        window._lang='no'; window._planChosen=true; setLayout('mob'); mobShowTab('settings');
        const p2=n=>String(n).padStart(2,'0');

        // (1) Lang metode i «Jeg begynner nå» skal IKKE tvinges til steketid-modus.
        S.type='napoletana'; S.cold=48; S.temp=22; S.meltype='doppio_zero';
        mobSetMode('start');
        const card=Array.from(document.querySelectorAll('#mob-gmet > div')).find(c=>c.textContent.includes('Langtidsdeig'));
        if(card) card.click();
        const stayedStart = (S.mode==='start' && S.method==='standard');

        // Framoverplan fra nå: første aktive steg ligger ikke i fortiden.
        const steps=computeCurrentSteps();
        const first=steps.find(s=>!s.passive)||steps[0];
        let fat=first?first.at:null; if(fat && !(fat instanceof Date)) fat=new Date(fat);
        const startNotInPast = !!fat && fat.getTime() >= Date.now()-2*60000;

        // (2) ensureFeasibleBakeTime flytter en for-tidlig standard-steketid framover.
        mobSetMode('end');
        const soon=new Date(Date.now()+2*3600000); // 2t fram — håpløst for en ~52t metode
        document.getElementById('mob-ed').value = soon.getFullYear()+'-'+p2(soon.getMonth()+1)+'-'+p2(soon.getDate());
        document.getElementById('mob-et').value = p2(soon.getHours())+':'+p2(soon.getMinutes());
        ensureFeasibleBakeTime();
        const eb=earliestBakeAt();
        const dv=document.getElementById('mob-ed').value, tv=document.getElementById('mob-et').value;
        const feasibleAfterFix = !!eb && new Date(dv+'T'+tv).getTime() >= eb.getTime();

        return {
          stayedStart, startNotInPast, feasibleAfterFix,
          noForceInMethodPick: !mobMethodCards.toString().includes(\"mobSetMode('end')\"),
          modeSwitchEnsuresFeasible: mobSetMode.toString().includes('ensureFeasibleBakeTime'),
          // Steg 3 skal verken tvinge steketid-modus eller auto-fikse tiden —
          // en bevisst for-tidlig steketid skal fortsatt flagges der.
          wizCheckNoForceNoAutofix: !wizCheckRefresh.toString().includes(\"mobSetMode('end')\") && !wizCheckRefresh.toString().includes('ensureFeasibleBakeTime')
        };
      } finally { S.mode=orig.mode;S.method=orig.method;S.cold=orig.cold;S.type=orig.type;S.temp=orig.temp;S.meltype=orig.mt;window._lang=orig.lang;window._planChosen=orig.chosen; }
    }""")
    ok64 = all(r64.get(k) for k in ['stayedStart','startNotInPast','feasibleAfterFix','noForceInMethodPick','modeSwitchEnsuresFeasible','wizCheckNoForceNoAutofix'])
    results.append(('make_now_respects_start_mode_and_feasible_bake_time', ok64, r64))

    # v0.674: «Jeg begynner nå» er en kom-i-gang-modus uten frist. Kvalitetssjekken
    # viser da en rolig kvittering («✓ Du setter i gang nå») med kvalitets-/livsstils-
    # hint som myke «Verdt å vite»-notater — ikke den røde «N ting å se på»-telleren.
    # I «Planlagt steketid» (med frist) er sjekken uendret: samme underliggende
    # varsel rammes fortsatt inn som noe å se på.
    r65 = page.evaluate("""() => {
      const orig={mode:S.mode,method:S.method,cold:S.cold,type:S.type,mt:S.meltype,lang:window._lang,chosen:window._planChosen};
      try{
        window._lang='no'; window._planChosen=true; setLayout('mob'); mobShowTab('settings');
        // Svakt mel + veldig lang kald gjæring -> kvalitets-hint (uten mode-vakt),
        // slår til i begge modi, så vi kan sammenligne innrammingen A/B.
        S.type='napoletana'; S.method='standard'; S.cold=100; S.meltype='doppio_zero';
        const el=document.getElementById('wiz-check');

        S.mode='start'; wizCheckRender();
        const startHtml=el.innerHTML;

        S.mode='end';
        const p2=n=>String(n).padStart(2,'0');
        const soon=new Date(Date.now()+2*3600000);
        document.getElementById('mob-ed').value=soon.getFullYear()+'-'+p2(soon.getMonth()+1)+'-'+p2(soon.getDate());
        document.getElementById('mob-et').value=p2(soon.getHours())+':'+p2(soon.getMinutes());
        wizCheckRender();
        const endHtml=el.innerHTML;

        return {
          startReceipt: startHtml.includes('Du setter i gang nå'),
          startSoftHint: startHtml.includes('Verdt å vite'),
          startNoAlarm: !startHtml.includes('ting å se på'),
          endStillAlarms: endHtml.includes('ting å se på') || endHtml.includes('Oppstarten har allerede passert')
        };
      } finally { S.mode=orig.mode;S.method=orig.method;S.cold=orig.cold;S.type=orig.type;S.meltype=orig.mt;window._lang=orig.lang;window._planChosen=orig.chosen; try{wizCheckRender();}catch(e){} }
    }""")
    ok65 = all(r65.get(k) for k in ['startReceipt','startSoftHint','startNoAlarm','endStillAlarms'])
    results.append(('make_now_shows_calm_receipt_not_alarm_counter', ok65, r65))

    # v0.675: statuslinje-tittelen ble kuttet midt i ordet («… pizza · Lon…»).
    # Nå brukes det korte typenavnet (tnShort, uten «pizza»-halet) og tittelen
    # brytes i stedet for å avkortes med ellipse.
    r66 = page.evaluate("""() => {
      const _lang=window._lang, _m=S.method, _t=S.type;
      try{
        S.type='napoletana'; S.method='standard';
        const mk=()=>deigStatusBarHTML([{title:'x',at:new Date(2026,7,3,18,0,0),passive:false}], false, false);
        window._lang='en'; const en=mk();
        window._lang='no'; const no=mk();
        // Første tittel-div (font-weight:700 rett etter space-between-raden).
        const titleStyle = en.split('font-weight:700')[1].split('>')[0];
        return {
          enShort: en.includes('Neapolitan · Long-ferment dough'),
          enNoPizzaSuffix: !en.includes('Neapolitan pizza ·'),
          noShort: no.includes('Napoletansk · Langtidsdeig'),
          noEllipsisTruncation: !titleStyle.includes('text-overflow:ellipsis') && !titleStyle.includes('white-space:nowrap')
        };
      } finally { window._lang=_lang; S.method=_m; S.type=_t; }
    }""")
    ok66 = all(r66.get(k) for k in ['enShort','enNoPizzaSuffix','noShort','noEllipsisTruncation'])
    results.append(('status_bar_title_short_type_and_wraps_not_truncates', ok66, r66))

    # v0.676: langtidsdeig får merkede kald-tid-valg rett under metodevalget (som
    # hurtig/kveld), i tillegg til slideren i Finjuster. Chip og slider setter
    # samme S.cold (ett sannhetsgrunnlag), og radene skjules for hurtigdeig.
    r67 = page.evaluate("""() => {
      const orig={mode:S.mode,method:S.method,cold:S.cold,type:S.type,lang:window._lang,chosen:window._planChosen};
      try{
        window._lang='no'; window._planChosen=true; setLayout('mob'); mobShowTab('settings');
        try{ wizGoto(2); }catch(e){}
        S.type='napoletana';
        const pick=txt=>{const c=[...document.querySelectorAll('#mob-gmet > div')].find(x=>x.textContent.includes(txt)); if(c) c.click(); return !!c;};
        pick('Langtidsdeig');
        const rows=[...document.querySelectorAll('#mob-srows > div')].map(d=>d.textContent.trim());
        const ssubShown = document.getElementById('mob-ssub').style.display!=='none';
        // Klikk «72 timer» -> S.cold=72
        const r72=[...document.querySelectorAll('#mob-srows > div')].find(d=>d.textContent.includes('72'));
        if(r72) r72.click();
        const coldAfterChip=S.cold;
        // Slider (mobUCold) -> chip re-highlightes = ett sannhetsgrunnlag
        mobUCold(48);
        const chip48=[...document.querySelectorAll('#mob-srows > div')].find(d=>d.textContent.includes('48'));
        const chip48On = !!(chip48 && chip48.getAttribute('style').includes('600'));
        // Skjules for hurtigdeig
        pick('Hurtigdeig');
        const hiddenForHurtig = document.getElementById('mob-ssub').style.display==='none';
        // Engelske etiketter (kall byggeren direkte med en=språk)
        window._lang='en'; mobBuildSrows();
        const enRows=[...document.querySelectorAll('#mob-srows > div')].map(d=>d.textContent.trim());
        return {
          hasThreeLabelled: rows.length===3 && rows[0].includes('24 timer') && rows[0].includes('Rett fram') && rows[2].includes('72 timer') && rows[2].includes('Full smak'),
          ssubShown, coldAfterChip, chip48On, hiddenForHurtig,
          enLabelled: enRows.length===3 && enRows[0].includes('24 hours') && enRows[0].includes('Straightforward') && enRows[2].includes('Full flavor')
        };
      } finally { S.mode=orig.mode;S.method=orig.method;S.cold=orig.cold;S.type=orig.type;window._lang=orig.lang;window._planChosen=orig.chosen; }
    }""")
    ok67 = (r67.get('hasThreeLabelled') and r67.get('ssubShown') and r67.get('coldAfterChip')==72
            and r67.get('chip48On') and r67.get('hiddenForHurtig') and r67.get('enLabelled'))
    results.append(('longferment_gets_labelled_cold_time_picks_like_quick_dough', ok67, r67))

    # v0.677: (1) «Verdt å vite»-hintene i nå-modus kan ignoreres (ikke tvunget
    # _warnShowAll), mens steketid-modus beholder full sjekkliste uten ignorer.
    # (2) «Annet mel / ikke i listen» (generic) demper det mel-spesifikke varselet,
    # vises språk-bevisst i statuslinja, og skjevfordeler ikke kald-tak/Smart-plan.
    r68 = page.evaluate("""() => {
      const orig={mode:S.mode,method:S.method,cold:S.cold,type:S.type,hydro:S.hydro,mt:S.meltype,lang:window._lang,chosen:window._planChosen};
      try{
        window._lang='no'; window._planChosen=true; setLayout('mob'); mobShowTab('settings');
        S.type='napoletana'; S.method='standard'; S.cold=100; S.hydro=65;
        const el=document.getElementById('wiz-check');
        // (1) Ignorer-knapp i nå-modus, ikke i steketid-modus
        S.meltype='nuvola';
        S.mode='start'; wizCheckRender(); const startHasIgnore = el.innerHTML.includes('Ignorer');
        const p2=n=>String(n).padStart(2,'0'); const soon=new Date(Date.now()+2*3600000);
        document.getElementById('mob-ed').value=soon.getFullYear()+'-'+p2(soon.getMonth()+1)+'-'+p2(soon.getDate());
        document.getElementById('mob-et').value='18:00';
        S.mode='end'; wizCheckRender(); const endHasIgnore = el.innerHTML.includes('Ignorer');
        // (1b) Faktisk ignorering i nå-modus skjuler nettopp mel-hintet (flere
        // varsler fyrer ved 100t, så vi treffer mel-varselets EGEN ignorer-knapp).
        S.mode='start'; wizCheckRender();
        const meltypeWrap=[...el.querySelectorAll('.warn-dismiss-wrap')].find(w=>w.textContent.includes('gjæret lenger enn anbefalt'));
        let dismissedHides=false;
        if(meltypeWrap){ meltypeWrap.querySelector('.warn-dismiss-btn').click(); dismissedHides = !document.getElementById('wiz-check').innerHTML.includes('gjæret lenger enn anbefalt'); }
        _dismissedWarnings.clear();
        // (2) «Annet mel»: varsel dempet
        S.meltype='nuvola'; const nuvolaWarns = meltypeWarningHTML().length>0;
        S.meltype='annet'; const annetSuppressed = meltypeWarningHTML()==='';
        // (2b) statuslinje språk-bevisst
        const sb=()=>deigStatusBarHTML([{title:'x',at:new Date(),passive:false}],false,false);
        window._lang='no'; const sbNo=sb().includes('Annet mel');
        window._lang='en'; const sbEn=sb().includes('Other flour'); window._lang='no';
        // (2c) aggregater upåvirket
        const coldCap = Math.max(...MELTYPER.map(m=>m.ferm.mx));
        const annetInSmart = MELTYPER.filter(m=>30>=m.ferm.mn && 30<=m.ferm.mx).some(m=>m.v==='annet');
        return { startHasIgnore, endHasIgnore, dismissedHides, nuvolaWarns, annetSuppressed, sbNo, sbEn, coldCap, annetInSmart };
      } finally { S.mode=orig.mode;S.method=orig.method;S.cold=orig.cold;S.type=orig.type;S.hydro=orig.hydro;S.meltype=orig.mt;window._lang=orig.lang;window._planChosen=orig.chosen; try{_dismissedWarnings.clear();}catch(e){} }
    }""")
    ok68 = (r68.get('startHasIgnore') and not r68.get('endHasIgnore') and r68.get('dismissedHides')
            and r68.get('nuvolaWarns') and r68.get('annetSuppressed') and r68.get('sbNo') and r68.get('sbEn')
            and r68.get('coldCap')==120 and not r68.get('annetInSmart'))
    results.append(('warnings_dismissible_in_now_mode_and_generic_flour_suppresses_meltype', ok68, r68))

    # v0.678: overmodnings-varselet (flour-agnostisk fysikk) fyrer fortsatt for
    # «Annet mel», men med en softere, usikkerhets-erkjennende ramme i stedet for
    # «⚠️ fare for overfermentering» — sansesjekken beholdes. Kjente mel uendret.
    r69 = page.evaluate("""() => {
      const orig={type:S.type,method:S.method,cold:S.cold,bigaH:S.bigaH,mt:S.meltype,lang:window._lang};
      try{
        window._lang='no'; S.type='napoletana'; S.method='biga'; S.cold=78; S.bigaH=24; // stables til >92t
        S.meltype='manitoba'; const known=overfermentWarningHTML();
        S.meltype='annet'; const gen=overfermentWarningHTML();
        window._lang='en'; const genEn=overfermentWarningHTML();
        return {
          knownFiresAlarm: known.includes('fare for overfermentering'),
          genSoftTitle: gen.includes('Lang gjæring for et ukjent mel') && !gen.includes('fare for overfermentering'),
          genKeepsCheck: gen.includes('sjekk deigen mot slutten') && gen.includes('et veldig sterkt mel kan tåle det'),
          genEnSoft: genEn.includes('Long fermentation for an unknown flour') && genEn.includes('a very strong flour may handle it')
        };
      } finally { S.type=orig.type;S.method=orig.method;S.cold=orig.cold;S.bigaH=orig.bigaH;S.meltype=orig.mt;window._lang=orig.lang; }
    }""")
    ok69 = all(r69.get(k) for k in ['knownFiresAlarm','genSoftTitle','genKeepsCheck','genEnSoft'])
    results.append(('overferment_softened_for_generic_flour_alarm_for_known', ok69, r69))

    # v0.679: «Mer → Visning»-seksjonen var zoom-kansellert (.fs-visning-wrap holdt
    # den på «chrome»-størrelse) så teksten ble mindre enn resten av skjermen. Nå
    # skalerer den med lesetekst som nabo-seksjonen (Språk/Enheter): felt-etikettene
    # matcher, og ingenting flyter over horisontalt på noe skriftnivå.
    r70 = page.evaluate("""() => {
      const orig=window._planChosen;
      try{
        window._planChosen=true; setLayout('mob'); mobShowTab('tips');
        const eff = (id,sel) => { let el=document.getElementById(id); if(sel) el=el&&el.querySelector(sel); if(!el) return null;
          let z=1,n=el; while(n&&n!==document.documentElement){z*=(parseFloat(getComputedStyle(n).zoom)||1);n=n.parentElement;}
          return Math.round(parseFloat(getComputedStyle(el).fontSize)*z*10)/10; };
        const themeL=eff('mob-theme-lbl'), fsL=eff('mob-fs-lbl'), langL=eff('mob-i18n-lang-lbl');
        const fsBtn=eff('mob-fs-seg','.o'), langBtn=eff('mob-l-no');
        const ov={}; for(const lvl of ['','fs-large','fs-xlarge','fs-xxlarge']){
          document.body.classList.remove('fs-large','fs-xlarge','fs-xxlarge'); if(lvl)document.body.classList.add(lvl);
          ov[lvl||'normal']=document.documentElement.scrollWidth-document.documentElement.clientWidth;
        } document.body.classList.remove('fs-large','fs-xlarge','fs-xxlarge');
        const notCancelled = ![...document.styleSheets].some(ss=>{ try{ return [...ss.cssRules].some(r=>/fs-visning-wrap/.test(r.selectorText||'')); }catch(e){ return false; } });
        return {
          labelsMatchNeighbor: themeL!=null && themeL===fsL && fsL===langL,
          buttonsMatchNeighbor: fsBtn!=null && fsBtn===langBtn,
          noOverflowAnyLevel: Object.values(ov).every(v=>v<=0),
          visningNotZoomCancelled: notCancelled
        };
      } finally { window._planChosen=orig; }
    }""")
    ok70 = all(r70.get(k) for k in ['labelsMatchNeighbor','buttonsMatchNeighbor','noOverflowAnyLevel','visningNotZoomCancelled'])
    results.append(('display_section_scales_like_page_not_zoom_cancelled', ok70, r70))

    # v0.681: Smart-plan-metode-filter. Seks avhukinger i beta-panelet styrer hvilke
    # metoder som foreslås (kun forslag — manuell velger uberørt). Ekskluderte
    # metoder faller ut av søket; persisteres i localStorage; skrur du av ALT
    # slappes filteret (relaxed-flagg) så skjermen aldri blir tom.
    r71 = page.evaluate("""() => {
      const _lang=window._lang, _saved=localStorage.getItem('pizzaBetaMethods');
      try{
        window._lang='no'; window._planChosen=true; setLayout('mob'); mobShowTab('beta');
        _betaMethods=null; try{localStorage.removeItem('pizzaBetaMethods');}catch(e){}
        renderBetaMethodFilter();
        const rows=document.querySelectorAll('#mob-beta-methods-rows > div').length;
        const d=new Date(Date.now()+140*3600000); d.setHours(18,0,0,0); // langt anker: alle metoder gjennomførbare
        const methodsIn=()=>[...new Set(searchAllMethods(new Date(d)).map(c=>c.snapshot.method))];
        const before=methodsIn();
        // skru av biga/poolish/mania
        ['biga','poolish','mania'].forEach(m=>toggleBetaMethod(m));
        const after=methodsIn();
        const persisted=JSON.parse(localStorage.getItem('pizzaBetaMethods')||'{}');
        const header=document.getElementById('mob-beta-methods-lbl').textContent;
        // skru av resten -> relaxed fallback, ikke tomt
        ['standard','hurtig','kveld'].forEach(m=>toggleBetaMethod(m));
        const resAll=searchAllMethods(new Date(d));
        const relaxed=window._betaFilterRelaxed, nonEmpty=resAll.length>0;
        return {
          rows, allSix: ['standard','poolish','biga','mania','hurtig','kveld'].every(m=>before.includes(m)),
          excludedGone: !after.includes('biga') && !after.includes('poolish') && !after.includes('mania') && after.includes('standard'),
          persistedOff: persisted.biga===false && persisted.poolish===false && persisted.standard===true,
          headerCount: header.includes('3 av 6'),
          relaxedWhenAllOff: relaxed===true && nonEmpty,
          manualUntouched: typeof mobMethodCards==='function' && !mobMethodCards.toString().includes('betaMethodAllowed')
        };
      } finally {
        window._lang=_lang; _betaMethods=null;
        if(_saved===null){ try{localStorage.removeItem('pizzaBetaMethods');}catch(e){} } else { try{localStorage.setItem('pizzaBetaMethods',_saved);}catch(e){} }
      }
    }""")
    ok71 = all(r71.get(k) for k in ['rows','allSix','excludedGone','persistedOff','headerCount','relaxedWhenAllOff','manualUntouched']) and r71.get('rows')==6
    results.append(('smartplan_method_filter_excludes_suggestions_persists_relaxes_when_empty', ok71, r71))

    # v0.682: etter at kald-taket ble hevet til 120t (v0.680) løftet «lengst =
    # best smak»-tiebreaken stadig ~115t-deiger som BARE Manitoba støtter. Nå veies
    # mel-støtte inn (kappet ved 3): topp-forslaget foretrekker en gjæringstid
    # flere mel takler (~48t, 5 mel) framfor 115t (1 mel) — men den lange finnes
    # fortsatt i puljen (under «Se flere alternativer»).
    r72 = page.evaluate("""() => {
      const _sched=window._pizzatidSchedule;
      try{
        window._planChosen=true; setLayout('mob');
        const allDay=[['00:00','23:59'],null];
        window._pizzatidSchedule={mon:allDay,tue:allDay,wed:allDay,thu:allDay,fri:allDay,sat:allDay,sun:allDay}; // null konflikter
        const d=new Date(Date.now()+150*3600000); d.setHours(18,0,0,0); // masse tid -> alle lengder gjennomførbare
        const res=searchAllMethods(new Date(d));
        const top=res[0];
        const topSupport=flourMatchesForHours(top.totalHrs).length;
        return {
          topSupportedByMany: topSupport>=3,
          topNotExtreme: Math.round(top.totalHrs)<=60,
          longStillInPool: res.some(c=>Math.round(c.totalHrs)>=110),
          supportFieldWired: searchAllMethods.toString().includes('_support')
        };
      } finally { window._pizzatidSchedule=_sched; }
    }""")
    ok72 = all(r72.get(k) for k in ['topSupportedByMany','topNotExtreme','longStillInPool','supportFieldWired'])
    results.append(('smartplan_prefers_broadly_supported_ferment_over_extreme_length', ok72, r72))

    # v0.683: tidskonflikt-merket på et steg som havner utenfor din LEDIGE tid sa
    # feilaktig «utenfor spisetid» (du spiser ikke da — du jobber), og var norsk-
    # only. Nå: «utenfor ledig tid» / «outside free time», tospråklig.
    r73 = page.evaluate("""() => {
      const _sched=window._pizzatidSchedule, _lang=window._lang, _m=S.method, _hh=S.hurtigH, _mode=S.mode;
      try{
        window._planChosen=true; setLayout('mob');
        window._pizzatidSchedule={mon:[null,null],tue:[null,null],wed:[null,null],thu:[null,null],fri:[null,null],sat:[null,null],sun:[null,null]};
        S.type='napoletana'; S.method='hurtig'; S.hurtigH=4; S.mode='end';
        const d=new Date(Date.now()+30*3600000); d.setHours(14,0,0,0); // oppstart ~kl 10, dagtid
        document.getElementById('mob-ed').value=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
        document.getElementById('mob-et').value='14:00';
        mobShowTab('plan');
        const grab=()=>{const f=document.querySelector('#mob-plan-content .conflict-flag'); return f?f.textContent.trim():'';};
        window._lang='no'; mobGen(); const no=grab();
        window._lang='en'; mobGen(); const en=grab();
        return {
          noCorrect: no.includes('utenfor ledig tid') && !no.includes('spisetid'),
          enTranslated: en.includes('outside free time'),
          srcNoSpisetid: !renderSteps.toString().includes('utenfor spisetid')
        };
      } finally { window._pizzatidSchedule=_sched; window._lang=_lang; S.method=_m; S.hurtigH=_hh; S.mode=_mode; }
    }""")
    ok73 = all(r73.get(k) for k in ['noCorrect','enTranslated','srcNoSpisetid'])
    results.append(('conflict_flag_says_free_time_not_eating_time_bilingual', ok73, r73))

    # v0.684: meltypene ligger nå på server (/api/flours) med innebygd seed-fallback.
    # Nedtrekkene genereres fra MELTYPER (så server-mel dukker opp), «annet» er en
    # frontend-sentinel som alltid ligger sist, og applyFlours overstyrer trygt
    # (validerer, beholder seed ved ugyldig/tom respons).
    r74 = page.evaluate("""() => {
      const _lang=window._lang, _mt=S.meltype;
      try{
        window._lang='no'; window._planChosen=true; setLayout('mob'); mobShowTab('settings');
        const opts=id=>[...document.getElementById(id).options].map(o=>o.value);
        const seedOpts=opts('mob-gmel');
        const seedLen=MELTYPER.length;
        // annet språk-bevisst
        window._lang='en'; populateMeltypeSelects();
        const annetEn=[...document.getElementById('mob-gmel').options].find(o=>o.value==='annet').textContent;
        window._lang='no'; populateMeltypeSelects();
        // applyFlours: server-data bytter ut, annet beholdes sist
        applyFlours([{v:'nytt_mel',t:'Test Supermel',protein:'15%',w:'400',hydro:'65–90%',hydroRange:{mn:65,mx:90},ferm:{mn:24,mx:96}}]);
        populateMeltypeSelects();
        const afterOpts=opts('mob-gmel');
        const newPresent=MELTYPER.some(f=>f.v==='nytt_mel');
        const annetLastAfter=MELTYPER[MELTYPER.length-1].v==='annet';
        // ugyldig/tom -> behold forrige
        const before=MELTYPER.length; applyFlours([]); const emptyKept=MELTYPER.length===before;
        applyFlours('garbage'); const junkKept=MELTYPER.length===before;
        // gjenopprett seed for etterfølgende tester
        applyFlours(MELTYPER_SEED); populateMeltypeSelects();
        return {
          dropdownGenerated: seedOpts.length===seedLen && seedOpts[0]==='dallari',
          annetLastSeed: seedOpts.slice(-1)[0]==='annet',
          annetSentinelNotInSeedConst: !MELTYPER_SEED.some(f=>f.v==='annet'),
          annetEnTranslated: annetEn.includes('Other'),
          serverFlourAppears: newPresent && afterOpts.includes('nytt_mel'),
          annetLastAfterApply: annetLastAfter,
          invalidKeepsPrev: emptyKept && junkKept,
          loadsFloursAtStartup: loadConfigThenStart.toString().includes('/api/flours')
        };
      } finally { window._lang=_lang; S.meltype=_mt; try{applyFlours(MELTYPER_SEED);populateMeltypeSelects();}catch(e){} }
    }""")
    ok74 = all(r74.get(k) for k in ['dropdownGenerated','annetLastSeed','annetSentinelNotInSeedConst','annetEnTranslated','serverFlourAppears','annetLastAfterApply','invalidKeepsPrev','loadsFloursAtStartup'])
    results.append(('flour_types_server_backed_with_seed_fallback_and_generated_dropdowns', ok74, r74))

    # v0.685 (fase 2): admin-editor for meltyper + dynamisk kald-tak. COLD_MAX
    # utledes nå fra sterkeste mels ferm.mx (legger admin inn et sterkere mel,
    # strekker slideren seg). Editoren lister ekte mel (ikke «annet»), og lagring
    # POST-er riktig payload til /api/flours/admin.
    r75 = page.evaluate("""() => {
      const _mt=S.meltype, _pw=window._adminPassword;
      try{
        window._planChosen=true; setLayout('mob'); mobShowTab('settings'); syncMobControls();
        const out={};
        // dynamisk COLD_MAX
        out.coldMaxSeed=COLD_MAX;
        applyFlours([{v:'super',t:'Supermel',protein:'15%',w:'450',hydro:'70–95%',hydroRange:{mn:70,mx:95},ferm:{mn:24,mx:150}}]);
        syncMobControls();
        out.coldMaxGrows = COLD_MAX===150 && document.getElementById('mob-csl').getAttribute('max')==='150';
        applyFlours(MELTYPER_SEED); syncMobControls();
        out.coldMaxRestored = COLD_MAX===120;
        out.derivesFromData = recomputeColdMax.toString().includes('ferm.mx');
        // editor
        window._adminPassword='x'; openFlourEditor();
        out.editorOpens = document.getElementById('flour-modal').style.display==='flex';
        out.listsRealFlours = document.querySelectorAll('#flour-modal-body .admin-card').length===9;
        out.annetExcluded = ![...document.querySelectorAll('#flour-modal-body .admin-uname')].some(e=>e.textContent.includes('Annet'));
        out.hasForm = !!document.getElementById('flour-f-t') && !!document.getElementById('flour-f-fmx');
        // save payload via mock fetch
        let cap=null; const _f=window.fetch;
        window.fetch=(url,opts)=>{ cap={url,opts}; return Promise.resolve({status:200,ok:true,json:()=>Promise.resolve({ok:true,flours:MELTYPER_SEED})}); };
        renderFlourEditor();
        document.getElementById('flour-f-t').value='Ny Testmel';
        document.getElementById('flour-f-hmn').value='60'; document.getElementById('flour-f-hmx').value='80';
        document.getElementById('flour-f-fmn').value='12'; document.getElementById('flour-f-fmx').value='60';
        return new Promise(resolve=>{ saveFlour().then(()=>{
          window.fetch=_f; closeFlourModal();
          const body=cap?JSON.parse(cap.opts.body):{};
          out.savePatch = cap && cap.url==='/api/flours/admin' && cap.opts.method==='PATCH';
          out.savePayloadOk = !!(body.flour && body.flour.v==='ny_testmel' && body.flour.ferm.mx===60 && body.password==='x');
          resolve(out);
        }); });
      } finally { S.meltype=_mt; window._adminPassword=_pw; try{applyFlours(MELTYPER_SEED);syncMobControls();}catch(e){} }
    }""")
    ok75 = all(r75.get(k) for k in ['coldMaxGrows','coldMaxRestored','derivesFromData','editorOpens','listsRealFlours','annetExcluded','hasForm','savePatch','savePayloadOk'])
    results.append(('flour_admin_editor_and_dynamic_cold_cap', ok75, r75))

    # v0.689: Kopier/Kalender/Lagre flyttet fra statuslinja (topp) til bunnen av
    # tidsplanen (ikke sticky) — sjeldent brukt, tar ikke lenger toppplass.
    r76 = page.evaluate("""() => {
      window._planChosen=true; setLayout('mob'); S.type='napoletana'; S.method='standard'; S.mode='start';
      mobShowTab('plan'); mobGen();
      const plan=document.getElementById('mob-plan-content');
      const statusBar=plan.querySelector('[aria-live]');
      const bottom=[...plan.querySelectorAll('div')].find(d=>d.textContent.includes('Med denne planen'));
      const savebtn=plan.querySelector('#mob-savebake-btn');
      const steps=[...plan.querySelectorAll('.mob-step')];
      const lastStep=steps[steps.length-1];
      const saveAfterSteps = !!(savebtn && lastStep && (savebtn.compareDocumentPosition(lastStep) & Node.DOCUMENT_POSITION_PRECEDING));
      return {
        topHasNoActions: !!statusBar && !statusBar.textContent.includes('Kopier'),
        hasBottomActions: !!bottom && bottom.textContent.includes('Kopier') && bottom.textContent.includes('Lagre'),
        saveAfterSteps
      };
    }""")
    ok76 = all(r76.get(k) for k in ['topHasNoActions','hasBottomActions','saveAfterSteps'])
    results.append(('plan_export_save_actions_moved_to_bottom', ok76, r76))

    # v0.691 (justert skisse B): kortet viser selve stegteksten (desc) igjen — den
    # er «hva du gjør» og skal alltid være synlig. Detaljene ligger bak rene ikoner
    # på samme linje: 🧾 ingredienser (nå ikon-kun, på lik linje med de andre),
    # 📋 understeg, 💡 tips. Ingen ingrediens-chips før 🧾 trykkes.
    r77 = page.evaluate("""() => {
      window._openIng=new Set(); window._openSub=new Set(); window._openTip=new Set();
      window._planChosen=true; setLayout('mob'); S.type='napoletana'; S.method='standard'; S.mode='start';
      mobShowTab('plan'); mobGen();
      const plan=()=>document.getElementById('mob-plan-content');
      const chipsBefore=plan().querySelectorAll('.mob-needchip').length;
      const descBefore=plan().querySelectorAll('.mob-sdesc').length;
      const btns=[...plan().querySelectorAll('.step-detail-btn')];
      const ingBtn=btns.find(b=>b.textContent.trim()==='🧾');
      const ingIconOnly=!!ingBtn && !ingBtn.textContent.toLowerCase().includes('ingred');
      const howIconOnly=!!btns.find(b=>b.textContent.trim()==='📋');
      const tipIconOnly=!!btns.find(b=>b.textContent.trim()==='💡');
      if(ingBtn) ingBtn.click();
      const chipsAfter=plan().querySelectorAll('.mob-needchip').length;
      window._openIng=new Set(); window._openSub=new Set(); window._openTip=new Set();
      return {
        chipsHiddenByDefault: chipsBefore===0,
        descShownByDefault: descBefore>0,
        ingIconOnly,
        ingRevealsChips: chipsAfter>0,
        howIconOnly, tipIconOnly
      };
    }""")
    ok77 = all(r77.get(k) for k in ['chipsHiddenByDefault','descShownByDefault','ingIconOnly','ingRevealsChips','howIconOnly','tipIconOnly'])
    results.append(('step_card_text_shown_details_behind_icons', ok77, r77))

    # v0.694: tidspunktet i steg-kortet brakk stygt midt i datoen («man 3. aug kl.»
    # / «15:10 · 30 min») fordi .mob-stim/.stim manglet white-space:nowrap. Tiden
    # skal holdes på én linje; skulle den + stedet ikke få plass, wrapper .mob-smeta
    # (flex-wrap) stedet ned i stedet for å splitte datoen. Sjekker computed style
    # på både mobil (.mob-stim) og PC (.stim).
    r78 = page.evaluate("""() => {
      window._openIng=new Set(); window._openSub=new Set(); window._openTip=new Set();
      window._planChosen=true; setLayout('mob'); S.type='napoletana'; S.method='standard'; S.mode='start';
      mobShowTab('plan'); mobGen();
      const mobTime=document.querySelector('#mob-plan-content .mob-stim');
      const mobNowrap = mobTime ? getComputedStyle(mobTime).whiteSpace==='nowrap' : false;
      document.body.classList.remove('mob-mode'); document.body.classList.add('pc-mode');
      gen();
      const pcTime=document.querySelector('#p-plan .stim');
      const pcNowrap = pcTime ? getComputedStyle(pcTime).whiteSpace==='nowrap' : false;
      document.body.classList.remove('pc-mode'); document.body.classList.add('mob-mode');
      return { hadMobTime:!!mobTime, mobNowrap, hadPcTime:!!pcTime, pcNowrap };
    }""")
    ok78 = all(r78.get(k) for k in ['hadMobTime','mobNowrap','hadPcTime','pcNowrap'])
    results.append(('step_time_stays_on_one_line', ok78, r78))

    # v0.695: ikonraden (🧾/📋/💡) hoppet opp/ned når man åpnet understeg, fordi den
    # lå UNDER prosateksten — og v0.693 lar teksten vike for sjekklista. Nå er raden
    # forankret rett under tittelen (over alt utvidbart innhold). Sjekker at
    # .step-detail-icons har SAMME posisjon blant kortets barn før og etter at
    # understeg åpnes (altså ikke flytter seg), og at den ligger foran både desc og
    # understeg-lista.
    r79 = page.evaluate("""() => {
      window._openIng=new Set(); window._openSub=new Set(); window._openTip=new Set();
      window._planChosen=true; setLayout('mob'); S.type='napoletana'; S.method='standard'; S.mode='start';
      mobShowTab('plan'); mobGen();
      const idxOfIcons=()=>{
        const icons=document.querySelector('#mob-plan-content .mob-step .step-detail-icons');
        if(!icons) return -1;
        return Array.prototype.indexOf.call(icons.parentElement.children, icons);
      };
      const idxClosed=idxOfIcons();
      // desc synlig og LIGGER ETTER ikonene når understeg er lukket
      const bodyClosed=document.querySelector('#mob-plan-content .mob-step .mob-sbody, #mob-plan-content .mob-step').innerHTML;
      const iconsBeforeDesc = bodyClosed.indexOf('step-detail-icons') < bodyClosed.indexOf('mob-sdesc');
      // åpne understeg på steg 0
      window._openSub=new Set([0]); mobGen();
      const idxOpen=idxOfIcons();
      const bodyOpen=document.querySelector('#mob-plan-content .mob-step .mob-sbody, #mob-plan-content .mob-step').innerHTML;
      const iconsBeforeSubs = bodyOpen.indexOf('step-detail-icons') < bodyOpen.indexOf('substep-list');
      window._openIng=new Set(); window._openSub=new Set(); window._openTip=new Set();
      return { idxClosed, idxOpen, stable: idxClosed>=0 && idxClosed===idxOpen,
               iconsBeforeDesc, iconsBeforeSubs };
    }""")
    ok79 = all(r79.get(k) for k in ['stable','iconsBeforeDesc','iconsBeforeSubs'])
    results.append(('step_detail_icons_anchored_do_not_jump', ok79, r79))

    # v0.696: ventebanneret etter «Lag poolish» sa «La stå i kjøleskap» når planen
    # hadde en kjøleskapspause (next.loc==='kjol'), selv om poolishen faktisk gjærer
    # ved ROMTEMPERATUR. Poolish/biga-fermentering skal merkes som romtemperatur;
    # kjøleskaps-poolish (S.poolishCold) skal si «modnes kaldt».
    r80 = page.evaluate("""() => {
      const orig={method:S.method,cold:S.poolishCold,pause:S.poolishPauseH,ph:S.poolishH};
      window._openSub=new Set(); window._planChosen=true; setLayout('mob');
      S.type='napoletana'; S.method='poolish'; S.poolishCold=false; S.poolishPauseH=6; S.poolishH=14; S.mode='start';
      mobShowTab('plan'); mobGen();
      const steps=[...document.querySelectorAll('#mob-plan-content .mob-step')];
      const titleOf=st=>{const t=st.querySelector('.mob-stit'); return t?t.textContent:'';};
      const poolishStep=steps.find(st=>/lag poolish/i.test(titleOf(st)));
      const hasPause=steps.some(st=>/kjøleskapspause/i.test(titleOf(st)));
      const wRoom=poolishStep?((poolishStep.querySelector('.mob-swait')||{}).textContent||''):'';
      // Kald poolish: samme steg skal nå si «modnes kaldt».
      S.poolishCold=true; mobGen();
      const steps2=[...document.querySelectorAll('#mob-plan-content .mob-step')];
      const poolishStep2=steps2.find(st=>/lag poolish/i.test((st.querySelector('.mob-stit')||{}).textContent||''));
      const wCold=poolishStep2?((poolishStep2.querySelector('.mob-swait')||{}).textContent||''):'';
      S.method=orig.method; S.poolishCold=orig.cold; S.poolishPauseH=orig.pause; S.poolishH=orig.ph;
      window._planChosen=true; mobGen();
      return {
        hadPoolishStep:!!poolishStep, hasPause,
        roomSaysRoom: wRoom.toLowerCase().includes('romtemperatur'),
        roomNotFridge: !wRoom.toLowerCase().includes('kjøleskap'),
        coldSaysCold: wCold.toLowerCase().includes('kaldt')
      };
    }""")
    ok80 = all(r80.get(k) for k in ['hadPoolishStep','hasPause','roomSaysRoom','roomNotFridge','coldSaysCold'])
    results.append(('poolish_ferment_wait_labelled_room_temp_not_fridge', ok80, r80))

    # v0.697 (Claude-oppskriftsgjennomgang): fire funn.
    # Funn 4: forme-steget og kald-heving-steget delte ordrett WHY.fk. Forme-steget
    #   har nå egen WHY.form (om runding/emner), ulik kald-hevingens WHY.fk.
    # Funn 2: poolish-gjæren trukket ned i den lange enden (15–16t); 14t uendret 1.0×.
    # Funn 1: TIP.intoFridge har fått råd om å øke gjæren ~25–30 % ved kaldt kjøleskap.
    # Temp: kjøleskapstemp harmonisert til 2–5°C i WHY.fk (var 2–8°C).
    r81 = page.evaluate("""() => {
      const orig={method:S.method,oven:S.oven,ph:S.poolishH,type:S.type,cold:S.poolishCold};
      window._planChosen=true; setLayout('mob');
      S.type='napoletana'; S.method='standard'; S.mode='start'; mobGen();
      const steps=window._steps||[];
      const form=steps.find(s=>/Form emner/i.test(s.title));
      const cold=steps.find(s=>/^Kjøleskapsheving$/i.test(s.title));
      const formWhy=form?form.why:''; const coldWhy=cold?cold.why:'';
      const whyDistinct = !!formWhy && !!coldWhy && formWhy!==coldWhy;
      const formAboutRounding = /rund/i.test(formWhy);
      // v0.699: fermenteringstemp strammet til den kaldeste sonen (2–4°C), der
      // deigen faktisk skal stå. Ikke 2–5/2–8 (for varmt) eller det tidligere 0–4.
      const fkTemp = WHY.fk.includes('2–4°C') && !WHY.fk.includes('2–5°C') && !WHY.fk.includes('2–8°C') && !WHY.fk.includes('0–4°C');
      // v0.698: den private +25–30 %-gjærregelen fjernet fra delt tips; termometer-
      // rådet beholdt; ingen usammenhengende «kaldere enn det»-logikk. v0.699:
      // plasseringsråd (kaldeste sone / unngå døra) bygget inn.
      const fridgeTip = /termometer/.test(TIP.intoFridge)
        && !/25–30/.test(TIP.intoFridge) && !/øk gjæren/i.test(TIP.intoFridge)
        && !/kaldere enn det/i.test(TIP.intoFridge)
        && /grønnsakskuff/i.test(TIP.intoFridge) && /(døra|kjøleskapsdør)/i.test(TIP.intoFridge);
      S.method='poolish'; S.poolishCold=false;
      S.poolishH=14; const m14=prefermentYeastMult();
      S.poolishH=15; const m15=prefermentYeastMult();
      S.poolishH=16; const m16=prefermentYeastMult();
      S.method=orig.method;S.oven=orig.oven;S.poolishH=orig.ph;S.type=orig.type;S.poolishCold=orig.cold; mobGen();
      return { whyDistinct, formAboutRounding, fkTemp, fridgeTip, m14, m15, m16 };
    }""")
    ok81 = (
      r81['whyDistinct'] and r81['formAboutRounding'] and r81['fkTemp'] and r81['fridgeTip'] and
      r81['m14'] == 1.0 and r81['m15'] < r81['m14'] and r81['m16'] < 0.85
    )
    results.append(('recipe_review_fixes_form_why_yeast_curve_temp_tip', ok81, r81))

    # Funn 3: bake-steget viste «45 min» pizzastein-forvarming også for PIZZAOVN, der
    # dekket er varmt på ~15–20 min. Nå ovnstype-bevisst: pizzaovn nevner ~15–20 min
    # og ikke «45 min»; vanlig ovn beholder «45 min» (som er riktig der).
    r82 = page.evaluate("""() => {
      const orig={oven:S.oven,method:S.method,type:S.type};
      window._planChosen=true; setLayout('mob');
      S.type='napoletana'; S.method='standard';
      S.oven='pizza'; mobGen();
      let steps=window._steps||[];
      let bake=steps.find(s=>/Strekk og stek/i.test(s.title));
      const pizzaText=bake?((bake.tip||'')+' '+((bake.substeps||[]).join(' '))):'';
      S.oven='vanlig'; mobGen();
      steps=window._steps||[];
      bake=steps.find(s=>/Strekk og stek/i.test(s.title));
      const regText=bake?((bake.tip||'')+' '+((bake.substeps||[]).join(' '))):'';
      S.oven=orig.oven;S.method=orig.method;S.type=orig.type; mobGen();
      return {
        pizzaNo45: !/45\\s*min/.test(pizzaText),
        pizzaMentionsFastPreheat: /15–20/.test(pizzaText),
        regHas45: /45\\s*min/.test(regText)
      };
    }""")
    ok82 = all(r82.get(k) for k in ['pizzaNo45','pizzaMentionsFastPreheat','regHas45'])
    results.append(('bake_preheat_tip_oven_aware_pizza_vs_regular', ok82, r82))

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
        # locale="nb-NO": den frosne baseline er norsk output, så testmiljøet må
        # være en norsk nettleser. Uten dette ville den nye språk-deteksjonen
        # (v6.26) gjette engelsk i headless Chromium (en-US) og velte baselinen.
        context = browser.new_context(viewport={"width": 390, "height": 844}, timezone_id="Europe/Oslo", locale="nb-NO")
        page = context.new_page()
        page.add_init_script("localStorage.setItem('pizzaUser', JSON.stringify({id:'test',name:'Test'}));")
        # v5.88: fanger opp JS-feil som oppstår ved selve sideinnlastingen — se
        # begrunnelse ved page_loads_without_script_errors nedenfor.
        load_errors = []
        page.on("pageerror", lambda exc: load_errors.append(str(exc)))
        page.on("console", lambda msg: load_errors.append(f"[console.{msg.type}] {msg.text}") if msg.type == "error" and "404" not in msg.text and "Failed to load resource" not in msg.text else None)
        page.goto(f"http://localhost:{port}/{os.path.basename(index_path)}")
        page.wait_for_timeout(1200)
        page.evaluate("document.getElementById('guide-modal') && (document.getElementById('guide-modal').style.display='none')")
        # v0.655: atferds- og render-testene representerer en bruker som HAR gjort
        # et valg (plan er generert). Uten et valg viser Tidsplan nå et tomt guide-
        # state i stedet for en default-plan. Det tomme staten testes eksplisitt i
        # r46 (som selv veksler flagget), så her setter vi «valgt» globalt.
        page.evaluate("window._planChosen=true")

        # v5.88: REELL BUG — en unterminert JS-streng i changelog.js (manglet
        # avsluttende ') brakk parsingen av HELE filen. Siden changelog.js
        # lastes som egen <script src> (v5.61), feilet bare referanser til
        # CHANGELOG — men det inkluderer versjonsvisningen, som skjer tidlig
        # i syncMobControls() og dermed stanset resten av den funksjonen.
        # Resultatet: en app som så nesten blank ut ("kun tittel"), mens alle
        # ANDRE tester fortsatt gikk gjennom — fordi page.evaluate() kaller
        # funksjoner direkte og de fleste ikke rører CHANGELOG i det hele
        # tatt. Denne sjekken laster siden ekte, slik en bruker ville gjort,
        # og krever null JS-feil pluss et faktisk synlig versjonsnummer.
        version_text = page.evaluate("document.getElementById('mob-name-version')?.textContent || ''")
        ok0 = (len(load_errors) == 0) and bool(version_text.strip())
        results0 = [('page_loads_without_script_errors', ok0, {'load_errors': load_errors, 'version_text': version_text})]
        print("Sideinnlasting:")
        for name, ok, detail in results0:
            if ok:
                print(f"✅ {name}: OK")
            else:
                failures.append((name, [("detail", "OK", detail)]))
                print(f"❌ {name}: FEILET — {detail}")
        print()

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
    total = len(results0) + len(SCENARIOS) + len(behavioral) + len(render_tests)
    if failures:
        print(f"{len(failures)} av {total} tester feilet.")
        sys.exit(1)
    else:
        print(f"Alle {total} tester OK.")
        sys.exit(0)

if __name__ == "__main__":
    main()
