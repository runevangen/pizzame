// Gruppe 0b (v0.835): serverfunksjonene. Seks netlify-funksjoner eier appens
// delte data — deiger, brukere/PIN, pizzatid, mel, kjernetall, feedback — og
// hadde NULL testdekning, til tross for at et reelt datatap alt har bodd her
// (BACKLOG #2: å åpne en lagret deig slettet avhakingen på serveren). De er
// vanlige Web-API-handlere (Request → Response) rundt @netlify/blobs, så de
// testes i node på millisekunder med en Map som blob-lager — samme
// last-og-stubb-mønster som test_enhet.mjs bruker mot engine.js.
// Kjøres av porten (test_regression.py) før nettleseren bootes, og alene:
// `node test_funksjoner.mjs`.
import { readFileSync } from 'node:fs';
import crypto from 'node:crypto';

// Konstantene leses når kilden evalueres — sett testpassordet FØR lasting,
// så assertene ikke trenger å kjenne prod-fallbacken.
process.env.ADMIN_PASSWORD = 'test-admin-passord';

// ===== Falskt blob-lager: nøyaktig API-flaten funksjonene bruker =====
// list() → {blobs:[{key}]}, get(key,{type:'json'}), setJSON(key,obj), delete(key).
// `korrupt` merker nøkler der get() skal kaste — for «én ødelagt post skal
// ikke velte lista»-testen (den vokteren finnes i bakes.js av en grunn).
function fakeStore() {
  const m = new Map(); const korrupt = new Set();
  return {
    _m: m, _korrupt: korrupt,
    async list() { return { blobs: [...m.keys()].map(key => ({ key })) }; },
    async get(key) {
      if (korrupt.has(key)) throw new Error('ugyldig JSON');
      return m.has(key) ? JSON.parse(m.get(key)) : null;
    },
    async setJSON(key, obj) { m.set(key, JSON.stringify(obj)); },
    async delete(key) { m.delete(key); },
  };
}

function lastFunksjon(fil, store) {
  let src = readFileSync(new URL(`./netlify/functions/${fil}`, import.meta.url), 'utf8');
  src = src
    .replace(/^import\s*\{\s*getStore\s*\}\s*from\s*'@netlify\/blobs';\s*$/m, '')
    .replace(/^import\s+crypto\s+from\s+'node:crypto';\s*$/m, '')
    .replace(/^export default/m, 'const _handler =')
    .replace(/^export const config =/m, 'const _config =');
  const getStore = () => store;
  return new Function('getStore', 'crypto', 'process',
    src + '\n;return _handler;')(getStore, crypto, process);
}

// Bygger en ekte Request og pakker ut Response — handlerne kjøres som i prod.
async function kall(handler, method, path, { body, query } = {}) {
  const url = 'http://lokal.test' + path + (query ? '?' + new URLSearchParams(query) : '');
  const req = new Request(url, {
    method,
    ...(body !== undefined ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } } : {}),
  });
  const res = await handler(req, {});
  return { status: res.status, body: await res.json() };
}

let ok = 0; const feil = [];
function t(navn, sann, detalj) {
  if (sann) { ok++; } else { feil.push(navn + (detalj !== undefined ? ` — ${JSON.stringify(detalj)}` : '')); }
}

