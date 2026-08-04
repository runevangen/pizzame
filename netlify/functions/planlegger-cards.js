import { getStore } from '@netlify/blobs';

// Kort — kjernen i Planleggeren. Delt tavle for hele vennegruppa (ingen privat/
// eier-skille som i deig-appen; alle ser og kan endre alle kort). Ett kort = én blob.
//
// Kortmodell:
//   { id, kolonneId, rekkefolge, tittel, beskrivelse, ansvarligId, frist,
//     prioritet, vedlegg[], kommentarer[], createdBy, createdAt, updatedAt }
//
//   prioritet : 'lav' | 'normal' | 'hoy'   (standard 'normal')
//   frist     : ISO-dato-streng eller null
//   ansvarligId : bruker-id (fra planlegger-users roster) eller null
//   vedlegg    : [{ id, navn, type, storrelse, data(base64) }]
//   kommentarer: [{ id, tekst, byId, byNavn, createdAt }]
//
// GET    /api/planlegger/cards                 -> { cards } (evt. ?kolonneId=X eller ?ansvarligId=Y)
// POST   /api/planlegger/cards                 -> nytt kort { tittel, kolonneId?, ..., createdBy }
// PATCH  /api/planlegger/cards/:id             -> endre felt / flytt / addComment / addAttachment / ...
// DELETE /api/planlegger/cards/:id             -> slett kort (vedlegg ligger inline og forsvinner med kortet)
//
// Utsatte valg (endrer ikke modellen — kan justeres senere):
//   * MAX_ATTACHMENT: maks filstørrelse per vedlegg (base64). Satt til ~900 kB nå,
//     samme som deig-appens bilder. Netlify-funksjoners request-tak er ~6 MB.
//   * Sletting av kort tar vedleggene med seg (de er inline). Ingen foreldreløse filer.
//   * Fritekstsøk gjøres i front-end; om det skal treffe kommentarer er et UI-valg.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Pizzamester2026';
const PRIORITETER = ['lav', 'normal', 'hoy'];
const MAX_ATTACHMENT = 900000; // tegn base64 per vedlegg

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
function idFromPath(path) { const p = path.split('/').filter(Boolean); return p[p.length - 1]; }
function genId(prefix) { return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8); }

function cleanPrioritet(p) {
  const s = String(p || '').trim().toLowerCase();
  // Tåler at klienten sender «høy» med ø.
  const norm = s === 'høy' ? 'hoy' : s;
  return PRIORITETER.includes(norm) ? norm : null;
}

// Godta ISO-dato eller null; forkast uleselige verdier.
function cleanFrist(f) {
  if (f === null || f === '') return null;
  if (typeof f !== 'string') return undefined;
  const t = Date.parse(f);
  return Number.isNaN(t) ? undefined : f;
}

function cleanAttachment(a) {
  if (!a || typeof a !== 'object') return null;
  const data = typeof a.data === 'string' ? a.data : '';
  if (!data) return null;
  if (data.length > MAX_ATTACHMENT) return 'too_big';
  return {
    id: genId('att'),
    navn: String(a.navn || 'vedlegg').slice(0, 120),
    type: String(a.type || '').slice(0, 60),
    storrelse: Number.isFinite(a.storrelse) ? a.storrelse : data.length,
    data
  };
}

