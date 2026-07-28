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
      // Tidsplan viser nå et nedtonet «⚠ utenfor spisetid»-merke på steget i
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
      if (shortcuts.length) shortcuts[0].click();
      const resultText = document.getElementById('mob-beta-result').textContent;
      const fieldsUpdated = dEl.value !== defaultDate || tEl.value !== '19:00';

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

    # v5.90: "Hei igjen"-mellomskjermen (bruk samme som sist / åpne favoritt)
    # er fjernet — brøt løftet sitt (glemte tidspunktet) og hoppet forbi hele
    # wizarden. Tester at wizarden nå går RETT til steg 1 ved første inngang,
    # at wiz-returning-elementet faktisk er borte, at wizGoto() ikke lenger
    # kaster på det manglende elementet, og at guarden som hindrer gjentatt
    # steg-1-hopp ved fanebytte FORTSATT virker (det var den ENESTE gjenværende
    # jobben til _wizEnteredOnce — verifisert manuelt at fjerningen ikke
    # samtidig slettet wizHideAllSteps/tnShort, som lå i samme kodeblokk og
    # nesten forsvant med i sletteoperasjonen).
    r21 = page.evaluate("""() => {
      window._wizEnteredOnce = false;
      mobShowTab('recipe');
      mobShowTab('settings');
      const initialStep = window._wizStep;
      wizGoto(2);
      mobShowTab('recipe');
      mobShowTab('settings');
      const stepAfterTabSwitch = window._wizStep;
      let gotoThrew = false;
      try{ wizGoto(1); }catch(e){ gotoThrew = true; }
      return {
        initialStep, stepAfterTabSwitch, gotoThrew,
        returningElementGone: !document.getElementById('wiz-returning'),
        noStaleFunctions: typeof window.wizDecideStart === 'undefined' && typeof window.wizUseLastConfig === 'undefined'
      };
    }""")
    ok21 = (
      r21['initialStep'] == 1 and r21['stepAfterTabSwitch'] == 2 and
      not r21['gotoThrew'] and r21['returningElementGone']
    )
    results.append(('hei_igjen_screen_removed_wizard_goes_straight_to_step_1', ok21, r21))

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

    # v5.92: REELL BUG (skjermbilde) — "Ikke vis igjen"-knappen i PC-varianten
    # av velkomstguiden brukte background:var(--forno-bg-raised,#F2F2F7). Den
    # fallbacken er død kode: --forno-bg-raised er satt ubetinget på :root
    # (mørk brun, #231a14), ikke skalert til mob-mode, så fallbacken kan aldri
    # utløses — knappen ble alltid mørk, med mørk tekst (--dyn-text i PC-modus)
    # oppå. Fikset til --dyn-btn-bg/--dyn-text/--dyn-border, samme mønster som
    # alle andre knapper i appen som skal se ulike ut i PC- og mobilmodus.
    r23 = page.evaluate("""() => {
      document.body.classList.remove('mob-mode');
      document.body.classList.add('pc-mode');
      openGuideModal();
      const btn = document.querySelector('#guide-modal-footer button');
      const cs = getComputedStyle(btn);
      const toRgb = s => s.match(/\\d+/g).map(Number);
      const bg = toRgb(cs.backgroundColor), fg = toRgb(cs.color);
      // Enkel lysstyrke-kontrast (0-255 per kanal) — bakgrunn skal være lys,
      // tekst mørk, og de skal ikke ligge nær hverandre.
      const lum = c => 0.299*c[0] + 0.587*c[1] + 0.114*c[2];
      document.body.classList.remove('pc-mode');
      return {
        text: btn.textContent,
        bgLuminance: lum(bg),
        fgLuminance: lum(fg),
        contrastGap: Math.abs(lum(bg) - lum(fg))
      };
    }""")
    ok23 = (
      r23['bgLuminance'] > 200 and r23['fgLuminance'] < 60 and r23['contrastGap'] > 150
    )
    results.append(('pc_guide_modal_button_has_readable_contrast', ok23, r23))

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
    r25 = page.evaluate("""() => {
      resetTestState();
      S.type='napoletana'; S.method='kveld'; S.kveldH=15; S.mel=500; S.hydro=65;
      S.mode='end'; S.temp=22; S.gjaer='torr';
      mobShowTab('plan'); mobGen();
      const mobStep = document.querySelector('#mob-plan-content .mob-step');
      const mobChips = mobStep ? Array.from(mobStep.querySelectorAll('.mob-needchip')).map(c=>c.textContent) : [];
      const mobDesc = mobStep ? mobStep.querySelector('.mob-sdesc').textContent : '';

      document.body.classList.remove('mob-mode'); document.body.classList.add('pc-mode');
      gen();
      const pcStep = document.querySelector('#p-plan .step');
      const pcChips = pcStep ? Array.from(pcStep.querySelectorAll('.needchip')).map(c=>c.textContent) : [];
      document.body.classList.remove('pc-mode'); document.body.classList.add('mob-mode');

      S.method='standard'; S.cold=48;
      mobGen();
      const stdStep = document.querySelector('#mob-plan-content .mob-step');
      const stdChips = stdStep ? Array.from(stdStep.querySelectorAll('.mob-needchip')).map(c=>c.textContent) : [];

      return { mobChips, mobDesc, pcChips, stdChips };
    }""")
    ok25 = (
      r25['mobChips'] == ['💧 325g vann', '🫙 1.01g tørrgjær', '🌾 500g mel', '🧂 14g salt'] and
      all(chip.split(' ')[1] in r25['mobDesc'] for chip in r25['mobChips']) and
      r25['pcChips'] == r25['mobChips'] and
      len(r25['stdChips']) > 0
    )
    results.append(('step_needs_chips_match_prose_numbers_pc_and_mobile', ok25, r25))

    # v5.96: Rune vil teste understeg-visningen i praksis for a bestemme seg,
    # UTEN a miste den gamle avsnittsvisningen som backup. Ny bryter
    # S.showSubsteps (default false -- render-lag-basisene rores derfor
    # ikke). Tester at bryteren finnes bade pa mobil og PC, at PA viser
    # nummererte understeg og AV viser eksakt samme avsnittstekst som for
    # bryteren i det hele tatt fantes, at et klikk pa et understeg i et
    # AKTIVT steg kan hakes av, og at et PASSIVT steg (Kjoleskapsheving)
    # ikke er klikkbart -- det er ingenting a "gjore" der.
    r26 = page.evaluate("""() => {
      resetTestState();
      S.type='napoletana'; S.method='standard'; S.mel=500; S.hydro=65; S.cold=24;
      S.mode='end'; S.temp=22; S.gjaer='torr';
      window._checkedSubsteps.clear();
      mobShowTab('plan'); mobGen();

      const descsBefore = document.querySelectorAll('#mob-plan-content .mob-sdesc').length;
      const mobBtn = document.querySelector('#mob-plan-content button[onclick="toggleSubsteps()"]');
      const hadMobToggle = !!mobBtn;

      mobBtn.click();
      const onState = {
        flag: S.showSubsteps,
        lists: document.querySelectorAll('#mob-plan-content .substep-list').length
      };
      const firstItem = document.querySelector('#mob-plan-content .substep-item');
      firstItem.click();
      const checkedAfterClick = !!document.querySelector('#mob-plan-content .substep-item.substep-done');

      const coldCard = Array.from(document.querySelectorAll('#mob-plan-content .mob-step'))
        .find(el => el.textContent.includes('Kjøleskapsheving'));
      const coldSubstep = coldCard ? coldCard.querySelector('.substep-item') : null;
      const passiveNotClickable = coldSubstep ? !coldSubstep.hasAttribute('onclick') : null;

      mobBtn.click();
      const offState = {
        flag: S.showSubsteps,
        lists: document.querySelectorAll('#mob-plan-content .substep-list').length,
        descs: document.querySelectorAll('#mob-plan-content .mob-sdesc').length
      };

      // PC-siden skal ha samme bryter, delt tilstand
      document.body.classList.remove('mob-mode'); document.body.classList.add('pc-mode');
      gen();
      const pcBtn = document.querySelector('#substep-toggle');
      document.body.classList.remove('pc-mode'); document.body.classList.add('mob-mode');

      window._checkedSubsteps.clear();
      return {
        descsBefore, hadMobToggle, onState, checkedAfterClick, passiveNotClickable, offState,
        hadPcToggle: !!pcBtn
      };
    }""")
    ok26 = (
      r26['descsBefore'] == 7 and r26['hadMobToggle'] and
      r26['onState']['flag'] is True and r26['onState']['lists'] == 7 and
      r26['checkedAfterClick'] and r26['passiveNotClickable'] and
      r26['offState']['flag'] is False and r26['offState']['lists'] == 0 and
      r26['offState']['descs'] == 7 and r26['hadPcToggle']
    )
    results.append(('substep_toggle_switches_view_and_old_view_is_unchanged', ok26, r26))

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
      S.type='napoletana'; S.method='kveld'; S.kveldH=15; S.mel=500; S.hydro=65;
      S.mode='end'; S.temp=22; S.gjaer='torr';
      mobShowTab('plan'); mobGen();
      const descsBefore = document.querySelectorAll('#mob-plan-content .mob-sdesc').length;
      const btn = document.querySelector('#mob-plan-content button[onclick="toggleSubsteps()"]');
      btn.click();
      const result = {
        descsBefore,
        substepLists: document.querySelectorAll('#mob-plan-content .substep-list').length,
        descsAfter: document.querySelectorAll('#mob-plan-content .mob-sdesc').length,
        firstItems: document.querySelector('#mob-plan-content .mob-step').querySelectorAll('.substep-item').length
      };
      S.showSubsteps=false; mobGen();
      return result;
    }""")
    ok27 = (
      r27['descsBefore'] == 5 and r27['substepLists'] == 5 and
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
      scenarios.forEach(([method, extra]) => {
        S.type='napoletana'; S.method=method; S.mel=500; S.hydro=65;
        S.mode='end'; S.temp=22; S.gjaer='torr';
        Object.keys(extra).forEach(k => S[k]=extra[k]);
        mobShowTab('plan'); mobGen();
        const total = document.querySelectorAll('#mob-plan-content .mob-step').length;
        const btn = document.querySelector('#mob-plan-content button[onclick="toggleSubsteps()"]');
        btn.click();
        out[method] = {
          total,
          lists: document.querySelectorAll('#mob-plan-content .substep-list').length,
          descsLeft: document.querySelectorAll('#mob-plan-content .mob-sdesc').length
        };
        S.showSubsteps=false; mobGen();
      });
      S.type='ingenelting'; S.mel=500; S.hydro=75; S.mode='end'; S.temp=22; S.gjaer='torr';
      mobShowTab('plan'); mobGen();
      const btn2 = document.querySelector('#mob-plan-content button[onclick="toggleSubsteps()"]');
      btn2.click();
      out['ingenelting'] = {
        total: document.querySelectorAll('#mob-plan-content .mob-step').length,
        lists: document.querySelectorAll('#mob-plan-content .substep-list').length,
        descsLeft: document.querySelectorAll('#mob-plan-content .mob-sdesc').length
      };
      S.showSubsteps=false; S.type='napoletana'; mobGen();
      return out;
    }""")
    ok28 = all(r28[m]['lists'] == r28[m]['total'] and r28[m]['descsLeft'] == 0 for m in r28)
    results.append(('every_method_has_full_substep_coverage', ok28, r28))

    # v6.00: Rune ba om aa flytte Understeg-knappen ved siden av Juster, og
    # legge til en Tips-bryter paa samme sted (skisse B: navn alene paa topp,
    # egen knapperad under med Juster+Understeg+Tips). Tester at alle tre
    # finnes sammen i Tidsplan-visningen, at Tips-bryteren FAKTISK virker paa
    # mobil naa (den var kun tilgjengelig paa PC for denne endringen), og at
    # wizardens kompakte statuslinjer (Metode/Sjekk/Finjuster) beholder Juster
    # inline uendret UTEN aa faa Understeg/Tips-rot -- de tre hoerer kun hjemme
    # i selve Tidsplan-fanen.
    r29 = page.evaluate("""() => {
      resetTestState();
      S.type='napoletana'; S.method='kveld'; S.kveldH=15; S.mel=500; S.hydro=65;
      S.mode='end'; S.temp=22; S.gjaer='torr';
      mobShowTab('plan'); mobGen();

      const juster = document.querySelector('#mob-plan-content button[onclick="wizOpenFinjusterFromPlan()"]');
      const understeg = document.querySelector('#mob-plan-content button[onclick="toggleSubsteps()"]');
      const tips = document.querySelector('#mob-plan-content button[onclick="toggleHelpFromPlan()"]');
      const allThreePresent = !!(juster && understeg && tips);

      const tipsBoxesBefore = document.querySelectorAll('#mob-plan-content .mob-stip').length;
      tips.click();
      const tipsBoxesAfterOff = document.querySelectorAll('#mob-plan-content .mob-stip').length;
      document.querySelector('#mob-plan-content button[onclick="toggleHelpFromPlan()"]').click();
      const tipsBoxesRestored = document.querySelectorAll('#mob-plan-content .mob-stip').length;

      mobShowTab('settings'); wizGoto(2);
      const wizHasJuster = !!document.querySelector('#wiz-status-step2 button[onclick="wizOpenFinjusterFromPlan()"]');
      const wizHasUndersteg = !!document.querySelector('#wiz-status-step2 button[onclick="toggleSubsteps()"]');
      const wizHasTips = !!document.querySelector('#wiz-status-step2 button[onclick="toggleHelpFromPlan()"]');

      return {
        allThreePresent, tipsBoxesBefore, tipsBoxesAfterOff, tipsBoxesRestored,
        wizHasJuster, wizHasUndersteg, wizHasTips
      };
    }""")
    ok29 = (
      r29['allThreePresent'] and r29['tipsBoxesBefore'] > 0 and
      r29['tipsBoxesAfterOff'] == 0 and
      r29['tipsBoxesRestored'] == r29['tipsBoxesBefore'] and
      r29['wizHasJuster'] and not r29['wizHasUndersteg'] and not r29['wizHasTips']
    )
    results.append(('juster_understeg_tips_grouped_in_tidsplan_toolbar', ok29, r29))

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
      r32['firstTitle'] == 'Væk gjæren (kickstart)' and r32['chainOk'] and
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
        # v5.88: fanger opp JS-feil som oppstår ved selve sideinnlastingen — se
        # begrunnelse ved page_loads_without_script_errors nedenfor.
        load_errors = []
        page.on("pageerror", lambda exc: load_errors.append(str(exc)))
        page.on("console", lambda msg: load_errors.append(f"[console.{msg.type}] {msg.text}") if msg.type == "error" and "404" not in msg.text and "Failed to load resource" not in msg.text else None)
        page.goto(f"http://localhost:{port}/{os.path.basename(index_path)}")
        page.wait_for_timeout(1200)
        page.evaluate("document.getElementById('guide-modal') && (document.getElementById('guide-modal').style.display='none')")

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
