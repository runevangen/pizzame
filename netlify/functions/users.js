import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

// Enkel navn+PIN-innlogging, delt mellom alle i familie/vennegruppen.
// Ingen sensitive data — PIN er kun en lett sperre, ikke ekte sikkerhet.
//
// GET    /api/users?name=X        -> { exists: true|false }  (sjekk før registrering/innlogging)
// POST   /api/users               -> registrer ny bruker { name, pin } -> { id, name }
// POST   /api/users/verify        -> logg inn { name, pin } -> { ok:true, id, name } eller { ok:false }
// GET    /api/users/admin?password=X       -> (admin) liste alle brukere uten PIN-hash
// PATCH  /api/users/admin/:id     -> (admin) sett ny PIN { password, newPin }
// DELETE /api/users/admin/:id     -> (admin) slett bruker { password }  (send som ?password=X siden DELETE-body er upålitelig i noen klienter)

const ADMIN_PASSWORD_HASH = '532720a9925cb133ccfdb81e3bd79164029e063dae6db328048b7bff2c55065b';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function hash(str) {
  return crypto.createHash('sha256').update(String(str)).digest('hex');
}

function checkAdminPassword(pw) {
  if (!pw) return false;
  return hash(pw) === ADMIN_PASSWORD_HASH;
}

function idFromPath(path) {
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1];
}

function normalizeName(name) {
  return String(name || '').trim().toLowerCase();
}

export default async (req, context) => {
  const store = getStore('pizza-users');
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const isAdminPath = pathParts.includes('admin');
  const isVerifyPath = pathParts.includes('verify');

  try {
    // ===== ADMIN: liste alle brukere =====
    if (req.method === 'GET' && isAdminPath) {
      const password = url.searchParams.get('password');
      if (!checkAdminPassword(password)) return json(401, { error: 'Feil passord' });
      const { blobs } = await store.list();
      const users = await Promise.all(blobs.map(async (b) => await store.get(b.key, { type: 'json' })));
      const safe = users.filter(Boolean).map(u => ({ id: u.id, name: u.displayName, createdAt: u.createdAt, lastLoginAt: u.lastLoginAt }));
      safe.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      return json(200, { users: safe });
    }

    // ===== ADMIN: sett ny PIN for en bruker =====
    if (req.method === 'PATCH' && isAdminPath) {
      const id = idFromPath(url.pathname);
      const body = await req.json();
      if (!checkAdminPassword(body.password)) return json(401, { error: 'Feil passord' });
      if (!/^\d{4}$/.test(String(body.newPin || ''))) return json(400, { error: 'PIN må være 4 siffer' });
      const existing = await store.get(id, { type: 'json' });
      if (!existing) return json(404, { error: 'Fant ikke bruker' });
      existing.pinHash = hash(body.newPin);
      await store.setJSON(id, existing);
      return json(200, { ok: true });
    }

    // ===== ADMIN: slett bruker =====
    if (req.method === 'DELETE' && isAdminPath) {
      const id = idFromPath(url.pathname);
      const password = url.searchParams.get('password');
      if (!checkAdminPassword(password)) return json(401, { error: 'Feil passord' });
      await store.delete(id);
      return json(200, { deleted: id });
    }

    // ===== Sjekk om navn allerede finnes (før registrering/innlogging) =====
    if (req.method === 'GET' && !isAdminPath) {
      const name = url.searchParams.get('name');
      if (!name) return json(400, { error: 'Mangler name' });
      const key = normalizeName(name);
      const existing = await store.get(key, { type: 'json' });
      return json(200, { exists: !!existing });
    }

    // ===== Innlogging (verifiser PIN) =====
    if (req.method === 'POST' && isVerifyPath) {
      const body = await req.json();
      const key = normalizeName(body.name);
      const existing = await store.get(key, { type: 'json' });
      if (!existing || existing.pinHash !== hash(body.pin)) {
        return json(401, { ok: false });
      }
      existing.lastLoginAt = new Date().toISOString();
      await store.setJSON(key, existing);
      return json(200, { ok: true, id: existing.id, name: existing.displayName });
    }

    // ===== Registrer ny bruker =====
    if (req.method === 'POST') {
      const body = await req.json();
      const displayName = String(body.name || '').trim().slice(0, 40);
      if (!displayName) return json(400, { error: 'Mangler navn' });
      if (!/^\d{4}$/.test(String(body.pin || ''))) return json(400, { error: 'PIN må være 4 siffer' });
      const key = normalizeName(displayName);
      const existing = await store.get(key, { type: 'json' });
      if (existing) return json(409, { error: 'Navnet er allerede registrert' });
      const id = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      const user = {
        id,
        displayName,
        pinHash: hash(body.pin),
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      await store.setJSON(key, user);
      return json(201, { id, name: displayName });
    }

    return json(405, { error: 'Metode ikke støttet' });
  } catch (e) {
    return json(500, { error: e.message || 'Ukjent feil' });
  }
};

export const config = { path: ['/api/users', '/api/users/verify', '/api/users/admin', '/api/users/admin/:id'] };