export default async (req) => {
  const store = getStore('planlegger-cards');
  const url = new URL(req.url);
  const path = url.pathname;
  const isCollection = path.endsWith('/cards') || path.endsWith('/cards/');

  try {
    // ===== Hent kort (delt tavle) =====
    if (req.method === 'GET') {
      const { blobs } = await store.list();
      const raw = await Promise.all(blobs.map(async (b) => {
        // Isoler hver post: én korrupt blob skal ikke velte hele lista.
        try { return await store.get(b.key, { type: 'json' }); }
        catch (err) { console.error('Kunne ikke lese kort', b.key, err && err.message); return null; }
      }));
      let cards = raw.filter(x => x && typeof x === 'object');
      const kolonneId = url.searchParams.get('kolonneId');
      const ansvarligId = url.searchParams.get('ansvarligId');
      if (kolonneId) cards = cards.filter(c => c.kolonneId === kolonneId);
      if (ansvarligId) cards = cards.filter(c => c.ansvarligId === ansvarligId);
      // Stabil visningsrekkefolge: kolonne, så rekkefolge, så alder.
      cards.sort((a, b) =>
        (a.rekkefolge ?? 0) - (b.rekkefolge ?? 0) ||
        new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      return json(200, { cards });
    }

    // ===== Nytt kort =====
    if (req.method === 'POST' && isCollection) {
      const body = await req.json();
      const tittel = String(body.tittel || '').trim().slice(0, 200);
      if (!tittel) return json(400, { error: 'Mangler tittel' });
      const now = new Date().toISOString();
      const card = {
        id: genId('card'),
        kolonneId: typeof body.kolonneId === 'string' && body.kolonneId.trim() ? body.kolonneId.trim() : 'col_todo',
        // Nye kort legges bakerst (høyt tall) med mindre klienten sier noe annet.
        rekkefolge: Number.isFinite(body.rekkefolge) ? body.rekkefolge : Date.now(),
        tittel,
        beskrivelse: String(body.beskrivelse || '').slice(0, 5000),
        ansvarligId: typeof body.ansvarligId === 'string' && body.ansvarligId.trim() ? body.ansvarligId.trim().slice(0, 64) : null,
        frist: cleanFrist(body.frist) ?? null,
        prioritet: cleanPrioritet(body.prioritet) || 'normal',
        vedlegg: [],
        kommentarer: [],
        createdBy: typeof body.createdBy === 'string' ? body.createdBy.trim().slice(0, 64) : null,
        createdAt: now,
        updatedAt: now
      };
      await store.setJSON(card.id, card);
      return json(201, card);
    }

    // ===== Endre kort =====
    if (req.method === 'PATCH') {
      const id = idFromPath(path);
      const existing = await store.get(id, { type: 'json' });
      if (!existing) return json(404, { error: 'Fant ikke kort' });
      const body = await req.json();
      const c = { ...existing };

      if (typeof body.tittel === 'string' && body.tittel.trim()) c.tittel = body.tittel.trim().slice(0, 200);
      if (typeof body.beskrivelse === 'string') c.beskrivelse = body.beskrivelse.slice(0, 5000);
      if (typeof body.kolonneId === 'string' && body.kolonneId.trim()) c.kolonneId = body.kolonneId.trim();
      if (Number.isFinite(body.rekkefolge)) c.rekkefolge = body.rekkefolge;
      if (body.ansvarligId !== undefined) {
        c.ansvarligId = typeof body.ansvarligId === 'string' && body.ansvarligId.trim() ? body.ansvarligId.trim().slice(0, 64) : null;
      }
      if (body.frist !== undefined) {
        const f = cleanFrist(body.frist);
        if (f === undefined) return json(400, { error: 'Ugyldig frist (må være ISO-dato eller null)' });
        c.frist = f;
      }
      if (body.prioritet !== undefined) {
        const p = cleanPrioritet(body.prioritet);
        if (!p) return json(400, { error: 'Ugyldig prioritet (lav/normal/hoy)' });
        c.prioritet = p;
      }

      // Kommentar: legg til / fjern.
      if (body.addComment && typeof body.addComment.tekst === 'string' && body.addComment.tekst.trim()) {
        c.kommentarer = Array.isArray(c.kommentarer) ? c.kommentarer : [];
        c.kommentarer.push({
          id: genId('cmt'),
          tekst: body.addComment.tekst.trim().slice(0, 2000),
          byId: typeof body.addComment.byId === 'string' ? body.addComment.byId.slice(0, 64) : null,
          byNavn: typeof body.addComment.byNavn === 'string' ? body.addComment.byNavn.slice(0, 40) : null,
          createdAt: new Date().toISOString()
        });
      }
      if (typeof body.removeCommentId === 'string') {
        c.kommentarer = (c.kommentarer || []).filter(k => k.id !== body.removeCommentId);
      }

      // Vedlegg: legg til / fjern.
      if (body.addAttachment) {
        const att = cleanAttachment(body.addAttachment);
        if (att === 'too_big') return json(400, { error: 'Vedlegget er for stort' });
        if (!att) return json(400, { error: 'Ugyldig vedlegg' });
        c.vedlegg = Array.isArray(c.vedlegg) ? c.vedlegg : [];
        c.vedlegg.push(att);
      }
      if (typeof body.removeAttachmentId === 'string') {
        c.vedlegg = (c.vedlegg || []).filter(v => v.id !== body.removeAttachmentId);
      }

      c.updatedAt = new Date().toISOString();
      await store.setJSON(id, c);
      return json(200, c);
    }

    // ===== Slett kort =====
    if (req.method === 'DELETE') {
      const id = idFromPath(path);
      const adminPw = url.searchParams.get('admin');
      // Delt tavle: alle kan slette. Admin-param finnes for ryddeverktøy, men
      // kreves ikke — behold hooken for symmetri med de andre funksjonene.
      void (adminPw && adminPw === ADMIN_PASSWORD);
      const existing = await store.get(id, { type: 'json' });
      if (!existing) return json(404, { error: 'Fant ikke kort' });
      await store.delete(id);
      return json(200, { deleted: id });
    }

    return json(405, { error: 'Metode ikke støttet' });
  } catch (e) {
    return json(500, { error: e.message || 'Ukjent feil' });
  }
};

export const config = { path: ['/api/planlegger/cards', '/api/planlegger/cards/:id'] };
