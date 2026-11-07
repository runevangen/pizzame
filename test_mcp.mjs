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
import { createServer } from 'node:http';

// HTTP-utgaven (netlify/functions/mcp.js) kjører i DENNE prosessen — ankre
// som "2026-08-01T18:00" må tolkes i norsk tid, som i de andre lagene.
process.env.TZ = 'Europe/Oslo';

const baseline = JSON.parse(readFileSync(new URL('./baseline_results.json', import.meta.url), 'utf8'));

let ok = 0; const feil = [];
function t(navn, sann, detalj) {
  if (sann) { ok++; }
  else { feil.push(`${navn}: FEILET` + (detalj !== undefined ? ` — ${JSON.stringify(detalj)}` : '')); }
}

// ===== Spawn serveren og snakk JSON-RPC med den =====
// Fabrikk (v0.854): melregister-testene trenger flere instanser med ulik
// PIZZAME_API. Hovedinstansen peker på en lukket port, så porten ALDRI er
// avhengig av nett — connection refused er umiddelbar, og fallbacken til
// innebygd seed er selve kontrakten som testes.
const alleBarn = [];
function startServer(env) {
  const barn = spawn(process.execPath, [new URL('./mcp_server.mjs', import.meta.url).pathname],
    { stdio: ['pipe', 'pipe', 'inherit'], env: { ...process.env, ...env } });
  alleBarn.push(barn);
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
  async function init() {
    const i = await kall('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '0' } });
    barn.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
    return i;
  }
  return { barn, kall, verktoy, init };
}
// Melregister-stubb: en liten http-server som svarer det testen bestemmer.
function startMelStubb(svar) {
  const srv = createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(svar));
  });
  return new Promise((resolve) => srv.listen(0, '127.0.0.1', () =>
    resolve({ url: `http://127.0.0.1:${srv.address().port}`, srv })));
}

const hoved = startServer({ PIZZAME_API: 'http://127.0.0.1:1' });
const { barn, kall, verktoy } = hoved;

