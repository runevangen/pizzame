// Gruppe 0d (v0.852): MCP-laget. mcp_server.mjs er et nytt hode på samme søm
// som test_steg.mjs — men DETTE laget tester gjennom selve stdio-protokollen:
// serveren spawnes som en ekte prosess, og JSON-RPC-meldingene går samme vei
// som en MCP-klient (Claude) ville sendt dem. Fasiten er de samme frosne
// scenariene i baseline_results.json som steglaget og nettleserlaget måles
// mot — svarer serveren noe annet enn motoren, stopper porten her.
//
// Kjøres av porten (test_regression.py) etter steglaget, og alene:
// `node test_mcp.mjs`.
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const baseline = JSON.parse(readFileSync(new URL('./baseline_results.json', import.meta.url), 'utf8'));

let ok = 0; const feil = [];
function t(navn, sann, detalj) {
  if (sann) { ok++; }
  else { feil.push(`${navn}: FEILET` + (detalj !== undefined ? ` — ${JSON.stringify(detalj)}` : '')); }
}

// ===== Spawn serveren og snakk JSON-RPC med den =====
const barn = spawn(process.execPath, [new URL('./mcp_server.mjs', import.meta.url).pathname],
  { stdio: ['pipe', 'pipe', 'inherit'] });
const ventere = new Map(); let nesteId = 1;
createInterface({ input: barn.stdout }).on('line', (linje) => {
  if (!linje.trim()) return;
  const msg = JSON.parse(linje);
  const v = ventere.get(msg.id);
  if (v) { ventere.delete(msg.id); v(msg); }
});
function kall(method, params) {
  const id = nesteId++;
  barn.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  return new Promise((res, rej) => {
    ventere.set(id, res);
    setTimeout(() => { if (ventere.delete(id)) rej(new Error(`${method}: ingen svar på 10 s`)); }, 10000);
  });
}
function verktoy(name, args) {
  return kall('tools/call', { name, arguments: args })
    .then(m => ({ err: m.error, isError: m.result && m.result.isError,
                  data: m.result && !m.result.isError ? JSON.parse(m.result.content[0].text) : null,
                  text: m.result ? m.result.content[0].text : '' }));
}