// ===== bakes.js — deigene (stedet datatapet bodde) =====
{
  const store = fakeStore();
  const bakes = lastFunksjon('bakes.js', store);

  let r = await kall(bakes, 'POST', '/api/bakes', { body: { name: 'Uten anker', config: {} } });
  t('bakes: POST uten anchorISO avvises', r.status === 400);

  r = await kall(bakes, 'POST', '/api/bakes', { body: {
    name: 'Fredagsdeig', config: { method: 'standard' }, anchorISO: '2027-01-01T18:00',
    ownerId: 'u1', checkedSteps: [0, 'to', 2, 3.5], checkedIngredients: ['mel', 7],
  } });
  t('bakes: POST lagrer privat og aktiv', r.status === 201 && r.body.shared === false && r.body.status === 'active');
  t('bakes: checkedSteps beholder kun heltall', JSON.stringify(r.body.checkedSteps) === '[0,2]');
  t('bakes: checkedIngredients beholder kun strenger', JSON.stringify(r.body.checkedIngredients) === '["mel"]');
  const idA = r.body.id;

  const idA2 = (await kall(bakes, 'POST', '/api/bakes', { body: { name: 'Lørdagsdeig', config: {}, anchorISO: '2027-01-02T18:00', ownerId: 'u1' } })).body.id;
  const idB = (await kall(bakes, 'POST', '/api/bakes', { body: { name: 'Delt deig', config: {}, anchorISO: '2027-01-03T18:00', ownerId: 'u2', shared: true } })).body.id;
  await store.setJSON('bake_gammel', { id: 'bake_gammel', name: 'Eierløs', savedAt: '2020-01-01' });

  const navnene = async (query) => (await kall(bakes, 'GET', '/api/bakes', { query })).body.bakes.map(b => b.name).sort();
  t('bakes: eier ser egne + delte + eierløse', JSON.stringify(await navnene({ userId: 'u1' })) === '["Delt deig","Eierløs","Fredagsdeig","Lørdagsdeig"]');
  t('bakes: andre ser IKKE privat deig', JSON.stringify(await navnene({ userId: 'u2' })) === '["Delt deig","Eierløs"]');
  t('bakes: admin ser alt', (await navnene({ admin: 'test-admin-passord' })).length === 4);

  store._korrupt.add('bake_gammel');
  // bakes.js logger den korrupte posten med console.error — det er riktig
  // oppførsel i prod, men støy i testrapporten. Demp akkurat her.
  const _err = console.error; console.error = () => {};
  r = await kall(bakes, 'GET', '/api/bakes', { query: { userId: 'u1' } });
  console.error = _err;
  t('bakes: én korrupt post velter ikke lista', r.status === 200 && r.body.bakes.length === 3);
  store._korrupt.delete('bake_gammel');

  r = await kall(bakes, 'PATCH', `/api/bakes/${idA}`, { body: { userId: 'u2', note: 'hei' } });
  t('bakes: PATCH fra feil bruker avvises', r.status === 403);
  r = await kall(bakes, 'PATCH', `/api/bakes/${idA}`, { body: { userId: 'u1', rating: 7 } });
  t('bakes: rating utenfor 1–5 ignoreres', r.status === 200 && r.body.rating === null);
  r = await kall(bakes, 'PATCH', `/api/bakes/${idA}`, { body: { userId: 'u1', rating: 4, status: 'finished' } });
  t('bakes: eier kan fullføre med terningkast', r.status === 200 && r.body.rating === 4 && r.body.status === 'finished' && !!r.body.finishedAt);
  r = await kall(bakes, 'PATCH', `/api/bakes/${idA}`, { body: { userId: 'u1', photo: 'x'.repeat(900001) } });
  t('bakes: for stort bilde avvises', r.status === 400);

  await kall(bakes, 'PATCH', `/api/bakes/${idA}`, { body: { userId: 'u1', favorite: true } });
  await kall(bakes, 'PATCH', `/api/bakes/${idB}`, { body: { userId: 'u2', favorite: true } });
  r = await kall(bakes, 'PATCH', `/api/bakes/${idA2}`, { body: { userId: 'u1', favorite: true } });
  const fav = async (id) => (await store.get(id)).favorite;
  t('bakes: ny favoritt avsetter eierens forrige', r.status === 200 && (await fav(idA)) === false && (await fav(idA2)) === true);
  t('bakes: men rører ikke andre eieres favoritt', (await fav(idB)) === true);

  r = await kall(bakes, 'DELETE', `/api/bakes/${idA}`, { query: { userId: 'u2' } });
  t('bakes: DELETE fra feil bruker avvises', r.status === 403);
  r = await kall(bakes, 'DELETE', `/api/bakes/${idA}`, { query: { userId: 'u1' } });
  t('bakes: eier kan slette', r.status === 200 && (await store.get(idA)) === null);
}

