// Gruppe 0c (v0.836): steglaget i node. Etter utflyttingen (steps.js) kan
// hele stegkjede-utregningen — rawSteps/hurtigSteps/kveldSteps med tekster,
// tider og ingredienser — kjøres uten nettleser. Denne fila beviser at
// node-utgaven regner NØYAKTIG det samme som nettleseren: de ti frosne
// scenariene i baseline_results.json (samme fasit nettleserlaget måles mot)
// sjekkes felt for felt — oppskrift, første/siste steg med ISO-tidspunkt,
// stegantall og titler.
//
// Sømmen fra v0.836 (hjelpere hentet verbatim fra index.html) ble lukket i
// v0.838: alt steglaget leser bor nå i engine.js (DEF, L, kjernetallene,
// menytabellene) og steps.js (tekst-/varighetshjelperne). Laget bygges derfor
// av de to filene ALENE — trenger en fremtidig endring å hente noe fra
// index.html igjen, er det et tilbakeskritt, ikke en løsning.
//
// Kjøres av porten (test_regression.py) før nettleseren, og alene:
// `node test_steg.mjs`.
import { readFileSync } from 'node:fs';

// Baseline er regnet i norsk tidssone (nettleserkonteksten pinner Europe/Oslo);
// node må tolke anker-klokkeslettet i samme sone for at ISO-ene skal matche.
process.env.TZ = 'Europe/Oslo';

const engineSrc = readFileSync(new URL('./engine.js', import.meta.url), 'utf8');
const stepsSrc = readFileSync(new URL('./steps.js', import.meta.url), 'utf8');
const baseline = JSON.parse(readFileSync(new URL('./baseline_results.json', import.meta.url), 'utf8'));

// ===== Bygg laget: engine + steps i ETT globalt scope =====
globalThis.window = { _lang: 'no', _openSub: new Set(), _openTip: new Set(), _openIng: new Set() };
const S = {};
const lag = new Function('window', 'S',
  engineSrc + '\n' + stepsSrc + `
  ;return { rawSteps, hurtigSteps, kveldSteps, stepsForAnchor, maniaRecipe, R, DEF,
            recipeFor, preheatMin, stepLoc };
`)(globalThis.window, S);

let ok = 0; const feil = [];
function t(navn, sann, detalj) {
  if (sann) { ok++; }
  else { feil.push(`${navn}: FEILET` + (detalj !== undefined ? ` — ${JSON.stringify(detalj)}` : '')); }
}

// ===== De ti frosne scenariene — samme fasit som nettleserlaget =====
// Speiler run_scenario() i test_regression.py: S.mode='start' + scenariofelter,
// fast anker, riktig stegfunksjon per metode, recipe fra maniaRecipe()/R().
const ANKER = new Date('2026-08-01T18:00:00');
const SCENARIOER = [
  { name: 'standard_napoletana', s: { method: 'standard', type: 'napoletana', mel: 500, hydro: 65, cold: 48, temp: 22, meltype: 'doppio_zero' } },
  { name: 'poolish_roomtemp', s: { method: 'poolish', type: 'napoletana', mel: 500, hydro: 65, poolishCold: false, poolishH: 14, cold: 24, temp: 22, meltype: 'doppio_zero' } },
  { name: 'poolish_cold', s: { method: 'poolish', type: 'napoletana', mel: 500, hydro: 65, poolishCold: true, poolishH: 36, cold: 48, temp: 22, meltype: 'couco' } },
  { name: 'poolish_cold_short', s: { method: 'poolish', type: 'napoletana', mel: 500, hydro: 65, poolishCold: true, poolishH: 12, cold: 24, temp: 22, meltype: 'doppio_zero' } },
  { name: 'poolish_cold_long', s: { method: 'poolish', type: 'napoletana', mel: 500, hydro: 65, poolishCold: true, poolishH: 48, cold: 24, temp: 22, meltype: 'couco' } },
  { name: 'biga', s: { method: 'biga', type: 'napoletana', mel: 500, hydro: 65, bigaH: 18, cold: 48, temp: 22, meltype: 'doppio_zero' } },
  { name: 'mania', s: { method: 'mania', type: 'napoletana', mel: 500, temp: 22 } },
  { name: 'hurtig', s: { method: 'hurtig', type: 'napoletana', mel: 500, hydro: 65, hurtigH: 4, temp: 22 } },
  { name: 'kveld', s: { method: 'kveld', type: 'napoletana', mel: 500, hydro: 65, kveldH: 10, temp: 22 } },
  { name: 'chicago_biga', s: { method: 'biga', type: 'chicago', mel: 600, hydro: 60, bigaH: 18, cold: 72, temp: 22, meltype: 'vanlig_hvetemel' } },
];

