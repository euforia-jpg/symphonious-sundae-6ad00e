/* 오늘 환율 (€1 → ₩) 을 대신 받아다 주는 작은 창구입니다.

   왜 필요한가:
   하나은행 매매기준율을 주는 곳(두나무 시세 API — 네이버·다음 환율이 쓰는 그것)은
   손님 브라우저가 직접 부르면 막힙니다(CORS). 그래서 우리 서버가 대신 부릅니다.
   손님 화면과 대쉬보드는 우리 주소인 /api/fx 만 부르면 됩니다.

   돌려주는 값
     { ok:true, base: 1588.47, at: "2026-09-01 09:12", source: "하나은행 매매기준율" }
   받아오지 못하면 ok:false 를 돌려주고, 화면은 data.js 에 박힌 값을 그대로 씁니다.

   /api/fx?debug=1 을 열면 어느 곳이 왜 실패했는지 한 줄씩 보여 줍니다.        */

const SRC = [
  /* 하나은행 매매기준율 — 같은 값을 주는 곳 두 군데를 차례로 두드립니다.
     한 곳이 해외 서버를 막아도 다른 곳이 열려 있는 경우가 있습니다. */
  {
    name: '하나은행 매매기준율',
    url: 'https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWEUR',
    pick: (j) => (Array.isArray(j) && j[0] && j[0].basePrice) || 0
  },
  {
    name: '하나은행 매매기준율',
    url: 'https://api-manager.upbit.com/api/v1/forex/recent?codes=FRX.KRWEUR',
    pick: (j) => (Array.isArray(j) && j[0] && j[0].basePrice) || 0
  },
  {
    name: 'open.er-api.com',
    url: 'https://open.er-api.com/v6/latest/EUR',
    pick: (j) => (j && j.rates && j.rates.KRW) || 0
  },
  {
    name: 'currency-api',
    url: 'https://latest.currency-api.pages.dev/v1/currencies/eur.json',
    pick: (j) => (j && j.eur && j.eur.krw) || 0
  }
];

/* 서울 시각으로 적어 둡니다 — 사장님도 손님도 한국 시각이 익숙합니다. */
function seoulNow() {
  const d = new Date(Date.now() + 9 * 3600 * 1000).toISOString();
  return d.slice(0, 10) + ' ' + d.slice(11, 16);
}

/* 어떤 곳은 기본 fetch 를 로봇으로 보고 막습니다. 보통 브라우저처럼 인사합니다. */
const HELLO = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
};

export default async (req) => {
  const debug = new URL(req.url).searchParams.get('debug');
  const log = [];
  const head = {
    'Content-Type': 'application/json; charset=utf-8',
    /* 30분 동안은 같은 답을 재사용합니다. 손님이 몰려도 바깥 API 를 두들기지 않습니다. */
    'Cache-Control': debug ? 'no-store' : 'public, max-age=1800, s-maxage=1800',
    'Access-Control-Allow-Origin': '*'
  };

  for (const s of SRC) {
    const host = new URL(s.url).host;
    try {
      const r = await fetch(s.url, {
        headers: HELLO,
        signal: AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined
      });
      if (!r.ok) { log.push(host + ' → HTTP ' + r.status); continue; }
      const body = await r.text();
      let j;
      try { j = JSON.parse(body); }
      catch (e) { log.push(host + ' → JSON 아님: ' + body.slice(0, 60)); continue; }
      const v = Number(s.pick(j));
      if (!(v > 500 && v < 4000)) {           // 말이 되는 값인지 한 번 봅니다
        log.push(host + ' → 값이 이상함: ' + JSON.stringify(j).slice(0, 60));
        continue;
      }
      log.push(host + ' → OK ' + v);
      return new Response(JSON.stringify({
        ok: true,
        base: Math.round(v * 100) / 100,
        at: seoulNow(),
        source: s.name,
        host: host,
        log: debug ? log : undefined
      }), { headers: head });
    } catch (e) {
      log.push(host + ' → ' + (e && e.name === 'TimeoutError' ? '시간 초과' : String(e && e.message || e).slice(0, 70)));
    }
  }

  return new Response(JSON.stringify({ ok: false, reason: 'no-source', log: log }), {
    status: 200,
    headers: Object.assign({}, head, { 'Cache-Control': 'no-store' })
  });
};

export const config = { path: '/api/fx' };