// ===== users.js — navn + PIN (innloggingen) =====
{
  const store = fakeStore();
  const users = lastFunksjon('users.js', store);

  let r = await kall(users, 'POST', '/api/users', { body: { name: 'Rune', pin: '12' } });
  t('users: PIN må være 4 siffer', r.status === 400);
  r = await kall(users, 'POST', '/api/users', { body: { name: 'Rune', pin: '1234' } });
  t('users: registrering virker', r.status === 201 && r.body.name === 'Rune');
  const runeId = r.body.id;
  r = await kall(users, 'POST', '/api/users', { body: { name: '  rUNE ', pin: '9999' } });
  t('users: samme navn (normalisert) avvises', r.status === 409);
  r = await kall(users, 'GET', '/api/users', { query: { name: '  RUNE ' } });
  t('users: exists-sjekk normaliserer navnet', r.status === 200 && r.body.exists === true);

  r = await kall(users, 'POST', '/api/users/verify', { body: { name: 'Rune', pin: '0000' } });
  t('users: feil PIN gir 401', r.status === 401 && r.body.ok === false);
  r = await kall(users, 'POST', '/api/users/verify', { body: { name: 'rune', pin: '1234' } });
  t('users: riktig PIN logger inn', r.status === 200 && r.body.ok === true && r.body.id === runeId);

  // Admin-PIN-bytte går via id → nøkkel-oppslaget (keyForUserId) — det var en
  // reell bug at id ble brukt som nøkkel direkte, så akkurat den veien voktes.
  r = await kall(users, 'PATCH', `/api/users/admin/${runeId}`, { body: { password: 'feil', newPin: '4321' } });
  t('users: admin-PIN-bytte krever passord', r.status === 401);
  r = await kall(users, 'PATCH', `/api/users/admin/${runeId}`, { body: { password: 'test-admin-passord', newPin: '4321' } });
  t('users: admin kan sette ny PIN via id', r.status === 200);
  t('users: gammel PIN virker ikke lenger', (await kall(users, 'POST', '/api/users/verify', { body: { name: 'Rune', pin: '1234' } })).status === 401);
  t('users: ny PIN virker', (await kall(users, 'POST', '/api/users/verify', { body: { name: 'Rune', pin: '4321' } })).status === 200);
  r = await kall(users, 'GET', '/api/users/admin', { query: { password: 'test-admin-passord' } });
  t('users: admin-lista lekker ikke PIN-hash', r.status === 200 && r.body.users.length === 1 && !('pinHash' in r.body.users[0]));
  r = await kall(users, 'DELETE', `/api/users/admin/${runeId}`, { query: { password: 'test-admin-passord' } });
  t('users: admin kan slette via id', r.status === 200 && (await store.get('rune')) === null);
}

// ===== pizzatid.js — ledig tid per bruker =====
{
  const store = fakeStore();
  const pizzatid = lastFunksjon('pizzatid.js', store);

  let r = await kall(pizzatid, 'GET', '/api/pizzatid', { query: { userId: 'u1' } });
  t('pizzatid: uten lagring svares det med standarduka', r.status === 200 && JSON.stringify(r.body.schedule.mon) === '[["16:00","23:30"],["06:30","08:00"]]');
  r = await kall(pizzatid, 'POST', '/api/pizzatid', { body: { userId: 'u1', schedule: {
    mon: [['08:00', '10:00'], ['25:00', '26:00'], 'søppel', null],
    tue: [],
  } } });
  t('pizzatid: ugyldige perioder droppes, gyldige består', r.status === 200 && JSON.stringify(r.body.schedule.mon) === '[["08:00","10:00"]]');
  t('pizzatid: tom dag betyr aldri ledig (ikke standarduka)', JSON.stringify(r.body.schedule.tue) === '[]');
  r = await kall(pizzatid, 'GET', '/api/pizzatid', { query: { userId: 'u1' } });
  t('pizzatid: lagret uke leses tilbake', JSON.stringify(r.body.schedule.mon) === '[["08:00","10:00"]]');
}

// ===== flours/config/feedback — vaktene + én lykkelig vei hver =====
{
  const store = fakeStore();
  const flours = lastFunksjon('flours.js', store);
  let r = await kall(flours, 'GET', '/api/flours');
  t('flours: GET leverer melliste', r.status === 200 && Array.isArray(r.body.flours) && r.body.flours.length > 0);
  r = await kall(flours, 'PATCH', '/api/flours/admin', { body: { password: 'feil', flour: { v: 'x', t: 'X' } } });
  t('flours: endring krever admin-passord', r.status === 401);
}
{
  const store = fakeStore();
  const cfg = lastFunksjon('config.js', store);
  let r = await kall(cfg, 'GET', '/api/config');
  t('config: GET svarer 200', r.status === 200);
  r = await kall(cfg, 'PATCH', '/api/config/admin', { body: { password: 'feil', type: 'napoletana', field: 'salt', value: 3 } });
  t('config: endring krever admin-passord', r.status === 401);
}
{
  const store = fakeStore();
  const feedback = lastFunksjon('feedback.js', store);
  let r = await kall(feedback, 'POST', '/api/feedback', { body: { message: '' } });
  t('feedback: tom melding avvises', r.status === 400);
  r = await kall(feedback, 'POST', '/api/feedback', { body: { message: 'Mer pizza!', name: 'Rune' } });
  t('feedback: gyldig melding lagres', r.status === 201 || r.status === 200);
}

if (feil.length) {
  console.log(`Serverfunksjoner: ${ok} OK, ${feil.length} FEILET:`);
  feil.forEach(n => console.log(`  ❌ ${n}`));
  process.exit(1);
}
console.log(`Serverfunksjoner: alle ${ok} tester OK (node, netlify/functions).`);
