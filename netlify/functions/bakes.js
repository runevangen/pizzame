import { getStore } from '@netlify/blobs';

// Delt liste over aktive og ferdige bakster.
// Ingen pålogging — åpen for alle i familie/vennegruppen som har lenken.
// GET    /api/bakes          -> liste alle
// POST   /api/bakes          -> lagre ny bakst { name, config, anchorMode, anchorISO }
// PATCH  /api/bakes/:id      -> merk ferdig + kommentar { note } eller gjenåpne { status:'active' },
//                                eller sett/fjern favoritt { favorite: true|false } (kun én favoritt om gangen)
// DELETE /api/bakes/:id      -> slette permanent

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function idFromPath(path) {
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1];
}

export default async (req, context) => {
  const store = getStore('pizza-bakes');
  const url = new URL(req.url);
  const isCollection = url.pathname.endsWith('/bakes') || url.pathname.endsWith('/bakes/');

  try {
    if (req.method === 'GET') {
      const { blobs } = await store.list();
      const bakes = await Promise.all(
        blobs.map(async (b) => {
          const raw = await store.get(b.key, { type: 'json' });
          return raw;
        })
      );
      bakes.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
      return json(200, { bakes: bakes.filter(Boolean) });
    }

    if (req.method === 'POST' && isCollection) {
      const body = await req.json();
      if (!body.name || !body.config || !body.anchorISO) {
        return json(400, { error: 'Mangler name, config eller anchorISO' });
      }
      const id = 'bake_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      const bake = {
        id,
        name: String(body.name).slice(0, 60),
        status: 'active',
        favorite: false,
        config: body.config,
        anchorMode: body.anchorMode === 'end' ? 'end' : 'start',
        anchorISO: body.anchorISO,
        savedAt: new Date().toISOString(),
        finishedAt: null,
        note: '',
        checkedSteps: Array.isArray(body.checkedSteps) ? body.checkedSteps.filter(n => Number.isInteger(n)).slice(0, 50) : []
      };
      await store.setJSON(id, bake);
      return json(201, bake);
    }

    if (req.method === 'PATCH') {
      const id = idFromPath(url.pathname);
      if (!id) return json(400, { error: 'Mangler id' });
      const existing = await store.get(id, { type: 'json' });
      if (!existing) return json(404, { error: 'Fant ikke bakst' });
      const body = await req.json();
      const updated = { ...existing };
      if (body.status === 'finished') {
        updated.status = 'finished';
        updated.finishedAt = new Date().toISOString();
      } else if (body.status === 'active') {
        updated.status = 'active';
        updated.finishedAt = null;
      }
      if (typeof body.note === 'string') updated.note = body.note.slice(0, 2000);
      if (typeof body.name === 'string' && body.name.trim()) updated.name = body.name.trim().slice(0, 60);
      if (body.config) updated.config = body.config;
      if (body.anchorMode) updated.anchorMode = body.anchorMode === 'end' ? 'end' : 'start';
      if (typeof body.anchorISO === 'string') updated.anchorISO = body.anchorISO;
      if (Array.isArray(body.checkedSteps)) updated.checkedSteps = body.checkedSteps.filter(n => Number.isInteger(n)).slice(0, 50);
      if (typeof body.favorite === 'boolean') {
        updated.favorite = body.favorite;
        // Kun én favoritt om gangen — fjern favoritt-merket fra alle andre bakster.
        if (body.favorite === true) {
          const { blobs } = await store.list();
          await Promise.all(blobs.map(async (b) => {
            if (b.key === id) return;
            const other = await store.get(b.key, { type: 'json' });
            if (other && other.favorite) {
              other.favorite = false;
              await store.setJSON(b.key, other);
            }
          }));
        }
      }
      await store.setJSON(id, updated);
      return json(200, updated);
    }

    if (req.method === 'DELETE') {
      const id = idFromPath(url.pathname);
      if (!id) return json(400, { error: 'Mangler id' });
      await store.delete(id);
      return json(200, { deleted: id });
    }

    return json(405, { error: 'Metode ikke støttet' });
  } catch (e) {
    return json(500, { error: e.message || 'Ukjent feil' });
  }
};

export const config = { path: ['/api/bakes', '/api/bakes/:id'] };
