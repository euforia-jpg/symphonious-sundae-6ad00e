/* ===== Mediterráneo — 공통 스크립트 ===== */
(function () {
'use strict';

var LS = {
  get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};

/* ---------- 상태 ---------- */
var qs = new URLSearchParams(location.search);
var S = {
  lang: qs.get('lang') || LS.get('me_lang', null) || detectLang(),
  cur:  LS.get('me_cur', null) || 'EUR',
  hall: qs.get('hall') || LS.get('me_hall', 'es'),
  cart: LS.get('me_cart', [])
};
if (!window.T['nav.home'][S.lang]) S.lang = 'en';
if (S.lang === 'ko' && !LS.get('me_cur', null)) S.cur = 'KRW';

function detectLang() {
  var n = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return window.T['nav.home'][n] ? n : 'en';
}
function t(k) { var o = window.T[k]; return (o && (o[S.lang] || o.en)) || k; }
/* 특정 언어로 못박아 읽습니다 (관 안내 문구용) */
function tIn(k, lang) { var o = window.T[k]; return (o && (o[lang] || o.en)) || k; }

/* 문의 메일 주소. 바꿀 일이 있으면 이 한 줄만 고치면 사이트 전체가 따라옵니다. */
var MAIL = 'rondalosnuevos@gmail.com';

/* 관마다 노리는 손님이 다릅니다.
   Europa = 스페인·포르투갈·이탈리아 상품을 한국 손님에게  -> 한국어 / 원화
   Corea  = 한국 상품을 남유럽 손님에게                    -> 스페인어 / 유로 */
var HALL_DEFAULT = { es: { lang: 'ko', cur: 'KRW' }, kr: { lang: 'es', cur: 'EUR' } };

/* ---------- 돈 ---------- */
var FX = window.FX;
function toKRW(eur) { return Math.round(eur * FX.rate / 10) * 10; }
function fmt(eur) {
  return S.cur === 'KRW' ? '₩' + toKRW(eur).toLocaleString('ko-KR') : '€' + eur.toFixed(2);
}
function fmtAlt(eur) {
  return S.cur === 'KRW' ? '€' + eur.toFixed(2) : '₩' + toKRW(eur).toLocaleString('ko-KR');
}
function fmtN(v) { return S.cur === 'KRW' ? '₩' + (Math.round(v / 10) * 10).toLocaleString('ko-KR') : '€' + v.toFixed(2); }
function unit(eur) { return S.cur === 'KRW' ? toKRW(eur) : eur; }
function fxLine() {
  return '€1 = ₩' + FX.rate.toLocaleString('ko-KR', { maximumFractionDigits: 1 }) +
         ' · ' + FX.source + ' · ' + FX.at + ' · ' + t('fx.daily');
}

/* ---------- 데이터 ---------- */
var P = window.PRODUCTS, B = window.BRANDS;

/* ---------- 관리자 대쉬보드(admin.html)에서 고친 값 ----------
   admin.html 에서 저장한 값을 이 브라우저에서만 덮어씁니다.
   내 눈으로 먼저 확인하는 단계입니다. 손님에게 정식으로 보이게 하려면
   admin.html → [data.js 내보내기] → assets 폴더에 덮어쓰기 → 배포. */
(function () {
  var ov = LS.get('me_admin_v1', null);
  if (!ov) return;
  if (ov.fx) {
    for (var k in ov.fx) if (ov.fx[k] !== '' && ov.fx[k] != null) FX[k] = ov.fx[k];
    FX.rate = Math.round(FX.base * (1 + FX.buffer) * 10) / 10;
  }
  if (ov.p) for (var i = 0; i < P.length; i++) {
    var o = ov.p[P[i].id];
    if (o) for (var k2 in o) P[i][k2] = o[k2];
  }
  /* 새로 넣은 상품은 아직 data.js 에 없을 때만 얹습니다.
     이미 올라가서 data.js 에 들어간 뒤에도 얹으면 같은 상품이 두 개로 보입니다. */
  if (ov.add) {
    var key = function (x) {
      var n = (x.name && (x.name.ko || x.name.en || x.name.es)) || '';
      return String(n).replace(/\s+/g, '').toLowerCase();
    };
    var live = {};
    for (var m = 0; m < P.length; m++) live[key(P[m])] = 1;
    for (var j = 0; j < ov.add.length; j++) {
      var k3 = key(ov.add[j]);
      if (k3 && live[k3]) continue;
      live[k3] = 1;
      P.push(ov.add[j]);
    }
  }
})();
var CATS = ['food', 'wine', 'craft', 'home', 'fashion', 'beauty'];
var HUE = { food: 32, wine: 344, craft: 218, home: 168, fashion: 288, beauty: 8 };
var ICON = {
  food: '<path d="M9 2h6v3l2 3v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8l2-3V2z"/><path d="M7 12h10"/>',
  wine: '<path d="M8 3h8l-1 6a3 3 0 0 1-6 0L8 3z"/><path d="M12 15v6"/><path d="M9 21h6"/>',
  craft: '<path d="M12 3l9 9-9 9-9-9 9-9z"/><circle cx="12" cy="12" r="3.2"/>',
  home: '<path d="M3 11h18a9 9 0 0 1-9 9 9 9 0 0 1-9-9z"/><path d="M12 11V4"/><path d="M9 6h6"/>',
  fashion: '<path d="M4 5a8 8 0 0 0 8 8 8 8 0 0 0 8-8"/><path d="M12 13v3"/><circle cx="12" cy="18.5" r="2.6"/>',
  beauty: '<path d="M10 2h4v4h-4z"/><path d="M8 6h8v13a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V6z"/><path d="M8 13h8"/>'
};
var MARK = '<svg class="mk" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 36V22a7 7 0 0 1 14 0v14"/><path d="M24 36V22a7 7 0 0 1 14 0v14"/><path d="M6 41h36"/></svg>';


/* ---------- 국기 (이미지 파일 없이 직접 그립니다. 어떤 기기에서나 똑같이 보입니다) ---------- */
var FLAGS = {
  ko:'<rect width="24" height="16" fill="#fff"/>' +
     '<path d="M7.8 8A4.2 4.2 0 0 1 16.2 8A2.1 2.1 0 0 1 12 8A2.1 2.1 0 0 0 7.8 8Z" fill="#CD2E3A"/>' +
     '<path d="M7.8 8A4.2 4.2 0 0 0 16.2 8A2.1 2.1 0 0 0 12 8A2.1 2.1 0 0 1 7.8 8Z" fill="#0047A0"/>' +
     '<g fill="#111" opacity=".9"><rect x="2.4" y="3.1" width="3" height=".7" transform="rotate(28 3.9 3.45)"/>' +
     '<rect x="2.4" y="4.3" width="3" height=".7" transform="rotate(28 3.9 4.65)"/>' +
     '<rect x="18.6" y="11.2" width="3" height=".7" transform="rotate(28 20.1 11.55)"/>' +
     '<rect x="18.6" y="12.4" width="3" height=".7" transform="rotate(28 20.1 12.75)"/></g>',
  es:'<rect width="24" height="16" fill="#AA151B"/><rect y="4" width="24" height="8" fill="#F1BF00"/>',
  en:'<rect width="24" height="16" fill="#012169"/>' +
     '<path d="M0 0 24 16M24 0 0 16" stroke="#fff" stroke-width="3.2"/>' +
     '<path d="M0 0 24 16M24 0 0 16" stroke="#C8102E" stroke-width="1.7"/>' +
     '<path d="M12 0v16M0 8h24" stroke="#fff" stroke-width="5"/>' +
     '<path d="M12 0v16M0 8h24" stroke="#C8102E" stroke-width="3"/>',
  fr:'<rect width="8" height="16" fill="#002395"/><rect x="8" width="8" height="16" fill="#fff"/><rect x="16" width="8" height="16" fill="#ED2939"/>',
  de:'<rect width="24" height="5.34" fill="#000"/><rect y="5.34" width="24" height="5.33" fill="#DD0000"/><rect y="10.67" width="24" height="5.33" fill="#FFCE00"/>',
  it:'<rect width="8" height="16" fill="#008C45"/><rect x="8" width="8" height="16" fill="#F4F5F0"/><rect x="16" width="8" height="16" fill="#CD212A"/>',
  zh:'<rect width="24" height="16" fill="#EE1C25"/>' +
     '<g fill="#FFDE00"><path d="M4.6 2.1 5.4 4.3 7.7 4.4 5.9 5.8 6.5 8 4.6 6.7 2.7 8 3.3 5.8 1.5 4.4 3.8 4.3Z"/>' +
     '<circle cx="9.2" cy="1.9" r=".85"/><circle cx="11" cy="3.8" r=".85"/>' +
     '<circle cx="11" cy="6.3" r=".85"/><circle cx="9.2" cy="8.1" r=".85"/></g>'
};
function flag(code) {
  return '<svg class="flag" viewBox="0 0 24 16" width="24" height="16" aria-hidden="true">' +
    FLAGS[code] + '<rect width="24" height="16" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1"/></svg>';
}

/* 손님에게 보이는 상품만. 관리자 대쉬보드에서 "숨기기" 한 상품은 목록에서 빠집니다. */
function PV() { return P.filter(function (p) { return !p.hidden; }); }
function prod(id) { for (var i = 0; i < P.length; i++) if (String(P[i].id) === String(id)) return P[i]; return null; }
function brand(id) { for (var i = 0; i < B.length; i++) if (B[i].id === id) return B[i]; return null; }
function nm(p) { return p.name[S.lang] || p.name.en; }
function tg(p) { return p.tag[S.lang] || p.tag.en; }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function link(page, params) {
  var u = page + '?lang=' + S.lang;
  for (var k in params) u += '&' + k + '=' + encodeURIComponent(params[k]);
  return u;
}

/* ---------- 장바구니 ---------- */
/* 사라진 상품 걸러 내기.
   상품을 지우거나 번호가 바뀌면, 손님 장바구니에는 그 번호가 그대로 남습니다.
   그러면 화면에는 아무 상품도 안 보이는데 장바구니 숫자는 1이고
   상품 금액은 0원인 채 배송비만 붙습니다. 들어올 때 한 번 걸러 냅니다. */
function pruneCart() {
  var before = S.cart.length;
  S.cart = S.cart.filter(function (i) { return !!prod(i.id); });
  if (S.cart.length !== before) LS.set('me_cart', S.cart);
  return before - S.cart.length;
}
function cartCount() { return S.cart.reduce(function (s, i) { return s + i.q; }, 0); }
function cartAdd(id, q) {
  var f = S.cart.filter(function (i) { return i.id === id; })[0];
  if (f) f.q += q; else S.cart.push({ id: id, q: q });
  LS.set('me_cart', S.cart); paintCartCount();
}
function cartRemove(id) {
  S.cart = S.cart.filter(function (i) { return i.id !== id; });
  LS.set('me_cart', S.cart); paintCartCount();
}
function subtotal() {
  return S.cart.reduce(function (s, i) { var p = prod(i.id); return p ? s + unit(p.eur) * i.q : s; }, 0);
}
function freeFrom() { return S.cur === 'KRW' ? 120000 : 80; }
function shipFee() {
  if (!S.cart.length) return 0;              // 빈 장바구니에 배송비가 붙으면 안 됩니다
  return subtotal() >= freeFrom() ? 0 : (S.cur === 'KRW' ? 18000 : 12.9);
}

/* ---------- 공통 UI ---------- */
/* 이 상품이 어느 나라 것인지.
   원산지 표기("Montilla-Moriles, Córdoba, ES")나 생산자 소재지("Barcelona, ES") 끝의
   두 글자 코드를 읽습니다. 못 읽으면 관 단위로 뭉뚱그립니다. */
function country(p) {
  var b = brand(p.brand);
  var src = p.origin || (b && b.loc) || '';
  var m = String(src).match(/(?:^|[,\s])([A-Z]{2})\s*$/);
  var key = m ? 'co.' + m[1] : null;
  if (key && window.T[key]) return t(key);
  return t(p.hall === 'es' ? 'co.eu' : 'co.KR');
}

/* 사진이 여러 장이면 첫 장이 대표 사진입니다. */
function photos(p) {
  var a = (p.imgs && p.imgs.length) ? p.imgs.slice() : [];
  if (p.img && a.indexOf(p.img) < 0) a.unshift(p.img);
  return a;
}
/* 사진이 없을 때 보여 주는 분류별 색 타일 */
function tileInner(cat) {
  return '<span class="gl"><svg viewBox="0 0 24 24">' + (ICON[cat] || ICON.food) + '</svg></span>';
}
/* 사진 파일이 없어졌을 때 깨진 그림 대신 색 타일로 되돌립니다 (media.js 가 부릅니다) */
function tileFallback(img) {
  var box = img.closest ? img.closest('.pimg') : null;
  var cat = img.getAttribute('data-cat') || 'food';
  if (!box) { img.removeAttribute('src'); img.style.visibility = 'hidden'; return; }
  box.classList.remove('has-img');
  box.style.setProperty('--h', HUE[cat] || 32);
  box.innerHTML = tileInner(cat);
}
function pimgHTML(p, extra) {
  var ph = photos(p);
  if (ph.length) {
    /* data-mp: 파일이 아직 폴더에 없으면 관리자 보관함의 미리보기로 바꿔 끼웁니다 (media.js).
       그것도 없으면 색 타일로 되돌립니다 — 손님에게 깨진 그림을 보이지 않습니다. */
    return '<div class="pimg has-img' + (extra || '') + '" style="--h:' + HUE[p.cat] + '">' +
      '<img src="' + ph[0] + '" data-mp="' + ph[0] + '" data-cat="' + p.cat + '" alt="" loading="lazy" decoding="sync"></div>';
  }
  return '<div class="pimg' + (extra || '') + '" style="--h:' + HUE[p.cat] + '">' + tileInner(p.cat) + '</div>';
}
function priceHTML(p) {
  if (!p.eur) return '<div class="price">' + t('pd.ask') + '</div>';
  return '<div class="price">' + fmt(p.eur) + '</div><div class="alt">' + fmtAlt(p.eur) + '</div>';
}
function pcard(p) {
  var b = brand(p.brand);
  var bd = '<span class="bdg eu">' + country(p) + '</span>';
  if (p.badge) bd += '<span class="bdg ' + p.badge + '">' + (p.badge === 'new' ? 'NEW' : 'BEST') + '</span>';
  return '<a class="pcard" href="' + link('product.html', { id: p.id }) + '">' +
    pimgHTML(p) +
    '<div class="body"><div class="brand">' + esc(b.name) + '</div>' +
    '<div class="name">' + esc(nm(p)) + '</div>' +
    '<div class="tag">' + esc(tg(p)) + '</div>' +
    priceHTML(p) +
    '<div class="badges">' + bd + '</div></div></a>';
}
function bcard(b) {
  return '<a class="bcard" href="' + link('brand.html', { id: b.id }) + '">' +
    '<div class="av" style="background:linear-gradient(140deg,hsl(' + b.h + ' 62% 58%),hsl(' + b.h + ' 55% 40%))">' + esc(b.name[0]) + '</div>' +
    '<div class="bn">' + esc(b.name) + '</div>' +
    '<div class="bl">' + esc(b.loc) + ' · ' + t('brand.since') + ' ' + b.since + '</div>' +
    '<div class="bs">' + esc(b.story[S.lang] || b.story.en) + '</div></a>';
}

function header(active) {
  var links = [['index.html', 'nav.home'], ['shop.html', 'nav.shop'], ['brands.html', 'nav.brands'],
               ['track.html', 'nav.track']];
  return '<div class="wrap head-in">' +
    '<div class="head-top">' +
    '<a class="lockup" href="' + link('index.html', {}) + '">' + MARK + '<span class="wm">Mediterráneo</span></a>' +
    '<div class="head-tools">' +
      '<button type="button" class="picker-btn" id="pickerBtn" aria-expanded="false" aria-controls="picker">' +
        flag(S.lang) + '<span class="pb-t">' + S.lang.toUpperCase() + ' · ' + (S.cur === 'KRW' ? '₩' : '€') + '</span>' +
        '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' +
      '</button>' +
      '<a class="cart-btn" href="' + link('cart.html', {}) + '">' +
        '<svg viewBox="0 0 24 24"><path d="M3.5 4h2l2 11h10l2-8H7"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="16.5" cy="19" r="1.4"/></svg>' +
        '<span class="cart-lbl">' + t('nav.cart') + '</span>' +
        '<span class="cart-n" id="cartN" hidden>0</span></a>' +
    '</div></div>' +
    '<nav class="nav">' + links.map(function (l) {
      return '<a href="' + link(l[0], {}) + '"' + (active === l[0] ? ' aria-current="page"' : '') + '>' + t(l[1]) + '</a>';
    }).join('') + '</nav>' +
    '<div class="picker" id="picker" hidden>' +
      '<div class="pk-h">' + t('ui.lang') + '</div>' +
      '<div class="pk-langs">' + window.LANGS.map(function (l) {
        return '<button type="button" class="pk-lang" data-lang="' + l[0] + '" aria-pressed="' + (l[0] === S.lang) + '">' +
          flag(l[0]) + '<span>' + l[1] + '</span></button>';
      }).join('') + '</div>' +
      '<div class="pk-h">' + t('ui.currency') + '</div>' +
      '<div class="curbar">' + [['EUR', '€'], ['KRW', '₩']].map(function (c) {
        return '<button type="button" class="cur" data-cur="' + c[0] + '" aria-pressed="' + (c[0] === S.cur) + '">' + c[1] + ' ' + c[0] + '</button>';
      }).join('') + '</div>' +
      installBlock() +
    '</div></div>';
}
function footer() {
  return '<div class="wrap foot-in">' +
    '<span class="lockup">' + MARK + '<span class="wm">Mediterráneo</span></span>' +
    '<span>' + t('foot.rights') + '</span>' +
    '<span class="head-sp"></span>' +
    '<a href="' + link('policy.html', {}) + '">' + t('nav.policy') + '</a>' +
    '<a href="' + link('track.html', {}) + '">' + t('nav.track') + '</a>' +
    '<a href="mailto:' + MAIL + '">' + t('foot.contact') + ' · ' + MAIL + '</a>' +
    '</div>';
}
function paintCartCount() {
  var el = document.getElementById('cartN'); if (!el) return;
  var n = cartCount(); el.textContent = n; el.hidden = n === 0;
}
function toast(msg) {
  var el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = msg; el.classList.add('on');
  clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove('on'); }, 1800);
}

