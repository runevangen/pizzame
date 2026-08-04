import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

// Brukerregister for Planleggeren — egen app, egen blob-store (kolliderer ikke
// med deig-appens `pizza-users`). Navn + personlig PIN, delt i en vennegruppe.
// PIN er en lett sperre, ikke ekte sikkerhet: den hashes og sammenlignes KUN her
// i funksjonen — klienten ser aldri hashen.
//
// I tillegg til navn/PIN har hver bruker en `color` (farge). Den brukes til
// avatarer og «ansvarlig»-visning uten bilder. Derfor finnes en OFFENTLIG roster
// (id, navn, farge) som appen kan laste for å fylle ansvarlig-nedtrekk og tegne
// avatarer — uten å lekke PIN-hasher.
//
// GET    /api/planlegger/users?name=X    -> { exists } (sjekk før registrering/innlogging)
// GET    /api/planlegger/users/roster    -> { users:[{id,navn,farge}] } (offentlig, uten PIN)
// POST   /api/planlegger/users           -> registrer { navn, pin, farge? } -> { id, navn, farge }
// POST   /api/planlegger/users/verify    -> logg inn { navn, pin } -> { ok, id, navn, farge }
// GET    /api/planlegger/users/admin?password=X    -> (admin) full liste uten pinHash
// PATCH  /api/planlegger/users/admin/:id -> (admin) sett ny PIN/farge { password, newPin?, farge? }
// DELETE /api/planlegger/users/admin/:id -> (admin) slett bruker (?password=X)
//
// Admin-passord: sett miljøvariabelen ADMIN_PASSWORD i Netlify. Faller tilbake
// til standardpassordet under hvis den ikke er satt ennå.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Pizzamester2026';

// Standardpalett — gis ut i tur og orden til nye brukere som ikke velger farge selv.
const PALETTE = [
  '#e4572e', '#2e86ab', '#3fa34d', '#8e44ad', '#f2a541',
  '#d81e5b', '#17a2b8', '#6b4226', '#00897b', '#5c6bc0'
];

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function hash(str) {
  return crypto.createHash('sha256').update(String(str)).digest('hex');
}

function checkAdminPassword(pw) { return !!pw && pw === ADMIN_PASSWORD; }
function idFromPath(path) { const p = path.split('/').filter(Boolean); return p[p.length - 1]; }
function normalizeName(name) { return String(name || '').trim().toLowerCase(); }

