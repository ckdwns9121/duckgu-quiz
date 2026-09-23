// 출근길 정처기 퀴즈 service worker
// 페이지(HTML)는 네트워크 우선: 온라인이면 항상 최신, 오프라인이면 저장본.
// SPA라 /lesson/... 같은 주소도 오프라인에서는 저장해 둔 첫 화면(./)을 돌려준다.
// 아이콘·폰트 같은 나머지는 저장본을 먼저 쓰고 뒤에서 새로 받아 둠.
const CACHE = 'jcq-v10';
const SHELL = ['./', './notes.html', './manifest.webmanifest',
  './icons/icon-192.png?v=duck1', './icons/icon-512.png?v=duck1', './icons/maskable-512.png?v=duck1',
  './icons/apple-touch-icon.png?v=duck1', './icons/favicon-32.png?v=duck1'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isPage(req) {
  return req.mode === 'navigate' || req.url.endsWith('.html');
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!sameOrigin && !isFont) return;

  if (sameOrigin && isPage(req)) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('./')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((cached) => {
      const fresh = fetch(req)
        .then((res) => {
          if (res.ok || res.type === 'opaque') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fresh;
    })
  );
});