function halls() {
  return '<div class="halls">' + [['es', 'hall.esName', 'hall.esSub'], ['kr', 'hall.krName', 'hall.krSub']].map(function (h) {
    var target = HALL_DEFAULT[h[0]].lang;   // 그 관이 노리는 손님의 언어로 적습니다
    return '<button class="hall" data-hall="' + h[0] + '" data-h="' + h[0] + '" aria-pressed="' + (S.hall === h[0]) + '">' +
      '<span class="hn"><span class="dot"></span><span class="ht">' + t(h[1]) + '</span>' +
        '<span class="hf">' + flag(target) + '</span></span>' +
      '<span class="hs" lang="' + target + '">' + tIn(h[2], target) + '</span></button>';
  }).join('') + '</div>';
}

/* ---------- 부팅 ---------- */

/* ---------- 앱으로 설치 ---------- */
var deferredPrompt = null;
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}
function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}
function installBlock() {
  if (isStandalone()) return '';
  if (isIOS()) {
    return '<div class="pk-h" style="margin-top:16px">' + t('app.install') + '</div>' +
      '<div class="ios-hint">' + t('app.ios') + '</div>';
  }
  if (!deferredPrompt) return '';
  return '<div class="pk-h" style="margin-top:16px">' + t('app.install') + '</div>' +
    '<button type="button" class="btn primary block" id="installBtn" style="padding:11px;font-size:14px">' +
    t('app.install') + '</button>';
}
window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();
  deferredPrompt = e;
  try { paint(); } catch (err) {}
});
window.addEventListener('appinstalled', function () { deferredPrompt = null; });

