/* UltimatePizza — minimal service worker.
   Formål: gjør appen installerbar (Android) og brukbar offline, uten å endre
   hvordan den oppfører seg online.

   Strategi:
   - Kode (selve siden + changelog.js): NETTVERK-FØRST, med cache som reserve.
     Appen slippes ofte i nye versjoner, så en fersk kopi skal alltid vinne når
     man er online; cachen er bare et sikkerhetsnett offline.
   - Statiske ressurser (ikoner, manifest): cache-først, oppdateres i bakgrunnen.
   - API-kall (/api/* og /.netlify/*): røres ALDRI — alltid rett til nett. */

// v0.723: bumpet til v2 OG engine.js/guide.js lagt til som KODE. De lå i
// cache-først-grenen, så en fersk index.html (nettverk-først) kunne lastes
// sammen med en UTDATERT engine.js fra cachen — index kalte da funksjoner som
// ikke fantes i den gamle motorfila → ReferenceError ved oppstart. Alle
// script-filer index.html laster MÅ stå i både SHELL og isCode-regexen.
// v0.836: v3 — steps.js (steglaget flyttet ut av index.html) inn samme vei.
const CACHE = 'ultimatepizza-shell-v3';
const SHELL = [
  './', './index.html', './changelog.js', './engine.js', './steps.js', './guide.js', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/apple-touch-icon.png', './icons/favicon-32.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => null)))) // én manglende fil skal ikke velte hele install
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;                    // fonts o.l. → rett til nett
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/.netlify/')) return; // aldri cache API

  const isCode = req.mode === 'navigate'
    || url.pathname === '/'
    || /\/(index\.html|changelog\.js|engine\.js|steps\.js|guide\.js)$/.test(url.pathname);

  if (isCode) {
    e.respondWith(
      fetch(req)
        .then(r => {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put(req.mode === 'navigate' ? './index.html' : req, copy));
          return r;
        })
        .catch(() => caches.match(req, {ignoreSearch:true}).then(m => m || caches.match('./index.html')))
    );
    return;
  }

  // statiske ressurser: cache-først, hent + oppdater i bakgrunnen ved miss
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return r;
    }))
  );
});
