/* Mediterráneo — 서비스 워커

   한 번 크게 데인 자리입니다. 예전에는 그림·코드·상품목록을 모두
   "저장해 둔 것 먼저 보여 주고 뒤에서 갱신" 방식으로 다뤘습니다.
   그래서 상품을 지우고 새로 배포해도 손님 화면에는 옛 상품이 계속 보였습니다.

   지금은 이렇게 나눕니다.
     - 상품 목록(data.js) : 무조건 새것부터. 인터넷이 끊겼을 때만 저장본.
     - 화면·코드·스타일   : 새것부터. 실패하면 저장본.
     - 사진·영상·아이콘   : 저장본 먼저 (빠르게), 뒤에서 조용히 갱신.

   숫자(VERSION)를 올리면 예전에 저장해 둔 것이 전부 버려집니다.
   사이트를 고칠 때마다 이 숫자를 올립니다. */
var VERSION = 'me-2026-08-31-10';

var CORE = [
  './', 'index.html', 'shop.html', 'product.html', 'brands.html', 'brand.html',
  'cart.html', 'thanks.html', 'policy.html', 'track.html',
  'assets/styles.css', 'assets/app.js', 'assets/i18n.js', 'assets/media.js',
  'assets/icon.svg', 'assets/icon-192.png', 'assets/icon-512.png',
  'manifest.webmanifest'
];
/* data.js 는 일부러 미리 저장하지 않습니다 — 늘 새로 받아야 하는 파일입니다. */

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

/* 새것부터 받아오고, 안 되면 저장해 둔 것 */
function networkFirst(req) {
  return fetch(req, { cache: 'no-store' }).then(function (res) {
    if (res && res.status === 200) {
      var copy = res.clone();
      caches.open(VERSION).then(function (c) { c.put(req, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(req).then(function (r) {
      return r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error());
    });
  });
}

/* 저장본 먼저 보여 주고 뒤에서 갱신 (사진처럼 잘 안 바뀌는 것) */
function cacheFirst(req) {
  return caches.match(req).then(function (hit) {
    var net = fetch(req).then(function (res) {
      if (res && res.status === 200) {
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () { return hit; });
    return hit || net;
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;          // 글꼴 등 외부 주소는 건드리지 않습니다
  if (url.pathname.indexOf('/admin') >= 0) return;     // 관리자 화면은 저장하지 않습니다

  var p = url.pathname;
  var isMedia = /\/assets\/(img|video)\//.test(p) || /\.(png|jpe?g|webp|gif|svg|mp4|webm|woff2?)$/i.test(p);

  if (isMedia) { e.respondWith(cacheFirst(req)); return; }

  /* 나머지는 전부 새것부터 — 화면, 상품 목록, 코드, 스타일 */
  e.respondWith(networkFirst(req));
});

/* 관리자 화면에서 "저장된 것 싹 비우기"를 부를 수 있게 열어 둡니다 */
self.addEventListener('message', function (e) {
  if (e.data === 'me-clear-cache') {
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return caches.delete(k); }));
    }).then(function () {
      if (e.source && e.source.postMessage) e.source.postMessage('me-cache-cleared');
    });
  }
});
