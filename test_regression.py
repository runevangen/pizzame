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
      _dismissedWarnings.clear();
      S.type='napoletana'; S.method='standard'; S.mel=500; S.hydro=65;
      S.cold=48; S.temp=22; S.meltype='doppio_zero'; S.mode='end';
      const now=new Date();
      const d=new Date(now.getFullYear(),now.getMonth(),now.getDate(),18,0,0,0);
      d.setDate(d.getDate() + ((2 - now.getDay() + 7) % 7 || 7));
      document.getElementById('mob-ed').value = fd(d);
      document.getElementById('mob-et').value = '18:00';
      mobShowTab('plan'); mobGen();
      const c = firstStepConflict(window._steps||[]);
      const anchor = mobGetAnchor('e');
      const box = Array.from(document.querySelectorAll('#mob-plan-content .warn-dismiss-wrap'))
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
      _dismissedWarnings.clear();
      const savedSched = window._pizzatidSchedule;
      const wd=[['16:00','23:30'],['06:30','08:00']], we=[['06:00','23:00'],null];
      window._pizzatidSchedule = {mon:wd,tue:wd,wed:wd,thu:wd,fri:wd,sat:we,sun:we};
      S.type='napoletana'; S.method='standard'; S.mel=500; S.hydro=65;
      S.cold=48; S.temp=22; S.meltype='doppio_zero'; S.mode='end';
      const now=new Date();
      const d=new Date(now.getFullYear(),now.getMonth(),now.getDate(),18,0,0,0);
      d.setDate(d.getDate() + ((2 - now.getDay() + 7) % 7 || 7));
      document.getElementById('mob-ed').value = fd(d);
      document.getElementById('mob-et').value = '18:00';
      mobShowTab('plan'); mobGen();
      const has = () => !!Array.from(document.querySelectorAll('#mob-plan-content .warn-dismiss-wrap'))
                            .find(x => x.textContent.includes('Et steg havner'));
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
      S.method='standard'; S.type='napoletana'; S.cold=48; S.mode='end';
      S.meltype='couco'; S.hydro=65;
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
      const allDay = [['00:00','23:59'], null];
      window._pizzatidSchedule = {mon:allDay,tue:allDay,wed:allDay,thu:allDay,fri:allDay,sat:allDay,sun:allDay};
      _dismissedWarnings.clear();
      mobShowTab('settings');

      // Rent utgangspunkt: mel som passer til gjæringstiden.
      S.type='napoletana'; S.method='standard'; S.mode='end';
      S.mel=500; S.hydro=65; S.cold=48; S.temp=22; S.meltype='couco';
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
