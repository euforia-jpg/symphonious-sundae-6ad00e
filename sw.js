/* Mercado Euforia — 서비스 워커
   화면(HTML)은 항상 새것을 먼저 받아옵니다. 그래서 사이트를 새로 배포하면 바로 반영됩니다.
   그림·스타일·스크립트는 저장해 두었다가 먼저 보여 주고 뒤에서 갱신합니다. 그래서 빠릅니다.
   인터넷이 끊겨도 마지막으로 봤던 화면은 열립니다. */
var VERSION = 'me-2026-08-29-4';
var CORE = [
  './', 'index.html', 'shop.html', 'product.html', 'brands.html', 'brand.html',
  'cart.html', 'thanks.html',
  'assets/styles.css', 'assets/app.js', 'assets/i18n.js', 'assets/data.js', 'assets/media.js',
  'assets/icon.svg', 'assets/icon-192.png', 'assets/icon-512.png',
  'assets/img/vinagre-px-gran-reserva-50.svg',
  'manifest.webmanifest'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (c) {
      return Promise.all(CORE.map(function (u) {
        return c.add(new Request(u, { cache: 'reload' })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return k === VERSION ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;   // 글꼴 등 외부 주소는 건드리지 않습니다
  if (url.pathname.indexOf('/admin') >= 0) return;  // 관리자 화면은 저장하지 않습니다

  // 화면 이동: 새것 먼저, 안 되면 저장해 둔 것
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (r) { return r || caches.match('index.html'); });
      })
    );
    return;
  }

  // 그 외 파일: 저장해 둔 것 먼저 보여 주고, 뒤에서 갱신
  e.respondWith(
    caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(VERSION).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});
