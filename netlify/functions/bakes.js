import { getStore } from '@netlify/blobs';

// Liste over aktive og ferdige bakster.
// Personvern (v0.642): deiger er PRIVATE per bruker (ownerId) som standard.
// En bruker ser sine egne + de som er delt med alle (shared:true). Eldre deiger
// UTEN ownerId regnes som delte/åpne (bakoverkompatibelt — ingenting forsvinner).
// Admin (?admin=PASSWORD) ser alt.
// GET    /api/bakes?userId=X            -> egne + delte (+ eldre uten eier)
// GET    /api/bakes?admin=PASSWORD      -> alle (admin)
// POST   /api/bakes          -> lagre ny bakst { name, config, anchorMode, anchorISO, ownerId?, shared?, checkedSteps?, checkedIngredients?, savedBy? }
// PATCH  /api/bakes/:id      -> merk ferdig + kommentar { note, noteBy? } eller gjenåpne { status:'active' },
//                                dele/gjøre privat { shared: true|false },
//                                sett/fjern favoritt { favorite: true|false } (kun én favoritt PER EIER),
//                                huske avhaket steg/ingredienser/understeg { checkedSteps, checkedIngredients, checkedSubsteps },
//                                eller sette vurdering/bilde på ferdig deig { rating: 1-5|null, photo: base64-string|null }
// DELETE /api/bakes/:id      -> slette permanent
//
// Admin-passord: sett miljøvariabelen ADMIN_PASSWORD i Netlify. Faller tilbake
// til standardpassordet under hvis den ikke er satt ennå.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Pizzamester2026';

