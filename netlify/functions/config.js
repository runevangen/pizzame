import { getStore } from '@netlify/blobs';

// Kjernetall per pizzatype (salt/olje/gjær/hydrering) — admin kan endre uten deploy.
// Alle andre tall (gjærkurver, meltyper, smør, sukker osv.) er fortsatt hardkodet i appen.
//
// GET    /api/config                       -> { values, updatedAt } (offentlig, ingen passord — brukes ved oppstart)
// PATCH  /api/config/admin                 -> (admin) endre én verdi { password, type, field, newValue }
// POST   /api/config/admin/revert          -> (admin) angre til forrige { password, type, field }
// POST   /api/config/suggest               -> (offentlig) foreslå endring { type, field, currentValue, suggestedValue, reasoning }
// GET    /api/config/suggestions?password=X          -> (admin) liste forslag (nyeste først)
// PATCH  /api/config/suggestions/admin/:id -> (admin) merk forslag { password, status:'applied'|'dismissed' } — 'applied' setter også selve verdien

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Pizzamester2026';
const FIELDS = ['salt', 'oil', 'yeast', 'hydro'];
const TYPES = ['napoletana', 'newyork', 'chicago', 'langpanne', 'ingenelting'];

const SEED_VALUES = {
  napoletana: { salt: 2.8, oil: 0,   yeast: 0.15, hydro: 65 },
  newyork:    { salt: 2.0, oil: 2.0, yeast: 0.2,  hydro: 63 },
  chicago:    { salt: 2.0, oil: 6.0, yeast: 0.2,  hydro: 55 },
  langpanne:  { salt: 2.0, oil: 3.0, yeast: 0.2,  hydro: 70 },
  ingenelting:{ salt: 2.0, oil: 6.0, yeast: 0.2,  hydro: 75 }
};

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
function checkAdminPassword(pw) { return !!pw && pw === ADMIN_PASSWORD; }
function idFromPath(path) { const p = path.split('/').filter(Boolean); return p[p.length - 1]; }
function validField(f) { return FIELDS.includes(f); }
function validType(t) { return TYPES.includes(t); }

async function getValuesRecord(store) {
  let rec = await store.get('values', { type: 'json' });
  if (!rec) {
    rec = {};
    for (const t of TYPES) {
      rec[t] = {};
      for (const f of FIELDS) rec[t][f] = { current: SEED_VALUES[t][f], previous: null };
    }
    await store.setJSON('values', rec);
  }
  return rec;
}

export default async (req, context) => {
  const configStore = getStore('pizza-config');
  const suggestStore = getStore('pizza-config-suggestions');
  const url = new URL(req.url);
  const path = url.pathname;
  const isAdminValues = path.endsWith('/config/admin') || path.endsWith('/config/admin/');
  const isRevert = path.endsWith('/admin/revert');
  const isSuggest = path.endsWith('/suggest');
  const isSuggestionsAdminPatch = path.includes('/suggestions/admin/');
  const isSuggestionsList = path.endsWith('/suggestions') || path.endsWith('/suggestions/');

  try {
    // ===== Offentlig: hent gjeldende verdier =====
    if (req.method === 'GET' && path.endsWith('/config')) {
      const rec = await getValuesRecord(configStore);
      return json(200, { values: rec });
    }

    // ===== Admin: liste forslag =====
    if (req.method === 'GET' && isSuggestionsList) {
      const password = url.searchParams.get('password');
      if (!checkAdminPassword(password)) return json(401, { error: 'Feil passord' });
      const { blobs } = await suggestStore.list();
      const items = await Promise.all(blobs.map(async b => await suggestStore.get(b.key, { type: 'json' })));
      const list = items.filter(Boolean).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return json(200, { suggestions: list });
    }

    // ===== Admin: angre til forrige verdi =====
    if (req.method === 'POST' && isRevert) {
      const body = await req.json();
      if (!checkAdminPassword(body.password)) return json(401, { error: 'Feil passord' });
      if (!validType(body.type) || !validField(body.field)) return json(400, { error: 'Ugyldig type/felt' });
      const rec = await getValuesRecord(configStore);
      const entry = rec[body.type][body.field];
      if (entry.previous === null || entry.previous === undefined) return json(400, { error: 'Ingen forrige verdi å angre til' });
      const temp = entry.current;
      entry.current = entry.previous;
      entry.previous = temp;
      await configStore.setJSON('values', rec);
      return json(200, { ok: true, values: rec });
    }

    // ===== Admin: endre en verdi =====
    if (req.method === 'PATCH' && isAdminValues) {
      const body = await req.json();
      if (!checkAdminPassword(body.password)) return json(401, { error: 'Feil passord' });
      if (!validType(body.type) || !validField(body.field)) return json(400, { error: 'Ugyldig type/felt' });
      const num = Number(body.newValue);
      if (!Number.isFinite(num)) return json(400, { error: 'Ugyldig tall' });
      const rec = await getValuesRecord(configStore);
      const entry = rec[body.type][body.field];
      entry.previous = entry.current;
      entry.current = num;
      await configStore.setJSON('values', rec);
      return json(200, { ok: true, values: rec });
    }

    // ===== Admin: merk forslag (og evt. bruk det) =====
    if (req.method === 'PATCH' && isSuggestionsAdminPatch) {
      const id = idFromPath(path);
      const body = await req.json();
      if (!checkAdminPassword(body.password)) return json(401, { error: 'Feil passord' });
      const suggestion = await suggestStore.get(id, { type: 'json' });
      if (!suggestion) return json(404, { error: 'Fant ikke forslag' });
      suggestion.status = body.status === 'applied' ? 'applied' : 'dismissed';
      await suggestStore.setJSON(id, suggestion);
      if (suggestion.status === 'applied') {
        const rec = await getValuesRecord(configStore);
        const entry = rec[suggestion.type][suggestion.field];
        entry.previous = entry.current;
        entry.current = suggestion.suggestedValue;
        await configStore.setJSON('values', rec);
      }
      return json(200, { ok: true });
    }

    // ===== Offentlig: foreslå endring =====
    if (req.method === 'POST' && isSuggest) {
      const body = await req.json();
      if (!validType(body.type) || !validField(body.field)) return json(400, { error: 'Ugyldig type/felt' });
      const suggestedValue = Number(body.suggestedValue);
      if (!Number.isFinite(suggestedValue)) return json(400, { error: 'Ugyldig tall' });
      const id = 'sug_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      const item = {
        id,
        type: body.type,
        field: body.field,
        currentValue: body.currentValue,
        suggestedValue,
        reasoning: String(body.reasoning || '').slice(0, 500),
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      await suggestStore.setJSON(id, item);
      return json(201, item);
    }

    return json(405, { error: 'Metode ikke støttet' });
  } catch (e) {
    return json(500, { error: e.message || 'Ukjent feil' });
  }
};

export const config = { path: ['/api/config', '/api/config/admin', '/api/config/admin/revert', '/api/config/suggest', '/api/config/suggestions', '/api/config/suggestions/admin/:id'] };
