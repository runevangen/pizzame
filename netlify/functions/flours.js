import { getStore } from '@netlify/blobs';

// Meltyper (flour types) flyttet ut av koden så nye mel kan legges til / egenskaper
// endres uten deploy. Speiler config.js-mønsteret. «annet / ikke i listen» er en
// frontend-sentinel og lagres IKKE her (kan ikke redigeres/slettes bort).
//
// GET    /api/flours                  -> { flours, updatedAt } (offentlig — lastes ved oppstart)
// PATCH  /api/flours/admin            -> (admin) legg til / endre ett mel { password, flour }  (upsert på .v)
// DELETE /api/flours/admin/:v         -> (admin) slett et mel { password }  (send password som ?password=X)
//
// Fallback: returnerer aldri tomt — seeder fra SEED_FLOURS (dagens hardkodede liste)
// hvis lageret er tomt. Frontend har i tillegg sin egen innebygde seed.

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Pizzamester2026';

// Dagens meltyper (uten «annet», som er en frontend-sentinel).
const SEED_FLOURS = [
  { v: 'dallari', t: 'Dallari pizzamel', protein: '10,7%', w: '–', hydro: '55–60%', hydroRange: { mn: 55, mx: 60 }, ferm: { mn: 4, mx: 8 } },
  { v: 'doppio_zero', t: 'Caputo Doppio Zero', protein: '11%', w: '220–230', hydro: '60–70%', hydroRange: { mn: 60, mx: 70 }, ferm: { mn: 6, mx: 24 } },
  { v: 'regal_pizzamel', t: 'Regal Pizzamel', protein: '11%', w: '–', hydro: '60–68%', hydroRange: { mn: 60, mx: 68 }, ferm: { mn: 6, mx: 24 }, estimated: true },
  { v: 'vanlig_hvetemel', t: 'Vanlig hvetemel', protein: '11,2%', w: '–', hydro: '55–63%', hydroRange: { mn: 55, mx: 63 }, ferm: { mn: 4, mx: 10 }, estimated: true },
  { v: 'ramlosa_tipo00', t: 'Ramlösa Kvarn Tipo 00', protein: '12,5%', w: '–', hydro: '58–70%', hydroRange: { mn: 58, mx: 70 }, ferm: { mn: 10, mx: 36 }, estimated: true },
  { v: 'pizzeria', t: 'Caputo Pizzeria', protein: '12,5%', w: '260–270', hydro: '60–80%', hydroRange: { mn: 60, mx: 80 }, ferm: { mn: 12, mx: 48 } },
  { v: 'nuvola', t: 'Caputo Nuvola', protein: '12,5%', w: '260–280', hydro: '60–75%', hydroRange: { mn: 60, mx: 75 }, ferm: { mn: 12, mx: 48 } },
  { v: 'regal_tipo00', t: 'Regal Tipo 00', protein: '13%', w: '–', hydro: '60–75%', hydroRange: { mn: 60, mx: 75 }, ferm: { mn: 12, mx: 48 }, estimated: true },
  { v: 'couco', t: 'Caputo Cuoco', protein: '13%', w: '300–320', hydro: '60–80%', hydroRange: { mn: 60, mx: 80 }, ferm: { mn: 16, mx: 54 } },
  { v: 'manitoba', t: 'Caputo Manitoba Oro', protein: '12,9–14,5%', w: '340–390', hydro: '70–100%', hydroRange: { mn: 70, mx: 100 }, ferm: { mn: 24, mx: 120 } }
];

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
function checkAdminPassword(pw) { return !!pw && pw === ADMIN_PASSWORD; }
function idFromPath(path) { const p = path.split('/').filter(Boolean); return p[p.length - 1]; }

