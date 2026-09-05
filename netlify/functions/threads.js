/* 쓰레드(Threads) 자동 게시 창구

   계정이 둘입니다. ?ch= 로 나눕니다.
     ch=shop (기본)  쇼핑몰 상품   — data.js + policy.js 의 window.THREADS
     ch=tour         여행사 일정   — tours.js 의 window.TOURS + window.TOURTHREADS

   주소
     /api/threads?ch=tour                 지금 상태
     /api/threads?ch=tour&preview=1       오늘 나갈 글을 보여만 줍니다. 올리지 않습니다.
     /api/threads?ch=tour&post=1&key=…    지금 올립니다.

   정해진 요일·시각에 올리는 일은 threads-cron.js(상품) 와
   threads-tour-cron.js(여행사) 가 이 주소를 부르는 방식으로 합니다.

   넷리파이 환경변수 (Site configuration → Environment variables)
     THREADS_USER_ID        쇼핑몰 쓰레드 사용자 번호
     THREADS_TOKEN          쇼핑몰 장기 토큰 (60일마다 갱신)
     THREADS_TOUR_USER_ID   여행사 쓰레드 사용자 번호
     THREADS_TOUR_TOKEN     여행사 장기 토큰 (60일마다 갱신)
     THREADS_HOOK_KEY       아무도 못 맞출 긴 문자열. 두 계정이 같이 씁니다.

   토큰은 넷리파이 안에만 있고, 손님 화면이나 대쉬보드로는 절대 내려가지 않습니다.  */

/* 여행 일정은 이 폴더 안의 파일에서 바로 읽습니다.
   assets 폴더가 아니라 여기 두는 이유는, 이 폴더의 파일은 서버 안에서만 돌고
   손님에게 파일로 내려가지 않기 때문입니다. 여행 상품은 쇼핑몰에 올리지 않습니다. */
import { TOURS, TOURTHREADS } from './tours-data.js';

/* 쓰레드 주소. 시험할 때만 THREADS_API 로 다른 곳을 보게 할 수 있습니다. */
const API = process.env.THREADS_API || 'https://graph.threads.net/v1.0';