try {
  // --- Håndtrykk ---
  const init = await kall('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '0' } });
  t('initialize svarer med serverInfo', init.result && init.result.serverInfo.name === 'pizzame-motor', init.result);
  // v0.857: tonen følger håndtrykket. Instruksen skal finnes, og den skal
  // navngi selve frasen den forbyr — det er den vokteren kan ta på.
  t('initialize bærer tone-instruksen («motoren sier» er forbudt)',
    typeof init.result.instructions === 'string' && init.result.instructions.includes('«motoren sier»')
    && init.result.instructions.includes('pizzacoach'), init.result.instructions);
  // v0.860: pizzaens nasjonalitet farger stemningen, men språket er norsk.
  // Vokteren tar på det testbare: instruksen nevner italiensk-glosene,
  // amerikansk gemytt og at språket forblir norsk.
  t('tone-instruksen bærer nasjonalitetsregelen (italiensk/amerikansk, norsk språk)',
    init.result.instructions.includes('italienske gloser')
    && init.result.instructions.includes('amerikansk')
    && init.result.instructions.includes('språket forblir norsk'), init.result.instructions);
  // v0.860: serverversjonen EIES av changelog.js — en egen kopi i verktøylaget
  // drev fra virkeligheten på tre dager (sto på 0.856 t.o.m. v0.859).
  const changelogTopp = (readFileSync(new URL('./changelog.js', import.meta.url), 'utf8')
    .match(/"v":\s*"([\d.]+)"/) || [])[1];
  t('serverversjonen er changelog-toppen (ingen egen kopi)',
    !!changelogTopp && init.result.serverInfo.version === changelogTopp,
    { server: init.result.serverInfo.version, changelog: changelogTopp });
  barn.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

  const liste = await kall('tools/list', {});
  const navn = (liste.result ? liste.result.tools : []).map(v => v.name).sort();
  t('tools/list gir alle fire verktøyene',
    JSON.stringify(navn) === JSON.stringify(['lag_plan', 'mel_som_passer', 'mengder', 'metoder_som_rekker']), navn);

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
    t('uten nett: melkilden er ærlig («innebygd»)', trangt.data.melkilde === 'innebygd', trangt.data.melkilde);
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

  // --- mel_som_passer (v0.854): melregisteret gjennom protokollen ---
  // Seed-fasiten: standard med 48t kald heving gir ~50t total gjæring — bare
  // de to sterkeste melene (Cuoco 16–54, Manitoba 24–120) tåler det, og
  // Dallari (4–8) gjør det ikke. Tallene bor i engine.js sin MELTYPER_SEED.
  const melSvar = await verktoy('mel_som_passer', { metode: 'standard', cold: 48 });
  if (!melSvar.data) { t('mel_som_passer svarer', false, melSvar.err || melSvar.text); }
  else {
    const d = melSvar.data;
    const taaler = d.mel.filter(m => m.taaler).map(m => m.navn);
    t('mel_som_passer: kilde er innebygd uten nett', d.melkilde === 'innebygd', d.melkilde);
    t('mel_som_passer: 48t kald krever sterkt mel',
      taaler.includes('Caputo Cuoco') && taaler.includes('Caputo Manitoba Oro') && taaler.length === 2,
      { totalTimer: d.totalGjaeringTimer, taaler });
    t('mel_som_passer: svake mel sier ærlig nei',
      d.mel.some(m => m.navn === 'Dallari pizzamel' && !m.taaler), d.mel.map(m => `${m.navn}:${m.taaler}`));
    t('mel_som_passer: de som tåler står først', d.mel[0].taaler === true && d.mel[d.mel.length - 1].taaler === false, d.mel[0]);
    t('mel_som_passer: hydrering sjekkes mot melets spenn',
      d.mel.every(m => typeof m.hydroPasser === 'boolean'), d.mel[0]);
  }

  // --- Levende register: en stubb-server spiller /api/flours ---
  const stubbOK = await startMelStubb({ flours: [
    { v: 'testmel', t: 'Testmel Ekstra', protein: '13%', w: '–', hydro: '60–80%',
      hydroRange: { mn: 60, mx: 80 }, ferm: { mn: 1, mx: 200 } },
  ] });
  const live = startServer({ PIZZAME_API: stubbOK.url });
  await live.init();
  const lm = await live.verktoy('mel_som_passer', { metode: 'standard', cold: 48 });
  t('levende register: kilden er «server»', !!lm.data && lm.data.melkilde === 'server', lm.data && lm.data.melkilde);
  t('levende register: appens mel erstatter seed-en',
    !!lm.data && lm.data.mel.length === 1 && lm.data.mel[0].navn === 'Testmel Ekstra' && lm.data.mel[0].taaler,
    lm.data && lm.data.mel);
  const lr = await live.verktoy('metoder_som_rekker', { tidspunkt: '2026-08-01T18:00', naa: '2026-07-20T10:00' });
  t('levende register: metoder_som_rekker melder samme kilde', !!lr.data && lr.data.melkilde === 'server',
    lr.data && lr.data.melkilde);
  stubbOK.srv.close();

  // --- Ugyldig serversvar: valideringen (delt med appen) skal beholde seed-en ---
  const stubbSoppel = await startMelStubb({ flours: [{ v: 'annet', t: 'Kupp' }, { v: '' }, 42] });
  const soppel = startServer({ PIZZAME_API: stubbSoppel.url });
  await soppel.init();
  const sm = await soppel.verktoy('mel_som_passer', { metode: 'standard', cold: 48 });
  t('ugyldig serversvar: faller ærlig tilbake til innebygd',
    !!sm.data && sm.data.melkilde === 'innebygd' && sm.data.mel.length === 10,
    sm.data && { melkilde: sm.data.melkilde, antall: sm.data.mel.length });
  stubbSoppel.srv.close();

  // --- HTTP-transporten (v0.856): fjernutgaven gjennom /api/mcp ---
  // Samme delte håndterer (mcp_verktoy.mjs) — her testes selve
  // Netlify-funksjonen i prosess, med ekte Request/Response-objekter.
  // PIZZAME_API settes FØR import, så porten aldri avhenger av nett.
  process.env.PIZZAME_API = 'http://127.0.0.1:1';
  const { default: httpHandler, config: httpConfig } = await import('./netlify/functions/mcp.js');
  t('http: ruter på /api/mcp og /api/kalender',
    JSON.stringify(httpConfig.path) === JSON.stringify(['/api/mcp', '/api/kalender']), httpConfig);
  const post = (body) => httpHandler(new Request('http://localhost/api/mcp',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
  const hInit = await (await post({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18' } })).json();
  t('http: initialize svarer med serverInfo', !!hInit.result && hInit.result.serverInfo.name === 'pizzame-motor', hInit);
  t('http: samme tone-instruks som stdio (delt lag)',
    !!hInit.result && hInit.result.instructions === init.result.instructions, hInit.result && hInit.result.instructions);
  t('http: samme versjon som stdio (begge leser changelog-toppen)',
    !!hInit.result && hInit.result.serverInfo.version === init.result.serverInfo.version,
    hInit.result && hInit.result.serverInfo);
  const hVarsel = await post({ jsonrpc: '2.0', method: 'notifications/initialized' });
  t('http: varsel kvitteres med 202 uten svar', hVarsel.status === 202, hVarsel.status);
  const hListe = await (await post({ jsonrpc: '2.0', id: 2, method: 'tools/list' })).json();
  t('http: alle fire verktøyene', !!hListe.result && hListe.result.tools.length === 4,
    hListe.result && hListe.result.tools.map(x => x.name));
  const hPlan = await (await post({ jsonrpc: '2.0', id: 3, method: 'tools/call',
    params: { name: 'lag_plan', arguments: { ...SCEN[0].args, tidspunkt: '2026-08-01T18:00', anker: 'start' } } })).json();
  const hData = JSON.parse(hPlan.result.content[0].text);
  t('http: lag_plan regner samme frosne scenario som steglaget',
    hData.steg[0].tid_iso === baseline.standard_napoletana.firstStep.iso
    && hData.steg.length === baseline.standard_napoletana.stepCount,
    { fikk: hData.steg[0], forventet: baseline.standard_napoletana.firstStep });
  const hGet = await httpHandler(new Request('http://localhost/api/mcp', { method: 'GET' }));
  t('http: GET avvises med 405 (ingen SSE-strøm tilbys)', hGet.status === 405, hGet.status);

  // --- /api/kalender (v0.859): planen som .ics, lenket fra lag_plan ---
  t('kalender: lag_plan bærer kalender_url med samme felter',
    hData.kalender_url && hData.kalender_url.includes('/api/kalender?')
    && hData.kalender_url.includes('metode=standard') && hData.kalender_url.includes('tidspunkt=2026-08-01T18%3A00'),
    hData.kalender_url);
  const hKal = await httpHandler(new Request('http://localhost' + hData.kalender_url.slice(hData.kalender_url.indexOf('/api/kalender')), { method: 'GET' }));
  const kalTekst = await hKal.text();
  t('kalender: GET svarer med .ics-fil', hKal.status === 200
    && (hKal.headers.get('Content-Type') || '').includes('text/calendar')
    && (hKal.headers.get('Content-Disposition') || '').includes('pizzaplan.ics'), hKal.status);
  t('kalender: én hendelse per plansteg (rundtur mot lag_plan)',
    (kalTekst.match(/BEGIN:VEVENT/g) || []).length === hData.steg.length,
    { steg: hData.steg.length, hendelser: (kalTekst.match(/BEGIN:VEVENT/g) || []).length });
  const hKalFeil = await httpHandler(new Request('http://localhost/api/kalender?metode=surdeig&tidspunkt=2026-08-01T18:00', { method: 'GET' }));
  t('kalender: ugyldig metode gir 400 med forklaring', hKalFeil.status === 400 && (await hKalFeil.text()).includes('surdeig'), hKalFeil.status);
  const hKalPost = await httpHandler(new Request('http://localhost/api/kalender', { method: 'POST', body: '{}' }));
  t('kalender: POST avvises med 405', hKalPost.status === 405, hKalPost.status);
  const hRot = await httpHandler(new Request('http://localhost/api/mcp', { method: 'POST', body: 'ikke json' }));
  t('http: ugyldig JSON gir -32700', hRot.status === 400 && (await hRot.json()).error.code === -32700, hRot.status);

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
  for (const b of alleBarn) b.kill();
}

if (feil.length) {
  for (const f of feil) console.log(`❌ ${f}`);
  console.log(`MCP-laget: ${feil.length} av ${ok + feil.length} tester FEILET.`);
  process.exit(1);
}
console.log(`MCP-laget: alle ${ok} tester OK (node, stdio + HTTP gjennom delt mcp_verktoy.mjs).`);
