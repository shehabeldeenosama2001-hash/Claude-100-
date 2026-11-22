// Service Worker: بيشغّل التطبيق من غير نت، وبيعرض الإشعارات اللي جاية من المنبّه حتى والتطبيق مقفول.
const CACHE = 'taskaty-v1';
const SHELL = [
  './', './index.html', './css/style.css', './js/main.js', './js/logic.js', './js/store.js',
  './js/firebase-config.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
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

// الشبكة الأول (عشان التحديثات توصل)، ولو مفيش نت نرجع للكاش
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html'))),
  );
});

// الإشعارات الجاية من Firebase Cloud Messaging (رسائل data-only)
self.addEventListener('push', (e) => {
  let payload = {};
  try { payload = e.data ? e.data.json() : {}; } catch { payload = { data: { title: e.data?.text() } }; }
  const d = payload.data || payload.notification || payload;
  e.waitUntil(showTaskNotification(d));
});

function showTaskNotification(d) {
  const isReminder = d.kind === 'reminder';
  return self.registration.showNotification(d.title || 'تاسكاتي', {
    body: d.body || '',
    icon: './icons/icon-192.png',
    badge: './icons/badge-96.png',
    dir: 'rtl',
    lang: 'ar',
    tag: d.taskId ? `task-${d.taskId}` : undefined,
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: d,
    actions: isReminder
      ? [{ action: 'ack', title: 'شفته ✓' }, { action: 'done', title: 'خلّصتها' }]
      : [{ action: 'done', title: 'خلّصتها' }, { action: 'open', title: 'افتح' }],
  });
}

// الصفحة نفسها بتبعت هنا في وضع التجربة
self.addEventListener('message', (e) => {
  if (e.data?.type === 'notify') e.waitUntil(showTaskNotification(e.data.payload));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const d = e.notification.data || {};
  const params = new URLSearchParams();
  if (d.taskId) {
    // أي ضغطة على الإشعار تعتبر "شفته" — ودي اللي بتوقف تذكير كل ساعة
    params.set(e.action === 'done' ? 'done' : 'ack', d.taskId);
  }
  const target = new URL(`./?${params}`, self.registration.scope).href;
  e.waitUntil((async () => {
    const all = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if ('focus' in c) {
        c.postMessage({ type: 'notification-click', action: e.action === 'done' ? 'done' : 'ack', taskId: d.taskId });
        return c.focus();
      }
    }
    return clients.openWindow(target);
  })());
});