function site() {
  return (process.env.URL || 'https://symphonious-sundae-6ad00e.netlify.app').replace(/\/+$/, '');
}
function json(o, status) {
  return new Response(JSON.stringify(o, null, 1), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

/* 우리 사이트의 자바스크립트 파일을 읽어 그 안의 값만 꺼내 옵니다.
   우리가 만들어 우리가 올린 파일이라 그대로 실행합니다. */
async function readJs(path) {
  const r = await fetch(site() + path + '?cb=' + Date.now(), { cache: 'no-store' });
  if (!r.ok) throw new Error(path + ' → HTTP ' + r.status);
  const w = {};
  new Function('window', await r.text())(w);
  return w;
}

/* 한국 시각 기준 오늘 */
function kst(d) {
  return new Date((d ? d.getTime() : Date.now()) + 9 * 3600 * 1000);
}
function kstDay(d) { return kst(d).getUTCDay(); }          // 0=일
function kstDate(d) { return kst(d).toISOString().slice(0, 10); }

/* 몇 번째 게시인가.
   정해진 요일에만 올리므로 "그동안 몇 번 올렸어야 하는가" 를 날짜에서 바로 셉니다.
   서버가 아무것도 기억하지 않아도 순서가 어긋나지 않습니다. */
function postIndex(days, d) {
  const set = new Set((days && days.length ? days : [1, 3, 5]).map(Number));
  const EPOCH = Date.UTC(2026, 0, 1);                      // 목요일
  const today = kst(d);
  const dayNo = Math.floor((Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) - EPOCH) / 86400000);
  if (dayNo < 0) return 0;
  const weeks = Math.floor(dayNo / 7), rest = dayNo % 7;
  let n = weeks * set.size;
  for (let i = 0; i <= rest; i++) {
    const wd = (new Date(EPOCH + (weeks * 7 + i) * 86400000)).getUTCDay();
    if (set.has(wd)) n++;
  }
  return n - 1 < 0 ? 0 : n - 1;                            // 오늘 것이 마지막
}

/* 채널마다 다른 것: 어디서 토큰을 읽고, 무엇을 재료로 쓰는가 */
const CH = {
  shop: { uid: 'THREADS_USER_ID',      tok: 'THREADS_TOKEN',      label: '쇼핑몰' },
  tour: { uid: 'THREADS_TOUR_USER_ID', tok: 'THREADS_TOUR_TOKEN', label: '여행사' }
};
function chan(q) { return q === 'tour' ? 'tour' : 'shop'; }

/* 올릴 수 있는 상품만 고릅니다 — 숨김·품절·값 없음·사진 없음은 뺍니다 */
function pool(P, hall) {
  return P.filter(p =>
    !p.hidden &&
    (!hall || p.hall === hall) &&
    p.eur > 0 &&
    (parseInt(p.stock, 10) || 0) > 0 &&
    (p.img || (p.imgs && p.imgs.length))
  ).sort((a, b) => String(a.id).localeCompare(String(b.id), 'en', { numeric: true }));
}

function won(eur, rate) {
  return '₩' + (Math.round(eur * rate / 10) * 10).toLocaleString('ko-KR');
}

function fill(tpl, p, b, rate, tags, lang) {
  const L = lang || 'ko';
  const pick = (o) => (o && (o[L] || o.en || o.ko)) || '';
  const url = site() + '/product.html?id=' + encodeURIComponent(p.id) +
              '&lang=' + L + '&hall=' + (p.hall || 'es') + '&utm_source=threads';
  const v = {
    name: pick(p.name),
    tag: pick(p.tag),
    brand: (b && b.name) || '',
    loc: (b && b.loc) || p.origin || '',
    won: won(p.eur, rate),
    eur: '€' + Number(p.eur).toFixed(2),
    g: p.g || '',
    link: url,
    tags: (tags || []).join(' ')
  };
  let s = String(tpl).replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
  /* 자리표가 비어서 생긴 빈 줄·군더더기를 정리합니다 */
  s = s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n')
       .replace(/^[ ·|—-]+|[ ·|—-]+$/gm, '').trim();
  if (s.length > 500) s = s.slice(0, 497).trim() + '…';     // 쓰레드는 500자까지
  return s;
}

function photo(p) {
  const first = (p.imgs && p.imgs.length) ? p.imgs[0] : p.img;
  if (!first) return '';
  return /^https?:/i.test(first) ? first : site() + '/' + String(first).replace(/^\/+/, '');
}

const HANGUL = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;

/* 한 칸에서 이 언어로 쓸 글자를 고릅니다.

   빈 칸을 다른 언어로 메우면 영어 글에 한글이 섞여 나옵니다 — 그건 안 합니다.
   다만 Andalucía · Porto 처럼 한글이 없는 말은 어느 언어에서나 같으니 빌려 씁니다. */
function tpick(o, L) {
  if (typeof o === 'string') return o.trim();
  if (!o) return '';
  const mine = String(o[L] || '').trim();
  if (mine) return mine;
  if (L === 'ko') return '';                       // 한국어 글에는 한국어 칸만
  const ko = String(o.ko || '').trim();
  return HANGUL.test(ko) ? '' : ko;
}

/* 여행 일정 글 채우기.

   빈 칸이 생기면 그 자리만 지우는 게 아니라, 그 칸을 안고 있던 조각째 지웁니다.
   그래야 "출발" 만 덩그러니 남거나 " · " 가 떠 있는 글이 안 나갑니다. */
function fillTour(tpl, t, tags, lang, kakao) {
  const L = lang || 'ko';
  const v = {
    name: tpick(t.name, L), tag: tpick(t.tag, L), area: tpick(t.area, L),
    days: tpick(t.days, L), price: tpick(t.price, L), from: tpick(t.from, L),
    link: String(t.link || kakao || '').trim(),
    tags: (tags || []).join(' ')
  };
  /* 한 조각을 채우고, 그 조각이 살아남을 만한지 알려 줍니다 */
  function chunk(text) {
    let had = false, filled = false;
    const out = text.replace(/\{(\w+)\}/g, (m, k) => {
      if (!(k in v)) return m;
      had = true;
      if (v[k]) { filled = true; return v[k]; }
      return '';
    });
    return { out: out, dead: had && !filled };
  }
  const lines = String(tpl).split('\n').map((line) => {
    const parts = line.split('·').map(chunk).filter((c) => !c.dead);
    if (!parts.length) return null;                              // 자리표가 다 비었으면 줄째 지웁니다
    return parts.map((c) => c.out.trim()).filter(Boolean).join(' · ');
  }).filter((x) => x !== null);

  let s = lines.join('\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^[ ·|—-]+|[ ·|—-]+$/gm, '')
    .trim();
  if (s.length > 500) s = s.slice(0, 497).trim() + '…';
  return s;
}

/* 여행사 채널이 오늘 무엇을 올릴지 */
async function planTour(when) {
  const T = TOURTHREADS || {};
  if (T.on === false) return { ok: false, why: '대쉬보드에서 꺼 두었습니다' };

  const list = (TOURS || []).filter(t => t.on !== false && (t.name && (t.name.ko || t.name.en || typeof t.name === 'string')));
  if (!list.length) return { ok: false, why: '올릴 여행 상품이 없습니다 — 대쉬보드 [여행사] 탭에서 넣어 주세요' };

  const n = postIndex(T.days && T.days.length ? T.days : [2, 4], when);
  const langs = (T.langs && T.langs.length) ? T.langs : ['ko'];
  const lang = langs[n % langs.length];
  const tpls = (T.postsBy && T.postsBy[lang] && T.postsBy[lang].length) ? T.postsBy[lang] : ['{name}\n{tag}\n{price}\n{link}'];
  const tags = (T.tagsBy && T.tagsBy[lang]) ? T.tagsBy[lang] : [];

  /* 오늘 쓸 언어로 이름이 적혀 있는 일정만 후보로 둡니다.
     영어 이름을 안 적어 둔 일정이 영어 날에 한글 제목으로 나가면 안 됩니다. */
  const pooled = list.filter((t) => !!tpick(t.name, lang));
  if (!pooled.length)
    return { ok: false, why: '오늘은 ' + (lang === 'ko' ? '한국어' : lang.toUpperCase()) +
      ' 차례인데 그 언어로 이름이 적힌 일정이 없습니다 — 대쉬보드 [여행사] 탭에서 채워 주세요' };

  const t = pooled[n % pooled.length];
  const tpl = tpls[(n * 3) % tpls.length];

  /* 여행 사진은 쇼핑몰에 올리지 않기로 했습니다.
     그래서 전체 주소(https://…)로 적힌 것만 씁니다. 쇼핑몰 안 경로는 무시합니다. */
  const raw = String(t.img || '').trim();
  const img = (/^https:\/\//i.test(raw) && raw.indexOf(site()) !== 0) ? raw : '';

  return {
    ok: true, ch: 'tour',
    date: kstDate(when), weekday: kstDay(when), index: n,
    productId: t.id || '', product: tpick(t.name, lang) || tpick(t.name, 'ko'),
    pool: pooled.length, lang: lang, template: (n * 3) % tpls.length,
    text: fillTour(tpl, t, tags, lang, T.kakao),
    image: img
  };
}

/* 오늘 무엇을 올릴지 정합니다 */
async function planToday(when) {
  const [D, POL] = await Promise.all([readJs('/assets/data.js'), readJs('/assets/policy.js')]);
  const T = POL.THREADS || {};
  if (T.on === false) return { ok: false, why: '대쉬보드에서 꺼 두었습니다' };

  const list = pool(D.PRODUCTS || [], T.hall || 'es');
  if (!list.length) return { ok: false, why: '올릴 수 있는 상품이 없습니다 (재고·가격·사진을 확인해 주세요)' };

  /* 몇 번째 게시인가 → 상품 · 언어 · 문구를 서로 다른 보폭으로 돌립니다. */
  const n = postIndex(T.days, when);

  /* 언어를 번갈아 갑니다. langs 가 없으면 예전처럼 한국어만. */
  const langs = (T.langs && T.langs.length) ? T.langs : ['ko'];
  const lang = langs[n % langs.length];

  /* 문구·해시태그는 언어별 목록에서. 없으면 예전 방식(T.posts / T.tags)으로 물러납니다. */
  const tpls = (T.postsBy && T.postsBy[lang] && T.postsBy[lang].length) ? T.postsBy[lang]
             : (T.posts && T.posts.length) ? T.posts
             : ['{name}\n{tag}\n{won}\n{link}'];
  const tags = (T.tagsBy && T.tagsBy[lang]) ? T.tagsBy[lang] : (T.tags || []);

  const p = list[n % list.length];
  const tpl = tpls[(n * 3) % tpls.length];

  /* 오늘 환율. 못 받아오면 data.js 에 박힌 값을 씁니다. */
  let base = Number(D.FX && D.FX.base) || 0;
  const buffer = Number(D.FX && D.FX.buffer) || 0;
  try {
    const r = await fetch(site() + '/api/fx', { cache: 'no-store' });
    const j = await r.json();
    if (j && j.ok && j.base > 500 && j.base < 4000 && Math.abs(j.base - base) / base <= 0.15) base = j.base;
  } catch (e) { /* 박힌 값 그대로 */ }
  const rate = Math.round(base * (1 + buffer) * 10) / 10;

  const b = (D.BRANDS || []).filter(x => x.id === p.brand)[0];
  return {
    ok: true,
    date: kstDate(when), weekday: kstDay(when), index: n,
    productId: p.id, product: (p.name && p.name.ko) || '',
    pool: list.length, lang: lang, template: (n * 3) % tpls.length,
    text: fill(tpl, p, b, rate, tags, lang),
    image: photo(p)
  };
}

/* ── 실제로 올리기 ── */
async function callAPI(path, params) {
  const body = new URLSearchParams(params);
  const r = await fetch(API + path, { method: 'POST', body });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error((j.error && j.error.message) || ('HTTP ' + r.status));
  return j;
}
async function containerReady(id, token) {
  /* 사진을 넣은 글은 쓰레드 쪽에서 사진을 내려받아 처리할 시간이 필요합니다.
     30초를 무턱대고 기다리는 대신 준비됐는지 물어보며 기다립니다. */
  for (let i = 0; i < 12; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const r = await fetch(API + '/' + id + '?fields=status,error_message&access_token=' + encodeURIComponent(token));
    const j = await r.json().catch(() => ({}));
    if (j.status === 'FINISHED') return true;
    if (j.status === 'ERROR' || j.status === 'EXPIRED') throw new Error('사진 처리 실패: ' + (j.error_message || j.status));
  }
  throw new Error('사진 처리가 1분 안에 끝나지 않았습니다');
}

async function publish(plan, ch) {
  const cfg = CH[ch] || CH.shop;
  const uid = process.env[cfg.uid], token = process.env[cfg.tok];
  if (!uid || !token) throw new Error(cfg.uid + ' / ' + cfg.tok + ' 이 넷리파이에 없습니다');

  const params = { access_token: token, text: plan.text };
  if (plan.image) { params.media_type = 'IMAGE'; params.image_url = plan.image; }
  else { params.media_type = 'TEXT'; }

  const c = await callAPI('/' + uid + '/threads', params);
  if (plan.image) await containerReady(c.id, token);
  else await new Promise(r => setTimeout(r, 3000));
  const out = await callAPI('/' + uid + '/threads_publish', { access_token: token, creation_id: c.id });
  return out.id;
}

export default async (req) => {
  const q = new URL(req.url).searchParams;
  const key = process.env.THREADS_HOOK_KEY || '';
  const ch = chan(q.get('ch'));
  const c = CH[ch];
  const plan = () => (ch === 'tour' ? planTour() : planToday());

  try {
    /* 대쉬보드가 여행 일정을 읽어 가는 창구.
       여행 상품은 손님에게 안 보이기로 했으므로 게시 열쇠를 아는 사람만 볼 수 있습니다. */
    if (q.get('data')) {
      if (ch !== 'tour') return json({ ok: false, why: '여행사 쪽에서만 쓰는 창구입니다' }, 400);
      if (key.length < 12) return json({ ok: false, why: 'THREADS_HOOK_KEY 를 12자 이상으로 정해 주세요' }, 403);
      if (q.get('key') !== key) return json({ ok: false, why: '열쇠가 다릅니다' }, 403);
      return json({ ok: true, TOURS: TOURS, TOURTHREADS: TOURTHREADS });
    }

    if (q.get('preview')) return json(await plan());

    if (q.get('post')) {
      /* 열쇠를 안 정해 두었으면 아무도 못 올리게 막습니다 — 빈 값끼리 맞아떨어지면 안 됩니다 */
      if (key.length < 12) return json({ ok: false, why: 'THREADS_HOOK_KEY 를 12자 이상으로 정해 주세요' }, 403);
      if (q.get('key') !== key) return json({ ok: false, why: '열쇠가 다릅니다' }, 403);

      const p = await plan();
      if (!p.ok) return json(p);
      const id = await publish(p, ch);
      console.log('[threads:' + ch + '] 올렸습니다', id, p.productId, p.date);
      return json({ ok: true, ch: ch, posted: id, date: p.date, productId: p.productId, text: p.text });
    }

    /* 아무 것도 안 붙였을 때 — 준비 상태만 알려 줍니다 (비밀은 보여 주지 않습니다) */
    return json({
      ok: true,
      계정: c.label,
      사용자번호: process.env[c.uid] ? '있음' : '없음',
      토큰: process.env[c.tok] ? '있음' : '없음',
      열쇠: key.length >= 12 ? '있음' : '없음(또는 너무 짧음)',
      오늘: kstDate(), 요일: kstDay()
    });
  } catch (e) {
    console.error('[threads:' + ch + ']', e);
    return json({ ok: false, why: String((e && e.message) || e) }, 200);
  }
};

export const config = { path: '/api/threads' };
