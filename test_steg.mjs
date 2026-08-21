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
  ;return { rawSteps, hurtigSteps, kveldSteps, stepsForAnchor, maniaRecipe, R, DEF };
`)(globalThis.window, S);

let ok = 0; const feil = [];
function t(navn, sann, detalj) {
  if (sann) { ok++; } else { feil.push(navn + (detalj !== undefined ? ` — ${JSON.stringify(detalj)}` : '')); }
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

if (feil.length) {
  console.log(`Steglag: ${ok} OK, ${feil.length} FEILET:`);
  feil.forEach(n => console.log(`  ❌ ${n}`));
  process.exit(1);
}
console.log(`Steglag: alle ${ok} tester OK (node, steps.js mot frossen baseline).`);
