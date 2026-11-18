/* GEB Hub service worker */
const VERSION = 'genesis-v4-1';
const SHELL = [
  '/', '/index.html', '/style.css', '/shell.css', '/brand.css', '/planner.css', '/biotools.css', '/social.css',
  '/shell.js', '/store.js', '/pwa.js', '/exam.js', '/social-core.js', '/app.js', '/campus.js', '/planner.js',
  '/bio-data.js', '/bio-glossary.js', '/bio-core.js', '/biotools.js', '/bio-seq.js', '/bio-lab.js',
  '/dnacard.js', '/teachers.js', '/connect.js', '/routine.js', '/board.js', '/library.js', '/404.html',
  '/img/genesis22-avatar.jpg', '/img/batch-photo.jpg', '/offline.html'
];
const SHELL_CACHE = VERSION + '-shell', DATA_CACHE = VERSION + '-data';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL_CACHE)
      .then(c => Promise.all(SHELL.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) {
    if (req.method === 'GET' && /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
      e.respondWith(staleWhileRevalidate(req, DATA_CACHE));
    }
    return;
  }
  if (url.pathname === '/api/data' || url.pathname === '/data.json') return void e.respondWith(networkFirst(req, DATA_CACHE));
  if (url.pathname.startsWith('/api/') || url.pathname === '/admin' || url.pathname === '/admin.html') return;
  if (url.pathname.startsWith('/uploads/')) return void e.respondWith(networkFirst(req, DATA_CACHE));
  if (req.mode === 'navigate') return void e.respondWith(navigate(req));
  e.respondWith(staleWhileRevalidate(req, SHELL_CACHE));
});

async function networkFirst(req, name) {
  const cache = await caches.open(name);
  try { const res = await fetch(req); if (res.ok) cache.put(req, res.clone()); return res; }
  catch (_) { const hit = await cache.match(req); if (hit) return hit; return new Response(JSON.stringify({ error: 'অফলাইন' }), { status: 503, headers: { 'Content-Type': 'application/json' } }); }
}

async function staleWhileRevalidate(req, name) {
  const cache = await caches.open(name), hit = await cache.match(req);
  const net = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
  return hit || (await net) || new Response('', { status: 504 });
}

async function navigate(req) {
  const cache = await caches.open(SHELL_CACHE);
  try { const res = await fetch(req); if (res.ok && new URL(req.url).pathname === '/') cache.put('/', res.clone()); return res; }
  catch (_) { return (await cache.match('/')) || (await cache.match('/index.html')) || (await cache.match('/offline.html')); }
}
