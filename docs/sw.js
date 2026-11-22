// Service Worker: بيخلّي التطبيق يفتح من غير نت.
const CACHE = 'taskaty-v2';
const SHELL = [
  './', './index.html', './css/style.css', './js/main.js', './js/logic.js', './js/store.js',
  './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// الشبكة الأول (عشان التحديثات توصل)، ولو مفيش نت نرجع للنسخة المحفوظة
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const sameOrigin = new URL(e.request.url).origin === location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com/.test(e.request.url);
  if (!sameOrigin && !isFont) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then((r) => r || (sameOrigin ? caches.match('./index.html') : Response.error()))),
  );
});