// Hvem kan se/endre en gitt deig? Eldre deiger uten eier er åpne for alle (som
// før). En eid deig er kun synlig/redigerbar for eieren — eller for alle når den
// er delt (synlig) / for eieren (redigerbar). Admin har alltid tilgang.
function isPublic(bake) { return !bake.ownerId || bake.shared === true; }
function ownedBy(bake, userId) { return bake.ownerId && userId && bake.ownerId === userId; }

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
      const userId = url.searchParams.get('userId') || null;
      const adminPw = url.searchParams.get('admin');
      const isAdmin = !!adminPw && adminPw === ADMIN_PASSWORD;
      const { blobs } = await store.list();
      const raw = await Promise.all(
        blobs.map(async (b) => {
          // Isoler hver post: en enkelt korrupt/uleselig blob skal IKKE velte hele
          // lista. Uten dette kaster store.get (ugyldig JSON) eller sorteringen på
          // en null-post, og GET /api/bakes svarer 500 → «Kunne ikke hente deiger».
          try {
            return await store.get(b.key, { type: 'json' });
          } catch (err) {
            console.error('Kunne ikke lese bakst', b.key, err && err.message);
            return null;
          }
        })
      );
      // Filtrer bort ugyldige poster FØR sortering (ellers krasjer new Date(null.savedAt)).
      let bakes = raw.filter((x) => x && typeof x === 'object');
      // Personvern: vanlige brukere ser bare egne + delte (+ eldre uten eier).
      // Admin ser alt.
      if (!isAdmin) {
        bakes = bakes.filter((b) => isPublic(b) || ownedBy(b, userId));
      }
      bakes.sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0));
      return json(200, { bakes });
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
        // Personvern: eier + delt-flagg. Ny deig er privat (shared:false) som
        // standard, eid av den som lagret den. Uten ownerId (gjest/eldre klient)
        // regnes deigen som åpen/delt, som før.
        ownerId: typeof body.ownerId === 'string' && body.ownerId.trim() ? body.ownerId.trim().slice(0, 64) : null,
        shared: body.shared === true,
        config: body.config,
        anchorMode: body.anchorMode === 'end' ? 'end' : 'start',
        anchorISO: body.anchorISO,
        savedBy: typeof body.savedBy === 'string' && body.savedBy.trim() ? body.savedBy.trim().slice(0, 40) : null,
        savedAt: new Date().toISOString(),
        finishedAt: null,
        note: '',
        rating: null,
        photo: null,
        checkedSteps: Array.isArray(body.checkedSteps) ? body.checkedSteps.filter(n => Number.isInteger(n)).slice(0, 50) : [],
        checkedIngredients: Array.isArray(body.checkedIngredients) ? body.checkedIngredients.filter(s => typeof s === 'string').slice(0, 20) : [],
        checkedSubsteps: Array.isArray(body.checkedSubsteps) ? body.checkedSubsteps.filter(s => typeof s === 'string').slice(0, 200) : []
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
      // Eierskapsvakt: en deig MED eier kan bare endres av eieren (eller admin).
      // Eldre deiger uten eier er fortsatt åpne for alle i gruppen (som før).
      const isAdmin = !!body.admin && body.admin === ADMIN_PASSWORD;
      if (existing.ownerId && !isAdmin && body.userId !== existing.ownerId) {
        return json(403, { error: 'Bare eieren kan endre denne deigen' });
      }
      const updated = { ...existing };
      if (typeof body.shared === 'boolean') updated.shared = body.shared;
      if (body.status === 'finished') {
        updated.status = 'finished';
        updated.finishedAt = new Date().toISOString();
      } else if (body.status === 'active') {
        updated.status = 'active';
        updated.finishedAt = null;
      }
      if (typeof body.note === 'string') {
        updated.note = body.note.slice(0, 2000);
        // Hvem som sist lagret notatet — sendes sammen med note fra front-end.
        if (typeof body.noteBy === 'string' && body.noteBy.trim()) {
          updated.noteBy = body.noteBy.trim().slice(0, 40);
        }
      }
      if (typeof body.name === 'string' && body.name.trim()) updated.name = body.name.trim().slice(0, 60);
      if (body.config) updated.config = body.config;
      if (body.anchorMode) updated.anchorMode = body.anchorMode === 'end' ? 'end' : 'start';
      if (typeof body.anchorISO === 'string') updated.anchorISO = body.anchorISO;
      if (Array.isArray(body.checkedSteps)) updated.checkedSteps = body.checkedSteps.filter(n => Number.isInteger(n)).slice(0, 50);
      if (Array.isArray(body.checkedIngredients)) updated.checkedIngredients = body.checkedIngredients.filter(s => typeof s === 'string').slice(0, 20);
      if (Array.isArray(body.checkedSubsteps)) updated.checkedSubsteps = body.checkedSubsteps.filter(s => typeof s === 'string').slice(0, 200);
      if (Number.isInteger(body.rating) && body.rating >= 1 && body.rating <= 5) updated.rating = body.rating;
      if (body.rating === null) updated.rating = null;
      if (typeof body.photo === 'string') {
        if (body.photo.length > 900000) return json(400, { error: 'Bildet er for stort' });
        updated.photo = body.photo;
      }
      if (body.photo === null) updated.photo = null;
      if (typeof body.favorite === 'boolean') {
        updated.favorite = body.favorite;
        // Kun én favoritt om gangen PER EIER — fjern favoritt-merket fra denne
        // eierens andre bakster (ikke andre brukeres, nå som deiger er private).
        if (body.favorite === true) {
          const { blobs } = await store.list();
          await Promise.all(blobs.map(async (b) => {
            if (b.key === id) return;
            const other = await store.get(b.key, { type: 'json' });
            // samme eierskap som deigen vi favoriserer (begge eid av samme bruker,
            // eller begge eldre uten eier)
            const sameScope = (other && (other.ownerId || null) === (updated.ownerId || null));
            if (other && other.favorite && sameScope) {
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
      // Eierskapsvakt (params, siden DELETE-body er upålitelig i noen klienter):
      // en eid deig kan bare slettes av eieren eller admin. Eldre uten eier: åpen.
      const existing = await store.get(id, { type: 'json' });
      if (existing && existing.ownerId) {
        const adminPw = url.searchParams.get('admin');
        const isAdmin = !!adminPw && adminPw === ADMIN_PASSWORD;
        const userId = url.searchParams.get('userId');
        if (!isAdmin && userId !== existing.ownerId) {
          return json(403, { error: 'Bare eieren kan slette denne deigen' });
        }
      }
      await store.delete(id);
      return json(200, { deleted: id });
    }

    return json(405, { error: 'Metode ikke støttet' });
  } catch (e) {
    return json(500, { error: e.message || 'Ukjent feil' });
  }
};

export const config = { path: ['/api/bakes', '/api/bakes/:id'] };