for (const sc of SCENARIOER) {
  const fasit = baseline[sc.name];
  if (!fasit) { feil.push(`${sc.name}: ingen frossen baseline`); continue; }
  for (const k of Object.keys(S)) delete S[k];
  Object.assign(S, lag.DEF, { mode: 'start' }, sc.s);
  let steg;
  try {
    steg = sc.s.method === 'hurtig' ? lag.hurtigSteps(ANKER).steps
         : sc.s.method === 'kveld' ? lag.kveldSteps(ANKER).steps
         : lag.rawSteps(ANKER);
  } catch (e) { feil.push(`${sc.name}: kastet — ${e.message}`); continue; }
  const oppskrift = sc.s.method === 'mania' ? lag.maniaRecipe() : lag.R();
  const faktisk = {
    recipe: oppskrift,
    firstStep: { title: steg[0].title, iso: new Date(steg[0].at).toISOString() },
    lastStep: { title: steg[steg.length - 1].title, iso: new Date(steg[steg.length - 1].at).toISOString() },
    stepCount: steg.length,
    stepTitles: steg.map(s => s.title),
  };
  for (const felt of ['recipe', 'firstStep', 'lastStep', 'stepCount', 'stepTitles']) {
    t(`${sc.name}.${felt}`, JSON.stringify(faktisk[felt]) === JSON.stringify(fasit[felt]),
      { forventet: fasit[felt], fikk: faktisk[felt] });
  }
}

// ===== Og et bevis på at laget faktisk er DOM-fritt i node =====
// stepsForAnchor over alle metodene (den ruta matrisesveipet bruker) — skal
// aldri røre document. `document` finnes ikke her; kaster noe, feiler testen.
{
  const metoder = ['standard', 'poolish', 'biga', 'mania', 'hurtig', 'kveld'];
  let alleOk = true; let hvor = null;
  for (const m of metoder) {
    for (const k of Object.keys(S)) delete S[k];
    Object.assign(S, lag.DEF, { mode: 'start', method: m });
    try {
      const st = lag.stepsForAnchor(new Date(2027, 2, 3, 10, 0));
      if (!st || !st.length) { alleOk = false; hvor = m + ': tom'; break; }
    } catch (e) { alleOk = false; hvor = m + ': ' + e.message; break; }
  }
  t('stepsForAnchor: alle metoder regner uten DOM', alleOk, hvor);
}

