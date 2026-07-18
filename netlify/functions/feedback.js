import { getStore } from '@netlify/blobs';

// Delt liste over tilbakemeldinger fra brukere av appen.
// Ingen pålogging — åpen for alle i familie/vennegruppen som har lenken.
// GET    /api/feedback            -> liste alle (nyeste først)
// POST   /api/feedback            -> ny tilbakemelding { category, message, context }
// PATCH  /api/feedback/:id        -> merk som lest/løst { resolved: true|false }
// DELETE /api/feedback/:id        -> slette permanent
// POST   /api/feedback/:id/vote   -> stem opp { voterId } — én stemme per voterId per sak

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

function isVotePath(path) {
  return path.endsWith('/vote');
}

function idFromVotePath(path) {
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 2];
}

const VALID_CATEGORIES = ['mel', 'feil', 'forslag', 'annet'];

export default async (req, context) => {
  const store = getStore('pizza-feedback');
  const url = new URL(req.url);
  const isCollection = url.pathname.endsWith('/feedback') || url.pathname.endsWith('/feedback/');

  try {
    if (req.method === 'GET') {
      const { blobs } = await store.list();
      const items = await Promise.all(
        blobs.map(async (b) => await store.get(b.key, { type: 'json' }))
      );
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return json(200, { feedback: items.filter(Boolean) });
    }

    if (req.method === 'POST' && isVotePath(url.pathname)) {
      const id = idFromVotePath(url.pathname);
      if (!id) return json(400, { error: 'Mangler id' });
      const existing = await store.get(id, { type: 'json' });
      if (!existing) return json(404, { error: 'Fant ikke tilbakemelding' });
      const body = await req.json();
      const voterId = body.voterId && String(body.voterId).slice(0, 200);
      if (!voterId) return json(400, { error: 'Mangler voterId' });
      const voterIds = Array.isArray(existing.voterIds) ? existing.voterIds : [];
      if (voterIds.includes(voterId)) {
        return json(200, { id, votes: existing.votes || 0, alreadyVoted: true });
      }
      const updated = {
        ...existing,
        votes: (existing.votes || 0) + 1,
        voterIds: [...voterIds, voterId]
      };
      await store.setJSON(id, updated);
      return json(200, { id, votes: updated.votes });
    }

    if (req.method === 'POST' && isCollection) {
      const body = await req.json();
      if (!body.message || !String(body.message).trim()) {
        return json(400, { error: 'Mangler melding' });
      }
      const id = 'fb_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      const item = {
        id,
        category: VALID_CATEGORIES.includes(body.category) ? body.category : 'annet',
        message: String(body.message).slice(0, 2000),
        context: body.context && typeof body.context === 'object' ? body.context : {},
        resolved: false,
        votes: 0,
        voterIds: [],
        createdAt: new Date().toISOString()
      };
      await store.setJSON(id, item);
      return json(201, item);
    }

    if (req.method === 'PATCH') {
      const id = idFromPath(url.pathname);
      if (!id) return json(400, { error: 'Mangler id' });
      const existing = await store.get(id, { type: 'json' });
      if (!existing) return json(404, { error: 'Fant ikke tilbakemelding' });
      const body = await req.json();
      const updated = { ...existing };
      if (typeof body.resolved === 'boolean') updated.resolved = body.resolved;
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

export const config = { path: ['/api/feedback', '/api/feedback/:id', '/api/feedback/:id/vote'] };
