/* 쓰레드(Threads) 자동 게시 창구

   주소 세 가지
     /api/threads                 지금 상태 (설정이 제대로 붙었는지 확인)
     /api/threads?preview=1       오늘 나갈 글을 보여만 줍니다. 올리지 않습니다.
     /api/threads?post=1&key=…    지금 올립니다. key 는 THREADS_HOOK_KEY 와 같아야 합니다.

   정해진 요일·시각에 올리는 일은 threads-cron.js 가 이 주소를 부르는 방식으로 합니다.

   넷리파이 환경변수 (Site configuration → Environment variables)
     THREADS_USER_ID    쓰레드 사용자 번호
     THREADS_TOKEN      장기 토큰 (60일마다 갱신해야 합니다)
     THREADS_HOOK_KEY   아무도 못 맞출 긴 문자열. 이게 없으면 게시를 막습니다.

   토큰은 넷리파이 안에만 있고, 손님 화면이나 대쉬보드로는 절대 내려가지 않습니다.  */

const API = 'https://graph.threads.net/v1.0';

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

async function publish(plan) {
  const uid = process.env.THREADS_USER_ID, token = process.env.THREADS_TOKEN;
  if (!uid || !token) throw new Error('THREADS_USER_ID / THREADS_TOKEN 이 넷리파이에 없습니다');

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

  try {
    if (q.get('preview')) return json(await planToday());

    if (q.get('post')) {
      /* 열쇠를 안 정해 두었으면 아무도 못 올리게 막습니다 — 빈 값끼리 맞아떨어지면 안 됩니다 */
      if (key.length < 12) return json({ ok: false, why: 'THREADS_HOOK_KEY 를 12자 이상으로 정해 주세요' }, 403);
      if (q.get('key') !== key) return json({ ok: false, why: '열쇠가 다릅니다' }, 403);

      const plan = await planToday();
      if (!plan.ok) return json(plan);
      const id = await publish(plan);
      console.log('[threads] 올렸습니다', id, plan.productId, plan.date);
      return json({ ok: true, posted: id, date: plan.date, productId: plan.productId, text: plan.text });
    }

    /* 아무 것도 안 붙였을 때 — 준비 상태만 알려 줍니다 (비밀은 보여 주지 않습니다) */
    return json({
      ok: true,
      사용자번호: process.env.THREADS_USER_ID ? '있음' : '없음',
      토큰: process.env.THREADS_TOKEN ? '있음' : '없음',
      열쇠: key.length >= 12 ? '있음' : '없음(또는 너무 짧음)',
      오늘: kstDate(), 요일: kstDay()
    });
  } catch (e) {
    console.error('[threads]', e);
    return json({ ok: false, why: String((e && e.message) || e) }, 200);
  }
};

export const config = { path: '/api/threads' };