// ===== MATRISE-INVARIANTENE (v0.839) — flyttet hit fra nettleserlaget =====
// LAG 1-invariantene (v0.739 og utover) sveiper metode × poolish-variant ×
// type × ovn × hydrering (210 kombinasjoner) og håndhever egenskaper som må
// holde for ALLE: massebalanse, vaghetslint, forvarmingstid, ingen fakta kun
// i understeg, ingen råe flyttall, overmodnings-tegn på lange hevinger,
// vanntemperatur der vann først tilsettes, og ett norsk navn på deigballen.
// Alt de leser er stegkjeder + oppskrift — ren beregning — så etter
// steglag-utflyttingen hører de hjemme her: porten stopper FØR nettleseren
// når en stegtekst bryter en regel, med regelnavnet i meldingen. Logikken er
// portert 1:1 fra Python-versjonene (historikk-kommentarene fulgte med);
// den ENE biten som krever DOM — sjekk-panelets varsler (v0.757) — står
// igjen i nettleserlaget som invariant_no_raw_floats_in_check_panel.
const sweep = [];
{
  const S2 = S;  // samme delte S som laget leser
  for (const m of ['standard', 'poolish', 'biga', 'mania', 'hurtig', 'kveld'])
  for (const pkald of (m === 'poolish' ? [false, true] : [false]))
  for (const ty of ['napoletana', 'newyork', 'langpanne', 'chicago', 'ingenelting'])
  for (const o of ['vanlig', 'pizza'])
  for (const h of [55, 65, 80]) {
    for (const k of Object.keys(S2)) delete S2[k];
    Object.assign(S2, lag.DEF);
    S2.method = m; S2.type = ty; S2.oven = o; S2.mode = 'start';
    S2.mel = 500; S2.hydro = h; S2.cold = 48; S2.temp = 22; S2.fridgeC = 3; S2.gjaer = 'torr';
    S2.hurtigH = 4; S2.kveldH = 10; S2.poolishH = 14; S2.bigaH = 18; S2.poolishCold = pkald;
    const lbl = m + (pkald ? '+kald' : '');
    let steps = null;
    try { steps = lag.stepsForAnchor(new Date(2027, 2, 3, 10, 0)); }
    catch (e) { sweep.push({ m: lbl, t: ty, o, h, err: '' + e }); continue; }
    if (!steps || !steps.length) { sweep.push({ m: lbl, t: ty, o, h, err: 'ingen steg' }); continue; }
    const bake = steps[steps.length - 1];
    // Siste steg før steking som handler om ovnen — enten merket dit du går
    // (dispLoc) eller navngitt som forvarming (Hurtigdeig/Ingen elting folder
    // forvarmingen inn i etterhevingssteget sitt).
    let gap = null, phTitle = null;
    for (let i = steps.length - 2; i >= 0; i--) {
      if (steps[i].dispLoc === 'ovn' || /forvarm|ovnen/i.test(steps[i].title)) {
        gap = Math.round((bake.at - steps[i].at) / 60000); phTitle = steps[i].title; break;
      }
    }
    sweep.push({ m: lbl, t: ty, o, h, recipe: lag.recipeFor(), preheatMin: lag.preheatMin(), gap, phTitle,
      steps: steps.map((s, i) => ({ title: s.title, desc: s.desc, why: s.why,
        tip: s.tip, substeps: s.substeps || [],
        passive: !!s.passive, loc: lag.stepLoc(s),
        minTilNeste: steps[i + 1] ? Math.round((steps[i + 1].at - s.at) / 60000) : 0 })),
      needs: steps.map(s => s.needs || []).reduce((a, b) => a.concat(b), []) });
  }
}
t('sveip: alle 210 kombinasjoner ga stegkjeder', !sweep.some(d => d.err),
  sweep.filter(d => d.err).slice(0, 5));

// Ordet i teksten, ikke emojien, bestemmer ingrediensen: 🍯 brukes både til
// oppskriftens sukker og til honningen som vekker gjæren i Hurtigdeig, og de
// to skal ikke summeres i samme bøtte.
const ING_WORDS = [['mel', 'flour'], ['vann', 'water'], ['salt', 'salt'],
                   ['gjær', 'yDry'], ['olje', 'oil'], ['smør', 'butter'], ['sukker', 'sugar']];
// v0.736-lærdommen: et vagt mengdeord er ikke bare upresist språk — det er
// stedet en motsigelse kan gjemme seg, fordi det ikke kan summeres og dermed
// er usynlig for massebalansen. Disse to er bevisste og gjelder mengder som
// IKKE er en del av oppskriften; alt annet vagt skal feile testen.
const VAGUE_OK = new Set(['🫒 litt olje', '🍯 1 ts honning']);
const NUM = /^(\d+(?:[.,]\d+)?)\s*g\b/;
// NB (portering): Python `entry[1:]` fjerner ett KODEPUNKT — emojiene foran
// needs-linjene er to UTF-16-enheter, så JS må splitte per kodepunkt, ellers
// blir en halv surrogat stående og NUM sitt ^-anker bommer på hele linja.
function ingOf(entry) {
  const tegn = [...String(entry || '')];
  const body = tegn.length && !/[\p{L}\p{N}]/u.test(tegn[0])
    ? tegn.slice(1).join('').trim() : String(entry || '');
  for (const [word, key] of ING_WORDS) {
    if (body.toLowerCase().includes(word)) return [key, body];
  }
  return [null, body];
}

{ // --- A: massebalanse ---
  const bad = [];
  for (const d of sweep) {
    if (d.err) continue;
    const got = {};
    for (const entry of d.needs) {
      const [key, body] = ingOf(entry);
      if (key === null) continue;
      const m = body.match(NUM);
      if (m) got[key] = Math.round(((got[key] || 0) + parseFloat(m[1].replace(',', '.'))) * 100) / 100;
    }
    for (const key of ['flour', 'water', 'salt', 'yDry', 'oil', 'butter', 'sugar']) {
      const want = d.recipe[key] || 0, have = got[key] || 0;
      if (Math.abs(have - want) > 0.011 && (have || want))
        bad.push(`${d.m}/${d.t}/${d.o} ${key}: steg=${have} oppskrift=${want}`);
    }
  }
  t('invariant_step_amounts_sum_to_recipe_all_configs', !bad.length, bad.slice(0, 12));
}

