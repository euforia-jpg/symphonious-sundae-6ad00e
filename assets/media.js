/* ===== Mercado Euforia — 사진·영상 보관함 =====

   관리자 대쉬보드에서 올린 사진과 영상을 이 브라우저 안에 담아 둡니다.
   담아 두는 이유는 하나입니다 — 파일을 assets 폴더에 넣고 배포하기 전에도
   대표님 눈으로 먼저 확인할 수 있게 하려고요.

   담기는 곳은 IndexedDB 입니다. localStorage 는 5MB 밖에 못 담아
   사진 몇 장이면 꽉 차지만, 여기는 훨씬 넉넉합니다.

   가게 화면(app.js)은 사진 파일을 먼저 찾아보고,
   아직 폴더에 없으면 여기에 담긴 것으로 대신 보여 줍니다. */
(function () {
'use strict';

var DB = 'me_media', STORE = 'files', VER = 1;
var _db = null, _open = null;

function open() {
  if (_open) return _open;
  _open = new Promise(function (res, rej) {
    if (!window.indexedDB) return rej(new Error('no-idb'));
    var r = indexedDB.open(DB, VER);
    r.onupgradeneeded = function () {
      var d = r.result;
      if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE, { keyPath: 'path' });
    };
    r.onsuccess = function () { _db = r.result; res(_db); };
    r.onerror = function () { rej(r.error); };
  });
  return _open;
}
function tx(mode) {
  return open().then(function (d) { return d.transaction(STORE, mode).objectStore(STORE); });
}
function wrap(req) {
  return new Promise(function (res, rej) {
    req.onsuccess = function () { res(req.result); };
    req.onerror = function () { rej(req.error); };
  });
}

/* path 예: "assets/img/1_01.jpg" */
function put(path, dataURL, meta) {
  var rec = { path: path, data: dataURL, at: Date.now() };
  for (var k in (meta || {})) rec[k] = meta[k];
  return tx('readwrite').then(function (s) { return wrap(s.put(rec)); }).then(function () { return rec; });
}
function get(path) {
  return tx('readonly').then(function (s) { return wrap(s.get(path)); }).catch(function () { return null; });
}
function del(path) {
  return tx('readwrite').then(function (s) { return wrap(s.delete(path)); }).catch(function () {});
}
function list() {
  return tx('readonly').then(function (s) { return wrap(s.getAll()); }).catch(function () { return []; });
}
function clear() {
  return tx('readwrite').then(function (s) { return wrap(s.clear()); }).catch(function () {});
}
function usage() {
  return list().then(function (rows) {
    var b = 0; rows.forEach(function (r) { b += (r.data || '').length * 0.75; });
    return { count: rows.length, bytes: Math.round(b) };
  });
}

/* 화면에 붙은 사진·영상 중 파일이 아직 없는 것을 보관함 것으로 바꿔 끼웁니다. */
function hydrate(root) {
  if (!window.indexedDB) return;
  (root || document).querySelectorAll('img[data-mp],video[data-mp]').forEach(function (el) {
    if (el._mpDone) return;
    el._mpDone = true;
    var path = el.dataset.mp;
    var swap = function () {
      get(path).then(function (rec) {
        if (!rec || !rec.data) return;
        if (el.tagName === 'VIDEO') { el.src = rec.data; el.load(); }
        else { el.src = rec.data; }
        el.setAttribute('data-preview', '1');
      });
    };
    el.addEventListener('error', swap, { once: true });
    /* 이미 실패한 뒤에 붙었을 수도 있습니다 */
    if (el.tagName === 'IMG' && el.complete && el.naturalWidth === 0) swap();
  });
}

function fmtBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return Math.round(b / 1024) + ' KB';
  return (b / 1024 / 1024).toFixed(1) + ' MB';
}

/* ---------- 사진 줄이기 ----------
   휴대폰 사진은 4~8MB 씩 합니다. 그대로 올리면 손님 화면이 느려지고
   Netlify 무료 용량도 금방 찹니다. 브라우저 안에서 미리 줄여 둡니다. */
function shrink(file, maxPx, quality) {
  maxPx = maxPx || 1200; quality = quality || 0.82;
  return new Promise(function (res, rej) {
    if (!/^image\//.test(file.type)) return rej(new Error('사진 파일이 아닙니다'));
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      var w = img.naturalWidth, h = img.naturalHeight;
      var sc = Math.min(1, maxPx / Math.max(w, h));
      var nw = Math.max(1, Math.round(w * sc)), nh = Math.max(1, Math.round(h * sc));
      var c = document.createElement('canvas'); c.width = nw; c.height = nh;
      var g = c.getContext('2d');
      g.fillStyle = '#fff'; g.fillRect(0, 0, nw, nh);          // 투명 배경은 흰색으로
      g.imageSmoothingQuality = 'high';
      g.drawImage(img, 0, 0, nw, nh);
      var data = c.toDataURL('image/jpeg', quality);
      URL.revokeObjectURL(url);
      res({ data: data, w: nw, h: nh, bytes: Math.round(data.length * 0.75), was: file.size, name: file.name });
    };
    img.onerror = function () { URL.revokeObjectURL(url); rej(new Error('사진을 읽지 못했습니다')); };
    img.src = url;
  });
}

function fileToDataURL(file) {
  return new Promise(function (res, rej) {
    var r = new FileReader();
    r.onload = function () { res(r.result); };
    r.onerror = function () { rej(r.error); };
    r.readAsDataURL(file);
  });
}

/* dataURL 을 내려받기 가능한 파일로 */
function download(dataURL, filename) {
  var a = document.createElement('a');
  a.href = dataURL; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(function () { a.remove(); }, 800);
}

/* ---------- 영상 주소 알아보기 ---------- */
function parseVideo(url) {
  url = String(url || '').trim();
  if (!url) return null;
  var m;
  if ((m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/))) {
    return { kind: 'youtube', id: m[1] };
  }
  if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d{6,})/))) {
    return { kind: 'vimeo', id: m[1] };
  }
  if (/^https?:\/\/.+\.(mp4|webm|mov)(\?|$)/i.test(url)) {
    return { kind: 'url', src: url };
  }
  return null;
}
function videoEmbedSrc(v) {
  if (!v) return '';
  if (v.kind === 'youtube') return 'https://www.youtube-nocookie.com/embed/' + v.id + '?rel=0&modestbranding=1';
  if (v.kind === 'vimeo') return 'https://player.vimeo.com/video/' + v.id;
  return '';
}
function videoThumb(v) {
  if (!v) return '';
  if (v.kind === 'youtube') return 'https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg';
  return '';
}

window.MEDIA = {
  put: put, get: get, del: del, list: list, clear: clear, usage: usage,
  hydrate: hydrate, shrink: shrink, fileToDataURL: fileToDataURL, download: download,
  fmtBytes: fmtBytes, parseVideo: parseVideo, videoEmbedSrc: videoEmbedSrc, videoThumb: videoThumb
};
})();