/* ---------- 서비스 워커 (오프라인 · 빠른 실행) ---------- */
if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  });
}

var PAGE = '', RENDER = function () {};
function paint() {
  document.documentElement.lang = S.lang;
  document.documentElement.setAttribute('data-hall', S.hall);
  var h = document.querySelector('.site-head'), f = document.querySelector('.site-foot');
  if (h) h.innerHTML = header(PAGE);
  if (f) f.innerHTML = footer();
  paintCartCount();
  contactFab();
  RENDER();
  if (window.MEDIA) window.MEDIA.hydrate(document);
  syncUrl();
}
/* 주소창만 조용히 맞춰 둡니다. 페이지를 다시 불러오지 않으므로
   파일을 그냥 열었을 때나 미리보기 창 안에서도 똑같이 동작합니다. */
function syncUrl() {
  try {
    var u = new URL(location.href);
    u.searchParams.set('lang', S.lang);
    u.searchParams.set('hall', S.hall);
    history.replaceState(null, '', u.pathname + u.search + u.hash);
  } catch (e) {}
}
function boot(page, render) {
  PAGE = page; RENDER = render;
  var gone = pruneCart();                    // 없어진 상품을 먼저 걸러 냅니다
  paint();
  if (gone) toast(t('cart.gone').replace('{0}', gone));

  document.addEventListener('click', function (e) {
    var pb = e.target.closest('#pickerBtn');
    var pk = document.getElementById('picker');
    if (pb) {
      var open = pk.hasAttribute('hidden');
      if (open) { pk.removeAttribute('hidden'); } else { pk.setAttribute('hidden', ''); }
      pb.setAttribute('aria-expanded', String(open));
      return;
    }
    if (pk && !pk.hasAttribute('hidden') && !e.target.closest('#picker')) pk.setAttribute('hidden', '');

    if (e.target.closest('#installBtn') && deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () { deferredPrompt = null; paint(); });
      return;
    }
    /* <html> 에도 data-hall 을 붙여 두었습니다 (색을 바꾸려고).
       그래서 그냥 closest 로 찾으면 화면 어디를 눌러도 <html> 이 걸려
       페이지 전체를 다시 그렸습니다 — 누를 때마다 사진이 한 번 깜빡인 이유입니다.
       진짜 누를 수 있는 것(단추·링크)만 골라 냅니다. */
    var hit = function (sel) {
      var el = e.target.closest(sel);
      if (!el || el === document.documentElement || el === document.body) return null;
      return el;
    };
    var lb = hit('[data-lang]');
    if (lb) { S.lang = lb.dataset.lang; LS.set('me_lang', S.lang); paint(); return; }
    var cb = hit('[data-cur]');
    if (cb) { S.cur = cb.dataset.cur; LS.set('me_cur', S.cur); paint(); return; }
    var hb = hit('[data-hall]');
    if (hb) {
      var prev = S.hall, next = hb.dataset.hall;
      S.hall = next; LS.set('me_hall', next);
      /* 손님이 직접 다른 언어를 고른 상태가 아니라면, 새 관에 맞는 언어·통화로 바꿔 줍니다. */
      if (prev !== next && S.lang === HALL_DEFAULT[prev].lang) {
        S.lang = HALL_DEFAULT[next].lang; LS.set('me_lang', S.lang);
        S.cur  = HALL_DEFAULT[next].cur;  LS.set('me_cur',  S.cur);
      }
      paint();
    }
  });
}