{ // --- B: vaghetslint ---
  const bad = new Set();
  for (const d of sweep) {
    for (const entry of (d.needs || [])) {
      const [key, body] = ingOf(entry);
      if (key === null || NUM.test(body) || VAGUE_OK.has(entry)) continue;
      bad.add(`${d.m}/${d.t}/${d.o}: ${entry}`);
    }
  }
  t('invariant_no_vague_amounts_for_recipe_ingredients', !bad.size, [...bad].slice(0, 12));
}

{ // --- C: forvarming i prosa vs. tid i tidsplanen ---
  // Stekesteget har alltid oppgitt hvor lenge ovnen må varmes. Invarianten er
  // at tidsplanen faktisk setter av den tiden — kravet skal ikke dukke opp i
  // det øyeblikket det er for sent å innfri. Fant Mania og Kveldsdeig, som
  // v0.737 antok alt hadde steget.
  const bad = [];
  for (const d of sweep) {
    if (d.err) continue;
    if (d.gap === null) bad.push(`${d.m}/${d.t}/${d.o}: ingen forvarmingssteg (krever ${d.preheatMin} min)`);
    else if (d.gap < d.preheatMin) bad.push(`${d.m}/${d.t}/${d.o}: ${d.gap} min satt av, ${d.preheatMin} min kreves`);
  }
  t('invariant_schedule_allows_the_preheat_it_demands', !bad.length, bad.slice(0, 12));
}

{ // --- D: ingen fakta som bare bor i understegene ---
  // «Kopier tidsplan» og «Del» tar tittel, desc, why og tip — ikke substeps,
  // ikke needs. Et tall som KUN finnes i understegene forsvinner fra en
  // kopiert plan (v0.755-funnet: Manias steketemperatur, åtte kombinasjoner).
  const NUM_UNIT = /(\d+(?:[.,]\d+)?)\s*(g|°C|min|sek|timer|t)\b/g;
  const tallMedEnhet = txt => new Set(
    [...String(txt || '').matchAll(NUM_UNIT)].map(m => m[1].replace(',', '.') + m[2]));
  const bad = [];
  for (const d of sweep) {
    if (d.err) continue;
    const iKopi = new Set();
    for (const st of d.steps) for (const felt of ['desc', 'why', 'tip'])
      for (const v of tallMedEnhet(st[felt])) iKopi.add(v);
    for (const st of d.steps) {
      const fraSub = new Set();
      for (const sub of st.substeps) for (const v of tallMedEnhet(sub)) fraSub.add(v);
      const tapt = [...fraSub].filter(v => !iKopi.has(v)).sort();
      if (tapt.length) bad.push(`${d.m}/${d.t}/${d.o}/${d.h}% · ${st.title}: ${tapt}`);
    }
  }
  t('invariant_no_facts_live_only_in_substeps', !bad.length, bad.slice(0, 12));
}

{ // --- E: ingen råe flyttall i stegtekst et menneske skal lese ---
  // Mer enn to desimaler i en brukertekst er alltid feil (v0.757: «ca.
  // 35.916666666666664 timer»). Sjekk-panelets varsler dekkes av nettleser-
  // laget (invariant_no_raw_floats_in_check_panel) — panelet er DOM.
  const RAA_FLYT = /\d+[.,]\d{3,}/g;
  const bad = [];
  for (const d of sweep) {
    if (d.err) continue;
    const biter = [];
    for (const st of d.steps) {
      for (const felt of ['desc', 'why', 'tip']) biter.push([`${st.title}.${felt}`, st[felt]]);
      for (const sub of st.substeps) biter.push([`${st.title}.substep`, sub]);
    }
    for (const [hvor, txt] of biter)
      for (const m of String(txt || '').match(RAA_FLYT) || [])
        bad.push(`${d.m}/${d.t}/${d.o}/${d.h}% · ${hvor}: ${m}`);
  }
  t('invariant_no_raw_floats_in_user_text', !bad.length, [...new Set(bad)].slice(0, 12));
}