// Gyldig hex-farge (#rrggbb) eller null.
function cleanColor(c) {
  const s = String(c || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(s) ? s.toLowerCase() : null;
}

// Brukere lagres med normalisert navn som blob-nøkkel (som i deig-appen). Admin
// sender inn intern "id" fra listen — så DELETE/PATCH må først finne den EKTE
// nøkkelen (navnet) ved å lete, ikke anta at id == nøkkel.
async function keyForUserId(store, id) {
  const { blobs } = await store.list();
  for (const b of blobs) {
    const u = await store.get(b.key, { type: 'json' });
    if (u && u.id === id) return b.key;
  }
  return null;
}

// Velg en ledig palettfarge (den første som ingen bruker har ennå), ellers rull
// videre i paletten når alle er tatt.
async function nextColor(store) {
  const { blobs } = await store.list();
  const taken = new Set();
  for (const b of blobs) {
    const u = await store.get(b.key, { type: 'json' });
    if (u && u.color) taken.add(u.color);
  }
  const free = PALETTE.find(c => !taken.has(c));
  return free || PALETTE[taken.size % PALETTE.length];
}

export default async (req) => {
  const store = getStore('planlegger-users');
  const url = new URL(req.url);
  const path = url.pathname;
  const isAdmin = path.includes('/users/admin');
  const isVerify = path.endsWith('/users/verify');
  const isRoster = path.endsWith('/users/roster');

  try {
    // ===== Offentlig: roster (id, navn, farge) for ansvarlig-visning =====
    if (req.method === 'GET' && isRoster) {
      const { blobs } = await store.list();
      const users = await Promise.all(blobs.map(async (b) => await store.get(b.key, { type: 'json' })));
      const roster = users.filter(Boolean)
        .map(u => ({ id: u.id, navn: u.displayName, farge: u.color || null }))
        .sort((a, b) => a.navn.localeCompare(b.navn, 'nb'));
      return json(200, { users: roster });
    }

    // ===== ADMIN: full liste (uten pinHash) =====
    if (req.method === 'GET' && isAdmin) {
      const password = url.searchParams.get('password');
      if (!checkAdminPassword(password)) return json(401, { error: 'Feil passord' });
      const { blobs } = await store.list();
      const users = await Promise.all(blobs.map(async (b) => await store.get(b.key, { type: 'json' })));
      const safe = users.filter(Boolean)
        .map(u => ({ id: u.id, navn: u.displayName, farge: u.color || null, createdAt: u.createdAt, lastLoginAt: u.lastLoginAt }))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      return json(200, { users: safe });
    }

    // ===== ADMIN: sett ny PIN og/eller farge =====
    if (req.method === 'PATCH' && isAdmin) {
      const id = idFromPath(path);
      const body = await req.json();
      if (!checkAdminPassword(body.password)) return json(401, { error: 'Feil passord' });
      const key = await keyForUserId(store, id);
      if (!key) return json(404, { error: 'Fant ikke bruker' });
      const existing = await store.get(key, { type: 'json' });
      if (!existing) return json(404, { error: 'Fant ikke bruker' });
      if (body.newPin !== undefined) {
        if (!/^\d{4}$/.test(String(body.newPin || ''))) return json(400, { error: 'PIN må være 4 siffer' });
        existing.pinHash = hash(body.newPin);
      }
      if (body.farge !== undefined) {
        const c = cleanColor(body.farge);
        if (!c) return json(400, { error: 'Ugyldig farge (må være #rrggbb)' });
        existing.color = c;
      }
      await store.setJSON(key, existing);
      return json(200, { ok: true });
    }

    // ===== ADMIN: slett bruker =====
    if (req.method === 'DELETE' && isAdmin) {
      const id = idFromPath(path);
      const password = url.searchParams.get('password');
      if (!checkAdminPassword(password)) return json(401, { error: 'Feil passord' });
      const key = await keyForUserId(store, id);
      if (!key) return json(404, { error: 'Fant ikke bruker' });
      await store.delete(key);
      return json(200, { deleted: id });
    }

    // ===== Sjekk om navn finnes (før registrering/innlogging) =====
    if (req.method === 'GET') {
      const name = url.searchParams.get('name');
      if (!name) return json(400, { error: 'Mangler name' });
      const existing = await store.get(normalizeName(name), { type: 'json' });
      return json(200, { exists: !!existing });
    }

    // ===== Innlogging (verifiser PIN) =====
    if (req.method === 'POST' && isVerify) {
      const body = await req.json();
      const existing = await store.get(normalizeName(body.navn), { type: 'json' });
      if (!existing || existing.pinHash !== hash(body.pin)) return json(401, { ok: false });
      existing.lastLoginAt = new Date().toISOString();
      await store.setJSON(normalizeName(body.navn), existing);
      return json(200, { ok: true, id: existing.id, navn: existing.displayName, farge: existing.color || null });
    }

    // ===== Registrer ny bruker =====
    if (req.method === 'POST') {
      const body = await req.json();
      const displayName = String(body.navn || '').trim().slice(0, 40);
      if (!displayName) return json(400, { error: 'Mangler navn' });
      if (!/^\d{4}$/.test(String(body.pin || ''))) return json(400, { error: 'PIN må være 4 siffer' });
      const key = normalizeName(displayName);
      if (await store.get(key, { type: 'json' })) return json(409, { error: 'Navnet er allerede registrert' });
      const color = cleanColor(body.farge) || await nextColor(store);
      const id = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      const user = {
        id,
        displayName,
        pinHash: hash(body.pin),
        color,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      await store.setJSON(key, user);
      return json(201, { id, navn: displayName, farge: color });
    }

    return json(405, { error: 'Metode ikke støttet' });
  } catch (e) {
    return json(500, { error: e.message || 'Ukjent feil' });
  }
};

export const config = {
  path: [
    '/api/planlegger/users',
    '/api/planlegger/users/roster',
    '/api/planlegger/users/verify',
    '/api/planlegger/users/admin',
    '/api/planlegger/users/admin/:id'
  ]
};
