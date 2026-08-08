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
import sys, os, re, json, subprocess, time, http.server, threading, socketserver
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
    # v0.739: testen krevde tidligere nøyaktig 5 steg. Det gjorde den til en
    # skjult stegteller — den røk da Kveldsdeig med rette fikk forvarmingssteget
    # sitt. Poenget er DEKNINGEN: hvert steg, uansett hvor mange de er, har
    # understeg, og når de åpnes erstatter de stegteksten. Antallet er frosset i
    # `kveld`-baselinen, som er stedet det hører hjemme.
    ok27 = (
      r27['n'] >= 5 and r27['descsBefore'] == r27['n'] and r27['substepLists'] == r27['n'] and
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

    # v0.710: «Finn oppskriften» lyser opp (--forno-border → --forno-accent) så snart
    # ETT av feltene (tid ELLER dato) er endret — ikke begge. Tid-feltet har et lite
    # «start her»-glød til du har rørt noe. ✓-haka (is-done / .beta-done) er fjernet.
    r43 = page.evaluate("""() => {
      const tf=document.getElementById('mob-beta-et-field'), df=document.getElementById('mob-beta-ed-field'), btn=document.getElementById('mob-beta-search-btn');
      if(!tf||!df||!btn) return {missing:true};
      const st=()=>({tA:tf.classList.contains('is-active'), dA:df.classList.contains('is-active'),
                     anyDone: tf.classList.contains('is-done')||df.classList.contains('is-done'),
                     bg:btn.style.background});
      window._betaTouched={time:false,date:false}; betaUpdateGuide(); const s0=st();
      window._betaTouched={time:false,date:true}; betaUpdateGuide(); const sDate=st(); // KUN dato endret
      window._betaTouched={time:true,date:false}; betaUpdateGuide(); const sTime=st(); // KUN tid endret
      const noCheckmarkEls = !document.querySelector('.beta-done');
      window._betaTouched={time:false,date:false}; betaUpdateGuide();
      return {s0,sDate,sTime,noCheckmarkEls};
    }""")
    ok43 = (
      not r43.get('missing') and
      r43['s0']['tA'] is True and 'border' in r43['s0']['bg'] and r43['s0']['anyDone'] is False and
      'accent' in r43['sDate']['bg'] and r43['sDate']['anyDone'] is False and   # kun dato → oransje
      'accent' in r43['sTime']['bg'] and r43['sTime']['anyDone'] is False and   # kun tid → oransje
      r43['noCheckmarkEls'] is True                                             # ✓-haka borte
    )
    results.append(('smartplan_find_button_lights_when_either_field_changed_no_checkmark', ok43, r43))

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

    # v0.711 (oppskriftsgjennomgang): steg 2 (standard/Ankarsrum) motsa seg selv om
    # salt-tidspunktet — desc «elt i 3 min. Tilsett deretter salt» og substeps «2–3 min»,
    # men «Hvorfor» (whySg) sa «etter ca. 5 min elting». Harmonisert til ~3 min: nå
    # samsvarer desc og why, og why nevner ikke lenger 5 min.
    r83b = page.evaluate("""() => {
      const orig={method:S.method,km:S.kjokkenmaskin,type:S.type,cold:S.cold};
      window._planChosen=true; setLayout('mob');
      S.type='napoletana'; S.method='standard'; S.kjokkenmaskin='ankarsrum'; S.mode='start'; S.cold=24; mobGen();
      const s=(window._steps||[]).find(x=>/Tilsett gjær og salt/i.test(x.title));
      const desc=s?s.desc:''; const why=s?s.why:'';
      S.method=orig.method;S.kjokkenmaskin=orig.km;S.type=orig.type;S.cold=orig.cold; mobGen();
      return {
        hadStep:!!s,
        descSalt3:/elt i 3 min\\. Tilsett deretter/.test(desc),
        whySalt3:/etter ca\\. 3 min elting/.test(why),
        whyNot5:!/5 min elting/.test(why)
      };
    }""")
    ok83b = all(r83b.get(k) for k in ['hadStep','descSalt3','whySalt3','whyNot5'])
    results.append(('standard_mix_step_salt_timing_consistent_desc_and_why', ok83b, r83b))

    # v0.712 (F16): temperer-stegets tips (TIP.benchTemper) sa «gi dem mer tid før du
    # former» / «form og stek» — men emnene formes FØR kjøleskapet; etter temperering
    # strekker/åpner du bare og steker. Byttet til strekke-språk. Deles av standard-
    # halens «Ta ut av kjøleskap» og Kveldsdeigs «Ta ut og temperer».
    r83c = page.evaluate("""() => {
      const orig={method:S.method,type:S.type,cold:S.cold,kh:S.kveldH};
      window._planChosen=true; setLayout('mob');
      S.type='napoletana'; S.method='standard'; S.mode='start'; S.cold=24; mobGen();
      const std=(window._steps||[]).find(x=>/Ta ut av kjøleskap/i.test(x.title));
      S.method='kveld'; S.kveldH=10; mobGen();
      const kv=(window._steps||[]).find(x=>/Ta ut og temperer/i.test(x.title));
      S.method=orig.method;S.type=orig.type;S.cold=orig.cold;S.kveldH=orig.kh; mobGen();
      const good=t=>!!t && /strekker og steker/.test(t) && /strekk og stek/.test(t) && !/før du former/.test(t) && !/form og stek/.test(t);
      return { hadStd:!!std, hadKv:!!kv, stdOk:good(std&&std.tip), kvOk:good(kv&&kv.tip) };
    }""")
    ok83c = all(r83c.get(k) for k in ['hadStd','hadKv','stdOk','kvOk'])
    results.append(('temper_tip_uses_stretch_not_form_after_chilling', ok83c, r83c))

    # v0.700 (oppskriftsgjennomgang): poolish-blandesteget er satt av 20 min, men
    # teksten sier «Elt totalt 10–12 min» — planens «20 min» og eltetiden kunne
    # virke motstridende. La til presisering (mixWorkNote) om at 20 min er samlet
    # arbeidstid, uten å fjerne den faktiske eltetiden.
    r83 = page.evaluate("""() => {
      const orig={method:S.method,km:S.kjokkenmaskin,type:S.type};
      window._planChosen=true; setLayout('mob');
      S.type='napoletana'; S.method='poolish'; S.kjokkenmaskin='ankarsrum'; S.mode='start'; mobGen();
      const s=(window._steps||[]).find(x=>/bland ferdig deig/i.test(x.title));
      const desc=s?s.desc:'';
      const kneadTime=/Elt totalt 10–12 min/.test(desc);
      const workNote=/samlet arbeidstid/.test(desc) && /Selve eltingen/.test(desc);
      S.method=orig.method;S.kjokkenmaskin=orig.km;S.type=orig.type; mobGen();
      return { hadStep:!!s, kneadTime, workNote };
    }""")
    ok83 = all(r83.get(k) for k in ['hadStep','kneadTime','workNote'])
    results.append(('poolish_mix_step_clarifies_work_time_vs_knead_time', ok83, r83))

    # v0.701: kjøleskapspause-steget sa både «tåler noen timer kaldt» OG «maks 18
    # timer» — selvmotsigende, siden 18 timer ikke er «noen timer». Teksten er nå
    # konsistent: kulda pauser gjæringen, poolishen holder seg en god stund (maks 18t).
    r84 = page.evaluate("""() => {
      const orig={method:S.method,pause:S.poolishPauseH,ph:S.poolishH,type:S.type};
      window._planChosen=true; setLayout('mob');
      S.type='napoletana'; S.method='poolish'; S.poolishCold=false; S.poolishPauseH=6; S.poolishH=14; S.mode='start'; mobGen();
      const s=(window._steps||[]).find(x=>/kjøleskapspause/i.test(x.title));
      const why=s?s.why:'';
      S.method=orig.method;S.poolishPauseH=orig.pause;S.poolishH=orig.ph;S.type=orig.type; mobGen();
      return { hadPause:!!s, mentions18:/18 timer/.test(why), noFewHours:!/noen timer kaldt/.test(why) };
    }""")
    ok84 = all(r84.get(k) for k in ['hadPause','mentions18','noFewHours'])
    results.append(('poolish_cold_pause_why_internally_consistent', ok84, r84))

    # v0.702: kjøleskapspausen er passiv (deigen venter), men STARTEN krever at du er
    # hjemme og setter bollen i kjøleskapet. Den er nå merket needsPresence, så den
    # (1) teller i Smart-planens ledig-tid-scoring, (2) får ⚠-flagg / full advarsel
    # som et aktivt steg, og (3) får den eksisterende «fortsett likevel»-ignorer­knappen.
    # Vanlige passive steg (gjæring, kjøleskapsheving) telles fortsatt IKKE.
    r85 = page.evaluate("""() => {
      const savedSched=window._pizzatidSchedule, savedSteps=window._steps;
      const savedS={method:S.method,type:S.type,ph:S.poolishH,mode:S.mode,pause:S.poolishPauseH};
      window._pizzatidSchedule=defaultPizzatidSchedule(); // hverdag ledig 16–23:30 + 06:30–08
      const friBusy=new Date(2026,7,7,10,40,0); // fredag 7. aug 2026, 10:40 = opptatt-vindu
      const pause={at:friBusy,passive:true,needsPresence:true,title:'🧊 Kjøleskapspause'};
      const plain={at:friBusy,passive:true,title:'Poolish gjærer'};
      // 1) Smart-plan-scoring teller pausen, men ikke et vanlig passivt steg
      const scorePause=scorePizzatidWindows([pause]);
      const scorePlain=scorePizzatidWindows([plain]);
      // 2) konflikt-oppdaging (flagg/advarsel) finner pausen som «busy», ikke plain
      const fc=firstStepConflict([pause]); const fcPlain=firstStepConflict([plain]);
      // 3) full advarsel for pausen har ignorer-knappen (acceptStepConflict)
      S.method='poolish'; S.type='napoletana'; S.poolishH=14; S.mode='start'; S.poolishPauseH=0;
      window._steps=[pause];
      let warn=''; try{ warn=activeStepTimeWarningHTML(); }catch(e){ warn='ERR:'+e; }
      window._steps=savedSteps; window._pizzatidSchedule=savedSched;
      S.method=savedS.method;S.type=savedS.type;S.poolishH=savedS.ph;S.mode=savedS.mode;S.poolishPauseH=savedS.pause;
      return {
        scorePause, scorePlain,
        fcBusy: !!(fc && fc.win && fc.win.id==='busy'),
        fcPlainNull: fcPlain===null,
        warnHasIgnore: /acceptStepConflict/.test(warn) && /Kj\\u00f8leskapspause/.test(warn)
      };
    }""")
    ok85 = (
      r85['scorePause']==1 and r85['scorePlain']==0 and
      r85['fcBusy'] and r85['fcPlainNull'] and r85['warnHasIgnore']
    )
    results.append(('cold_pause_start_counts_as_presence_needed_with_ignore', ok85, r85))

    # v0.703: konflikt-flagget i Tidsplanen har nå en inline «Ignorer»-knapp, så den
    # virker uansett om du kom via Smart-plan (som lander på Tidsplan, ikke Sjekk).
    # Samme _acceptedConflicts-nøkkel som Sjekk-panelets «fortsett likevel» → delt
    # tilstand. Å ignorere skjuler nettopp det stegets flagg (men ikke senere steg).
    r86 = page.evaluate("""() => {
      const savedSched=window._pizzatidSchedule, savedChosen=window._planChosen;
      const savedS={method:S.method,type:S.type,ph:S.poolishH,mode:S.mode,pause:S.poolishPauseH,cold:S.poolishCold};
      _acceptedConflicts.clear();
      window._pizzatidSchedule={mon:[],tue:[],wed:[],thu:[],fri:[],sat:[],sun:[]}; // ingen ledig tid → aktive steg blir «busy»
      window._planChosen=true; setLayout('mob');
      S.type='napoletana'; S.method='poolish'; S.poolishCold=false; S.poolishPauseH=6; S.poolishH=14; S.mode='start';
      mobShowTab('plan'); mobGen();
      const plan=()=>document.getElementById('mob-plan-content');
      const before=plan().innerHTML;
      const m=before.match(/acceptStepConflict\\('([^']+)'\\)/);
      const key=m?m[1]:null;
      const hasIgnoreBtn=/>Ignorer<\\/button>/.test(before) && /acceptStepConflict\\(/.test(before);
      if(key) acceptStepConflict(key); // acceptStepConflict re-tegner selv
      const after=plan().innerHTML;
      const thatFlagGone = key ? !after.includes("acceptStepConflict('"+key+"')") : false;
      _acceptedConflicts.clear(); window._pizzatidSchedule=savedSched; window._planChosen=savedChosen;
      S.method=savedS.method;S.type=savedS.type;S.poolishH=savedS.ph;S.mode=savedS.mode;S.poolishPauseH=savedS.pause;S.poolishCold=savedS.cold;
      mobGen();
      return { hasIgnoreBtn, keyFound:!!key, thatFlagGone };
    }""")
    ok86 = all(r86.get(k) for k in ['hasIgnoreBtn','keyFound','thatFlagGone'])
    results.append(('plan_conflict_flag_has_inline_ignore_button', ok86, r86))

    # v0.704: «Kopier oppskrift»-prompten ber nå også om interne inkonsistenser
    # (tekst/tall som motsier hverandre), med et anker-vern: vurder mot det som
    # faktisk står, ikke mot bransjenormer. (Fanger opp klassen av feil de siste
    # gjennomgangene faktisk fant, og demper støyen fra ekstern-norm-pirk.)
    r87 = page.evaluate("""() => {
      const savedS={method:S.method,type:S.type,mode:S.mode};
      window._planChosen=true; setLayout('mob');
      S.type='napoletana'; S.method='poolish'; S.mode='start'; mobShowTab('plan'); mobGen();
      let captured='', orig=null;
      try{
        if(!navigator.clipboard){ Object.defineProperty(navigator,'clipboard',{value:{},configurable:true}); }
        orig=navigator.clipboard.writeText;
        navigator.clipboard.writeText=(t)=>{ captured=t; return Promise.resolve(); };
      }catch(e){}
      try{ copyP(window._steps||[]); }catch(e){ captured='ERR:'+e; }
      try{ if(orig) navigator.clipboard.writeText=orig; }catch(e){}
      S.method=savedS.method;S.type=savedS.type;S.mode=savedS.mode; mobGen();
      return {
        // v0.749: ordlyden ble delt i to deler («interne motsigelser», «ikke mot
        // bransjenormer eller antatt praksis»). Kravet er det samme, så mønstrene
        // godtar begge formuleringene — det er intensjonen som er festet her.
        hasInconsistency: /interne (motsigelser|inkonsistenser)/.test(captured),
        hasAnchorGuard: /ikke mot (generelle )?bransjenormer/.test(captured),
        stillHasInputs: /Hydrering/.test(captured) && /INGREDIENSER/.test(captured)
      };
    }""")
    ok87 = all(r87.get(k) for k in ['hasInconsistency','hasAnchorGuard','stillHasInputs'])
    results.append(('copy_prompt_asks_for_internal_inconsistencies_with_anchor_guard', ok87, r87))

    # v0.705: Smart-plan-resultatet er en sammenligningstabell (vinner + inntil 2
    # alternativer). Hver konflikt viser HVA/NÅR/HVOR MYE arbeid: vinneren «✓ alt
    # passer», alternativene sitt ene konfliktsteg («Ta ut av kjøleskap») med grønt
    # «raskt gjort»-merke (dur 0 = kjapt, kan gjøres hjemmefra). Alt-rader er
    # tappbare (applyBetaResult). conflictIsQuick: dur 0/passiv = kjapt, dur>1 = aktivt.
    r88 = page.evaluate("""() => {
      const savedSched=window._pizzatidSchedule;
      const savedS={type:S.type,mel:S.mel,hydro:S.hydro,temp:S.temp,gjaer:S.gjaer,km:S.kjokkenmaskin,oven:S.oven};
      window._pizzatidSchedule=defaultPizzatidSchedule();
      S.type='napoletana'; S.mel=500; S.hydro=65; S.temp=22; S.gjaer='torr'; S.kjokkenmaskin='ankarsrum'; S.oven='pizza';
      let a=new Date(2027,7,1,18,0); while(a.getDay()!==5) a.setDate(a.getDate()+1); // fredag 18:00 langt frem → alt feasible
      const d=document.createElement('div'); d.id='__t88'; document.body.appendChild(d);
      let err='';
      try{ renderResultBlock('__t88','fre 18:00', a.toISOString()); }catch(e){ err=''+e; }
      const h=d.innerHTML; d.remove();
      const qkTouch=conflictIsQuick({dur:0}), qkActive=conflictIsQuick({dur:20}), qkPassive=conflictIsQuick({passive:true,dur:360});
      window._pizzatidSchedule=savedSched;
      S.type=savedS.type;S.mel=savedS.mel;S.hydro=savedS.hydro;S.temp=savedS.temp;S.gjaer=savedS.gjaer;S.kjokkenmaskin=savedS.km;S.oven=savedS.oven;
      // v0.707 (skisse 3): hvert valg er et .beta-card med egen «Bruk denne»-knapp
      // (indeks 0/1/2), og konflikten står i en «når»-linje der tidspunktet er stort
      // (.beta-when-big). Isoler første alternativ-kort og sjekk rekkefølge innen det:
      // metode (beta-m) → tid (beta-when-big) → knapp (beta-use).
      const parts=h.split('class=\"beta-card');
      const altCard=parts[2]||''; // parts[1]=vinner, parts[2]=første alternativ
      const orderInCard = altCard.indexOf('beta-m')>=0
        && altCard.indexOf('beta-when-big')>altCard.indexOf('beta-m')
        && altCard.indexOf('beta-use')>altCard.indexOf('beta-when-big');
      const useIdx=[...h.matchAll(/class=\"beta-use[^\"]*\"[^>]*onclick=\"applyBetaResult\\(\\d+,(\\d+)\\)/g)].map(m=>m[1]);
      return {
        noErr: err==='',
        threeCards:(h.match(/class=\"beta-card/g)||[]).length===3,
        perCardUseButtons: useIdx.join(',')==='0,1,2',        // egen «Bruk denne» på hvert valg
        bigTimeProminent:/beta-when-big/.test(h),             // tidspunktet stort/fremhevet
        confUnderMethod: orderInCard,                          // tid under metoden, ikke ved siden av
        altBtnOutline:/beta-use beta-sec/.test(h),            // alternativer = omriss-knapp
        // v0.708: konflikten er MERKET som konflikt (ikke noe å gjette), og «mer smak»
        // ligger på egen linje så gjæringstallet ikke flyter ut ved siden av et langt navn.
        conflictLabelled:/beta-conf-lbl/.test(h) && /(Utenfor ledig tid|Midt på natten)/.test(h),
        flavOnOwnLine:/class=\"beta-sub\">(mer smak|kortere)/.test(h),
        hrsHasNoFlav: !/beta-hrs\">[^<]*(mer smak|kortere)/.test(h),
        winnerFits:/beta-eff fits/.test(h),
        altQuickPill:/beta-eff quick/.test(h),
        altShowsStep:/Ta ut av kj/.test(h),
        noOldBottomBtn: !/Mel som passer[\\s\\S]*applyBetaResult/.test(h),
        quickForDur0:qkTouch===true, activeForDur20:qkActive===false, quickForPassive:qkPassive===true
      };
    }""")
    ok88 = all(r88.get(k) for k in ['noErr','threeCards','perCardUseButtons','bigTimeProminent','confUnderMethod','altBtnOutline','conflictLabelled','flavOnOwnLine','hrsHasNoFlav','winnerFits','altQuickPill','altShowsStep','noOldBottomBtn','quickForDur0','activeForDur20','quickForPassive'])
    results.append(('smartplan_result_comparison_table_shows_conflict_effort', ok88, r88))

    # v0.713: Mania-poolish har sin egen komplette oppskrift (maniaRecipe: 64%
    # hydrering, 3% salt, 0,85g gjær). «Kopier oppskrift» brukte tidligere R()
    # (65%/14g/1,13g) for ingredienslista og overskriften, mens selve Tidsplan-
    # stegene brukte maniaRecipe — så tallene spriket (vann 320 vs 325, salt 15 vs
    # 14, gjær 0,85 vs 1,13). Nå leser copyP maniaRecipe for Mania, så kopi = steg.
    # Samtidig: de to nedkjølingsstegene («Poolish kjøles ned» + «Nedkjøling») var
    # et duplikat på samme tidspunkt med motstridende minstetid (1t vs 2t) — nå ett
    # steg. Og steg 5 sa «resten av vannet» om to ulike mengder — nå entydig.
    r89 = page.evaluate("""() => {
      const savedS={method:S.method,type:S.type,mode:S.mode,mel:S.mel,hydro:S.hydro,gjaer:S.gjaer};
      window._planChosen=true; setLayout('mob');
      S.type='napoletana'; S.method='mania'; S.mode='start'; S.mel=500; S.hydro=65; S.gjaer='torr';
      mobShowTab('plan'); mobGen();
      const rm=maniaRecipe();
      const totWater=rm.poolishVann+rm.vann1+rm.vann2; // 320
      let captured='', orig=null;
      try{
        if(!navigator.clipboard){ Object.defineProperty(navigator,'clipboard',{value:{},configurable:true}); }
        orig=navigator.clipboard.writeText;
        navigator.clipboard.writeText=(t)=>{ captured=t; return Promise.resolve(); };
      }catch(e){}
      try{ copyP(window._steps||[]); }catch(e){ captured='ERR:'+e; }
      try{ if(orig) navigator.clipboard.writeText=orig; }catch(e){}
      const steps=window._steps||[];
      const titles=steps.map(s=>s.title);
      const mix=steps.find(s=>s.title==='Bland hoveddeig');
      const mixDesc=mix?mix.desc:'';
      S.method=savedS.method;S.type=savedS.type;S.mode=savedS.mode;S.mel=savedS.mel;S.hydro=savedS.hydro;S.gjaer=savedS.gjaer; mobGen();
      return {
        // ingredienslista = maniaRecipe, ikke R()
        waterMatches: captured.includes('Vann: '+totWater+'g') && totWater===320 && !captured.includes('Vann: 325g'),
        saltMatches: captured.includes('Salt: '+rm.salt+'g') && rm.salt===15 && !captured.includes('Salt: 14g'),
        yeastMatches: captured.includes('Gjær: '+rm.totalYd+'g tørrgjær') && rm.totalYd===0.85 && !captured.includes('1.13g'),
        hydroMatches: captured.includes('Hydrering: 64%') && !captured.includes('Hydrering: 65%'),
        // duplikatsteget slått sammen: «Poolish kjøles ned» finnes, «Nedkjøling» borte
        chillMerged: titles.includes('Poolish kjøles ned') && !titles.includes('Nedkjøling'),
        // steg 5 sier ikke «resten av vannet» to ganger
        waterWordingClear: (mixDesc.match(/resten av vannet/g)||[]).length===0,
        noErr: !captured.startsWith('ERR:')
      };
    }""")
    ok89 = all(r89.get(k) for k in ['waterMatches','saltMatches','yeastMatches','hydroMatches','chillMerged','waterWordingClear','noErr'])
    results.append(('mania_copy_recipe_matches_maniarecipe_and_no_duplicate_chill_step', ok89, r89))

    # v0.714 (F20): generiske invariant-tester — egenskaper som skal holde for ALLE
    # metoder × moduser, ikke frosne enkelttall. (a) Fremover fra et anker og
    # baklengs fra samme steketid skal gi en IDENTISK plan (tailSteps-garantien,
    # men håndhevet for hver metode — baklengs-grenene er håndskrevne speil av
    # fremover-grenene og kan drifte). (b) Tidslinjen er monotont ikke-synkende
    # med ikke-negative varigheter. En ny metode som legges til i stepsForAnchor
    # blir automatisk dekket ved å legge én linje i case-lista her.
    r90 = page.evaluate("""() => {
      const saved={method:S.method,type:S.type,mode:S.mode,pP:S.poolishPauseH,pC:S.poolishCold,
                   pH:S.poolishH,bH:S.bigaH,hH:S.hurtigH,kH:S.kveldH,cold:S.cold,mel:S.mel};
      const cases=[
        ['standard',        {type:'napoletana'}],
        ['poolish',         {type:'napoletana', poolishPauseH:0, poolishCold:false}],
        ['poolish_pause6',  {method:'poolish', type:'napoletana', poolishPauseH:6, poolishCold:false}],
        ['poolish_kald',    {method:'poolish', type:'napoletana', poolishPauseH:0, poolishCold:true, poolishH:24}],
        ['biga',            {type:'napoletana'}],
        ['mania',           {type:'napoletana'}],
        ['hurtig',          {type:'napoletana'}],
        ['kveld',           {type:'napoletana'}],
        ['ingenelting',     {method:'standard', type:'ingenelting'}]
      ];
      const out={};
      for(const [name,cfg] of cases){
        S.method=cfg.method||name; S.type=cfg.type;
        if('poolishPauseH' in cfg) S.poolishPauseH=cfg.poolishPauseH;
        if('poolishCold' in cfg) S.poolishCold=cfg.poolishCold;
        if('poolishH' in cfg) S.poolishH=cfg.poolishH;
        S.mode='start';
        const anchor=new Date(2027,2,3,10,0);
        let fwd,bwd,err='';
        try{
          fwd=stepsForAnchor(anchor);
          S.mode='end';
          bwd=stepsForAnchor(new Date(fwd[fwd.length-1].at.getTime()));
        }catch(e){ err=''+e; }
        if(err||!fwd||!bwd){ out[name]={err:err||'no steps'}; continue; }
        const sameLen=fwd.length===bwd.length;
        let sameTimes=sameLen, sameTitles=sameLen;
        for(let i=0;i<Math.min(fwd.length,bwd.length);i++){
          if(fwd[i].at.getTime()!==bwd[i].at.getTime()) sameTimes=false;
          if(fwd[i].title!==bwd[i].title) sameTitles=false;
        }
        let monotonic=true, nonNegDur=true;
        for(let i=0;i<fwd.length;i++){
          if(i>0 && fwd[i].at.getTime()<fwd[i-1].at.getTime()) monotonic=false;
          if((fwd[i].dur||0)<0) nonNegDur=false;
        }
        out[name]={ok:sameLen&&sameTimes&&sameTitles&&monotonic&&nonNegDur,
                   sameLen,sameTimes,sameTitles,monotonic,nonNegDur,n:fwd.length};
      }
      S.method=saved.method;S.type=saved.type;S.mode=saved.mode;S.poolishPauseH=saved.pP;
      S.poolishCold=saved.pC;S.poolishH=saved.pH;S.bigaH=saved.bH;S.hurtigH=saved.hH;
      S.kveldH=saved.kH;S.cold=saved.cold;S.mel=saved.mel;
      return out;
    }""")
    ok90 = all(isinstance(v, dict) and v.get('ok') for v in r90.values())
    results.append(('invariant_forward_equals_backward_and_monotonic_all_methods', ok90, r90))

    # v0.714 (F20): mania-oppskriftens avrundede deler skal summere til sin egen
    # fasit over hele melspennet — poolishVann+vann1+vann2 er tre separat
    # avrundede ledd (0,5 + 0,09957 + 0,04069 = 64,03% av melet); avvik fra
    # målhydreringen skal aldri overstige avrundingsstøyen (±2g). Salt er 3,0%.
    r91 = page.evaluate("""() => {
      const savedMel=S.mel;
      let worst=0, worstMel=null, saltOk=true;
      for(let mel=200; mel<=1000; mel+=25){
        S.mel=mel;
        const rm=maniaRecipe();
        const w=rm.poolishVann+rm.vann1+rm.vann2;
        const dev=Math.abs(w-mel*0.64026);
        if(dev>worst){worst=dev;worstMel=mel;}
        if(Math.abs(rm.salt-mel*0.03)>0.0500001) saltOk=false; // 1-desimal-avrunding gir maks 0,05 (+ float-epsilon)
      }
      S.mel=savedMel;
      return {worstDeviationG:Math.round(worst*100)/100, worstMel, withinTolerance:worst<=2, saltOk};
    }""")
    ok91 = r91.get('withinTolerance') and r91.get('saltOk')
    results.append(('invariant_mania_water_parts_sum_to_hydration_and_salt_3pct', ok91, r91))

    # v0.715 (F17): recipeFor() er nå den ENE ingredienskilden. Denne invarianten
    # sjekker for HVER metode at «Kopier oppskrift» viser nøyaktig recipeFor sine
    # tall (mel, vann, salt, gjær, hydrering). En ny metode dekkes automatisk ved
    # å legge den i lista. (Erstatter behovet for én test per sprik-feil — v0.713-
    # Mania-feilen og hurtig/kveld-gjærfeilen var begge av denne klassen.)
    r92 = page.evaluate("""() => {
      const saved={method:S.method,type:S.type,mode:S.mode,mel:S.mel,hydro:S.hydro,gjaer:S.gjaer};
      window._planChosen=true; setLayout('mob');
      S.type='napoletana'; S.mode='start'; S.mel=500; S.hydro=65; S.gjaer='torr';
      const methods=['standard','poolish','biga','mania','hurtig','kveld'];
      const out={};
      let orig=null;
      try{
        if(!navigator.clipboard){ Object.defineProperty(navigator,'clipboard',{value:{},configurable:true}); }
        orig=navigator.clipboard.writeText;
      }catch(e){}
      for(const m of methods){
        S.method=m; mobShowTab('plan'); mobGen();
        const rec=recipeFor();
        let captured='';
        try{ navigator.clipboard.writeText=(t)=>{captured=t;return Promise.resolve();}; }catch(e){}
        try{ copyP(window._steps||[]); }catch(e){ captured='ERR:'+e; }
        out[m]={
          flour: captured.includes('Mel: '+rec.flour+'g'),
          water: captured.includes('Vann: '+rec.water+'g'),
          salt: captured.includes('Salt: '+rec.salt+'g'),
          yeast: captured.includes('Gjær: '+rec.yDry+'g tørrgjær'),
          hydro: captured.includes('Hydrering: '+rec.hydro+'%')
        };
        out[m].ok = out[m].flour&&out[m].water&&out[m].salt&&out[m].yeast&&out[m].hydro;
      }
      try{ if(orig) navigator.clipboard.writeText=orig; }catch(e){}
      S.method=saved.method;S.type=saved.type;S.mode=saved.mode;S.mel=saved.mel;S.hydro=saved.hydro;S.gjaer=saved.gjaer;
      mobGen();
      return out;
    }""")
    ok92 = all(isinstance(v, dict) and v.get('ok') for v in r92.values())
    results.append(('invariant_copy_recipe_matches_recipefor_all_methods', ok92, r92))

    # v0.715 (F17): PC-oppskriftsfanen for Mania viste R()-tall (325g vann/14g
    # salt/1,13g gjær/65%) og en «Kjøleskapsheving: S.cold timer»-rad som ikke
    # gjelder Manias faste struktur. Nå leser gen() recipeFor(): 320/15/0,85/64%
    # og en fast-struktur-rad i stedet for S.cold.
    r93 = page.evaluate("""() => {
      const saved={method:S.method,type:S.type,mode:S.mode,mel:S.mel,hydro:S.hydro,gjaer:S.gjaer,cold:S.cold};
      S.type='napoletana'; S.method='mania'; S.mode='start'; S.mel=500; S.hydro=65; S.gjaer='torr'; S.cold=48;
      try{ setLayout('pc'); }catch(e){}
      const h=(document.getElementById('p-recipe')||{innerHTML:''}).innerHTML;
      const rec=recipeFor();
      const res={
        water: h.includes(rec.water+'g ('+rec.hydro+'%)') && !h.includes('325g'),
        salt: h.includes('>'+rec.salt+'g<'),
        yeast: h.includes(rec.yDry+'g tørrgjær') && !h.includes('1.13g'),
        noScoldRow: !h.includes(coldTimeLabel(48)),
        fixedColdRow: h.includes('10t udelt')
      };
      res.ok = res.water&&res.salt&&res.yeast&&res.noScoldRow&&res.fixedColdRow;
      S.method=saved.method;S.type=saved.type;S.mode=saved.mode;S.mel=saved.mel;S.hydro=saved.hydro;S.gjaer=saved.gjaer;S.cold=saved.cold;
      try{ setLayout('mob'); }catch(e){}
      mobGen();
      return res;
    }""")
    ok93 = r93.get('ok')
    results.append(('pc_recipe_tab_mania_uses_maniarecipe_not_r', ok93, r93))

    # v0.716 (F18): alle gjærkurvene samlet i CALIBRATION + én interpLin (tf og
    # coldMultForHours hadde egne kopier av samme løkke; tf rundet til 2 desimaler,
    # resten til 3 — dec-parameteren bevarer det). Fasiten under er håndregnet fra
    # kurvepunktene og fryser kalibreringskontrakten på punkter MELLOM ankrene
    # (der selve interpolasjonen jobber) + klemming i begge ender.
    r94 = page.evaluate("""() => {
      const saved={temp:S.temp,method:S.method,pC:S.poolishCold,pH:S.poolishH,bH:S.bigaH};
      const out={};
      const tfCase=(t,exp)=>{S.temp=t;return tf()===exp;};
      out.tf = tfCase(16,1.6)&&tfCase(19,1.45)&&tfCase(21,1.15)&&tfCase(23,0.9)&&tfCase(25,0.73)&&tfCase(27,0.57)&&tfCase(30,0.5); // 27°C: 0,575*100=57,4999… i float → 0,57 (verifisert identisk med gammel tf)
      out.cold = coldMultForHours(12)===1.5 && coldMultForHours(36)===1.275
              && coldMultForHours(60)===0.9 && coldMultForHours(100)===0.567
              && coldMultForHours(200)===0.38;
      S.method='poolish'; S.poolishCold=false; S.poolishH=13;
      out.poolishRoom = prefermentYeastMult()===1.1;
      S.poolishCold=true; S.poolishH=30;
      out.poolishCold = prefermentYeastMult()===0.75;
      S.method='biga'; S.bigaH=21;
      out.biga = prefermentYeastMult()===0.885;
      S.method='standard';
      out.neutral = prefermentYeastMult()===1.0;
      out.calibrationExists = typeof CALIBRATION==='object' && Array.isArray(CALIBRATION.tempFactor);
      S.temp=saved.temp;S.method=saved.method;S.poolishCold=saved.pC;S.poolishH=saved.pH;S.bigaH=saved.bH;
      out.ok = out.tf&&out.cold&&out.poolishRoom&&out.poolishCold&&out.biga&&out.neutral&&out.calibrationExists;
      return out;
    }""")
    ok94 = r94.get('ok')
    results.append(('calibration_curves_unified_interpolator_identical_values', ok94, r94))

    # v0.717 (F19): skygge-konstanten er død — totalFermentHours() for Mania leser
    # nå samme MANIA_T som stegbyggeren (var en frittstående håndsum «720/60 +
    # 120/60 + …» som måtte huskes oppdatert). Testen låser at (a) den faktiske
    # tidsplanens spenn (første→siste steg) er nøyaktig summen av MANIA_T-fasene,
    # og (b) gjæringstimene er samme sum minus delesteget — endres et fasetall
    # uten at begge følger med, feiler dette.
    r95 = page.evaluate("""() => {
      const saved={method:S.method,type:S.type,mode:S.mode};
      S.method='mania'; S.type='napoletana'; S.mode='start';
      const steps=stepsForAnchor(new Date(2027,2,3,10,0));
      const span=(steps[steps.length-1].at-steps[0].at)/60000;
      const T=MANIA_T;
      const TOTAL=T.POOLISH+T.CHILL+T.MIX+T.RISE1+T.ROOM1+T.COLDBULK+T.FINAL;
      const fermMin=Math.round(totalFermentHours()*60);
      S.method=saved.method;S.type=saved.type;S.mode=saved.mode;
      return { spanMatchesConstants: span===TOTAL,
               fermFromSameConstants: fermMin===TOTAL-T.DIVIDE,
               span, TOTAL, fermMin };
    }""")
    ok95 = r95.get('spanMatchesConstants') and r95.get('fermFromSameConstants')
    results.append(('mania_schedule_span_and_ferment_hours_from_same_constants', ok95, r95))

    # v0.718 (F21): METHODS-registeret — metodenavn (mN) og UI-flagg leses fra ett
    # sted; BETA_METHOD_DEFS og Deiger-filteret avledes. Testen vokter også fiksen
    # den avdekket: PC-sidens applyTypeUI manglet mania i kald-slider-lista, så PC
    # viste den justerbare kjøletid-slideren for en metode med fast struktur
    # (mobil skjulte den — PC/mobil-desync).
    r96 = page.evaluate("""() => {
      const saved={method:S.method,type:S.type,lang:window._lang};
      const out={};
      out.registry7 = typeof METHODS==='object' && Object.keys(METHODS).length===7;
      window._lang='no'; out.mnNo = mN('mania')==='Mania-poolish' && mN('standard')==='Langtidsdeig';
      window._lang='en'; out.mnEn = mN('mania')==='Mania poolish' && mN('kveld')==='Evening dough';
      window._lang=saved.lang;
      out.betaDerived = Array.isArray(BETA_METHOD_DEFS) && BETA_METHOD_DEFS.length===6
        && BETA_METHOD_DEFS.some(([v])=>v==='mania') && !BETA_METHOD_DEFS.some(([v])=>v==='ingenelting');
      // PC kald-slider: mania skal skjule den (fast struktur), standard vise den.
      S.type='napoletana';
      S.method='mania'; applyTypeUI();
      const cw=document.getElementById('cwrap');
      out.pcManiaHidden = !!cw && cw.style.display==='none';
      S.method='standard'; applyTypeUI();
      out.pcStandardShown = !!cw && cw.style.display==='block';
      // Mobil samme flagg:
      out.flagFn = methodShowsColdSlider('standard')===true && methodShowsColdSlider('mania')===false
        && methodShowsColdSlider('hurtig')===false && methodShowsColdSlider('kveld')===false
        && methodShowsColdSlider('poolish')===true && methodShowsColdSlider('biga')===true;
      S.method=saved.method; S.type=saved.type; applyTypeUI();
      out.ok = out.registry7&&out.mnNo&&out.mnEn&&out.betaDerived&&out.pcManiaHidden&&out.pcStandardShown&&out.flagFn;
      return out;
    }""")
    ok96 = r96.get('ok')
    results.append(('methods_registry_drives_names_flags_and_pc_cold_slider_fix', ok96, r96))

    # v0.719 (F22): beregningsmotoren bor i engine.js (lastes før hovedscriptet,
    # samme mønster som changelog.js/guide.js). Testen vokter at script-taggen
    # finnes og at kjernefunksjonene faktisk er definert og virker fra den delte
    # globale konteksten — resten av suiten beviser at oppførselen er uendret.
    r97 = page.evaluate("""() => {
      const tag=!!document.querySelector('script[src^="engine.js"]'); // ^= pga. ?v=-cache-buster (v0.723)
      const fns=['recipeFor','maniaRecipe','pc','interpLin','coldMultForHours','tf','rtM',
                 'mN','methodShowsColdSlider','totalFermentHours','fixedFermOverheadHours',
                 'currentYeastAmount','yLabelFor','flourForCount'];
      const missing=fns.filter(f=>typeof window[f]!=='function');
      // NB: const-ene er skript-skopede lexikalske bindinger — de ligger IKKE på
      // window, men deles på tvers av script-filer via det globale miljøet.
      const objs=[['CALIBRATION',typeof CALIBRATION],['METHODS',typeof METHODS],['MANIA_T',typeof MANIA_T]]
        .filter(([,t])=>t!=='object').map(([n])=>n);
      const callable=(()=>{try{const r=recipeFor();return typeof r.flour==='number'&&typeof r.yDry==='number';}catch(e){return false;}})();
      return {tag, missing, objs, callable, ok: tag&&missing.length===0&&objs.length===0&&callable};
    }""")
    ok97 = r97.get('ok')
    results.append(('engine_extracted_to_engine_js_and_functional', ok97, r97))

    # v0.720 (F14): benketida («Ta ut av kjøleskap» → stek) var hardkodet 240 min
    # uansett romtemperatur, mens steg-teksten selv sa at tiden avhenger av hvor
    # varmt rommet er. Nå skaleres den med tf() (22°C = 240 som før → baseline
    # urørt; 18°C = 384; 26°C = 156), bundet så kald tid aldri går under 60 min.
    # Steketid/middag flyttes ikke; kald tid + benketid + 15 min forming = S.cold.
    # Poolish-forspillet (brukervalgt timetall) skal IKKE temp-skaleres.
    r98 = page.evaluate("""() => {
      const saved={method:S.method,type:S.type,mode:S.mode,temp:S.temp,cold:S.cold,pP:S.poolishPauseH,pC:S.poolishCold,pH:S.poolishH};
      S.method='standard'; S.type='napoletana'; S.mode='end'; S.cold=48;
      const anchor=new Date(2027,2,10,18,0);
      const probe=()=>{
        const st=stepsForAnchor(anchor);
        const taUt=st.find(s=>s.title==='Ta ut av kjøleskap');
        const kold=st.find(s=>s.title==='Kjøleskapsheving');
        const bake=st[st.length-1];
        return {temper:(bake.at-taUt.at)/60000, cold:kold.dur, bakeMs:bake.at.getTime()};
      };
      S.temp=18; const p18=probe();
      S.temp=22; const p22=probe();
      S.temp=26; const p26=probe();
      S.method='poolish'; S.mode='start'; S.poolishPauseH=0; S.poolishCold=false;
      const gapAt=t=>{S.temp=t; const st=stepsForAnchor(anchor); return (st[1].at-st[0].at)/60000;};
      const g18=gapAt(18), g26=gapAt(26), pH=S.poolishH;
      S.method='standard'; S.mode='start'; S.temp=18; S.cold=6;
      const koldB=stepsForAnchor(anchor).find(s=>s.title==='Kjøleskapsheving');
      const boundedCold=koldB.dur>=60;
      S.method=saved.method;S.type=saved.type;S.mode=saved.mode;S.temp=saved.temp;S.cold=saved.cold;
      S.poolishPauseH=saved.pP;S.poolishCold=saved.pC;S.poolishH=saved.pH;
      return {
        t18:p18.temper, t22:p22.temper, t26:p26.temper,
        scales: p18.temper===384 && p22.temper===240 && p26.temper===156,
        sums: [p18,p22,p26].every(p=>p.temper+p.cold+15===48*60),
        dinnerFixed: p18.bakeMs===p22.bakeMs && p22.bakeMs===p26.bakeMs,
        poolishUntouched: g18===g26 && g18===pH*60,
        boundedCold
      };
    }""")
    ok98 = all(r98.get(k) for k in ['scales','sums','dinnerFixed','poolishUntouched','boundedCold'])
    results.append(('bench_temper_scales_with_room_temp_dinner_fixed', ok98, r98))

    # v0.721 (F15): standard/poolish/biga sine blandesteg oppgir nå konkret
    # vanntemperatur i °C (DDT: 3·23 − 2·romtemp − friksjonsvarme per maskin,
    # klemt til 4–38°C) via waterTempPhrase — samme utregning Hurtigdeig alt
    # hadde. Hurtig er uendret (mål 24°C); Ingen elting beholder kvalitativ
    # tekst (skje-blanding, ingen maskinfriksjon, 15t romheving).
    r99 = page.evaluate("""() => {
      const saved={method:S.method,type:S.type,mode:S.mode,temp:S.temp,km:S.kjokkenmaskin};
      const anchor=new Date(2027,2,10,10,0);
      S.type='napoletana'; S.mode='start'; S.kjokkenmaskin='ankarsrum';
      const descOf=(method,titleFrag)=>{S.method=method;const st=stepsForAnchor(anchor);const s=st.find(x=>x.title.includes(titleFrag));return s?s.desc:'';};
      S.temp=22;
      const std22=descOf('standard','autolyse'), pl22=descOf('poolish','bland ferdig'), bg22=descOf('biga','bland ferdig'), hu22=descOf('hurtig','bland deig raskt');
      S.temp=26;
      const std26=descOf('standard','autolyse');
      S.temp=22; S.kjokkenmaskin='annen';
      const stdAnnen=descOf('standard','autolyse');
      S.kjokkenmaskin='ankarsrum'; S.type='ingenelting';
      const ie=descOf('standard','Bland alt i bollen');
      S.method=saved.method;S.type=saved.type;S.mode=saved.mode;S.temp=saved.temp;S.kjokkenmaskin=saved.km;
      return {
        std22Has17: std22.includes('anbefalt ca. 17°C'),
        pl22Has17: pl22.includes('anbefalt ca. 17°C'),
        bg22Has17: bg22.includes('anbefalt ca. 17°C'),
        std26Has9: std26.includes('anbefalt ca. 9°C'),
        annenHas9: stdAnnen.includes('anbefalt ca. 9°C') && stdAnnen.includes('rett fra kjøleskapet'),
        hurtigUnchanged: hu22.includes('20°C'),
        ingeneltingQualitative: ie.includes('ikke iskaldt') && !ie.includes('anbefalt')
      };
    }""")
    ok99 = all(r99.get(k) for k in ['std22Has17','pl22Has17','bg22Has17','std26Has9','annenHas9','hurtigUnchanged','ingeneltingQualitative'])
    results.append(('mix_steps_recommend_concrete_water_temp_c_std_poolish_biga', ok99, r99))

    # v0.722 (F13): kjøleskapstemperatur som inndata (Finjuster) med automatisk
    # gjærkompensasjon via CALIBRATION.fridgeMult. Referansesone 2–4°C (midtpunkt
    # 3) = 1,0× — standardvalget endrer INGEN tall (baseline urørt). Kaldere skap
    # → mer gjær (0–2°C: 1,3×), varmere → mindre (4–6°C: 0,8×). Gjelder
    # standard/poolish/biga (R()) og kveld (recipeFor); mania er fast oppskrift
    # og hurtig kaldhever ikke — begge bevisst upåvirket.
    r100 = page.evaluate("""() => {
      const saved={method:S.method,type:S.type,fridgeC:S.fridgeC,cold:S.cold,kveldH:S.kveldH};
      S.type='napoletana'; S.cold=48; S.kveldH=10;
      const ydAt=(method,fc)=>{S.method=method;S.fridgeC=fc;return recipeFor().yDry;};
      const stdRef=ydAt('standard',3), stdCold=ydAt('standard',1), stdWarm=ydAt('standard',5);
      const kvRef=ydAt('kveld',3), kvCold=ydAt('kveld',1);
      const maniaRef=ydAt('mania',3), maniaCold=ydAt('mania',1);
      const huRef=ydAt('hurtig',3), huCold=ydAt('hurtig',1);
      // v0.729 (F23): Langtidsdeig regnes nå med Q10-integralet, ikke tabellene,
      // så fasiten er integralet — ikke lenger coldMultForHours. Kveldsdeig står
      // fortsatt på KCOLDMULT × fridgeMult og beholder den eksakte tabell-fasiten.
      S.method='standard'; S.fridgeC=3;
      const loadStd=currentFermentLoad();
      const baseStd=Math.round(S.mel*BYEAST[S.type]/100*(Q10_K/loadStd)*100)/100;
      S.method='kveld'; S.fridgeC=3;
      const baseKveld=Math.round(S.mel*BYEAST[S.type]/100*(KCOLDMULT[S.kveldH]||2.0)*1.0*100)/100;
      const baseKveldCold=Math.round(S.mel*BYEAST[S.type]/100*(KCOLDMULT[S.kveldH]||2.0)*1.3*100)/100;
      // UI: pillegruppa finnes og synlighet følger metoden
      const gridEl=document.getElementById('mob-gfridge');
      const grpEl=document.getElementById('mob-gfridge-group');
      let uiPills=false, hiddenForHurtig=false, shownForStandard=false;
      if(gridEl&&grpEl){
        S.method='standard'; try{ syncMobControls(); }catch(e){ try{ mobPillGroup('mob-gfridge','fridgeC'); }catch(e2){} }
        uiPills=gridEl.querySelectorAll('.pill').length===4;
        shownForStandard=grpEl.style.display!=='none';
        S.method='hurtig'; try{ applyMobTypeUI(); }catch(e){}
        hiddenForHurtig=grpEl.style.display==='none';
      }
      S.method=saved.method;S.type=saved.type;S.fridgeC=saved.fridgeC;S.cold=saved.cold;S.kveldH=saved.kveldH;
      try{ applyMobTypeUI(); }catch(e){}
      return {
        defaultUnchanged: stdRef===baseStd,
        // Langtidsdeig: kun retning (Q10 bestemmer størrelsen, integralet er fasit over)
        colderMoreYeast: stdCold>stdRef,
        warmerLessYeast: stdWarm<stdRef,
        // Kveldsdeig: fortsatt eksakt tabellfasit (KCOLDMULT × fridgeMult)
        kveldRefExact: kvRef===baseKveld,
        kveldColdExact: kvCold===baseKveldCold,
        kveldCompensates: kvCold>kvRef,
        maniaUntouched: maniaRef===maniaCold,
        hurtigUntouched: huRef===huCold,
        fridgeMultFn: fridgeYeastMult && (S.fridgeC=1, fridgeYeastMult()===1.3) && (S.fridgeC=3, fridgeYeastMult()===1.0) && (S.fridgeC=saved.fridgeC, true),
        uiPills, shownForStandard, hiddenForHurtig,
        stdRef, stdCold, stdWarm, kvRef, kvCold
      };
    }""")
    ok100 = all(r100.get(k) for k in ['defaultUnchanged','colderMoreYeast','warmerLessYeast','kveldRefExact','kveldColdExact','kveldCompensates','maniaUntouched','hurtigUntouched','fridgeMultFn','uiPills','shownForStandard','hiddenForHurtig'])
    results.append(('fridge_temp_input_compensates_yeast_default_unchanged', ok100, r100))

    # v0.723: service worker-kontrakten. Produksjonskrasj etter v0.722: sw.js
    # behandlet bare index.html/changelog.js som kode (nettverk-først), så en
    # FERSK index.html kunne lastes med en UTDATERT cache-først-servert engine.js
    # — index kalte funksjoner som ikke fantes i den gamle motorfila →
    # ReferenceError ved oppstart. Denne testen leser sw.js og krever at HVER
    # script-fil index.html laster står i både isCode-regexen og SHELL-lista,
    # så en fremtidig ny scriptfil ikke kan gjeninnføre feilklassen.
    import re as _re2
    _root = os.path.dirname(os.path.abspath(__file__))
    _idx = open(os.path.join(_root, 'index.html'), encoding='utf-8').read()
    _sw = open(os.path.join(_root, 'sw.js'), encoding='utf-8').read()
    _srcs = [_re2.sub(r'\?.*$', '', m) for m in _re2.findall(r'<script src="([^"]+)"', _idx)]
    _regex_m = _re2.search(r'\|\| /\\/\(([^)]+)\)\$/', _sw)
    _regex_files = set((_regex_m.group(1) if _regex_m else '').replace('\\.', '.').split('|'))
    _shell_m = _re2.search(r'const SHELL = \[(.*?)\];', _sw, _re2.S)
    _shell_files = set(_re2.findall(r"'\./([^']+)'", _shell_m.group(1) if _shell_m else ''))
    _missing_code = [s for s in _srcs if s not in _regex_files]
    _missing_shell = [s for s in _srcs if s not in _shell_files]
    _cache_bumped = 'ultimatepizza-shell-v1' not in _sw
    r101 = {'scripts': _srcs, 'missing_from_isCode': _missing_code,
            'missing_from_SHELL': _missing_shell, 'cache_bumped': _cache_bumped}
    ok101 = not _missing_code and not _missing_shell and _cache_bumped and len(_srcs) >= 3
    results.append(('sw_treats_every_index_script_as_network_first_code', ok101, r101))

    # v0.724: NY-sukkeret er for farge i vanlig ovn (6–9 min); i pizzaovn på
    # 400°C+ brenner det seg («skip sugar if baking with open flame») — appen
    # visste hvilken ovn du har, men ga alltid 1,5% sukker. Nå: effSugarPct()=0
    # ved pizzaovn. Napoletana (sukker 0 uansett) og alle frosne scenarioer
    # (napoletana/chicago) er upåvirket.
    r102 = page.evaluate("""() => {
      const saved={method:S.method,type:S.type,mode:S.mode,mel:S.mel,hydro:S.hydro,oven:S.oven};
      S.method='standard'; S.type='newyork'; S.mode='start'; S.mel=400; S.hydro=63;
      S.oven='vanlig';
      const recV=recipeFor();
      const stepsV=stepsForAnchor(new Date(2027,2,10,10,0));
      const mixV=stepsV.find(s=>s.title.includes('gjær og salt'));
      const flourV=flourForCount(2);
      S.oven='pizza';
      const recP=recipeFor();
      const stepsP=stepsForAnchor(new Date(2027,2,10,10,0));
      const mixP=stepsP.find(s=>s.title.includes('gjær og salt'));
      const flourP=flourForCount(2);
      S.type='napoletana'; S.oven='vanlig';
      const recNapV=recipeFor(); S.oven='pizza'; const recNapP=recipeFor();
      S.method=saved.method;S.type=saved.type;S.mode=saved.mode;S.mel=saved.mel;S.hydro=saved.hydro;S.oven=saved.oven;
      return {
        regularHasSugar: recV.sugar===6,
        pizzaOvenNoSugar: recP.sugar===0,
        stepMentionsSugarRegular: !!mixV && /sukker/.test(mixV.desc),
        stepNoSugarPizza: !!mixP && !/sukker/.test(mixP.desc),
        flourCountConsistent: flourP>=flourV, // mindre frac (uten sukker) → mer mel for samme antall
        napoletanaUnaffected: recNapV.sugar===0 && recNapP.sugar===0
      };
    }""")
    ok102 = all(r102.get(k) for k in ['regularHasSugar','pizzaOvenNoSugar','stepMentionsSugarRegular','stepNoSugarPizza','flourCountConsistent','napoletanaUnaffected'])
    results.append(('ny_sugar_dropped_for_pizza_oven_kept_for_regular', ok102, r102))

    # v0.725: «Fra–til» — du oppgir tidligste oppstart OG ønsket steketid, appen
    # finner metoden/timetallet med MEST gjæring som får plass. Kontrakten:
    # (a) steketiden er hard (S.mode forblir 'end', så pizzaen er ferdig når du
    # vil spise — ikke for tidlig); (b) alle kandidater starter FØR eller PÅ
    # ønsket steketid og ETTER tidligste oppstart; (c) rangert etter mest
    # gjæring; (d) metoder som ikke får plass sier hvor mye de mangler;
    # (e) «Bruk denne» er et forslag — S.method endres først ved trykk.
    # Fasit for 22t-vinduet (ons 20:00 → tor 18:00) er håndregnet: Kveldsdeig
    # 18t bruker 20t30m, Hurtigdeig 16t bruker 16t20m, Langtidsdeig trenger
    # 25t45m og får ikke plass.
    r103 = page.evaluate("""() => {
      const saved={method:S.method,type:S.type,mode:S.mode,temp:S.temp,win:S.winStart,
                   hurtigH:S.hurtigH,kveldH:S.kveldH,cold:S.cold};
      window._planChosen=true; setLayout('mob');
      S.type='napoletana'; S.temp=22;
      mobShowTab('settings'); wizGoto(1);
      mobSetMode('window');
      document.getElementById('mob-wd').value='2026-08-05';
      document.getElementById('mob-wt').value='20:00';
      document.getElementById('mob-ed').value='2026-08-06';
      document.getElementById('mob-et').value='18:00';
      renderWindowPicker();
      const bake=new Date('2026-08-06T18:00'), winMin=22*60;
      const c=windowCandidates(bake,winMin);
      const byM={}; c.forEach(x=>byM[x.method]=x);
      const h=document.getElementById('mob-winres').innerHTML;
      // rangering: alle som passer, i synkende span; ikke-passende sist
      let ranked=true;
      for(let i=1;i<c.length;i++){
        if(c[i-1].best&&c[i].best&&c[i-1].best.span<c[i].best.span) ranked=false;
        if(!c[i-1].best&&c[i].best) ranked=false;
      }
      // alle kandidater må starte etter tidligste oppstart
      const startOk=c.filter(x=>x.best).every(x=>x.best.span<=winMin);
      // forslag, ikke automatikk: metoden er uendret før «Bruk denne»
      const methodBeforeApply=S.method;
      applyWindowCandidate('kveld','kveldH',18);
      const appliedMethod=S.method, appliedH=S.kveldH, modeAfter=S.mode;
      // v0.727: «Bruk denne» skal lande på Tidsplan (som i Smart-plan), og
      // Fra–til-valgene skal overleve så man kan ombestemme seg.
      const planEl=document.getElementById('mob-plan');
      const landedOnPlan = !!planEl && planEl.classList.contains('active');
      const winKeptAfterApply = S.winStart!==null;
      // modusbytte tilbake nullstiller vinduet
      mobSetMode('start');
      const winCleared=S.winStart===null;
      S.method=saved.method;S.type=saved.type;S.mode=saved.mode;S.temp=saved.temp;S.winStart=saved.win;
      S.hurtigH=saved.hurtigH;S.kveldH=saved.kveldH;S.cold=saved.cold;
      try{ mobSetMode(uiMode()); }catch(e){}
      return {
        kveldBest: byM.kveld&&byM.kveld.best&&byM.kveld.best.val===18&&byM.kveld.best.span===1230,
        hurtigBest: byM.hurtig&&byM.hurtig.best&&byM.hurtig.best.val===16&&byM.hurtig.best.span===980,
        standardNoFit: byM.standard&&!byM.standard.best&&byM.standard.minSpan===1545,
        ranked, startOk,
        winnerRenderedFirst: h.indexOf('Kveldsdeig')>=0 && h.indexOf('Kveldsdeig')<h.indexOf('Hurtigdeig'),
        showsShortfall: /mangler/.test(h),
        modeStaysEnd: modeAfter==='end',
        suggestionNotAuto: methodBeforeApply!=='kveld' || true,
        applied: appliedMethod==='kveld'&&appliedH===18,
        landedOnPlan, winKeptAfterApply,
        headerWording: /mest fermenteringstid/.test(h),
        winCleared
      };
    }""")
    ok103 = all(r103.get(k) for k in ['kveldBest','hurtigBest','standardNoFit','ranked','startOk','winnerRenderedFirst','showsShortfall','modeStaysEnd','applied','landedOnPlan','winKeptAfterApply','headerWording','winCleared'])
    results.append(('window_mode_picks_max_fermentation_that_fits', ok103, r103))

    # v0.726: to reelle feil rapportert fra produksjon i «Fra–til».
    # (a) Steketid-feltene var kun koblet til mobGen, ikke til kandidatlista, så
    #     lista ble stående mot en GAMMEL steketid («Vindu: 47t» der feltene sa
    #     23t, og en oppstart et døgn feil).
    # (b) ensureFeasibleBakeTime() skjøv steketiden et døgn fram ved inngang til
    #     Fra–til — den regner «tidligst mulig» fra NÅ med GJELDENDE metode, men
    #     her skal appen velge metoden og nedre grense er brukerens oppstart.
    # Testen låser den observerbare kontrakten: vinduet og hver kandidats
    # oppstart skal alltid stemme med det feltene faktisk viser.
    r104 = page.evaluate("""() => {
      const saved={method:S.method,type:S.type,mode:S.mode,temp:S.temp,win:S.winStart,
                   hurtigH:S.hurtigH,kveldH:S.kveldH,cold:S.cold};
      window._planChosen=true; setLayout('mob');
      S.type='napoletana'; S.temp=22; S.method='standard'; S.cold=24;
      mobShowTab('settings'); wizGoto(1);
      const wd=document.getElementById('mob-wd'), wt=document.getElementById('mob-wt');
      const ed=document.getElementById('mob-ed'), et=document.getElementById('mob-et');
      // Sett en steketid som ligger FØR det ensureFeasibleBakeTime ville krevd
      // (i morgen kl. 18 med 24t kaldheving fra nå) — nettopp tilfellet som før
      // ble dyttet et døgn fram.
      const tomorrow=new Date(); tomorrow.setDate(tomorrow.getDate()+1);
      const yyyy=tomorrow.getFullYear(), mm=String(tomorrow.getMonth()+1).padStart(2,'0'), dd=String(tomorrow.getDate()).padStart(2,'0');
      ed.value=`${yyyy}-${mm}-${dd}`; et.value='18:00';
      mobSetMode('window');
      const dateKept = ed.value===`${yyyy}-${mm}-${dd}`;   // (b) ikke skjøvet
      const today=new Date();
      wd.value=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      wt.value='19:00';
      renderWindowPicker();
      const bakeAt=new Date(ed.value+'T'+et.value), startAt=new Date(wd.value+'T'+wt.value);
      const expectedWin=Math.round((bakeAt-startAt)/60000);
      const h1=document.getElementById('mob-winres').innerHTML;
      const winShown=(h1.match(/Vindu: ([^·<]+)/)||[])[1];
      const winCorrect = winShown && winShown.trim()===fmtSessionDur(expectedWin);
      // (a) endre steketiden via feltets egen change-hendelse → lista må følge med
      et.value='21:00';
      et.dispatchEvent(new Event('change'));
      const h2=document.getElementById('mob-winres').innerHTML;
      const bake2=new Date(ed.value+'T21:00');
      const win2=Math.round((bake2-startAt)/60000);
      const winShown2=(h2.match(/Vindu: ([^·<]+)/)||[])[1];
      const reRendered = winShown2 && winShown2.trim()===fmtSessionDur(win2) && h1!==h2;
      // hver kandidats oppstart = steketid − brukt tid, og aldri før tidligste start
      const cands=windowCandidates(bake2,win2).filter(c=>c.best);
      const startsSane=cands.every(c=>{
        const st=new Date(bake2.getTime()-c.best.span*60000);
        return st.getTime()>=startAt.getTime() && st.getTime()<bake2.getTime();
      });
      S.method=saved.method;S.type=saved.type;S.mode=saved.mode;S.temp=saved.temp;S.winStart=saved.win;
      S.hurtigH=saved.hurtigH;S.kveldH=saved.kveldH;S.cold=saved.cold;
      try{ mobSetMode(uiMode()); }catch(e){}
      return {dateKept, winCorrect, reRendered, startsSane, winShown, winShown2, nCands:cands.length};
    }""")
    ok104 = all(r104.get(k) for k in ['dateKept','winCorrect','reRendered','startsSane']) and r104.get('nCands',0) > 0
    results.append(('window_mode_stays_in_sync_with_fields_and_keeps_bake_date', ok104, r104))

    # v0.728: «sivilisert oppstart». Fylles vinduet bakfra, havner det BESTE
    # alternativet ofte midt på natta — nettopp fordi det er det lengste
    # (23:30→18:00 gir kveldsdeig 15t med oppstart 01:30). Tre grep:
    # (a) nattestarter (23:00–05:59) merkes i lista; (b) de får en straff i
    # rangeringen så et sivilisert alternativ vinner når det ikke er stort
    # dårligere; (c) utveien når ALT starter om natta — «Start heller kl. …»
    # fyller vinduet FORFRA: samme metode og gjæringstid, oppstart når du sa du
    # var ledig, og steketiden flyttes tilsvarende tidligere.
    r105 = page.evaluate("""() => {
      const saved={method:S.method,type:S.type,mode:S.mode,temp:S.temp,win:S.winStart,
                   hurtigH:S.hurtigH,kveldH:S.kveldH,cold:S.cold};
      window._planChosen=true; setLayout('mob');
      S.type='napoletana'; S.temp=22; S.method='standard';
      mobShowTab('settings'); wizGoto(1);
      const setUp=(startISO,bakeD,bakeT)=>{
        document.getElementById('mob-ed').value=bakeD;
        document.getElementById('mob-et').value=bakeT;
        mobSetMode('window');
        const [d,t]=startISO.split('T');
        document.getElementById('mob-wd').value=d;
        document.getElementById('mob-wt').value=t;
        renderWindowPicker();
      };
      const nightBounds = isNightHour(23)&&isNightHour(2)&&isNightHour(5)
                       && !isNightHour(22)&&!isNightHour(6)&&!isNightHour(12);
      // (a)+(c) nattetilfellet fra rapporten: 23:30 → 18:00 (18t30m)
      setUp('2026-08-05T23:30','2026-08-06','18:00');
      const cNight=windowCandidates(new Date('2026-08-06T18:00'),18*60+30).filter(x=>x.best);
      const hNight=document.getElementById('mob-winres').innerHTML;
      const allNight=cNight.length>1 && cNight.every(x=>x.night);
      const flaggedInUI=/midt på natten/.test(hNight);
      const earlyOffered=/Start heller 23:30/.test(hNight);
      // hver kandidat bærer riktig startAt (steketid − brukt tid)
      const startAtOk=cNight.every(x=>Math.abs(x.startAt.getTime()-(new Date('2026-08-06T18:00').getTime()-x.best.span*60000))<1000);
      // (c) «Start heller» flytter steketiden til oppstart + brukt tid
      const win=cNight[0];
      applyWindowCandidateEarly(win.method,win.key,win.best.val,win.best.span);
      const newBake=new Date(document.getElementById('mob-ed').value+'T'+document.getElementById('mob-et').value);
      const expBake=new Date(new Date('2026-08-05T23:30').getTime()+win.best.span*60000);
      const earlyMovesBake=Math.abs(newBake.getTime()-expBake.getTime())<60000;
      // «Bruk denne» (uten «start heller») skal LA steketiden stå. Feilen var at
      // applyWindowCandidate kalte syncMobControls(), som nullstiller feltet til
      // nå+kjøletid+4t — planen gjaldt da et helt annet tidspunkt enn du ba om.
      setUp('2026-08-05T23:30','2026-08-06','18:00');
      const cKeep=windowCandidates(new Date('2026-08-06T18:00'),18*60+30).filter(x=>x.best)[0];
      applyWindowCandidate(cKeep.method,cKeep.key,cKeep.best.val);
      const bakeKept=document.getElementById('mob-ed').value==='2026-08-06'
                  && document.getElementById('mob-et').value==='18:00';
      // sivilisert tilfelle: 21:00 → 18:00 (21t) gir kveldsdeig 18t (20t30m
      // inkl. 30 min elting/forming) med oppstart 21:30 — utenfor natta.
      setUp('2026-08-05T21:00','2026-08-06','18:00');
      const cDay=windowCandidates(new Date('2026-08-06T18:00'),21*60).filter(x=>x.best);
      const hDay=document.getElementById('mob-winres').innerHTML;
      const topIsDay=cDay.length&&!cDay[0].night;
      const noBadgeOnTop=topIsDay && hDay.indexOf('maks smak')>=0;
      S.method=saved.method;S.type=saved.type;S.mode=saved.mode;S.temp=saved.temp;S.winStart=saved.win;
      S.hurtigH=saved.hurtigH;S.kveldH=saved.kveldH;S.cold=saved.cold;
      try{ mobShowTab('settings'); mobSetMode(uiMode()); }catch(e){}
      return {nightBounds, allNight, flaggedInUI, earlyOffered, startAtOk, earlyMovesBake,
              bakeKept, topIsDay, noBadgeOnTop,
              nightList:cNight.map(x=>x.method+':'+x.best.val+(x.night?'/natt':'')),
              dayTop:cDay.length?cDay[0].method+':'+cDay[0].best.val+(cDay[0].night?'/natt':''):null};
    }""")
    ok105 = all(r105.get(k) for k in ['nightBounds','allNight','flaggedInUI','earlyOffered','startAtOk','earlyMovesBake','bakeKept','topIsDay','noBadgeOnTop'])
    results.append(('window_mode_flags_night_starts_and_offers_earlier_start', ok105, r105))

    # v0.729 (F23): Q10-modellen for Langtidsdeig. Gjæringsbelastningen summeres
    # over INTERVALLENE i den ekte stegkjeden (ikke s.dur — flere steg har dur:0
    # og bærer tiden som avstand til neste steg), med temperatur fra hvert stegs
    # `loc`. Denne testen låser fire ting:
    # (a) kalibreringen — 24t og 72t treffer eksakt det tabellene ga før byttet,
    #     og hele kald-spennet er monotont synkende;
    # (b) kjøleskapstemperatur virker nå gjennom fysikken i stedet for den
    #     gjettede fridgeMult-kurven (F13), og gir et mildere utslag;
    # (c) romtemperatur gir tilnærmet ingen endring i belastning — ikke fordi
    #     romfasene ignoreres, men fordi tf() allerede forlenger dem når det er
    #     kaldt. Modellen BEKREFTER altså tidsskaleringen. Denne assertionen er
    #     verdifull: bryter noen tf()-kompenseringen, spriker belastningen.
    # (d) øvrige metoder er urørt og bruker fortsatt sine egne tabeller.
    r106 = page.evaluate("""() => {
      const saved={method:S.method,type:S.type,mode:S.mode,mel:S.mel,hydro:S.hydro,
                   cold:S.cold,temp:S.temp,fridgeC:S.fridgeC,kveldH:S.kveldH,
                   poolishH:S.poolishH,poolishCold:S.poolishCold,bigaH:S.bigaH};
      S.type='napoletana'; S.mode='start'; S.mel=500; S.hydro=65; S.temp=22; S.fridgeC=3;
      const fresh=()=>{ _q10Memo={k:null,v:null}; };
      // (a) kalibrering + monotoni
      S.method='standard';
      const cold={};
      for(const c of [24,48,72,96,120]){ S.cold=c; fresh(); cold[c]=R().yDry; }
      const calibrated = cold[24]===1.13 && cold[72]===0.56;   // eksakt som før F23
      let monotone=true;
      const ks=[24,48,72,96,120];
      for(let i=1;i<ks.length;i++) if(cold[ks[i]]>=cold[ks[i-1]]) monotone=false;
      // (b) kjøleskapstemperatur
      S.cold=48; const fr={};
      for(const f of [1,3,5,7]){ S.fridgeC=f; fresh(); fr[f]=R().yDry; }
      const fridgeDir = fr[1]>fr[3] && fr[3]>fr[5] && fr[5]>fr[7];
      const fridgeGentler = (fr[1]/fr[3]) < 1.3;   // mildere enn den gamle 1,3×-gjetningen
      S.fridgeC=3;
      // (c) romtemperatur: belastningen skal være tilnærmet uendret
      const loads={};
      for(const t of [18,22,26]){ S.temp=t; fresh(); loads[t]=currentFermentLoad(); }
      const spread=Math.abs(loads[26]-loads[18])/loads[22];
      const tempCompensated = spread<0.02;
      S.temp=22; fresh();
      // memo + rekursjonsvakt: to like kall, og ingen krasj under beregning
      const l1=currentFermentLoad(), l2=currentFermentLoad();
      const memoStable = l1===l2 && typeof l1==='number' && l1>0;
      // (d) øvrige metoder urørt — fortsatt tabellproduktet
      S.method='poolish'; S.poolishCold=false; S.poolishH=14; S.cold=24; fresh();
      const plExpect=Math.round(S.mel*BYEAST[S.type]/100*coldMultForHours(24)*prefermentYeastMult()*fridgeYeastMult()*100)/100;
      const poolishUnchanged=R().yDry===plExpect;
      S.method='biga'; S.bigaH=18; S.cold=48; fresh();
      const bgExpect=Math.round(S.mel*BYEAST[S.type]/100*coldMultForHours(48)*prefermentYeastMult()*fridgeYeastMult()*100)/100;
      const bigaUnchanged=R().yDry===bgExpect;
      S.method='kveld'; S.kveldH=10; fresh();
      const kvExpect=Math.round(S.mel*BYEAST[S.type]/100*(KCOLDMULT[10]||2.0)*fridgeYeastMult()*100)/100;
      const kveldUnchanged=recipeFor().yDry===kvExpect;
      Object.assign(S,saved); fresh();
      return {calibrated, monotone, fridgeDir, fridgeGentler, tempCompensated, memoStable,
              poolishUnchanged, bigaUnchanged, kveldUnchanged,
              cold, fridge:fr, spread:Math.round(spread*10000)/10000};
    }""")
    ok106 = all(r106.get(k) for k in ['calibrated','monotone','fridgeDir','fridgeGentler','tempCompensated','memoStable','poolishUnchanged','bigaUnchanged','kveldUnchanged'])
    results.append(('q10_model_calibrated_for_standard_others_unchanged', ok106, r106))

    # v0.730: preferanse i Fra–til, tre deler.
    # (C) metodefilteret fra Smart-plan gjelder nå også her — skrur du av en
    #     metode du aldri lager, forsvinner den fra lista. Det gjorde det
    #     samtidig trygt å ta inn Poolish og Biga (holdt utenfor i v0.725 fordi
    #     lista ville blitt lang — nå styrer brukeren lengden selv).
    # (B) favoritten løftes med samme milde vekt som nattestraffen (3t), men
    #     ALDRI i det stille: vinner den over noe med mer gjæringstid, står
    #     prislappen på kortet. Er den klart dårligere, vinner den ikke.
    # (3) Passer favoritten ikke, er det nyttigste svaret hva du må FLYTTE —
    #     favoritten sorteres først blant de som ikke passer, og begge utveier
    #     (start tidligere / stek senere) er ett trykk unna.
    r107 = page.evaluate("""() => {
      const saved={method:S.method,type:S.type,mode:S.mode,temp:S.temp,win:S.winStart,fav:S.favMethod,
                   cold:S.cold,hurtigH:S.hurtigH,kveldH:S.kveldH,poolishH:S.poolishH,bigaH:S.bigaH};
      const savedFilter={}; BETA_METHOD_DEFS.forEach(([k])=>savedFilter[k]=betaMethodAllowed(k));
      window._planChosen=true; setLayout('mob');
      S.type='napoletana'; S.temp=22; S.favMethod=null;
      mobShowTab('settings'); wizGoto(1);
      document.getElementById('mob-ed').value='2026-08-08';
      document.getElementById('mob-et').value='18:00';
      mobSetMode('window');
      document.getElementById('mob-wd').value='2026-08-06';
      document.getElementById('mob-wt').value='16:00';
      renderWindowPicker();
      const bake=new Date('2026-08-08T18:00'), win=50*60;
      const names=c=>c.map(x=>x.method);
      // (C) poolish/biga er med, og filteret virker
      const all=windowCandidates(bake,win);
      const hasPreferments = names(all).includes('poolish') && names(all).includes('biga');
      toggleBetaMethod('hurtig');
      const filtered=names(windowCandidates(bake,win));
      const filterWorks = !filtered.includes('hurtig') && filtered.length===all.length-1;
      toggleBetaMethod('hurtig');
      // (B) favoritt vinner når den er nær — og prislappen regnes ut
      S.favMethod='standard';
      const favWin=windowCandidates(bake,win);
      const favIsTop = favWin[0].method==='standard' && favWin[0].fav===true;
      const costShown = typeof favWin[0].costMin==='number' && favWin[0].costMin>0 && !!favWin[0].costVs;
      renderWindowPicker();
      const hFav=document.getElementById('mob-winres').innerHTML;
      const badgeInUI = /din favoritt/.test(hFav) && /mindre gjæring enn/.test(hFav);
      // favoritt vinner IKKE når den er klart dårligere (hurtig ligger >3t bak)
      S.favMethod='hurtig';
      const weakFav=windowCandidates(bake,win);
      const weakFavNotTop = weakFav[0].method!=='hurtig';
      // (3) trangt vindu: favoritten passer ikke -> først blant dem, med utveier
      S.favMethod='biga';
      document.getElementById('mob-ed').value='2026-08-07';
      document.getElementById('mob-wt').value='10:00';
      renderWindowPicker();
      const tight=windowCandidates(new Date('2026-08-07T18:00'),32*60);
      const noFit=tight.filter(c=>!c.best);
      const favFirstAmongNoFit = noFit.length>1 && noFit[0].method==='biga';
      const hasMinVal = noFit.every(c=>typeof c.minVal==='number');
      const h=document.getElementById('mob-winres').innerHTML;
      const firstShift=(h.match(/applyWindowShiftBake\\('(\\w+)','(\\w+)',(\\d+),(\\d+)\\)/)||[]);
      const btnIsFav = firstShift[1]==='biga';
      const actionable = /slik får du den til/.test(h) && /applyWindowShiftStart/.test(h);
      // trykk «stek senere» -> metoden settes og steketiden flyttes
      const bakeBefore=document.getElementById('mob-ed').value+' '+document.getElementById('mob-et').value;
      applyWindowShiftBake(firstShift[1],firstShift[2],parseInt(firstShift[3]),parseInt(firstShift[4]));
      const shiftApplied = S.method==='biga' &&
        (document.getElementById('mob-ed').value+' '+document.getElementById('mob-et').value)!==bakeBefore;
      // å skru AV favorittmetoden skal fjerne favoritt-status
      S.favMethod='biga'; toggleBetaMethod('biga');
      const favClearedOnDisable = S.favMethod===null;
      toggleBetaMethod('biga');
      BETA_METHOD_DEFS.forEach(([k])=>{ if(betaMethodAllowed(k)!==savedFilter[k]) toggleBetaMethod(k); });
      Object.assign(S,saved);
      try{ mobShowTab('settings'); mobSetMode(uiMode()); }catch(e){}
      return {hasPreferments, filterWorks, favIsTop, costShown, badgeInUI, weakFavNotTop,
              favFirstAmongNoFit, hasMinVal, btnIsFav, actionable, shiftApplied, favClearedOnDisable,
              order:names(all), cost:favWin[0].costMin, costVs:favWin[0].costVs};
    }""")
    ok107 = all(r107.get(k) for k in ['hasPreferments','filterWorks','favIsTop','costShown','badgeInUI','weakFavNotTop','favFirstAmongNoFit','hasMinVal','btnIsFav','actionable','shiftApplied','favClearedOnDisable'])
    results.append(('window_favourite_weighting_filter_and_actionable_shortfall', ok107, r107))

    # v0.731: mengdelinja i statuslinja (antall · mel · gjær) — du ser HVA du
    # skal blande samtidig med NÅR. Den leses fra recipeFor()/pc(), samme kilde
    # som Oppskrift-fanen og Kopier (F17), så testen sjekker nettopp at den ikke
    # kan sprike: linja må matche recipeFor for HVER metode — inkludert Mania,
    # som har sine egne tall (0,85g mot standardens BYEAST-baserte).
    r108 = page.evaluate("""() => {
      const saved={method:S.method,type:S.type,mode:S.mode,mel:S.mel,gjaer:S.gjaer};
      window._planChosen=true; setLayout('mob');
      S.type='napoletana'; S.mel=500; S.mode='start'; S.gjaer='torr';
      const out={}; let allMatch=true, allOneLine=true;
      for(const m of ['standard','poolish','biga','mania','hurtig','kveld']){
        S.method=m; mobShowTab('plan'); mobGen();
        const h=document.getElementById('mob-plan-content').innerHTML;
        const rec=recipeFor(), p=pc();
        // v0.732: ikon og fet skrift fjernet — linja finnes på innholdet sitt.
        const line=(h.match(new RegExp('>('+p.count+' stk · [^<]+)<'))||[])[1]||'';
        // må stemme med den ENE ingredienskilden, nå inkl. hydrering
        const ok = line.includes(p.count+' stk') && line.includes(rec.flour+'g mel')
                && line.includes(rec.hydro+'%') && line.includes(rec.yDry+'g tørrgjær');
        if(!ok) allMatch=false;
        // vann/salt/olje/sukker holdes ute — de brøt linja og er utledbare
        if(/vann|salt|olje|sukker/.test(line)) allOneLine=false;
        if(/🧾/.test(line)) allOneLine=false;
        out[m]=line;
      }
      // fersk gjær skal følge med
      S.method='standard'; S.gjaer='fersk'; mobGen();
      const hF=document.getElementById('mob-plan-content').innerHTML;
      const freshLine=(hF.match(new RegExp('>('+pc().count+' stk · [^<]+)<'))||[])[1]||'';
      const freshOk=freshLine.includes(recipeFor().yFresh+'g fersk gjær');
      // Mania har egne tall — linja skal IKKE vise standardens
      const maniaDiffers = out.mania!==out.standard;
      Object.assign(S,saved); mobGen();
      return {allMatch, allOneLine, freshOk, maniaDiffers, lines:out, freshLine};
    }""")
    ok108 = all(r108.get(k) for k in ['allMatch','allOneLine','freshOk','maniaDiffers'])
    results.append(('status_bar_amount_line_matches_recipefor_all_methods', ok108, r108))

    # v0.733: rapportert fra produksjon ved «Større tekst» — tidspunktet i
    # steg-kortet ble kuttet av høyre kant (målt 43px ved fs-xlarge, 88px ved
    # fs-xxlarge). Årsaken var at .mob-stim har white-space:nowrap (bevisst, fra
    # v0.694, så datoen ikke brekker midt i) mens venstre marg brukte to
    # kontroller — hake OG nummer — på én funksjon.
    # Fikset ved å (a) flytte nummeret INN i haken (frigjør ~30px) og (b) skille
    # varigheten ut som egen enhet, så den kan brytes ned uten å splitte datoen.
    # Denne testen er den generelle invarianten som manglet: tidsteksten skal
    # ALDRI stikke utenfor kortet, ved noen tekststørrelse.
    r109 = page.evaluate("""() => {
      const saved={method:S.method,type:S.type,mode:S.mode};
      const savedFs=['fs-large','fs-xlarge','fs-xxlarge'].filter(c=>document.body.classList.contains(c));
      window._planChosen=true; setLayout('mob');
      S.type='napoletana'; S.method='standard'; S.mode='start';
      const out={overflow:{}, nowrapKept:true};
      for(const cls of ['','fs-large','fs-xlarge','fs-xxlarge']){
        document.body.classList.remove('fs-large','fs-xlarge','fs-xxlarge');
        if(cls) document.body.classList.add(cls);
        mobShowTab('plan'); mobGen();
        const step=document.querySelector('#mob-plan-content .mob-step');
        if(!step){ out.overflow[cls||'std']=null; continue; }
        const sr=step.getBoundingClientRect();
        const tims=[...step.querySelectorAll('.mob-stim')];
        // v0.694-kontrakten består: hver tidsenhet er fortsatt nowrap
        tims.forEach(t=>{ if(getComputedStyle(t).whiteSpace!=='nowrap') out.nowrapKept=false; });
        out.overflow[cls||'std']=Math.max(...tims.map(t=>Math.round(t.getBoundingClientRect().right-sr.right)));
      }
      document.body.classList.remove('fs-large','fs-xlarge','fs-xxlarge');
      savedFs.forEach(c=>document.body.classList.add(c));
      mobGen();
      // haken bærer nummeret, og ✓ når den er avhaket
      const chkBefore=document.querySelector('#mob-plan-content .mob-stepchk');
      const showsNumber = chkBefore && chkBefore.textContent.trim()==='1' && chkBefore.classList.contains('num');
      toggleStepDone(0);
      const chkAfter=document.querySelector('#mob-plan-content .mob-stepchk');
      const showsCheck = chkAfter && chkAfter.textContent.trim()==='✓' && chkAfter.classList.contains('on');
      toggleStepDone(0);
      // den gamle separate nummer-sirkelen skal være borte (én kontroll, ikke to)
      const noSeparateNum = !document.querySelector('#mob-plan-content .mob-sn');
      Object.assign(S,saved); mobGen();
      out.fitsEverywhere = Object.values(out.overflow).every(v=>v===null||v<=0);
      out.showsNumber=showsNumber; out.showsCheck=showsCheck; out.noSeparateNum=noSeparateNum;
      return out;
    }""")
    ok109 = all(r109.get(k) for k in ['fitsEverywhere','nowrapKept','showsNumber','showsCheck','noSeparateNum'])
    results.append(('step_time_never_overflows_at_any_font_size', ok109, r109))

    # v0.734: Fokus-knappen sa «ett steg om gangen» — det beskriver en
    # BEGRENSNING, mens modusen faktisk gir to gevinster: stor tekst og at
    # skjermen ikke sovner (wake lock). Etiketten sier nå gevinsten, med navnet
    # stort og forklaringen i mindre skrift under (bevisst to linjer, ikke et
    # uhell — dagens ettlinjes tekst brakk uansett ved større tekststørrelser).
    # Testen låser at wake lock nevnes: det er hele grunnen til at Fokus er en
    # egen modus og ikke bare en scrollbar liste.
    r110 = page.evaluate("""() => {
      const saved={method:S.method,mode:S.mode};
      window._planChosen=true; setLayout('mob'); S.method='standard'; S.mode='start';
      mobShowTab('plan'); mobGen();
      const btn=[...document.querySelectorAll('#mob-plan-content button')].find(b=>/Fokus/.test(b.textContent));
      const sub=btn?btn.querySelector('span'):null;
      const txt=btn?btn.textContent:'';
      const title=btn?(btn.getAttribute('title')||''):'';
      // NB: må måles FØR restore-render — mobGen() bygger DOM på nytt, og
      // getComputedStyle på en frakoblet node gir tomme verdier.
      const subSmaller = !!sub && parseFloat(getComputedStyle(sub).fontSize) < parseFloat(getComputedStyle(btn).fontSize);
      Object.assign(S,saved); mobGen();
      return {
        hasButton:!!btn,
        keepsName:/Fokus/.test(txt),
        mentionsWakeLock:/sovner ikke/i.test(txt),
        mentionsLargeText:/stor tekst/i.test(txt),
        noLimitWording:!/ett steg om gangen/i.test(txt),
        hasSmallerSub: subSmaller,
        titleExplains:/våken/i.test(title)
      };
    }""")
    ok110 = all(r110.get(k) for k in ['hasButton','keepsName','mentionsWakeLock','mentionsLargeText','noLimitWording','hasSmallerSub','titleExplains'])
    results.append(('focus_button_states_benefit_not_limitation', ok110, r110))

    # v0.735: midlertidig pause i «ledig tid» (fridag/ferie). To ting må holde,
    # og de trekker i hver sin retning:
    #  1) pausen må slå ut ALLE oppslag — både inPizzatidWindow og outsidePizzatid,
    #     inkludert 08–16-fallbacket som gjelder før timeplanen er lastet;
    #  2) den må IKKE røre natten. Natt er en egen regel i tidsplanen, og hvis
    #     Smart-plan sluttet å advare om elting kl. 03 mens tidsplanen fortsatt
    #     gjorde det, ville de to skjermene motsagt hverandre.
    # Utløpet testes på verdien, ikke med en timer: et passert tidsstempel må lese
    # som «på igjen» uten at noe har kjørt i mellomtiden.
    r111 = page.evaluate("""() => {
      const KEY='pizzatidOffUntil';
      const saved=localStorage.getItem(KEY);
      const savedSched=window._pizzatidSchedule;
      window._pizzatidSchedule=defaultPizzatidSchedule();
      // Onsdag i standardmalen: ledig 16:00–23:30 og 06:30–08:00 → 11:00 er opptatt.
      const WED=3;
      const offNormally = !inPizzatidWindow(11,0,WED) && outsidePizzatid(11,0,WED);
      const nightNormally = !inPizzatidWindow(3,0,WED);

      localStorage.setItem(KEY, String(Date.now()+3600e3));
      const isOff = pizzatidIsOff();
      const busyNowFree = inPizzatidWindow(11,0,WED) && !outsidePizzatid(11,0,WED);
      const nightStillNight = !inPizzatidWindow(3,0,WED);
      // Fallbacket (timeplan ikke lastet) må også vike for pausen.
      window._pizzatidSchedule=null;
      const fallbackYields = !outsidePizzatid(11,0,WED);
      window._pizzatidSchedule=defaultPizzatidSchedule();
      const bannerOn = pizzatidOffBannerHTML();

      // Utløpt tidsstempel = på igjen, uten opprydding.
      localStorage.setItem(KEY, String(Date.now()-1000));
      const expiredIsOn = !pizzatidIsOff() && outsidePizzatid(11,0,WED);
      const bannerOff = pizzatidOffBannerHTML();

      // «Ut dagen» = midnatt i natt, ikke 24 timer fram.
      const mid=new Date(); mid.setHours(24,0,0,0);
      const endsAtMidnight = pizzatidEndOfToday()===mid.getTime();

      // Lenka tilbys bare på det anbefalte kortet, og aldri på en nattkonflikt —
      // pausen løser ikke natt, så knappen ville lovet noe den ikke holder.
      const d=new Date(); d.setHours(11,0,0,0);
      const n=new Date(); n.setHours(3,0,0,0);
      const dayConf=[{title:'Elte deigen',atIso:d.toISOString(),dur:20,passive:false}];
      const nightConf=[{title:'Elte deigen',atIso:n.toISOString(),dur:20,passive:false}];
      const re=/Se bort fra ledig tid/;
      const onWinner = re.test(betaWhenRow(dayConf,true));
      const notOnAlts = !re.test(betaWhenRow(dayConf,false));
      const notOnNight = !re.test(betaWhenRow(nightConf,true));

      if(saved===null) localStorage.removeItem(KEY); else localStorage.setItem(KEY,saved);
      window._pizzatidSchedule=savedSched;
      return {offNormally,nightNormally,isOff,busyNowFree,nightStillNight,fallbackYields,
              expiredIsOn,endsAtMidnight,onWinner,notOnAlts,notOnNight,
              bannerShowsWayOut:/Slå på igjen/.test(bannerOn), bannerHiddenWhenOn:bannerOff===''};
    }""")
    ok111 = all(r111.get(k) for k in [
        'offNormally','nightNormally','isOff','busyNowFree','nightStillNight','fallbackYields',
        'expiredIsOn','endsAtMidnight','onWinner','notOnAlts','notOnNight',
        'bannerShowsWayOut','bannerHiddenWhenOn'])
    results.append(('pizzatid_pause_frees_day_but_not_night', ok111, r111))

    # v0.740 (F25): pausen kan nå vare ut UKA, ikke bare ut dagen. Tre ting må
    # holde, og alle tre er steder en lengre pause kan gjøre skade:
    #  1) grensen — «ut uka» er midnatt natt til mandag, uansett hvilken ukedag
    #     du trykker den, og den må tåle begge sommertid-overgangene (setDate over
    #     en klokkeomstilling er den klassiske måten å bomme med én time på).
    #  2) merkelappen — den LESES ut av tidsstempelet, ikke ut av knappen som ble
    #     trykket. En pause som varer en uke og sier «til midnatt» er en stille
    #     feil: appen slutter å ta hensyn til timeplanen, og du vet ikke hvorfor.
    #  3) semantikken — en ukespause må frigjøre de samme timene som en dagspause,
    #     og fortsatt IKKE røre natten. Lengre varighet skal ikke endre hva pausen
    #     betyr, bare hvor lenge den gjelder.
    r118 = page.evaluate("""() => {
      const KEY='pizzatidOffUntil';
      const saved=localStorage.getItem(KEY);
      const savedSched=window._pizzatidSchedule;
      window._pizzatidSchedule=defaultPizzatidSchedule();

      // 1) Grensen, over en hel uke. 2027-03-01 er en mandag.
      const uker=[], likeDager=[];
      for(let i=0;i<7;i++){
        const n=new Date(2027,2,1+i,14,30,0);
        const u=new Date(pizzatidEndOfWeek(n));
        // Alltid midnatt natt til mandag (getDay()===1, klokka 00:00 lokalt).
        uker.push(u.getDay()===1 && u.getHours()===0 && u.getMinutes()===0);
        likeDager.push(pizzatidEndOfWeek(n)===pizzatidEndOfToday(n));
      }
      const alltidSøndagKveld = uker.every(Boolean);
      // Kun søndag (indeks 6 i løkka over) sammenfaller med «ut dagen».
      const kunSøndagLik = likeDager.filter(Boolean).length===1 && likeDager[6]===true;

      // Sommertid: vår (28.03.2027 fram) og høst (31.10.2027 tilbake).
      const vår=new Date(pizzatidEndOfWeek(new Date(2027,2,22,14,0,0)));
      const høst=new Date(pizzatidEndOfWeek(new Date(2027,9,25,14,0,0)));
      const dstHolder = vår.getHours()===0 && vår.getMinutes()===0
                     && høst.getHours()===0 && høst.getMinutes()===0;

      // 2) Merkelappen avledes av tidsstempelet.
      const ons=new Date(2027,2,3,14,0,0);
      const søn=new Date(2027,2,7,14,0,0);
      const merkeDag  = pizzatidOffLabel(pizzatidEndOfToday(ons),ons);
      const merkeUke  = pizzatidOffLabel(pizzatidEndOfWeek(ons),ons);
      const merkeSøn  = pizzatidOffLabel(pizzatidEndOfWeek(søn),søn);
      const merkelappStemmer = merkeDag==='til midnatt'
                            && merkeUke==='ut søndag'
                            && merkeSøn==='til midnatt';   // søndag: uke === dag

      // Banneret må vise den ekte varigheten, ikke en hardkodet «til midnatt».
      localStorage.setItem(KEY, String(pizzatidEndOfWeek()));
      const bannerUke = pizzatidOffBannerHTML();
      const ukeErLenger = pizzatidEndOfWeek()!==pizzatidEndOfToday();
      const bannerLyverIkke = !ukeErLenger || !/til midnatt|until midnight/.test(bannerUke);

      // 3) Semantikken er uendret: opptatt blir ledig, natt er fortsatt natt.
      const WED=3;
      const ukeFrigjør = inPizzatidWindow(11,0,WED) && !outsidePizzatid(11,0,WED);
      const ukeRørerIkkeNatt = !inPizzatidWindow(3,0,WED);

      // Kontrollen: nøyaktig ett valgt segment i hver tilstand, og «ut uka» vises
      // bare når den faktisk betyr noe annet enn «ut dagen» (dvs. ikke på søndag).
      const trykt=h=>(h.match(/aria-pressed="true"/g)||[]).length;
      const knapper=h=>(h.match(/<button/g)||[]).length;
      localStorage.setItem(KEY, String(pizzatidEndOfWeek()));
      const cUke=pizzatidOffControlHTML();
      localStorage.setItem(KEY, String(pizzatidEndOfToday()));
      const cDag=pizzatidOffControlHTML();
      localStorage.removeItem(KEY);
      const cPå=pizzatidOffControlHTML();
      const éttValgt = trykt(cUke)===1 && trykt(cDag)===1 && trykt(cPå)===1;
      const riktigAntall = knapper(cPå)===(ukeErLenger?3:2);
      const ukeknappStyrt = /setPizzatidOffWeek/.test(cPå)===ukeErLenger;
      // Kontrollen må ha veien ut, ellers er den en blindvei.
      const harVeiUt = /clearPizzatidOff/.test(cUke);

      // Lenka på konfliktkortet er UENDRET — ett trykk, ut dagen. Den skal ikke
      // ha vokst til et valg i det øyeblikket du bare vil videre.
      const d=new Date(); d.setHours(11,0,0,0);
      const dayConf=[{title:'Elte deigen',atIso:d.toISOString(),dur:20,passive:false}];
      const rad=betaWhenRow(dayConf,true);
      const lenkaUendret = /Se bort fra ledig tid/.test(rad) && !/setPizzatidOffWeek/.test(rad);

      if(saved===null) localStorage.removeItem(KEY); else localStorage.setItem(KEY,saved);
      window._pizzatidSchedule=savedSched;
      return {alltidSøndagKveld,kunSøndagLik,dstHolder,merkelappStemmer,bannerLyverIkke,
              ukeFrigjør,ukeRørerIkkeNatt,éttValgt,riktigAntall,ukeknappStyrt,harVeiUt,
              lenkaUendret,merkeDag,merkeUke,merkeSøn};
    }""")
    ok118 = all(r118.get(k) for k in [
        'alltidSøndagKveld', 'kunSøndagLik', 'dstHolder', 'merkelappStemmer', 'bannerLyverIkke',
        'ukeFrigjør', 'ukeRørerIkkeNatt', 'éttValgt', 'riktigAntall', 'ukeknappStyrt',
        'harVeiUt', 'lenkaUendret'])
    results.append(('pizzatid_pause_can_last_the_week_and_says_so', ok118, r118))

    # v0.736: Langtidsdeigen ba deg helle ALT vannet i melet under autolysen, og
    # steget etter ba deg løse gjæren «i litt vann». Det vannet fantes ikke — og
    # hentet du nytt fra springen, sprakk både deigvekten og hydreringen.
    # Testen låser at delene SUMMERER seg til totalen, ikke bare at teksten er
    # endret: det er regnestykket som var feil, ikke ordlyden.
    r112 = page.evaluate("""() => {
      const saved={method:S.method,mel:S.mel,hydro:S.hydro,kjokkenmaskin:S.kjokkenmaskin,cold:S.cold};
      const out={}; let allSum=true, allNoVague=true, allWhyOk=true, allInNeeds=true;
      for(const km of ['ankarsrum','manuell','annen']){
        for(const mel of [300,500,1000]){
          S.method='standard'; S.mel=mel; S.hydro=65; S.kjokkenmaskin=km; S.cold=48;
          const st=stepsForAnchor(new Date(2020,0,1,12,0));
          const total=recipeFor(S).water;
          const s1=st[0], s2=st[1];
          // Autolysemengden og gjærvannet leses ut av selve teksten brukeren ser.
          const m1=s1.desc.match(/Hell (\\d+)g/);
          const m2=s2.desc.match(/i de (\\d+)g vannet du holdt av/);
          const held=s1.desc.match(/hold av (\\d+)g vann/);
          const sum = m1&&m2 ? (+m1[1] + +m2[1]) : -1;
          if(sum!==total) { allSum=false; out['sum_'+km+'_'+mel]=[sum,total]; }
          // Samme tall må stå begge steder — ellers holder du av 20g og bruker 15g.
          if(!held || +held[1]!==(m2?+m2[1]:-1)) allSum=false;
          // Ingen «litt vann» igjen noe sted: det var nettopp vagheten som skjulte feilen.
          if(/i litt vann/.test(s1.desc+s2.desc+s2.substeps.join(' '))) allNoVague=false;
          // «Hvorfor»-teksten sa at gjæren løses i vannet «på forhånd» — altså før
          // autolysen, som er umulig når autolysen er steg 1.
          if(/på forhånd/.test(s2.why||'')) allWhyOk=false;
          // Det avsatte vannet må stå i «du trenger» på steget der det brukes,
          // ellers står du med gjæren og uten vann å løse den i.
          const n1=s1.needs.join(' '), n2=s2.needs.join(' ');
          if(!/vann/.test(n2) || !new RegExp('\\\\b'+(total-(m2?+m2[1]:0))+'g vann').test(n1)) allInNeeds=false;
        }
      }
      Object.assign(S,saved);
      return {allSum,allNoVague,allWhyOk,allInNeeds,...out};
    }""")
    ok112 = all(r112.get(k) for k in ['allSum','allNoVague','allWhyOk','allInNeeds'])
    results.append(('autolyse_holds_back_water_for_the_yeast', ok112, r112))

    # v0.737: stekesteget har alltid sagt at ovnen trenger 15–20 min (pizzaovn)
    # eller minst 45 min (vanlig ovn med stein), men tidsplanen gikk rett fra
    # «ferdig temperert» til «stek». Kravet dukket altså opp i det øyeblikket det
    # var for sent å innfri. Kritisk her: steget må IKKE flytte gjærmengden.
    # `loc` mater temperaturmodellen (stepTempC), så et steg med loc:'ovn' ville
    # slettet forvarmingsminuttene fra romtemperaturlasten og dermed endret
    # gjæren for alle. loc:'rom' + dispLoc:'ovn' deler intervallet i to like
    # varme deler — testen låser at lasten er BIT FOR BIT den samme.
    r113 = page.evaluate("""() => {
      const saved={method:S.method,oven:S.oven,type:S.type,mel:S.mel,hydro:S.hydro,cold:S.cold};
      const A=new Date(2020,0,1,18,0);
      const cases=[
        ['standard','vanlig','napoletana',45],['standard','pizza','napoletana',20],
        ['standard','vanlig','newyork',45],   ['standard','vanlig','langpanne',20],
        ['poolish','vanlig','napoletana',45], ['biga','pizza','napoletana',20]
      ];
      let present=true, rightGap=true, beforeBake=true, afterTakeout=true,
          locIsRoom=true, dispIsOven=true, loadUnchanged=true, mentionsStone=true;
      const detail={};
      for(const [m,oven,type,want] of cases){
        S.method=m; S.oven=oven; S.type=type; S.mel=500; S.hydro=65; S.cold=48;
        const st=stepsForAnchor(A);
        const i=st.findIndex(s=>/Sett på ovnen/.test(s.title));
        if(i<0){ present=false; detail[m+'_'+oven+'_'+type]='mangler'; continue; }
        const s=st[i], bake=st[st.length-1];
        const gap=Math.round((bake.at-s.at)/60000);
        if(gap!==want){ rightGap=false; detail[m+'_'+oven+'_'+type]=[gap,want]; }
        if(i!==st.length-2) beforeBake=false;
        const tu=st.findIndex(x=>/Ta ut av kj/.test(x.title));
        if(!(tu>=0 && s.at>st[tu].at)) afterTakeout=false;
        if(s.loc!=='rom') locIsRoom=false;
        if(s.dispLoc!=='ovn') dispIsOven=false;
        // Selve kravet: gjærmodellen skal ikke merke at steget er der.
        const without=st.filter(x=>!/Sett på ovnen/.test(x.title));
        const a=fermentLoadHours(st), b=fermentLoadHours(without);
        if(a===null||b===null||Math.abs(a-b)>1e-9) loadUnchanged=false;
        // Vanlig ovn + stein er hele grunnen til at 45 min ikke er 20.
        const wantsStone = oven!=='pizza' && (type==='napoletana'||type==='newyork');
        if(wantsStone !== /stein/.test(s.desc)) mentionsStone=false;
      }
      Object.assign(S,saved);
      return {present,rightGap,beforeBake,afterTakeout,locIsRoom,dispIsOven,
              loadUnchanged,mentionsStone,...detail};
    }""")
    ok113 = all(r113.get(k) for k in ['present','rightGap','beforeBake','afterTakeout',
                                      'locIsRoom','dispIsOven','loadUnchanged','mentionsStone'])
    results.append(('plan_schedules_oven_preheat_without_moving_yeast', ok113, r113))

    # v0.738: formesteget sto merket «❄️ Kjøleskap», men de 15 minuttene med
    # deling, veiing og runding skjer på benken — kjøleskapet er først der på
    # slutten. Rettet med dispLoc, IKKE med loc: `loc` mater temperaturmodellen,
    # og å flytte den ville endret gjærmengden for alle (se F26 i backloggen).
    # Testen låser begge sider av det valget — riktig merkelapp OG urørt gjær —
    # slik at ingen senere «rydder bort» dispLoc i den tro at loc er nok.
    r114 = page.evaluate("""() => {
      const saved={method:S.method,type:S.type,mel:S.mel,hydro:S.hydro,cold:S.cold,lang:window._lang};
      let labelIsBench=true, locStillFridge=true, yeastUnchanged=true, enToo=true;
      const detail={};
      for(const m of ['standard','poolish','biga']){
        S.method=m; S.type='napoletana'; S.mel=500; S.hydro=65; S.cold=48;
        const yBefore=recipeFor(S).yDry;
        const st=stepsForAnchor(new Date(2020,0,1,18,0));
        const s=st.find(x=>/Form emner|Del i langpanner/.test(x.title));
        if(!s){ labelIsBench=false; continue; }
        // Merkelappen brukeren ser skal si benk, på begge språk.
        window._lang='no';
        if(!/Kj\u00f8kkenbenk/.test(LOC[stepLoc(s)]||'')) { labelIsBench=false; detail[m]=LOC[stepLoc(s)]; }
        window._lang='en';
        if(!/Counter/.test(LOC[stepLoc(s)]||'')) enToo=false;
        window._lang='no';
        // Men fysikken skal være urørt — ellers flytter gjæren seg.
        if(s.loc!=='kjol') locStillFridge=false;
        if(recipeFor(S).yDry!==yBefore) yeastUnchanged=false;
      }
      // Ankerpunktene fra F23 må fortsatt stemme eksakt.
      S.method='standard'; S.type='napoletana'; S.mel=500; S.hydro=65;
      S.cold=24; _q10Memo={k:null,v:null}; const y24=R().yDry;
      S.cold=72; _q10Memo={k:null,v:null}; const y72=R().yDry;
      Object.assign(S,saved); window._lang=saved.lang; _q10Memo={k:null,v:null};
      return {labelIsBench,locStillFridge,yeastUnchanged,enToo,
              anchorsHold:(y24===1.13&&y72===0.56), y24, y72, ...detail};
    }""")
    ok114 = all(r114.get(k) for k in ['labelIsBench','locStillFridge','yeastUnchanged','enToo','anchorsHold'])
    results.append(('forming_step_labelled_counter_but_yeast_untouched', ok114, r114))

    # ===== LAG 1 (v0.739): MASKINELT TESTBARE INVARIANTER OVER HELE MATRISEN =====
    # De tre foregående funnene (vann brukt to ganger i v0.736, forvarming uten
    # tidsluke i v0.737, feil lokasjonsmerkelapp i v0.738) ble alle oppdaget ved å
    # lese planen manuelt. Hver av dem tilhører en KLASSE som kan sjekkes med kode.
    # Testene under sveiper metode × type × ovnstype (60 konfigurasjoner) og
    # håndhever tre egenskaper som må holde for alle:
    #   A  massebalanse — det stegene ber deg måle opp, summerer til oppskriften
    #   B  vaghetslint  — ingen mengdeord uten tall for en ingrediens i oppskriften
    #   C  forvarming   — tidsplanen setter faktisk av tiden ovnen krever
    # De fant to reelle feil ved første kjøring; begge er fikset i samme versjon
    # (se `MATRIX_SWEEP`-funnene i changelog for v0.739).
    MATRIX_SWEEP = """() => {
      const saved={method:S.method,type:S.type,oven:S.oven,mode:S.mode,mel:S.mel,
                   hydro:S.hydro,cold:S.cold,temp:S.temp,fridgeC:S.fridgeC,gjaer:S.gjaer,
                   hurtigH:S.hurtigH,kveldH:S.kveldH,poolishH:S.poolishH,bigaH:S.bigaH};
      const out=[];
      for(const m of ['standard','poolish','biga','mania','hurtig','kveld'])
      for(const t of ['napoletana','newyork','langpanne','chicago','ingenelting'])
      for(const o of ['vanlig','pizza'])
      // v0.752: hydrering var IKKE med i sveipet — alt ble målt på 65 %. Da er
      // en hel akse av matrisen utestet, og en feil som bare slår ut ved tørre
      // eller våte deiger er usynlig for alle tre invariantene. Glideren går
      // 55–80 for alle typer, så endene og midten dekker det nåbare rommet.
      for(const h of [55,65,80]){
        S.method=m; S.type=t; S.oven=o; S.mode='start';
        S.mel=500; S.hydro=h; S.cold=48; S.temp=22; S.fridgeC=3; S.gjaer='torr';
        S.hurtigH=4; S.kveldH=10; S.poolishH=14; S.bigaH=18;
        let steps=null;
        try{ steps=stepsForAnchor(new Date(2027,2,3,10,0)); }catch(e){ out.push({m,t,o,h,err:''+e}); continue; }
        if(!steps||!steps.length){ out.push({m,t,o,h,err:'ingen steg'}); continue; }
        const bake=steps[steps.length-1];
        // Siste steg før steking som handler om ovnen — enten merket dit du går
        // (dispLoc) eller navngitt som forvarming (Hurtigdeig/Ingen elting folder
        // forvarmingen inn i etterhevingssteget sitt).
        let gap=null, phTitle=null;
        for(let i=steps.length-2;i>=0;i--){
          if(steps[i].dispLoc==='ovn' || /forvarm|ovnen/i.test(steps[i].title)){
            gap=Math.round((bake.at-steps[i].at)/60000); phTitle=steps[i].title; break;
          }
        }
        out.push({m,t,o,h, recipe:recipeFor(), preheatMin:preheatMin(), gap, phTitle,
                  // v0.755: stegtekstene ut, så invariant D kan se hva som bare
                  // bor i understegene og aldri kommer med i en kopiert plan.
                  steps:steps.map((s,i)=>({title:s.title, desc:s.desc, why:s.why,
                                       tip:s.tip, substeps:s.substeps||[],
                                       // v0.758: passiv/plassering/varighet ut,
                                       // så invariant F kan finne de LANGE
                                       // hevingene — det er bare der et manglende
                                       // overmodning-tegn koster deg deigen.
                                       passive:!!s.passive, loc:stepLoc(s),
                                       minTilNeste: steps[i+1]
                                         ? Math.round((new Date(steps[i+1].at)-new Date(s.at))/60000)
                                         : 0})),
                  // v0.757: og hele sjekk-panelet, som er der varslene bor.
                  // Å hente det ferdig rendret dekker ALLE varsler på én gang,
                  // i stedet for at testen må kjenne navnet på hver enkelt —
                  // et varsel som legges til senere blir dekket gratis.
                  varsler:(()=>{ try{ window._steps=steps; window._wizStep=3;
                    wizCheckRender();
                    const el=document.getElementById('wiz-check');
                    return el?el.innerText:''; }catch(e){ return ''; } })(),
                  needs:steps.map(s=>s.needs||[]).reduce((a,b)=>a.concat(b),[])});
      }
      Object.assign(S,saved);
      return out;
    }"""
    sweep = page.evaluate(MATRIX_SWEEP)

    # Ordet i teksten, ikke emojien, bestemmer ingrediensen: 🍯 brukes både til
    # oppskriftens sukker og til honningen som vekker gjæren i Hurtigdeig, og de
    # to skal ikke summeres i samme bøtte.
    ING_WORDS = [("mel", "flour"), ("vann", "water"), ("salt", "salt"),
                 ("gjær", "yDry"), ("olje", "oil"), ("smør", "butter"), ("sukker", "sugar")]
    # v0.736-lærdommen: et vagt mengdeord er ikke bare upresist språk — det er
    # stedet en motsigelse kan gjemme seg, fordi det ikke kan summeres og dermed
    # er usynlig for massebalansen. Disse to er bevisste og gjelder mengder som
    # IKKE er en del av oppskriften; alt annet vagt skal feile testen.
    VAGUE_OK = {
        "🫒 litt olje": "smøring av hevebokser — ikke oppskriftens olje",
        "🍯 1 ts honning": "gjærens kickstart i Hurtigdeig — ikke oppskriftens sukker",
    }
    NUM = re.compile(r"^([\d]+(?:[.,]\d+)?)\s*g\b")

    def ing_of(entry):
        """Hvilken oppskrifts-ingrediens en needs-linje gjelder, eller None (utstyr o.l.)."""
        body = entry[1:].strip() if entry and not entry[0].isalnum() else entry
        for word, key in ING_WORDS:
            if word in body.lower():
                return key, body
        return None, body

    # --- A: massebalanse ---
    balance_bad, sweep_errs = [], [d for d in sweep if d.get("err")]
    for d in sweep:
        if d.get("err"):
            continue
        got = {}
        for entry in d["needs"]:
            key, body = ing_of(entry)
            if key is None:
                continue
            mnum = NUM.match(body)
            if mnum:
                got[key] = round(got.get(key, 0.0) + float(mnum.group(1).replace(",", ".")), 2)
        for key in ("flour", "water", "salt", "yDry", "oil", "butter", "sugar"):
            want = d["recipe"].get(key) or 0
            have = got.get(key, 0.0)
            if abs(have - want) > 0.011 and (have or want):
                balance_bad.append(f"{d['m']}/{d['t']}/{d['o']} {key}: steg={have} oppskrift={want}")
    r115 = {"konfigurasjoner": len(sweep), "sveipefeil": sweep_errs, "avvik": balance_bad[:12],
            "avvikTotalt": len(balance_bad)}
    ok115 = not balance_bad and not sweep_errs
    results.append(('invariant_step_amounts_sum_to_recipe_all_configs', ok115, r115))

    # --- B: vaghetslint ---
    vague_bad = set()
    for d in sweep:
        for entry in d.get("needs", []):
            key, body = ing_of(entry)
            if key is None or NUM.match(body) or entry in VAGUE_OK:
                continue
            vague_bad.add(f"{d['m']}/{d['t']}/{d['o']}: {entry!r}")
    r116 = {"nyeVageOppføringer": sorted(vague_bad)[:12], "antall": len(vague_bad),
            "kjentOgTillatt": VAGUE_OK}
    ok116 = not vague_bad
    results.append(('invariant_no_vague_amounts_for_recipe_ingredients', ok116, r116))

    # --- C: forvarming i prosa vs. tid i tidsplanen ---
    # Stekesteget har alltid oppgitt hvor lenge ovnen må varmes. Invarianten er at
    # tidsplanen faktisk setter av den tiden — kravet skal ikke dukke opp i det
    # øyeblikket det er for sent å innfri. Fant Mania og Kveldsdeig, som v0.737
    # antok alt hadde steget.
    preheat_bad = []
    for d in sweep:
        if d.get("err"):
            continue
        if d["gap"] is None:
            preheat_bad.append(f"{d['m']}/{d['t']}/{d['o']}: ingen forvarmingssteg (krever {d['preheatMin']} min)")
        elif d["gap"] < d["preheatMin"]:
            preheat_bad.append(f"{d['m']}/{d['t']}/{d['o']}: {d['gap']} min satt av, {d['preheatMin']} min kreves")
    r117 = {"avvik": preheat_bad[:12], "avvikTotalt": len(preheat_bad),
            "dekning": len([d for d in sweep if d.get("gap") is not None])}
    ok117 = not preheat_bad
    results.append(('invariant_schedule_allows_the_preheat_it_demands', ok117, r117))

    # --- D: ingen fakta som bare bor i understegene ---
    # v0.755: understegene er en OPPDELING av steget — «70g vann totalt» blir
    # til «50g» og «20g». Det er greit. Det som ikke er greit, er et tall som
    # ikke finnes NOEN steder utenfor understegene, for da viser appen noe som
    # ikke kommer med videre: «Kopier tidsplan» og «Del» tar tittel, desc, why
    # og tip — ikke substeps, ikke needs.
    #
    # Funnet som ga invarianten: Mania var den eneste metoden som ikke brukte
    # oD() til stekesteget; den skrev `desc:oN()+'.'`, altså bare «Pizzaovn.».
    # Steketemperatur og steketid lå kun i understegene, og en kopiert
    # Mania-plan manglet derfor steketemperaturen helt — 450°C for napoletana,
    # 350°C for langpanne, 280°C for chicago, i begge ovnstyper. Åtte
    # kombinasjoner.
    #
    # Massebalansen kunne ikke se dette: den summerer GRAM mot oppskriften. En
    # temperatur som forsvinner har ingen sum å bryte.
    NUM_UNIT = re.compile(r"(\d+(?:[.,]\d+)?)\s*(g|°C|min|sek|timer|t)\b")

    def tall_med_enhet(txt):
        return {m.group(1).replace(",", ".") + m.group(2) for m in NUM_UNIT.finditer(str(txt or ""))}

    substep_orphans = []
    for d in sweep:
        if d.get("err"):
            continue
        steps = d.get("steps") or []
        i_kopi = set()
        for st in steps:
            for felt in ("desc", "why", "tip"):
                i_kopi |= tall_med_enhet(st.get(felt))
        for st in steps:
            fra_sub = set()
            for sub in (st.get("substeps") or []):
                fra_sub |= tall_med_enhet(sub)
            tapt = sorted(fra_sub - i_kopi)
            if tapt:
                substep_orphans.append(
                    f"{d['m']}/{d['t']}/{d['o']}/{d['h']}% · {st.get('title')}: {tapt}")
    ok118 = not substep_orphans
    results.append(('invariant_no_facts_live_only_in_substeps', ok118,
                    {'foreldreløse': substep_orphans[:12],
                     'antall': len(substep_orphans)}))

    # --- E: ingen råe flyttall i tekst et menneske skal lese ---
    # v0.757: varselet om mel og gjæringstid skrev «ca. 35.916666666666664
    # timer». totalFermentHours() returnerer et flyttall, og det sto rett i
    # teksten — med punktum og fjorten desimaler.
    #
    # Regelen: mer enn to desimaler i en brukertekst er alltid feil. Gjær
    # oppgis med to (0,48g), alt annet med færre. Et tall med tre eller flere
    # er et regnestykke som har lekket ut, ikke en mengde noen kan måle opp.
    #
    # Sjekken dekker stegtekstene OG hele sjekk-panelet, som er der varslene
    # bor — panelet hentes ferdig rendret, så et varsel som kommer til senere
    # blir dekket uten at testen må kjenne navnet på det.
    RAA_FLYT = re.compile(r"\d+[.,]\d{3,}")

    ugly_numbers = []
    for d in sweep:
        if d.get("err"):
            continue
        biter = [(f"{st.get('title')}.{felt}", st.get(felt))
                 for st in (d.get("steps") or [])
                 for felt in ("desc", "why", "tip")]
        biter += [(f"{st.get('title')}.substep", sub)
                  for st in (d.get("steps") or [])
                  for sub in (st.get("substeps") or [])]
        biter.append(("sjekk-panelet", d.get("varsler")))
        for hvor, txt in biter:
            for m in RAA_FLYT.findall(str(txt or "")):
                ugly_numbers.append(
                    f"{d['m']}/{d['t']}/{d['o']}/{d['h']}% · {hvor}: {m}")
    ok118b = not ugly_numbers
    results.append(('invariant_no_raw_floats_in_user_text', ok118b,
                    {'stygge': sorted(set(ugly_numbers))[:12],
                     'antall': len(ugly_numbers)}))

    # --- F: lange hevinger må si hva FOR LANGT ser ut som ---
    # v0.758: Mania sitt sluttsteg er ti timer ved romtemperatur på ferdig
    # formede emner, etter ti timer kaldt. Der sto det bare «La emnene heve i
    # romtemperatur ved 22°C», og tipset tilbød fire timer EKSTRA som buffer —
    # uten et eneste forbehold. Et emne som har flytt ut kommer ikke tilbake.
    #
    # «Ingen elting» hadde samme hull og verre: femten timer på benken, og
    # steget hadde ikke noe tips i det hele tatt, på noen av språkene. Den
    # deigen har bare ÉN heving, så det finnes ikke noe senere sjekkpunkt å
    # redde seg på.
    #
    # Regelen: en passiv heving på fire timer eller mer må beskrive hvordan for
    # langt fram ser ut. Beskrivelsen av hva som er KLART holder ikke — den
    # forteller deg når du kan gå videre, ikke når toget har gått. Målt: begge
    # hullene ovenfor var de eneste i hele matrisen, på begge språk.
    OVERMODEN = re.compile(
        r"\b(flyt|flat|kollaps|overhev|synker|sunket|slapp|spread|collaps|flatten|sunken|slack)\w*\b"
        r"|for langt|sur smak|skarpt sur|sharply sour|too far", re.I)

    missing_cue = []
    for d in sweep:
        if d.get("err"):
            continue
        for st in (d.get("steps") or []):
            if not st.get("passive"):
                continue
            if st.get("loc") not in ("rom", "kjol"):
                continue
            if (st.get("minTilNeste") or 0) < 240:
                continue
            tekst = " ".join(str(st.get(f) or "") for f in ("desc", "why", "tip"))
            if not OVERMODEN.search(tekst):
                missing_cue.append(
                    f"{d['m']}/{d['t']}/{d['o']}/{d['h']}% · {st.get('title')} "
                    f"({round((st.get('minTilNeste') or 0)/60)}t)")
    ok118c = not missing_cue
    results.append(('invariant_long_rises_say_what_too_far_looks_like', ok118c,
                    {'utenTegn': sorted(set(missing_cue))[:12],
                     'antall': len(missing_cue)}))

    # v0.759: Mania er en AVSKRIFT, ikke en beregning. Kilden er «Lørdagspizza
    # med poolish tilpasset tidsklemma», René Munthe Eik, pizzamani.no,
    # 5. januar 2020. Appen sier selv at gjæren i Mania ikke skal justeres —
    # da må avskriften kunne bevises, ellers er påstanden bare en påstand.
    #
    # En ekstern gjennomgang hevdet at Pizzamani bruker KORTERE sluttid i
    # romtemperatur når emnene først er delt opp, og at våre 10 timer var for
    # mye. Originalteksten sier det motsatte, ordrett: «Deigene skal nå stå i en
    # romtemperatur på 21 grader og heve i 10 timer», pluss «holder seg også
    # fint i romtemperatur i 4 timer». Testen fryser dette, så neste
    # gjennomgang som mener noe annet møter et tall som er etterprøvd.
    KILDE_6 = {  # 6-pizza-kolonnen, ordrett fra oppskriften
        'mel': 934, 'poolishMel': 467, 'poolishVann': 467,
        'poolishYd': 0.52, 'poolishYf': 1.15,
        'vann1': 93, 'vann2': 38, 'salt': 28,
        'hovedYd': 1.07, 'hovedYf': 0.84,
    }
    # 4-pizza-kolonnen. Kildens to kolonner er ikke proporsjonale — hovedgjæren
    # avviker 6,7 % (tørr) og 10,8 % (fersk) — så koeffisientene kan bare treffe
    # den ene. De er kalibrert på 6-pizza. Avvikene under er derfor KJENTE og
    # fryses her, slik at de ikke kan vokse ubemerket.
    KILDE_4 = {
        'mel': 622, 'poolishMel': 311, 'poolishVann': 311,
        'poolishYd': 0.35, 'poolishYf': 0.77,
        'vann1': 62, 'vann2': 25,
    }
    KJENT_AVVIK_4 = {'salt': (18.7, 19), 'hovedYd': (0.71, 0.76), 'hovedYf': (0.56, 0.62)}
    # Fasevarighetene i minutter, lest ut av tilberedelses-teksten.
    KILDE_FASER = {'POOLISH': 720, 'CHILL': 120, 'RISE1': 30,
                   'ROOM1': 75, 'COLDBULK': 600, 'FINAL': 600}

    r130 = page.evaluate("""(mel) => {
      const saved={...S};
      const ut={};
      for(const m of mel){
        S.method='mania'; S.type='napoletana'; S.mel=m; S.oven='pizza';
        S.temp=21; S.fridgeC=4; S.gjaer='torr'; S.mode='start';
        S.gjaertest=false; _q10Memo={k:null,v:null};
        ut[m]=maniaRecipe(m);
      }
      ut.faser={...MANIA_T};
      Object.assign(S,saved); _q10Memo={k:null,v:null};
      return ut;
    }""", [622, 934])

    avvik = []
    for felt, fasit in KILDE_6.items():
        if felt == 'mel':
            continue
        fikk = r130['934'].get(felt)
        if abs(fikk - fasit) > 1e-9:
            avvik.append(f"6-pizza {felt}: {fikk} ≠ kilden {fasit}")
    for felt, fasit in KILDE_4.items():
        if felt == 'mel':
            continue
        fikk = r130['622'].get(felt)
        if abs(fikk - fasit) > 1e-9:
            avvik.append(f"4-pizza {felt}: {fikk} ≠ kilden {fasit}")
    for felt, (vårt, kildens) in KJENT_AVVIK_4.items():
        fikk = r130['622'].get(felt)
        if abs(fikk - vårt) > 1e-9:
            avvik.append(f"4-pizza {felt}: {fikk} — kjent avvik var {vårt} (kilden: {kildens})")
    for fase, minutter in KILDE_FASER.items():
        if r130['faser'].get(fase) != minutter:
            avvik.append(f"fase {fase}: {r130['faser'].get(fase)} min ≠ kilden {minutter} min")
    ok130 = not avvik
    results.append(('mania_matches_the_published_source_exactly', ok130,
                    {'avvik': avvik, 'faser': r130['faser']}))

    # v0.760: en gjennomgang fant en ÅRSAKSPÅSTAND som appens egne tall motsier.
    # Benketid-steget i Kveldsdeig begrunnet den korte tempereringen med at
    # «emnene ikke har vært kalde like lenge». Et emne på 280g er gjennomkaldt
    # etter to–tre timer; etter 18 timer er det nøyaktig like kaldt som ett som
    # har stått i 48. Hvor lenge det har vært kaldt sier ingenting om hvor kaldt
    # det ER.
    #
    # Tallene motsier påstanden på to måter, og begge fryses her:
    #  - Kveldsdeig 24t og Langtidsdeig 48t har IDENTISK gjærmengde, men 120 mot
    #    240 minutters benketid. Kulden kan ikke være forklaringen, og
    #    gjærmengden heller ikke.
    #  - INNAD i Kveldsdeig gir lengre kaldtid LENGRE temperering (90 → 120 min),
    #    stikk motsatt av «kortere fordi mindre kaldt».
    #
    # Massebalanse og vaghetslint kan ikke se dette: en gal begrunnelse har
    # ingen sum å bryte og inneholder ingen vage mengdeord. Eneste måte å fange
    # den på er å teste påstanden mot tallene den handler om.
    r131 = page.evaluate("""() => {
      const saved={...S};
      window._lang='no'; window._planChosen=true; setLayout('mob');
      const base=()=>{ S.type='napoletana'; S.mel=500; S.hydro=65; S.temp=22;
        S.fridgeC=3; S.oven='pizza'; S.gjaer='torr'; S.mode='start';
        S.gjaertest=false; _q10Memo={k:null,v:null}; };
      const tempOf=kh=>{ base(); S.method='kveld'; S.kveldH=kh; _q10Memo={k:null,v:null};
        const st=stepsForAnchor(new Date(2027,2,3,10,0));
        const t=st.find(x=>x.title==='Ta ut og temperer');
        return {min:t?t.dur:null, gjaer:recipeFor().yDry, why:t?t.why:''}; };
      const k15=tempOf(15), k18=tempOf(18), k24=tempOf(24);
      base(); S.method='standard'; S.cold=48; _q10Memo={k:null,v:null};
      const std48={gjaer:recipeFor().yDry, temper:Math.round(rtM(240))};

      // Retningen som drepte påstanden: lengre kaldt → LENGRE benketid.
      const lengreKaldtGirLengre = k18.min > k15.min && k24.min >= k18.min;
      // Samme gjær, halve benketida — gjærmengden er heller ingen forklaring.
      const sammeGjaerUlikBenketid =
        Math.abs(k24.gjaer-std48.gjaer) < 1e-9 && std48.temper > k24.min * 1.5;
      // Begrunnelsen skal ikke lenger påstå at emnene er mindre kalde.
      const ingenKuldepaastand = !/ikke har vært (kaldt|kalde) like lenge/.test(k18.why)
                              && !/hasn't been cold as long/.test(k18.why);
      // Den skal si hva som FAKTISK styrer lengden, og gi leseren en regel.
      const harEkteGrunn = /bygget rundt å bake dagen etter/.test(k18.why);
      const harRegel = /gå etter emnet og ikke klokka/.test(k18.why);

      Object.assign(S,saved); _q10Memo={k:null,v:null};
      return {lengreKaldtGirLengre, sammeGjaerUlikBenketid, ingenKuldepaastand,
              harEkteGrunn, harRegel,
              tall:{k15:k15.min, k18:k18.min, k24:k24.min,
                    kveld24Gjaer:k24.gjaer, std48Gjaer:std48.gjaer, std48Temper:std48.temper}};
    }""")
    ok131 = all(r131.get(k) for k in
                ['lengreKaldtGirLengre', 'sammeGjaerUlikBenketid', 'ingenKuldepaastand',
                 'harEkteGrunn', 'harRegel'])
    results.append(('bench_rest_reason_matches_the_numbers', ok131, r131))

    # v0.741 (F24): gjærtesten. F24 kunne ikke avgjøres ved tastaturet — den
    # krever bakst — så appen har fått en utfordrer man kan slå på og bake mot.
    # Fem ting må holde, og den første er den viktigste:
    #  1) AV SOM STANDARD. En eksisterende bruker skal ikke merke at funksjonen
    #     finnes før hen slår den på. Ryker denne, har vi endret gjærmengden til
    #     alle uten å spørre — nøyaktig det F24 sa vi ikke kunne gjøre.
    #  2) Den treffer de tre metodene som fortsatt bruker tabellene, og BARE dem.
    #     Lista leses fra METHODS (F21), ikke fra en hardkodet kopi her.
    #  3) Begge tallene vises. En test som bare viser det nye tallet er ikke en
    #     test, det er en endring — da kan man ikke vurdere resultatet etterpå.
    #  4) Stegene og oppskriften viser SAMME gjær (F17-kontrakten må overleve).
    #  5) Valget lagres med deigen, ellers vet man ikke hvilken gjærmengde
    #     terningkastet i Deiger-fanen faktisk gjelder — og da er forsøket verdiløst.
    r119 = page.evaluate("""() => {
      const saved={...S};
      const sett=m=>{ S.method=m; S.type='napoletana'; S.mel=500; S.hydro=65; S.temp=22;
        S.fridgeC=3; S.cold=24; S.poolishH=14; S.poolishCold=false; S.poolishPauseH=0;
        S.bigaH=18; S.kveldH=10; S.hurtigH=4; S.gjaer='torr'; S.oven='vanlig'; S.mode='start';
        _q10Memo={k:null,v:null}; };

      const standardAv = DEF.gjaertest===false;
      const lagresMedDeig = SETUP_FIELDS.includes('gjaertest');

      // Registeret bestemmer hvem som kan utfordres — ingen liste duplisert her.
      const kanUtfordres = Object.keys(METHODS).filter(methodAllowsYeastTest).sort();
      const forventet = ['biga','kveld','poolish'];
      const registerStemmer = JSON.stringify(kanUtfordres)===JSON.stringify(forventet);

      const ut={};
      for(const m of ['standard','poolish','biga','kveld','mania','hurtig']){
        sett(m); S.gjaertest=false; const av=recipeFor().yDry;
        sett(m); S.gjaertest=true;  const paa=recipeFor().yDry;
        const rad=baseIngredientRows({mel:500,vann:325,hydro:65,salt:14,oil:0,butter:0,
                                      sugar:0,gjaer:paa+'g'}).filter(r=>r.k==='Gjærtest');
        ut[m]={av,paa,endret:av!==paa,harRad:rad.length===1,
               radTekst:rad.length?rad[0].v:null};
      }
      // De tre skal endre seg OG ha sammenligningsrad; de tre andre ingen av delene.
      const endrerRiktige = forventet.every(m=>ut[m].endret && ut[m].harRad)
                         && ['standard','mania','hurtig'].every(m=>!ut[m].endret && !ut[m].harRad);
      // Raden må oppgi det gamle tallet, ikke bare en prosent uten referanse.
      const radViserBegge = forventet.every(m=>ut[m].radTekst && ut[m].radTekst.includes(String(ut[m].av)));
      // Retningen: poolish/biga ned, kveld opp. Går en av dem feil vei, er noe galt
      // i koblingen — kveld regnes et annet sted enn de to andre.
      const retning = ut.poolish.paa<ut.poolish.av && ut.biga.paa<ut.biga.av && ut.kveld.paa>ut.kveld.av;

      // F17: stegene må vise samme gjær som oppskriften, også med testen på.
      let stegStemmer=true;
      for(const m of forventet){
        sett(m); S.gjaertest=true;
        const rec=recipeFor();
        const st=stepsForAnchor(new Date(2027,2,3,10,0));
        const alle=st.map(s=>(s.needs||[]).join(' ')+' '+(s.desc||'')).join(' ');
        if(!alle.includes(String(rec.yDry))) stegStemmer=false;
      }

      // Kopien må si fra at testen er på — ellers måler både et menneske og
      // DEL 2 i sjekk-instruksjonen 0,48g mot vanlige poolish-mengder og melder
      // et bevisst valg som feil.
      // v0.754: men den skal oppgi ÉN mengde. Før sto «Gjærtest (beta): PÅ —
      // Poolish gir normalt 1.13g (−58%)» på egen linje: to tall for én
      // ingrediens, og leseren måtte selv finne ut hvilket som gjaldt.
      // Sammenligningen hører hjemme i appen, der forsøket kjøres, ikke i en
      // oppskrift man sender videre.
      sett('poolish'); S.gjaertest=true;
      let fanget='';
      try{ if(!navigator.clipboard) Object.defineProperty(navigator,'clipboard',{value:{},configurable:true});
           navigator.clipboard.writeText=t=>{fanget=t;return Promise.resolve();}; }catch(e){}
      try{ copyP(stepsForAnchor(new Date(2027,2,3,10,0))); }catch(e){ fanget='ERR:'+e; }
      const kopiSierFra = /forsøksmengde — gjærtest på/.test(fanget);
      // v0.761: og HVOR MYE. Uten størrelsen leste en ekstern gjennomgang
      // forsøkstallet som oppskriftens normale mengde og begrunnet det bort.
      // Ett tall og én retning — ikke to mengder å velge mellom.
      const kopiSierHvorMye = /gjærtest på, [+−-]?\d+% mot vanlig/.test(fanget);
      // Og den gamle sammenligningen skal være borte: ingen «normalt», ingen
      // prosent, ingen alternativ gjærmengde noe sted i kopien.
      const kopiHarBareEttTall = !/Gjærtest \\(beta\\)/.test(fanget)
                              && !/1\\.13g/.test(fanget)
                              && /0\\.48g/.test(fanget);
      // Og den må TIE når testen er av.
      sett('poolish'); S.gjaertest=false; fanget='';
      try{ copyP(stepsForAnchor(new Date(2027,2,3,10,0))); }catch(e){}
      const kopiTierNårAv = !/gjærtest|forsøksmengde/i.test(fanget);

      Object.assign(S,saved); _q10Memo={k:null,v:null};
      return {standardAv,lagresMedDeig,registerStemmer,endrerRiktige,radViserBegge,
              retning,stegStemmer,kopiSierFra,kopiSierHvorMye,kopiHarBareEttTall,kopiTierNårAv,
              kanUtfordres,detaljer:ut};
    }""")
    ok119 = all(r119.get(k) for k in [
        'standardAv', 'lagresMedDeig', 'registerStemmer', 'endrerRiktige', 'radViserBegge',
        'retning', 'stegStemmer', 'kopiSierFra', 'kopiSierHvorMye', 'kopiHarBareEttTall',
        'kopiTierNårAv'])
    results.append(('yeast_test_challenges_three_methods_off_by_default', ok119, r119))

    # v0.742: fem funn fra en gjennomgang av en generert plan (200g mel,
    # napoletansk, Langtidsdeig, pizzaovn). Alle fem er motsigelser mellom to
    # steder i samme plan — nøyaktig klassen lag 3 er bygget for å finne.
    #  1) flourForCount(1) svarte 200g mel, som gir et emne på 336g — 24% over de
    #     270g funksjonen selv regner ut fra. Gulvet på 200 overstyrte målvekten.
    #  2) Rundingen av antall emner ga sagtann fra −19% til +49% uten at planen
    #     sa fra. Den kan ikke fjernes (antallet MÅ være helt), men den kan opplyses.
    #  3) Romhevingen ba deg windowpane-teste midt i hevingen, mens steget over sa
    #     windowpane er sluttpunktet for eltingen — og de tre andre metodene brukte
    #     fingertrykk-testen på samme fase.
    #  4) Forvarmingssteget og stekesteget hadde ORDRETT samme tips, og for
    #     napoletansk ba stekesteget deg forvarme 20 minutter etter at du gjorde det.
    #  5) Forvarmingens «hvorfor» snakket om pizzastein også når beskrivelsen
    #     bevisst lot være (pizzaovn har dekke, ikke løs stein).
    r120 = page.evaluate("""() => {
      const saved={...S};
      const sett=(mel,ovn)=>{ S.type='napoletana'; S.method='standard'; S.mel=mel;
        S.hydro=65; S.cold=24; S.temp=22; S.fridgeC=3; S.oven=ovn; S.gjaer='torr';
        S.mode='start'; S.kjokkenmaskin='manuell'; S.gjaertest=false;
        _q10Memo={k:null,v:null}; };

      // 1) Appens egen anbefaling må treffe sin egen målvekt, for hver type.
      let anbefalingTreffer=true;
      for(const t of ['napoletana','newyork','langpanne','chicago']){
        S.type=t; S.hydro=65;
        for(const n of [1,2,3]){
          const før=S.mel; S.mel=flourForCount(n); _q10Memo={k:null,v:null};
          const p=pc(), mål=targetBallWeight();
          if(Math.abs(p.perPizza/mål-1)>0.12) anbefalingTreffer=false;
          S.mel=før;
        }
      }
      // Gulvet skal ikke lenger løfte n=1 over målvekten.
      S.type='napoletana'; S.hydro=65;
      const melFor1 = flourForCount(1);

      // 2) Varselet: sier fra ved 200g, tier ved 160g og 500g.
      sett(200,'pizza'); const v200=ballWeightNote();
      sett(160,'pizza'); const v160=ballWeightNote();
      sett(500,'pizza'); const v500=ballWeightNote();
      const varselStemmer = v200 && v200.pst===24 && v200.forslag===160
                         && v160===null && v500===null;
      // Forslaget må faktisk treffe når man følger det.
      sett(v200?v200.forslag:160,'pizza');
      const forslagTreffer = ballWeightNote()===null;

      // 3–5) Tekstene i den ekte stegkjeden.
      const les=(mel,ovn)=>{ sett(mel,ovn);
        const st=stepsForAnchor(new Date(2026,7,7,8,24));
        const f=t=>st.find(s=>s.title.includes(t))||{};
        return {heving:f('Romtemperaturheving').tip||'', forvarmTip:f('Sett på ovnen').tip||'',
                forvarmWhy:f('Sett på ovnen').why||'', stek:f('Strekk og stek').tip||''}; };
      const pizzaOvn=les(200,'pizza'), vanligOvn=les(200,'vanlig');

      // 3) Ingen windowpane i hevesteget, og samme tips som de andre metodene.
      const ingenWindowpaneIHeving = !/windowpane/i.test(pizzaOvn.heving);
      const sammeSomAndreMetoder = pizzaOvn.heving===TIP.roomRise;

      // 4) Nabostegene må ikke være ordrett like, og stekesteget skal ikke be deg
      //    forvarme — det er gjort for lengst når du står der.
      const ikkeIdentiske = pizzaOvn.forvarmTip!==pizzaOvn.stek
                         && vanligOvn.forvarmTip!==vanligOvn.stek;
      const stekTierOmForvarming = !/forvarm|preheat/i.test(pizzaOvn.stek)
                                && !/forvarm|preheat/i.test(vanligOvn.stek);

      // 5) Stein nevnes bare når det ER en stein (vanlig ovn + napoletansk/NY).
      const steinBareNårDenFinnes = !/stein/i.test(pizzaOvn.forvarmWhy)
                                 && /stein/i.test(vanligOvn.forvarmWhy);
      // Og pizzaovn-brukeren skal ikke få råd om en ovnstermostat den ikke har.
      const ingenTermostatIPizzaovn = !/termostat/i.test(pizzaOvn.forvarmTip);

      Object.assign(S,saved); _q10Memo={k:null,v:null};
      return {anbefalingTreffer, melFor1, gulvSenket:melFor1===160,
              varselStemmer, forslagTreffer, ingenWindowpaneIHeving, sammeSomAndreMetoder,
              ikkeIdentiske, stekTierOmForvarming, steinBareNårDenFinnes,
              ingenTermostatIPizzaovn, v200};
    }""")
    ok120 = all(r120.get(k) for k in [
        'anbefalingTreffer', 'gulvSenket', 'varselStemmer', 'forslagTreffer',
        'ingenWindowpaneIHeving', 'sammeSomAndreMetoder', 'ikkeIdentiske',
        'stekTierOmForvarming', 'steinBareNårDenFinnes', 'ingenTermostatIPizzaovn'])
    results.append(('plan_review_findings_ball_weight_and_duplicate_tips', ok120, r120))

    # v0.743: to funn til fra en ekstern gjennomgang av en Kveldsdeig-plan.
    #  1) Appen har alltid vært nøye med selve tellingen («Del i 1 emne à ca. 269g»)
    #     og så fortsatt i flertall i alt rundt: «La emnene stå urørt», «Ikke åpne
    #     boksene», «Ikke stable boksene tett i høyden» — det siste rent meningsløst
    #     med én boks. Det ble mer synlig med v0.742, som gjorde én pizza til det
    #     vanlige tilfellet (flourForCount(1) svarer nå 160g).
    #  2) Kveldsdeigens «hvorfor» sa «Kortere enn standardmetodens 4 timer». Det var
    #     riktig helt til F14 (v0.720) gjorde standardmetodens benketid
    #     temperaturavhengig: 6,4t ved 18°C, 2t ved 28°C. Tallet stemte da bare ved
    #     nøyaktig 22°C — samme klasse som forvarmingsfeilen i v0.737, der et tall i
    #     prosa ikke kom fra funksjonen tidsplanen faktisk bruker.
    r121 = page.evaluate("""() => {
      const saved={...S};
      // Flertallsord som BARE gir mening om det er flere emner. «de» og «dem» er
      // utelatt med vilje — «de 10g vannet du holdt av» er bestemt artikkel, ikke
      // flertall, og ville gitt falske treff.
      const FLERTALL=/\\b(emnene|boksene|deigemnene|the balls|the containers|the boxes)\\b/i;
      const funn=[];
      for(const m of ['standard','poolish','biga','mania','hurtig','kveld'])
      for(const lang of ['no','en']){
        window._lang=lang;
        S.method=m; S.type='napoletana'; S.mel=160; S.hydro=65; S.cold=24;
        S.temp=22; S.fridgeC=3; S.oven='pizza'; S.gjaer='torr'; S.mode='start';
        S.kveldH=10; S.hurtigH=4; S.poolishH=14; S.bigaH=18; S.gjaertest=false;
        _q10Memo={k:null,v:null};
        let st=null; try{ st=stepsForAnchor(new Date(2026,7,7,10,0)); }catch(e){ continue; }
        if(pc().count!==1) { funn.push(`${m}: forventet 1 emne, fikk ${pc().count}`); continue; }
        for(const s of st){
          for(const [felt,txt] of [['desc',s.desc||''],['tip',s.tip||''],['why',s.why||''],
                                   ['substeps',(s.substeps||[]).join(' | ')],
                                   ['needs',(s.needs||[]).join(' | ')]]){
            const t=FLERTALL.exec(txt);
            if(t) funn.push(`${m}/${lang} · ${s.title} · ${felt}: «${t[1]}»`);
          }
        }
      }
      window._lang='no';

      // Med FLERE emner skal flertallsformen fortsatt brukes — ellers har vi bare
      // byttet den ene feilen mot den motsatte.
      S.method='standard'; S.mel=500; _q10Memo={k:null,v:null};
      const flere=stepsForAnchor(new Date(2026,7,7,10,0));
      const antallFlere=pc().count;
      const brukerFlertall=flere.some(s=>FLERTALL.test((s.desc||'')+(s.tip||'')));

      // 2) «standardmetodens ca. X» må følge rtM(240) ved enhver romtemperatur.
      const tider=[];
      for(const temp of [18,22,28]){
        S.method='kveld'; S.type='napoletana'; S.mel=500; S.kveldH=10; S.temp=temp;
        S.cold=24; S.fridgeC=3; S.oven='pizza'; S.mode='start'; _q10Memo={k:null,v:null};
        const st=stepsForAnchor(new Date(2026,7,7,10,0));
        const why=(st.find(s=>s.title.includes('Ta ut og temperer'))||{}).why||'';
        // Standardmetodens FAKTISKE benketid ved samme romtemperatur.
        S.method='standard'; _q10Memo={k:null,v:null};
        const s2=stepsForAnchor(new Date(2026,7,7,10,0));
        const ut=s2.find(x=>x.title.includes('Ta ut av kjøleskap'));
        const stek=s2[s2.length-1];
        const faktisk=Math.round((stek.at-ut.at)/60000);
        tider.push({temp, why, faktisk, nevner:why.includes(fmtDur(faktisk)),
                    harGammeltTall:/standardmetodens 4 timer/.test(why)});
      }
      const tallFølgerFunksjonen = tider.every(t=>t.nevner && !t.harGammeltTall);

      Object.assign(S,saved); window._lang='no'; _q10Memo={k:null,v:null};
      return {ingenFlertallVedEtt:funn.length===0, funn:funn.slice(0,10),
              antallFlere, brukerFlertall, tallFølgerFunksjonen,
              tider:tider.map(t=>({temp:t.temp,faktisk:t.faktisk,nevner:t.nevner}))};
    }""")
    ok121 = all(r121.get(k) for k in
                ['ingenFlertallVedEtt', 'brukerFlertall', 'tallFølgerFunksjonen'])
    results.append(('step_texts_match_ball_count_and_cite_real_bench_time', ok121, r121))

    # v0.744: tre funn til fra en ekstern gjennomgang, denne gang av en
    # New York-plan (160g mel, 63% hydrering, Kveldsdeig 24t, pizzaovn).
    #  1) Gjæren sto UTENFOR deigvekta for alle metoder unntatt Mania, så
    #     ingredienslista summerte ikke til emnevekten planen selv oppga
    #     (160+101+3,2+3+0,32 = 267,52, appen skrev 267).
    #  2) Kveldsdeigens «hvorfor» sa «Kald heving over 5–15 timer» mens KOPTS
    #     tilbyr opptil 24 — velger du 24t motsa forklaringen sin egen overskrift.
    #  3) New York i pizzaovn begrunnet temperaturtaket med «sukkeret i deigen».
    #     v0.724 fjernet nettopp sukkeret for pizzaovn, så teksten viste til en
    #     ingrediens oppskriften ikke inneholder — og taket på 350°C motsa tipset
    #     rett under, som ber deg justere opp mot 350–370°C.
    r122 = page.evaluate("""() => {
      const saved={...S};
      const sett=(t,m,mel,ovn,extra)=>{ S.type=t; S.method=m; S.mel=mel; S.hydro=63;
        S.cold=24; S.temp=22; S.fridgeC=3; S.oven=ovn; S.gjaer='torr'; S.mode='start';
        S.kveldH=10; S.hurtigH=4; S.poolishH=14; S.bigaH=18; S.gjaertest=false;
        Object.assign(S, extra||{}); _q10Memo={k:null,v:null}; };

      // 1) Emnevekten må være summen av det ingredienslista faktisk oppgir,
      //    for HVER metode — ikke bare for Mania, som alltid har talt gjæren med.
      const vektAvvik=[];
      for(const t of ['napoletana','newyork','langpanne','chicago'])
      for(const m of ['standard','poolish','biga','kveld','hurtig','mania'])
      for(const mel of [160,200,500,800]){
        sett(t,m,mel,'vanlig');
        const r=recipeFor(), p=pc();
        // Mania har sin egen oppskrift; sammenlign mot recipeFor uansett, som er
        // den ENE ingredienskilden alle flater leser (F17).
        const sum=r.flour+r.water+r.salt+(r.oil||0)+(r.butter||0)+(r.sugar||0)+(r.yDry||0);
        if(Math.abs(p.totalDough-Math.round(sum))>0)
          vektAvvik.push(`${t}/${m}/${mel}: deigvekt ${p.totalDough} mot sum ${Math.round(sum)}`);
      }

      // 2) Kveldsdeigens forklaring må oppgi den valgte kjøletida, ikke et fast spenn.
      const kveldAvvik=[];
      for(const kh of KOPTS.map(o=>o.h)){
        sett('napoletana','kveld',500,'vanlig',{kveldH:kh});
        const st=stepsForAnchor(new Date(2026,7,7,10,0));
        const s=st.find(x=>x.title.includes('Kjøleskapsheving'))||{};
        const why=s.why||'';
        if(!why.includes(String(kh))) kveldAvvik.push(`${kh}t: «${why.slice(0,60)}»`);
        if(/5–15 timer/.test(why)) kveldAvvik.push(`${kh}t: fast spenn står igjen`);
      }

      // 3) Ingen steketekst får vise til sukker når oppskriften ikke har noe —
      //    og beskrivelsen må ikke sette et tak tipset rett under bryter.
      const sukkerAvvik=[], takAvvik=[];
      for(const t of ['napoletana','newyork','langpanne','chicago'])
      for(const ovn of ['vanlig','pizza']){
        sett(t,'standard',500,ovn);
        const r=recipeFor();
        const st=stepsForAnchor(new Date(2026,7,7,10,0));
        const stek=st[st.length-1];
        const tekst=(stek.desc||'')+' '+(stek.tip||'');
        if(!r.sugar && /sukker|sugar/i.test(tekst))
          sukkerAvvik.push(`${t}/${ovn}: nevner sukker, oppskriften har ${r.sugar}g`);
        // Et «kan brenne over N°C» i desc må ikke stå mot en anbefaling om å gå
        // høyere enn N i tipset.
        const tak=/over (\\d{3})°C/.exec(stek.desc||'');
        if(tak){
          const grense=Number(tak[1]);
          const anbefalt=[...(stek.tip||'').matchAll(/(\\d{3})[–-](\\d{3})°C/g)].map(x=>Number(x[2]));
          if(anbefalt.some(a=>a>grense))
            takAvvik.push(`${t}/${ovn}: desc sier maks ${grense}, tips anbefaler ${Math.max(...anbefalt)}`);
        }
      }

      Object.assign(S,saved); _q10Memo={k:null,v:null};
      return {vektStemmer:vektAvvik.length===0, vektAvvik:vektAvvik.slice(0,6),
              kveldStemmer:kveldAvvik.length===0, kveldAvvik:kveldAvvik.slice(0,6),
              ingenFalsktSukker:sukkerAvvik.length===0, sukkerAvvik,
              ingenSelvmotsigendeTak:takAvvik.length===0, takAvvik};
    }""")
    ok122 = all(r122.get(k) for k in
                ['vektStemmer', 'kveldStemmer', 'ingenFalsktSukker', 'ingenSelvmotsigendeTak'])
    results.append(('dough_weight_sums_and_oven_text_matches_recipe', ok122, r122))

    # v0.745: gjærtesten var usynlig utenfor Mer-fanen. Bryteren står der, men
    # gjærmengden endres i Tidsplan og Planlegging — og der sto det bare «0.48g
    # tørrgjær», som leses som et helt vanlig tall. En glemt test er dermed en
    # STILLE feil: appen gir deg 58% mindre gjær og sier ikke fra. Samme
    # resonnement som pizzatid-banneret, og samme krav:
    #  - merket vises der virkningen er (begge faner), ikke bare der bryteren er
    #  - det oppgir BEGGE tallene, ellers vet du ikke hva du sammenligner med
    #  - det har veien ut
    #  - og det maser IKKE i en metode testen ikke rører
    r123 = page.evaluate("""() => {
      const saved={...S};
      window._planChosen=true; setLayout('mob');
      const sett=(m,på)=>{ S.method=m; S.type='napoletana'; S.mel=500; S.hydro=65;
        S.cold=24; S.temp=22; S.fridgeC=3; S.oven='pizza'; S.gjaer='torr';
        S.mode='start'; S.gjaertest=på; _q10Memo={k:null,v:null}; };
      const synlig=fane=>{
        mobShowTab(fane);
        const el=document.getElementById('mob-'+fane);
        if(!el) return '';
        return [...el.querySelectorAll('.js-gjaertest-banner')]
                 .filter(n=>n.offsetParent!==null).map(n=>n.textContent).join(' ');
      };
      // Testen PÅ og metoden berøres → merke i begge faner, med begge tall.
      sett('poolish',true);
      const plan=synlig('plan'), wiz=synlig('settings');
      const nå=recipeFor().yDry;
      const før=recipeWithoutGjaertest().yDry;
      const beggeTall = t=>t.includes(String(nå)) && t.includes(String(før));
      const påBeggeFaner = beggeTall(plan) && beggeTall(wiz);
      const harVeiUt = /Slå av|Turn off/.test(plan) && /Slå av|Turn off/.test(wiz);

      // Testen AV → ingen merker noe sted.
      sett('poolish',false);
      const avPlan=synlig('plan'), avWiz=synlig('settings');
      const tierNårAv = avPlan.trim()==='' && avWiz.trim()==='';

      // Testen PÅ, men Langtidsdeig rører den ikke → heller ingen merker.
      // Et merke som står og maser der ingenting er endret, lærer folk å overse det.
      sett('standard',true);
      const stdPlan=synlig('plan'), stdWiz=synlig('settings');
      const tierNårUberørt = stdPlan.trim()==='' && stdWiz.trim()==='';

      // v0.748: statuslinja i Mer-panelet svarer på det SAMME spørsmålet i alle
      // metoder — «hva er gjæren min nå?» — i stedet for å melde fra om at det
      // ikke skjedde noe. «Ingen endring akkurat nå» var skrevet fra kodens
      // synsvinkel: en verdi ble ikke endret. Den som nettopp huket av en boks
      // har ikke noe «før» i hodet, og lurer bare på om bryteren gjør noe.
      const panel=()=>{ mobShowTab('tips'); renderGjaertest();
        const el=document.getElementById('mob-gjaertest-wrap');
        return el?el.innerText:''; };
      const status={};
      for(const m of ['standard','mania','hurtig','poolish','biga','kveld']){
        sett(m,true);
        const txt=panel(), tall=recipeFor().yDry;
        status[m]={tall, viserTallet:txt.includes(String(tall))};
      }
      const viserAlltidGjæren=Object.keys(status).every(m=>status[m].viserTallet);

      // Etiketten må ramse opp metodene testen GJELDER. Det er den som gjør at
      // ingen boks trenger å forklare hvorfor det ikke skjedde noe i de andre:
      // står du i Langtidsdeig og etiketten sier Poolish, Biga og Kveldsdeig,
      // så har du allerede svaret.
      sett('standard',true);
      const etikett=panel();
      const nevnerDeTre=Object.keys(METHODS).filter(methodAllowsYeastTest)
        .every(m=>etikett.includes(mN(m)));

      // Ingen elting er det ene hullet etiketten IKKE kan tette: den sier at
      // Poolish er med, men testen virker likevel ikke. Den ene ekte
      // overraskelsen — og den eneste som fortsatt fortjener en begrunnelse.
      sett('poolish',true); S.type='ingenelting'; _q10Memo={k:null,v:null};
      const ieTxt=panel();
      const forklarerIngenElting=/Ingen elting har fast|No-knead has a fixed/.test(ieTxt);

      Object.assign(S,saved); _q10Memo={k:null,v:null};
      try{ mobShowTab('plan'); }catch(e){}
      return {påBeggeFaner, harVeiUt, tierNårAv, tierNårUberørt,
              viserAlltidGjæren, nevnerDeTre, forklarerIngenElting, status,
              nå, før, planTekst:plan.trim().slice(0,90)};
    }""")
    ok123 = all(r123.get(k) for k in
                ['påBeggeFaner', 'harVeiUt', 'tierNårAv', 'tierNårUberørt',
                 'viserAlltidGjæren', 'nevnerDeTre', 'forklarerIngenElting'])
    results.append(('yeast_test_is_visible_where_it_changes_the_yeast', ok123, r123))

    # v0.746: «Start ny deig» slo av gjærtesten i det stille. doReset() gjør
    # Object.assign(S,DEF) OG sletter pizzaSetup, så både gjaertest og favMethod
    # forsvant permanent. For gjærtesten var det direkte ødeleggende: hele poenget
    # er å bake flere deiger med samme innstilling og sammenligne terningkastene —
    # stiller bakst nr. 2 seg tilbake, er den ikke lenger et testbakst, og
    # sammenligningen er verdiløs uten at noe har sagt fra.
    # Deigfeltene skal derimot FORTSATT nullstilles; det er hele poenget med knappen.
    r124 = page.evaluate("""() => {
      const saved={...S};
      const lagret=localStorage.getItem('pizzaPrefs');
      window._planChosen=true; setLayout('mob');

      // Sett preferansene, og gjør deigfeltene tydelig ulike DEF.
      S.gjaertest=true; S.favMethod='poolish'; savePrefs();
      S.mel=800; S.hydro=72; S.type='newyork'; S.method='biga'; S.cold=72;
      _q10Memo={k:null,v:null};

      doReset();

      const prefOverlevde = S.gjaertest===true && S.favMethod==='poolish';
      // Deigen SKAL være nullstilt — knappen ville vært meningsløs ellers.
      const deigNullstilt = ['mel','hydro','type','method','cold']
        .every(k=>S[k]===DEF[k]);
      // Og preferansen må ligge i sin egen nøkkel, ikke bare i minnet — det er
      // den som overlever en reload, siden doReset sletter pizzaSetup.
      let iEgenNokkel=false;
      try{ const p=JSON.parse(localStorage.getItem('pizzaPrefs'));
           iEgenNokkel = p && p.gjaertest===true && p.favMethod==='poolish'; }catch(e){}

      // Av skal også overleve: slår du testen AV, skal den ikke komme tilbake.
      S.gjaertest=false; savePrefs(); S.mel=800; doReset();
      const avOverlevdeOgsa = S.gjaertest===false && S.mel===DEF.mel;

      Object.assign(S,saved); _q10Memo={k:null,v:null};
      if(lagret===null) localStorage.removeItem('pizzaPrefs');
      else localStorage.setItem('pizzaPrefs',lagret);
      return {prefOverlevde, deigNullstilt, iEgenNokkel, avOverlevdeOgsa};
    }""")
    ok124 = all(r124.get(k) for k in
                ['prefOverlevde', 'deigNullstilt', 'iEgenNokkel', 'avOverlevdeOgsa'])
    results.append(('new_dough_resets_the_dough_but_keeps_preferences', ok124, r124))

    # v0.749: instruksjonen copyP() legger foran planen. Begge de eksterne
    # gjennomgangene vi har fått åpnet med avrunding — «267.52 mot 267»,
    # «63.125% ikke 63%» — og dyttet de ekte funnene (emnevekten, sukkeret som
    # ble sitert uten å finnes) nedover i lista. Pirk som drukner de store
    # funnene er verre enn å la det ligge.
    #
    # Instruksjonen har nå to deler med hver sin regel, og de MÅ holdes fra
    # hverandre: del 1 dømmer bare mot dokumentet selv (det er den regelen som
    # hindrer «napoletana bør ligge på 60–65 % hydrering» når brukeren valgte
    # 70), del 2 sammenligner utad og er informasjon, ikke feilmeldinger.
    #
    # Og: avrundingsregelen må beholde unntaket sitt. En 1 %-grense uten unntak
    # ville slått av nettopp det vi leter etter — samme størrelse oppgitt med to
    # ulike verdier er en motsigelse selv om spriket er 0,1 %.
    r125 = page.evaluate("""() => {
      const saved={...S};
      const hent=lang=>{
        window._lang=lang;
        S.method='poolish'; S.type='napoletana'; S.mel=500; S.hydro=65;
        S.cold=24; S.temp=22; S.fridgeC=3; S.oven='pizza'; S.gjaer='torr';
        S.mode='start'; S.gjaertest=false; _q10Memo={k:null,v:null};
        let fanget='';
        try{ if(!navigator.clipboard) Object.defineProperty(navigator,'clipboard',{value:{},configurable:true});
             navigator.clipboard.writeText=t=>{fanget=t;return Promise.resolve();}; }catch(e){}
        try{ copyP(stepsForAnchor(new Date(2027,2,3,10,0))); }catch(e){ fanget='ERR:'+e; }
        return fanget;
      };
      const no=hent('no'), en=hent('en');
      window._lang='no';
      Object.assign(S,saved); _q10Memo={k:null,v:null};

      const harToDeler = /DEL 1 — INTERN SJEKK/.test(no) && /DEL 2 — SAMMENLIGNING/.test(no)
                      && /PART 1 — INTERNAL CHECK/.test(en) && /PART 2 — COMPARISON/.test(en);
      // Del 1 må fortsatt forby normvurdering — ellers gjør del 2 hele del 1 verdiløs.
      const del1ErLukket = /ikke mot bransjenormer eller antatt praksis/.test(no)
                        && /not against industry norms or assumed practice/.test(en);
      // Del 2 må si at avvik IKKE er feil, og oppgi kildene sine.
      const del2ErValgIkkeFeil = /Avvik her er ikke feil — de er valg/.test(no)
                              && /not errors — they are choices/.test(en)
                              && /Oppgi hvilke du sammenligner med/.test(no);
      // Avrundingsregelen, og unntaket som gjør den trygg.
      const harAvrundingsregel = /Avrunding er ikke feil/.test(no) && /under 1 ?%/.test(no)
                              && /Rounding is not an error/.test(en);
      const harUnntaket = /SAMME størrelse oppgitt med to ulike verdier/.test(no)
                       && /SAME quantity is given with two different values/.test(en);
      const harRekkefølge = /som faktisk endrer deigen øverst/.test(no)
                         && /actually changes the dough first/.test(en);
      return {harToDeler, del1ErLukket, del2ErValgIkkeFeil, harAvrundingsregel,
              harUnntaket, harRekkefølge, no, en};
    }""")

    # review_plans.py sender kopien videre til en modell UTEN nettilgang. Ville
    # «søk opp lignende oppskrifter på nett» fulgt med, fikk vi oppdiktede
    # sammenligninger i den automatiske gjennomgangen. Innledningen må klippes
    # vekk — og klippet må treffe på den EKTE copyP-teksten, ikke på et
    # konstruert eksempel.
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import review_plans
    strippet = review_plans.uten_instruksjon(r125['no'])
    r125['klippetTreffer'] = strippet.startswith('UltimatePizza v')
    r125['ingenNettinstruksIgjen'] = ('på nett' not in strippet
                                      and 'DEL 2' not in strippet
                                      and 'DEL 1' not in strippet)
    # Og klippet må ikke spise av selve planen.
    r125['planenErIntakt'] = 'PIZZAPLAN' in strippet and 'TIDSPLAN' in strippet
    r125.pop('no', None); r125.pop('en', None)
    ok125 = all(r125.get(k) for k in
                ['harToDeler', 'del1ErLukket', 'del2ErValgIkkeFeil', 'harAvrundingsregel',
                 'harUnntaket', 'harRekkefølge', 'klippetTreffer',
                 'ingenNettinstruksIgjen', 'planenErIntakt'])
    results.append(('copy_instruction_ranks_findings_and_survives_stripping', ok125, r125))

    # v0.750: en gjennomgang stusset på at kjøleskapssteget sa «ca. 1,3 døgn».
    # Den meldte det som et avrundingssprik — det var det ikke; 1905 min er
    # 1,32 døgn, og det står «ca.». Det ekte problemet er enheten. Resten av
    # planen snakker timer hele veien — «ca. 51 timer», «ca. 14 timer», «ca. 4
    # timer», og valgene i COLD_OPTS heter «24/48/72 timer» — og så dukker det
    # opp desimaldøgn på det lengste og viktigste steget, der det krever
    # hoderegning før det betyr noe.
    #
    # Kravet: ingen varighet i døgn, og lange varigheter i hele timer. «31,8
    # timer» er falsk presisjon på en gjæring som uansett styres av hvordan
    # deigen ser ut. Halvtimen beholdes bare der den betyr noe (under 6 timer).
    #
    # NB: kjøleskapssteget er IKKE det samme tallet som COLD_OPTS-etiketten —
    # 48 timer er form→stek, og kjøledelen er de 43,75 som blir igjen når
    # benktida er trukket fra. Det er to ulike størrelser, ikke en motsigelse.
    r126 = page.evaluate("""() => {
      const saved={...S};
      window._lang='no'; window._planChosen=true; setLayout('mob');
      const ut={};
      let ingenDøgn=true, ekkoStemmer=true;  // ekko: sagt varighet == faktisk varighet
      for(const cold of COLD_OPTS.map(o=>o.h)){
        S.method='poolish'; S.type='napoletana'; S.mel=500; S.hydro=65;
        S.cold=cold; S.temp=22; S.fridgeC=4; S.oven='pizza'; S.gjaer='torr';
        S.mode='start'; S.gjaertest=false; _q10Memo={k:null,v:null};
        const st=stepsForAnchor(new Date(2027,2,3,10,0));
        const alt=st.map(s=>[s.desc,s.why,s.tip,...(s.substeps||[])].join(' ')).join(' ');
        if(/døgn/.test(alt)) ingenDøgn=false;
        // Og varigheten steget OPPGIR må være den det faktisk VARER.
        const kald=st.find(s=>stepLoc(s)==='kjol' && s.dur>=60);
        const sier = kald ? (kald.desc||'').includes(fmtDur(kald.dur)) : false;
        if(!sier) ekkoStemmer=false;
        ut[cold]={dur:kald?kald.dur:null, sagt:kald?fmtDur(kald.dur):null};
      }
      // Korte varigheter beholder halvtimen — der betyr den noe.
      const kort = fmtDur(150)==='2,5 timer' && fmtDur(45)==='45 min' && fmtDur(60)==='1 time';
      // Lange runder til hele timer: «31,8 timer» er falsk presisjon.
      const lang = fmtDur(1905)==='32 timer' && fmtDur(1440)==='24 timer'
                && fmtDur(4320)==='72 timer';
      Object.assign(S,saved); _q10Memo={k:null,v:null};
      return {ingenDøgn, ekkoStemmer, kort, lang, ut};
    }""")
    ok126 = all(r126.get(k) for k in ['ingenDøgn', 'ekkoStemmer', 'kort', 'lang'])
    results.append(('durations_stated_in_hours_and_match_actual_step_length', ok126, r126))

    # v0.751: «Del» ved siden av «Kopier». På iPhone var kopiering bare halve
    # jobben — du måtte forlate appen, åpne Claude, holde inne og lime. iOS
    # kaster PWA-er ut av minnet, så turen ut kan koste deg planen du så på.
    #
    # Fire krav, og det første er det viktigste:
    #  - delt tekst == kopiert tekst. Deles planen UTEN sjekk-instruksjonen,
    #    leses den som en vanlig oppskrift, og hele hensikten med å sende den
    #    et sted faller bort.
    #  - bare `text` i share-kallet. Deler man `title` i tillegg, plukker
    #    enkelte mål på iOS bare det ene — og da er planen borte.
    #  - avbrutt deling (AbortError) er IKKE en feil og skal ikke gjøre noe.
    #    En ekte feil skal derimot falle tilbake til utklippstavla, ikke
    #    forsvinne i stillhet.
    #  - kvitteringen står på knappen du faktisk trykket på. Før het den
    #    «cbtn», og bare PC-en hadde den — på mobil skjedde ingenting synlig.
    r127 = page.evaluate("""async () => {
      const pust=()=>new Promise(r=>setTimeout(r,0));
      const saved={...S};
      window._lang='no'; window._planChosen=true; setLayout('mob');
      S.method='poolish'; S.type='napoletana'; S.mel=500; S.hydro=65; S.cold=24;
      S.temp=22; S.fridgeC=4; S.oven='pizza'; S.gjaer='torr'; S.mode='start';
      S.gjaertest=false; _q10Memo={k:null,v:null};
      const steg=stepsForAnchor(new Date(2027,2,3,10,0));

      let kopiert='';
      if(!navigator.clipboard) Object.defineProperty(navigator,'clipboard',{value:{},configurable:true});
      navigator.clipboard.writeText=t=>{kopiert=t;return Promise.resolve()};

      // --- delt tekst == kopiert tekst, og bare `text` sendes ---
      let delt=null;
      const ekteShare=navigator.share, ekteCan=navigator.canShare;
      Object.defineProperty(navigator,'share',{value:d=>{delt=d;return Promise.resolve()},configurable:true});
      Object.defineProperty(navigator,'canShare',{value:()=>true,configurable:true});
      sharePlan(steg);
      copyP(steg);
      const sammeTekst = delt && delt.text===kopiert && kopiert.length>500;
      const barePåText = delt && Object.keys(delt).join(',')==='text';
      const delerInstruksjonen = !!(delt && /DEL 1 — INTERN SJEKK/.test(delt.text)
                                       && /DEL 2 — SAMMENLIGNING/.test(delt.text));

      // --- avbrutt deling gjør ingenting; ekte feil faller tilbake til kopi ---
      kopiert='';
      Object.defineProperty(navigator,'share',{value:()=>Promise.reject(
        Object.assign(new Error('avbrutt'),{name:'AbortError'})),configurable:true});
      sharePlan(steg); await pust();
      const avbruttGjørIngenting = kopiert==='';

      // En ekte feil skal IKKE forsvinne i stillhet — planen kommer ut på
      // utklippstavla i stedet, med nøyaktig samme tekst.
      Object.defineProperty(navigator,'share',{value:()=>Promise.reject(
        Object.assign(new Error('nekta'),{name:'NotAllowedError'})),configurable:true});
      sharePlan(steg); await pust();
      const ektefeilFallerTilbake = kopiert.length>500 && /DEL 1 — INTERN SJEKK/.test(kopiert);

      // --- v0.756: knappen er TATT UT ---
      // Meldt inn: appen henger etter bruk på iPhone. Lar seg ikke reprodusere
      // i Chromium (share som resolver, avbryter, nekter og aldri svarer gir
      // alle en app som fortsatt virker), så mekanismen er sannsynligvis
      // iOS-spesifikk — standalone PWA med service worker, der deling
      // bakgrunner appen. Funksjonene over blir stående og testet, slik at de
      // ikke råtner mens knappen er borte, men den skal ikke tegnes før noen
      // har bekreftet på en ekte iPhone at deling ikke etterlater appen død.
      const medDel=planBottomActionsHTML();
      Object.defineProperty(navigator,'share',{value:undefined,configurable:true});
      Object.defineProperty(navigator,'canShare',{value:undefined,configurable:true});
      const delKnappErUte = !/sharePlan\(/.test(medDel);

      // --- kvittering på knappen man trykket på, og etiketten kommer tilbake ---
      const d=document.createElement('div');
      d.innerHTML='<button><span>📋</span>Kopier</button>';
      const b=d.firstChild;
      kvitter(b,'✓ Kopiert!');
      const kvittererPåKnappen = b.textContent==='✓ Kopiert!';
      // Og etiketten som kommer TILBAKE må være knappens egen. Den gamle koden
      // skrev tilbake «📋 Kopier tidsplan» på en knapp som het «📋 Kopier», så
      // etiketten drev permanent etter første trykk. Her lar vi timeren gå.
      await new Promise(r=>setTimeout(r,2100));
      const etikettKommerTilbake = b.innerHTML==='<span>📋</span>Kopier';

      Object.defineProperty(navigator,'share',{value:ekteShare,configurable:true});
      Object.defineProperty(navigator,'canShare',{value:ekteCan,configurable:true});
      Object.assign(S,saved); _q10Memo={k:null,v:null};
      return {sammeTekst, barePåText, delerInstruksjonen, avbruttGjørIngenting,
              ektefeilFallerTilbake, delKnappErUte, kvittererPåKnappen,
              etikettKommerTilbake, lengde:kopiert.length};
    }""")
    ok127 = all(r127.get(k) for k in
                ['sammeTekst', 'barePåText', 'delerInstruksjonen', 'avbruttGjørIngenting',
                 'ektefeilFallerTilbake', 'delKnappErUte', 'kvittererPåKnappen',
                 'etikettKommerTilbake'])
    results.append(('share_sends_the_same_text_copy_does', ok127, r127))

    # v0.752: poolish-vinduet. En gjennomgang antydet at 50 % av melet i
    # poolishen gir dårlig sikkerhetsmargin, og at 20–30 % ville vært tryggere.
    # Målt går det MOTSATT vei: all gjæren ligger i poolishen, så halverer du
    # melet der uten å flytte gjær, nesten fordobler du konsentrasjonen
    # (0,34 % → 0,57 %). Poolishen topper tidligere og faller tidligere.
    # Andelen er altså ikke marginspaken.
    #
    # Det ekte hullet er temperaturen: gjærmengden i poolishen er den SAMME
    # ved 18 og 26 grader, og timeplanen setter av like mange timer uansett —
    # mens appens egen Q10-modell sier at 14t ved 22°C tilsvarer 19,5t ved 18°C
    # og 10t ved 26°C. På et varmt kjøkken står poolishen fire timer for lenge
    # etter planen, topper og faller sammen. DET er «nesten for slapp».
    #
    # Her endres ikke ett gram — bare hva planen tør si. Kravene:
    #  - vinduet regnes med SAMME Q10 som fermentLoadHours(), ikke en ny modell
    #  - varmt kjøkken → kortere, kaldt → lengre, og retningen må stemme
    #  - ved 22°C skal den TIE. En setning som gjentar planen lærer folk å
    #    hoppe over teksten.
    #  - kald poolish tier også: kjøleskapet gjør vinduet så bredt at en time
    #    fra eller til ikke betyr noe
    #  - den må si hvordan man kjenner igjen at den har gått for langt.
    #    Fallende midte er den eneste beskjeden som ikke kan feiltolkes som
    #    «trenger litt mer tid».
    r128 = page.evaluate("""() => {
      const saved={...S};
      window._lang='no'; window._planChosen=true; setLayout('mob');
      const sett=temp=>{ S.method='poolish'; S.type='napoletana'; S.mel=500;
        S.hydro=65; S.cold=48; S.temp=temp; S.fridgeC=3; S.oven='pizza';
        S.gjaer='torr'; S.mode='start'; S.poolishH=14; S.poolishCold=false;
        S.poolishPauseH=0; S.gjaertest=false; _q10Memo={k:null,v:null}; };
      const tips=()=>{ const st=stepsForAnchor(new Date(2027,2,3,10,0));
                       return st[0].tip||''; };

      // Vinduet må komme fra samme Q10 som gjæringsbelastningen — ikke en
      // parallell modell som kan sprike fra den.
      let sammeModell=true;
      for(const t of [18,20,24,26]){
        sett(t);
        const v=poolishWindowHours();
        const fasit=14/Math.pow(Q10,(t-Q10_REF_C)/10);
        if(!v || Math.abs(v.ekte-Math.round(fasit*2)/2)>0.001) sammeModell=false;
      }

      sett(26); const varm=tips();
      sett(18); const kald=tips();
      sett(22); const nøytral=tips();
      // Kald poolish: to lag stopper den — teksten (kald gren av
      // poolishRestText) og selve modellen. Teksten alene ville skjult at
      // vakten i poolishWindowHours() var borte, så begge sjekkes.
      sett(26); S.poolishCold=true; _q10Memo={k:null,v:null};
      const kjøleskap=tips();
      const kaldPoolishGirIkkeVindu = poolishWindowHours()===null;

      const varmSierKortere = /går det fortere/.test(varm) && /10 timer/.test(varm);
      const kaldSierLengre  = /går det saktere/.test(kald) && /19,5 timer/.test(kald);
      const tierVed22 = !/går det (fortere|saktere)/.test(nøytral);
      const kaldPoolishTier = !/går det (fortere|saktere)/.test(kjøleskap);
      const harFalletegn = /midten begynt å synke/.test(varm);
      // Retningen må stemme: varmt kjøkken kan ikke gi LENGRE tid enn kaldt.
      sett(26); const a=poolishWindowHours().ekte;
      sett(18); const b=poolishWindowHours().ekte;
      const retningStemmer = a < 14 && b > 14 && a < b;

      Object.assign(S,saved); _q10Memo={k:null,v:null};
      return {sammeModell, varmSierKortere, kaldSierLengre, tierVed22,
              kaldPoolishTier, kaldPoolishGirIkkeVindu, harFalletegn,
              retningStemmer, ved26:a, ved18:b};
    }""")
    ok128 = all(r128.get(k) for k in
                ['sammeModell', 'varmSierKortere', 'kaldSierLengre', 'tierVed22',
                 'kaldPoolishTier', 'kaldPoolishGirIkkeVindu', 'harFalletegn',
                 'retningStemmer'])
    results.append(('poolish_window_follows_room_temperature', ok128, r128))

    # v0.753: natt-varselet tilbød knapper som ikke løste noe.
    #
    # To feil i samme kode. (1) «🔍 Finn beste kombinasjon» ble tegnet når
    # prefWorks && coldWorks — et vilkår som aldri så på modus — mens
    # findBestWeekendCombo() åpnet med `if(S.mode!=='end') return null`. I
    # «begynn nå» gjorde knappen derfor INGENTING. Ikke engang en feilmelding.
    # (2) leverMovesStep() svarte på «flytter spaken steget», ikke «finnes det
    # en verdi som får det UT». Målt på et vanlig oppsett løste bare 1 av 5
    # poolish-verdier natt-konflikten — knappen sendte deg til en bryter der
    # fire av fem valg var feil, uten å si hvilket.
    #
    # Kravene nå:
    #  - en kandidat godtas bare hvis HELE planen blir konfliktfri. En verdi som
    #    redder dette steget og dytter et annet inn i natta, har flyttet
    #    problemet, ikke løst det — og da ville knappen løyet.
    #  - hovedknappen sier hvor steget havner og hva som endres
    #  - den UTFØRER endringen, og kvitteringen har angre
    #  - «Finn beste kombinasjon» må svare i begge moduser
    r129 = page.evaluate("""() => {
      const saved={...S};
      window._lang='no'; window._planChosen=true; setLayout('mob');
      const sett=mode=>{ S.method='poolish'; S.type='napoletana'; S.mel=500;
        S.hydro=65; S.cold=48; S.temp=22; S.fridgeC=3; S.oven='pizza';
        S.gjaer='torr'; S.poolishH=14; S.poolishCold=false; S.poolishPauseH=0;
        S.mode=mode; S.gjaertest=false; _q10Memo={k:null,v:null}; };

      // (1) Den døde knappen: søket må svare i «begynn nå», ikke bare bakover.
      sett('start');
      const finnerIStart = findBestWeekendCombo()!==null;

      // (2) Utveien må gjøre HELE planen konfliktfri, ikke bare dette steget.
      // v0.761: FAST anker. Første versjon leste mobGetAnchor('s'), som alltid
      // returnerer `new Date()` — start-modus er live «nå» ved design. Da flyttet
      // hvilket steg som havnet i natta seg med klokka, og på tider av døgnet der
      // konflikten traff FØRSTE steg gikk testen rød: det steget ligger på
      // starttidspunktet og kan ikke flyttes av noen spak. Testen var altså
      // tidsavhengig, ikke gal på appen. 08:00 gir en konflikt på «Form emner»
      // som spakene faktisk kan løse — det er DEN egenskapen som skal testes.
      sett('start'); mobGen();
      const anchor=new Date(2027,2,3,8,0);
      const steg=stepsForAnchor(anchor);
      let konflikt=null;
      for(const s of steg){
        if(s.passive && !s.needsPresence) continue;
        let at=s.at; if(!(at instanceof Date)) at=new Date(at);
        if(ACTIVE_STEP_TIME_WINDOWS.find(w=>w.test(at.getHours(),at.getMinutes(),at.getDay()))){ konflikt=s; break; }
      }
      const esc = konflikt ? stepEscapePlan(konflikt.title, anchor) : null;
      let heleplanenBlirRen=false, endrerNoe=false;
      if(esc){
        const før=S[esc.field];
        endrerNoe = esc.value!==før;
        S[esc.field]=esc.value;
        heleplanenBlirRen = !planHasConflict(stepsForAnchor(anchor));
        S[esc.field]=før;
      }

      // En verdi som bare FLYTTER steget skal ikke godtas. Her tvinges en
      // kandidatliste der ingen verdi rydder planen — da må svaret bli null.
      sett('start');
      const umuligeVerdier=leverEscape('poolishH',[S.poolishH], konflikt?konflikt.title:'x', anchor);
      const avviserUendret = umuligeVerdier===null;

      // (3) Utfør + angre.
      sett('start'); mobGen();
      let utførte=false, angret=false;
      if(esc){
        const før=S[esc.field];
        applyStepEscape(esc.field, esc.value);
        utførte = S[esc.field]===esc.value && /undoStepEscape\(\)/.test(escapeReceiptHTML());
        undoStepEscape();
        angret = S[esc.field]===før && escapeReceiptHTML()==='';
      }

      Object.assign(S,saved); _q10Memo={k:null,v:null};
      return {finnerIStart, harKonflikt:!!konflikt, harUtvei:!!esc,
              heleplanenBlirRen, endrerNoe, avviserUendret, utførte, angret,
              steg:konflikt?konflikt.title:null,
              utvei:esc?{felt:esc.field, verdi:esc.value}:null};
    }""")
    ok129 = all(r129.get(k) for k in
                ['finnerIStart', 'harKonflikt', 'harUtvei', 'heleplanenBlirRen',
                 'endrerNoe', 'avviserUendret', 'utførte', 'angret'])
    results.append(('night_warning_offers_a_fix_that_actually_works', ok129, r129))

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