{ // --- F: lange hevinger må si hva FOR LANGT ser ut som ---
  // En passiv heving på fire timer eller mer må beskrive overmodning —
  // beskrivelsen av hva som er KLART forteller når du kan gå videre, ikke
  // når toget har gått (v0.758-funnene: Mania-sluttsteget og Ingen elting).
  const OVERMODEN = new RegExp(
    '\\b(flyt|flat|kollaps|overhev|synker|sunket|slapp|spread|collaps|flatten|sunken|slack)\\w*\\b'
    + '|for langt|sur smak|skarpt sur|sharply sour|too far', 'i');
  const bad = [];
  for (const d of sweep) {
    if (d.err) continue;
    for (const st of d.steps) {
      if (!st.passive) continue;
      if (st.loc !== 'rom' && st.loc !== 'kjol') continue;
      if ((st.minTilNeste || 0) < 240) continue;
      const tekst = ['desc', 'why', 'tip'].map(f => String(st[f] || '')).join(' ');
      if (!OVERMODEN.test(tekst))
        bad.push(`${d.m}/${d.t}/${d.o}/${d.h}% · ${st.title} (${Math.round((st.minTilNeste || 0) / 60)}t)`);
    }
  }
  t('invariant_long_rises_say_what_too_far_looks_like', !bad.length, [...new Set(bad)].slice(0, 12));
}

{ // --- G: vannet skal ha en temperatur der det først tilsettes ---
  // Forgjæringene står 12–18 timer uten elting, så vannets temperatur ER
  // starttemperaturen (v0.763). Regelen gjelder FØRSTE steg som tilsetter
  // vann; senere steg kan vise tilbake uten å gjenta den.
  const VANN_MENGDE = /\d+(?:[.,]\d+)?\s*g\s+(?:kaldt\s+|kjølig\s+|romtemperert\s+)*vann/i;
  const VANN_TEMP = /\d+\s*(?:–|-)\s*\d+\s*°C|ca\.\s*\d+\s*°C|iskaldt|romtemperert|kjølig|lunkent/i;
  const bad = [];
  for (const d of sweep) {
    if (d.err) continue;
    for (const st of d.steps) {
      const tekst = [st.desc, ...st.substeps].map(x => String(x || '')).join(' ');
      if (!VANN_MENGDE.test(tekst)) continue;
      if (!VANN_TEMP.test(tekst)) bad.push(`${d.m}/${d.t}/${d.o}/${d.h}% · ${st.title}`);
      break;   // kun første vannsteg per plan
    }
  }
  t('invariant_water_states_its_temperature_where_added', !bad.length, [...new Set(bad)].slice(0, 12));
}

{ // --- H: deigballen heter ÉN ting på norsk ---
  // «ball» og «kule» bannlyses rett ut. «bolle» kan IKKE bannlyses (den er
  // redskapet 30 steder) — regelen er at «bolle» aldri står som objekt for
  // et formingsverb (v0.775: «lag en stram, rund bolle. Legg i bakebolle»).
  const NO_BALL = /\bball(?:en|er|ene)?\b|\bkule(?:n|r|ne)?\b/i;
  const BOLLE_SOM_DEIG = /(?:form|lag|brett|rund|stram)\w*[^.!?|]{0,40}\bbolle\b/i;
  const bad = [];
  for (const d of sweep) {
    if (d.err) continue;
    for (const st of d.steps) {
      const biter = [st.title, st.desc, st.why, st.tip, ...st.substeps];
      for (const b of biter) {
        const tekst = String(b || '');
        for (const [pat, hvorfor] of [[NO_BALL, 'ball/kule'], [BOLLE_SOM_DEIG, 'bolle=deig']]) {
          const m = tekst.match(pat);
          if (m) bad.push(`${d.m} · ${hvorfor} · «${m[0]}» i: ` + tekst.replace(/\s+/g, ' ').slice(0, 90));
        }
      }
    }
  }
  t('invariant_dough_ball_has_one_norwegian_name', !bad.length, [...new Set(bad)].slice(0, 12));
}

if (feil.length) {
  console.log(`Steglag: ${ok} OK, ${feil.length} FEILET:`);
  // Uinnrykket «❌ navn: FEILET — …» — samme linjeformat som nettleserlaget,
  // så CI-ens feiltabell (grep '^❌') også fanger node-lagets funn.
  feil.forEach(n => console.log(`❌ ${n}`));
  process.exit(1);
}
console.log(`Steglag: alle ${ok} tester OK (node, steps.js mot frossen baseline).`);