/* ---------- 안내 문구 · 결제 수단 · 택배사 ----------
   policy.js 에서 옵니다. 그 파일이 아직 없는 예전 배포와 섞여도 화면이 깨지지 않도록
   없으면 빈 값으로 둡니다. */
var POL  = window.POLICY     || { updated: '', pay: [], ship: [], cancel: [] };
var PAYM = window.PAYMETHODS || [];
var CARR = window.CARRIERS   || [];
var CT   = window.CONTACT    || { kakao: '', kakaoOn: false };
(function () {                                    // 관리자 미리보기
  var ov = LS.get('me_admin_v1', null);
  if (!ov) return;
  if (ov.pol) POL = ov.pol;
  if (ov.paym) PAYM = ov.paym;
  if (ov.carr) CARR = ov.carr;
  if (ov.ct) CT = ov.ct;
})();
/* 안내 글은 한국어·스페인어·영어만 채워 둡니다. 나머지 언어로 보는 손님에게는 영어가 나갑니다. */
function pt(o) { if (!o) return ''; return o[S.lang] || o.en || o.ko || o.es || ''; }
function payOn() { return PAYM.filter(function (m) { return m.on; }); }

/* ---------- 문의 단추 (화면 오른쪽 아래) ----------
   카카오톡 채널 주소를 넣어 두면 카카오톡 단추가 같이 나옵니다.
   주소가 비어 있으면 메일 단추만 나옵니다 — 깨진 링크를 손님에게 보이지 않기 위해서입니다. */
