import { getStore } from '@netlify/blobs';

// Delt (på tvers av enheter) lagring av "Pizzatid" — brukerens ukentlige ledige
// tid for deigarbeid, brukt av Beta-fanens "omvendt planlegger"-søk.
// Lagres per bruker-id (samme id som pizzaUser i localStorage), ikke per enhet.
//
// GET  /api/pizzatid?userId=X   -> { schedule } (default hvis ikke lagret ennå)
// POST /api/pizzatid            -> lagre { userId, schedule } -> { ok:true }
//
// schedule-format: { mon:[[fra,til],[fra,til]], tue:[...], ..., sun:[...] }
// Klokkeslett som "HH:MM"-strenger. Inntil to perioder per dag; ubrukt periode
// kan være null.

const DAYS = ['mon','tue','wed','thu','fri','sat','sun'];
const DEFAULT_WEEKDAY = [['16:00','23:30'],['06:30','08:00']];
const DEFAULT_WEEKEND = [['06:00','23:00'], null];
const DEFAULT_SCHEDULE = {
  mon: DEFAULT_WEEKDAY, tue: DEFAULT_WEEKDAY, wed: DEFAULT_WEEKDAY,
  thu: DEFAULT_WEEKDAY, fri: DEFAULT_WEEKDAY,
  sat: DEFAULT_WEEKEND, sun: DEFAULT_WEEKEND
};

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function isValidTime(t) {
  return typeof t === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
}

function sanitizePeriod(p) {
  if (p === null || p === undefined) return null;
  if (!Array.isArray(p) || p.length !== 2) return null;
  const [from, to] = p;
  if (!isValidTime(from) || !isValidTime(to)) return null;
  return [from, to];
}

function sanitizeSchedule(input) {
  const out = {};
  for (const day of DAYS) {
    const periods = Array.isArray(input?.[day]) ? input[day] : DEFAULT_SCHEDULE[day];
    const p1 = sanitizePeriod(periods[0]) ?? null;
    const p2 = sanitizePeriod(periods[1]) ?? null;
    out[day] = [p1, p2];
  }
  return out;
}

export default async (req, context) => {
  const store = getStore('pizza-pizzatid');
  const url = new URL(req.url);

  try {
    if (req.method === 'GET') {
      const userId = url.searchParams.get('userId');
      if (!userId) return json(400, { error: 'Mangler userId' });
      const existing = await store.get(userId, { type: 'json' });
      return json(200, { schedule: existing?.schedule || DEFAULT_SCHEDULE });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const userId = body.userId;
      if (!userId || typeof userId !== 'string') return json(400, { error: 'Mangler userId' });
      const schedule = sanitizeSchedule(body.schedule);
      await store.setJSON(userId, { userId, schedule, updatedAt: new Date().toISOString() });
      return json(200, { ok: true, schedule });
    }

    return json(405, { error: 'Metode ikke støttet' });
  } catch (e) {
    return json(500, { error: e.message || 'Ukjent feil' });
  }
};

export const config = { path: ['/api/pizzatid'] };