try {
  // --- Håndtrykk ---
  const init = await kall('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '0' } });
  t('initialize svarer med serverInfo', init.result && init.result.serverInfo.name === 'pizzame-motor', init.result);
  barn.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

  const liste = await kall('tools/list', {});
  const navn = (liste.result ? liste.result.tools : []).map(v => v.name).sort();
  t('tools/list gir alle tre verktøyene',
    JSON.stringify(navn) === JSON.stringify(['lag_plan', 'mengder', 'metoder_som_rekker']), navn);

  // --- Frosne scenarier gjennom protokollen — samme fasit som steglaget ---
  // Scenariofeltene speiler test_steg.mjs; anker='start' fordi baseline er
  // regnet med mode:'start' og anker 2026-08-01T18:00 (Europe/Oslo).
  const SCEN = [
    { name: 'standard_napoletana', args: { metode: 'standard', type: 'napoletana', mel: 500, hydro: 65, cold: 48, temp: 22, meltype: 'doppio_zero' } },
    { name: 'biga', args: { metode: 'biga', type: 'napoletana', mel: 500, hydro: 65, bigaH: 18, cold: 48, temp: 22, meltype: 'doppio_zero' } },
    { name: 'hurtig', args: { metode: 'hurtig', type: 'napoletana', mel: 500, hydro: 65, hurtigH: 4, temp: 22 } },
    { name: 'mania', args: { metode: 'mania', type: 'napoletana', mel: 500, temp: 22 } },
  ];
  for (const sc of SCEN) {
    const fasit = baseline[sc.name];
    const r = await verktoy('lag_plan', { ...sc.args, tidspunkt: '2026-08-01T18:00', anker: 'start' });
    if (r.err || r.isError || !r.data) { t(`${sc.name}: lag_plan svarer`, false, r.err || r.text); continue; }
    const steg = r.data.steg;
    t(`${sc.name}.stepCount via MCP`, steg.length === fasit.stepCount, { forventet: fasit.stepCount, fikk: steg.length });
    t(`${sc.name}.stepTitles via MCP`, JSON.stringify(steg.map(s => s.tittel)) === JSON.stringify(fasit.stepTitles),
      { forventet: fasit.stepTitles, fikk: steg.map(s => s.tittel) });
    t(`${sc.name}.firstStep.iso via MCP`, steg[0].tid_iso === fasit.firstStep.iso, { forventet: fasit.firstStep.iso, fikk: steg[0].tid_iso });
    t(`${sc.name}.lastStep.iso via MCP`, steg[steg.length - 1].tid_iso === fasit.lastStep.iso,
      { forventet: fasit.lastStep.iso, fikk: steg[steg.length - 1].tid_iso });
    // Oppskriften: lag_plan bruker recipeFor()/maniaRecipe() — det brukeren
    // ser i appen — mens baseline-recipe er R()/maniaRecipe() (steglagets
    // råtall). Fellesfeltene er identiske, UNNTATT hurtigdeigens gjær:
    // recipeFor() overstyrer den fra HOPTS (4 t ⇒ 3 g for 500 g mel), og det
    // er det riktige svaret å servere en som spør. Sjekkes eksplisitt under.
    const felter = sc.name === 'hurtig' ? ['flour', 'water', 'salt'] : ['flour', 'water', 'salt', 'yDry'];
    for (const felt of felter) {
      t(`${sc.name}.oppskrift.${felt} via MCP`, r.data.oppskrift[felt] === fasit.recipe[felt],
        { forventet: fasit.recipe[felt], fikk: r.data.oppskrift[felt] });
    }
    if (sc.name === 'hurtig') {
      t('hurtig.oppskrift.yDry er HOPTS-tallet (ikke R()-grunntallet)', r.data.oppskrift.yDry === 3,
        { forventet: 3, fikk: r.data.oppskrift.yDry });
    }
  }

  // --- mengder: kjernetall uten tidsplan ---
  const m = await verktoy('mengder', { metode: 'standard', type: 'napoletana', mel: 500, hydro: 65, meltype: 'doppio_zero' });
  t('mengder gir motorens kjernetall', !!m.data && m.data.flour === 500 && m.data.water === 325
    && m.data.salt === baseline.standard_napoletana.recipe.salt, m.data);

  // --- metoder_som_rekker (v0.853): Smart-plan-sveipet gjennom protokollen ---
  // `naa` er med i kallet så fasiten er deterministisk: 8 timer til ferdig
  // betyr at bare hurtigdeig rekker; med 12 dagers forsprang rekker alt.
  const trangt = await verktoy('metoder_som_rekker', { tidspunkt: '2026-08-01T18:00', naa: '2026-08-01T10:00' });
  if (!trangt.data) { t('metoder_som_rekker svarer', false, trangt.err || trangt.text); }
  else {
    const per = Object.fromEntries(trangt.data.metoder.map(m => [m.metode, m]));
    t('8t-vindu: hurtigdeig rekker', per.hurtig && per.hurtig.rekker === true, per.hurtig);
    t('8t-vindu: langtidsdeig rekker ikke', per.standard && per.standard.rekker === false, per.standard);
    t('8t-vindu: biga rekker ikke', per.biga && per.biga.rekker === false, per.biga);
    t('8t-vindu: ærlig om når du måtte startet', !!(per.standard && per.standard.maatteStartet_iso
      && per.standard.maatteStartet_iso < '2026-08-01T08:00:00.000Z'), per.standard);
    t('8t-vindu: beste hurtig starter etter «nå»', !!(per.hurtig.beste
      && per.hurtig.beste.start_iso >= '2026-08-01T08:00:00.000Z'), per.hurtig.beste);
  }
  const romslig = await verktoy('metoder_som_rekker', { tidspunkt: '2026-08-01T18:00', naa: '2026-07-20T10:00' });
  if (!romslig.data) { t('metoder_som_rekker (romslig) svarer', false, romslig.err || romslig.text); }
  else {
    t('12 dagers forsprang: alle seks metoder rekker', romslig.data.metoder.every(m => m.rekker),
      romslig.data.metoder.filter(m => !m.rekker).map(m => m.metode));
    // Rundtur-kontrakten: oppsettet svaret peker på skal gi en lag_plan som
    // faktisk steker på ferdigtidspunktet. Dette er HELE poenget med verktøyet
    // — et forslag du ikke kan bake etter er verre enn ingenting.
    const beste = romslig.data.metoder.find(m => m.metode === 'standard').beste;
    const plan = await verktoy('lag_plan', { ...beste.oppsett, metode: beste.oppsett.method,
      tidspunkt: '2026-08-01T18:00', anker: 'ferdig' });
    const siste = plan.data && plan.data.steg[plan.data.steg.length - 1];
    t('rundtur: beste oppsett gir plan som steker på ferdigtidspunktet',
      !!siste && siste.tid_iso === '2026-08-01T16:00:00.000Z', siste);
    t('rundtur: planens første steg matcher senesteStart-logikken',
      !!plan.data && plan.data.steg[0].tid_iso <= beste.start_iso, plan.data && plan.data.steg[0]);
  }

  // --- Feilveiene skal være høflige, presise og aldri gjette ---
  const f1 = await verktoy('lag_plan', { metode: 'surdeig', tidspunkt: '2026-08-01T18:00' });
  t('ukjent metode avvises med navn i meldingen', f1.isError && f1.text.includes('surdeig'), f1.text);
  const f2 = await verktoy('lag_plan', { metode: 'standard', tidspunkt: 'i morgen' });
  t('ugyldig tidspunkt avvises', f2.isError && f2.text.includes('tidspunkt'), f2.text);
  const f3 = await verktoy('lag_plan', { metode: 'standard', tidspunkt: '2026-08-01T18:00', mel: 'mye' });
  t('tekst i tallfelt avvises (pgrp-lærdommen)', f3.isError && f3.text.includes('mel'), f3.text);
  const f4 = await kall('tools/call', { name: 'finnes_ikke', arguments: {} });
  t('ukjent verktøy gir JSON-RPC-feil', !!f4.error, f4);
} catch (e) {
  feil.push(`protokoll: ${e.message}`);
} finally {
  barn.kill();
}

if (feil.length) {
  for (const f of feil) console.log(`❌ ${f}`);
  console.log(`MCP-laget: ${feil.length} av ${ok + feil.length} tester FEILET.`);
  process.exit(1);
}
console.log(`MCP-laget: alle ${ok} tester OK (node, mcp_server.mjs over stdio).`);