var IC_KAKAO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2c-4.8 0-8.7 3-8.7 6.8 0 2.4 1.6 4.5 4 5.7l-.9 3.4c-.1.3.2.5.5.4l4-2.6c.4 0 .7.1 1.1.1 4.8 0 8.7-3 8.7-6.8S16.8 3.2 12 3.2z"/></svg>';
var IC_MAIL  = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3.8 7l8.2 6 8.2-6"/></svg>';

function contactFab() {
  var el = document.getElementById('mefab');
  if (!el) { el = document.createElement('div'); el.id = 'mefab'; document.body.appendChild(el); }
  var k = String(CT.kakao || '').trim();
  var showK = k && CT.kakaoOn !== false;
  el.innerHTML =
    (showK ? '<a class="fb kko" href="' + esc(k) + '" target="_blank" rel="noopener">' +
        IC_KAKAO + '<span>' + t('ct.kakao') + '</span></a>' : '') +
    '<a class="fb ml" href="mailto:' + MAIL + '?subject=' + encodeURIComponent(t('ct.subject')) + '">' +
      IC_MAIL + '<span>' + t('ct.mail') + '</span></a>';
}

/* ---------- 밖으로 ---------- */
window.ME = {
  S: S, t: t, P: P, PV: PV, B: B, CATS: CATS, HUE: HUE, ICON: ICON, MARK: MARK,
  prod: prod, brand: brand, nm: nm, tg: tg, esc: esc, link: link,
  fmt: fmt, fmtAlt: fmtAlt, fmtN: fmtN, unit: unit, fxLine: fxLine, toKRW: toKRW,
  MAIL: MAIL, POL: POL, PAYM: PAYM, CARR: CARR, CT: CT, pt: pt, payOn: payOn,
  country: country, pcard: pcard, bcard: bcard, pimgHTML: pimgHTML, photos: photos, tileFallback: tileFallback,
  flag: flag, repaint: paint, halls: halls, boot: boot, toast: toast,
  cartAdd: cartAdd, cartRemove: cartRemove, cartCount: cartCount,
  subtotal: subtotal, shipFee: shipFee, freeFrom: freeFrom
};
})();