// Saniter ett mel til en trygg, forventet form. Returnerer null hvis ubrukelig.
// ferm.mx kappes ved 240t (10 døgn) og hydrering 0–200 for å hindre fotgun-verdier.
function sanitizeFlour(f) {
  if (!f || typeof f !== 'object') return null;
  const v = String(f.v || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  const t = String(f.t || '').trim();
  if (!v || v === 'annet' || !t) return null; // 'annet' er reservert sentinel
  const num = (x, lo, hi, dflt) => { const n = Number(x); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : dflt; };
  const fMn = num(f.ferm && f.ferm.mn, 0, 240, 24);
  const fMx = num(f.ferm && f.ferm.mx, 0, 240, 48);
  const hMn = num(f.hydroRange && f.hydroRange.mn, 0, 200, 60);
  const hMx = num(f.hydroRange && f.hydroRange.mx, 0, 200, 70);
  const out = {
    v, t,
    protein: String(f.protein || '–').slice(0, 20),
    w: String(f.w || '–').slice(0, 20),
    hydro: String(f.hydro || (hMn + '–' + hMx + '%')).slice(0, 20),
    hydroRange: { mn: Math.min(hMn, hMx), mx: Math.max(hMn, hMx) },
    ferm: { mn: fMn, mx: fMx }
  };
  if (f.tEn) out.tEn = String(f.tEn).slice(0, 40);
  if (f.estimated) out.estimated = true;
  return out;
}

async function getFlours(store) {
  let list = await store.get('list', { type: 'json' });
  if (!Array.isArray(list) || !list.length) {
    list = SEED_FLOURS.map(f => ({ ...f }));
    await store.setJSON('list', list);
    return list;
  }
  // v0.804: lageret vant ALT så snart det fantes — seeden ble bare lest ved
  // første kall noensinne. Konsekvens, meldt inn fra prod: nye mel i koden
  // (Ramlösa, v0.803) dukket aldri opp, og Cuoco-navnerettingen (v0.801) ble
  // aldri synlig, fordi frontenden lar serverlista overstyre sin egen seed ved
  // oppstart. Testene fanget det ikke: de kjører uten serverfunksjonen, så
  // applyFlours() får aldri data lokalt.
  //
  // Migrering ved lesing, med adminens suverenitet i behold:
  //  · Seed-mel som mangler i lagret liste settes inn på seed-plassen sin
  //    (lista er sortert etter protein — å dytte dem bakerst hadde rotet den).
  //  · Kjente feilverdier rettes BARE hvis lagret verdi fortsatt er nøyaktig
  //    den gamle feilen — har admin endret noe selv, røres det ikke.
  let endret = false;
  SEED_FLOURS.forEach((f, i) => {
    if (!list.some(x => x.v === f.v)) {
      list.splice(Math.min(i, list.length), 0, { ...f });
      endret = true;
    }
  });
  const c = list.find(f => f.v === 'couco');
  if (c && c.t === 'Caputo Couco') { c.t = 'Caputo Cuoco'; endret = true; }
  if (c && c.w === '300–340') { c.w = '300–320'; endret = true; }
  if (endret) await store.setJSON('list', list);
  return list;
}

export default async (req) => {
  const store = getStore('pizza-flours');
  const url = new URL(req.url);
  const path = url.pathname;
  const isAdmin = path.includes('/flours/admin');

  try {
    // ===== Offentlig: hent gjeldende meltyper =====
    if (req.method === 'GET' && path.endsWith('/flours')) {
      const flours = await getFlours(store);
      return json(200, { flours });
    }

    // ===== Admin: legg til / endre ett mel (upsert på .v) =====
    if (req.method === 'PATCH' && isAdmin) {
      const body = await req.json();
      if (!checkAdminPassword(body.password)) return json(401, { error: 'Feil passord' });
      const clean = sanitizeFlour(body.flour);
      if (!clean) return json(400, { error: 'Ugyldig mel (mangler v/t eller ugyldige tall)' });
      const list = await getFlours(store);
      const idx = list.findIndex(f => f.v === clean.v);
      if (idx >= 0) list[idx] = clean; else list.push(clean);
      await store.setJSON('list', list);
      return json(200, { ok: true, flours: list });
    }

    // ===== Admin: slett et mel =====
    if (req.method === 'DELETE' && isAdmin) {
      const v = idFromPath(path);
      const password = url.searchParams.get('password') || (await req.json().catch(() => ({}))).password;
      if (!checkAdminPassword(password)) return json(401, { error: 'Feil passord' });
      const list = await getFlours(store);
      const next = list.filter(f => f.v !== v);
      if (next.length === list.length) return json(404, { error: 'Fant ikke mel' });
      if (!next.length) return json(400, { error: 'Kan ikke slette alle mel' });
      await store.setJSON('list', next);
      return json(200, { ok: true, flours: next });
    }

    return json(405, { error: 'Metode ikke støttet' });
  } catch (e) {
    return json(500, { error: e.message || 'Ukjent feil' });
  }
};

export const config = { path: ['/api/flours', '/api/flours/admin', '/api/flours/admin/:v'] };
