import { getStore } from '@netlify/blobs';

// Kolonner (tavlens lister) — lagret som DATA allerede i v1, ikke som hardkodede
// strenger i UI-et. Hver kolonne har { id, navn, rekkefolge }. I v1 lar UI-et deg
// bare ikke redigere dem ennå; når det åpnes i v2 er det en ren UI-endring, ingen
// datamigrering — fordi kolonnene alt bor her.
//
// GET    /api/planlegger/columns              -> { columns } (offentlig, lastes ved oppstart)
// PATCH  /api/planlegger/columns/admin        -> (admin) upsert én kolonne { password, column:{id?,navn,rekkefolge?} }
// PATCH  /api/planlegger/columns/admin/order  -> (admin) sett rekkefolge { password, order:[id,...] }
// DELETE /api/planlegger/columns/admin/:id    -> (admin) slett kolonne (?password=X)
//
// Merk: kort ligger i en egen store (planlegger-cards). Å slette en kolonne som
// har kort er en v2-avgjørelse (flytt kortene? blokker?) og håndteres ikke her —
// funksjonen sperrer bare mot å slette den siste kolonnen.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Pizzamester2026';

// Standardkolonner. Seedes første gang lageret leses og er tomt.
const SEED_COLUMNS = [
  { id: 'col_todo',  navn: 'Å gjøre', rekkefolge: 0 },
  { id: 'col_doing', navn: 'Pågår',   rekkefolge: 1 },
  { id: 'col_done',  navn: 'Ferdig',  rekkefolge: 2 }
];

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
function checkAdminPassword(pw) { return !!pw && pw === ADMIN_PASSWORD; }
function idFromPath(path) { const p = path.split('/').filter(Boolean); return p[p.length - 1]; }

async function getColumns(store) {
  let list = await store.get('list', { type: 'json' });
  if (!Array.isArray(list) || !list.length) {
    list = SEED_COLUMNS.map(c => ({ ...c }));
    await store.setJSON('list', list);
  }
  list.sort((a, b) => (a.rekkefolge ?? 0) - (b.rekkefolge ?? 0));
  return list;
}

export default async (req) => {
  const store = getStore('planlegger-columns');
  const url = new URL(req.url);
  const path = url.pathname;
  const isOrder = path.endsWith('/columns/admin/order');
  const isAdminUpsert = path.endsWith('/columns/admin') || path.endsWith('/columns/admin/');

  try {
    // ===== Offentlig: hent kolonner =====
    if (req.method === 'GET' && path.endsWith('/columns')) {
      return json(200, { columns: await getColumns(store) });
    }

    // ===== Admin: sett rekkefolge fra en id-liste =====
    if (req.method === 'PATCH' && isOrder) {
      const body = await req.json();
      if (!checkAdminPassword(body.password)) return json(401, { error: 'Feil passord' });
      if (!Array.isArray(body.order)) return json(400, { error: 'Mangler order[]' });
      const list = await getColumns(store);
      const rank = new Map(body.order.map((id, i) => [id, i]));
      list.forEach(c => { if (rank.has(c.id)) c.rekkefolge = rank.get(c.id); });
      list.sort((a, b) => a.rekkefolge - b.rekkefolge);
      await store.setJSON('list', list);
      return json(200, { ok: true, columns: list });
    }

    // ===== Admin: upsert én kolonne =====
    if (req.method === 'PATCH' && isAdminUpsert) {
      const body = await req.json();
      if (!checkAdminPassword(body.password)) return json(401, { error: 'Feil passord' });
      const navn = String(body.column && body.column.navn || '').trim().slice(0, 40);
      if (!navn) return json(400, { error: 'Mangler kolonnenavn' });
      const list = await getColumns(store);
      const id = String(body.column.id || '').trim();
      const existing = id && list.find(c => c.id === id);
      if (existing) {
        existing.navn = navn;
        if (Number.isFinite(body.column.rekkefolge)) existing.rekkefolge = body.column.rekkefolge;
      } else {
        const newId = id || 'col_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        const rekkefolge = Number.isFinite(body.column.rekkefolge)
          ? body.column.rekkefolge
          : (list.reduce((m, c) => Math.max(m, c.rekkefolge ?? 0), -1) + 1);
        list.push({ id: newId, navn, rekkefolge });
      }
      list.sort((a, b) => a.rekkefolge - b.rekkefolge);
      await store.setJSON('list', list);
      return json(200, { ok: true, columns: list });
    }

    // ===== Admin: slett kolonne =====
    if (req.method === 'DELETE' && path.includes('/columns/admin/')) {
      const id = idFromPath(path);
      const password = url.searchParams.get('password');
      if (!checkAdminPassword(password)) return json(401, { error: 'Feil passord' });
      const list = await getColumns(store);
      const next = list.filter(c => c.id !== id);
      if (next.length === list.length) return json(404, { error: 'Fant ikke kolonne' });
      if (!next.length) return json(400, { error: 'Kan ikke slette den siste kolonnen' });
      await store.setJSON('list', next);
      return json(200, { ok: true, columns: next });
    }

    return json(405, { error: 'Metode ikke støttet' });
  } catch (e) {
    return json(500, { error: e.message || 'Ukjent feil' });
  }
};

export const config = {
  path: [
    '/api/planlegger/columns',
    '/api/planlegger/columns/admin',
    '/api/planlegger/columns/admin/order',
    '/api/planlegger/columns/admin/:id'
  ]
};
