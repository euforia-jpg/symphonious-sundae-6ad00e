/* 오늘 환율 (€1 → ₩) 을 대신 받아다 주는 작은 창구입니다.

   왜 필요한가:
   하나은행 매매기준율을 주는 곳(두나무 시세 API — 네이버·다음 환율이 쓰는 그것)은
   손님 브라우저가 직접 부르면 막힙니다(CORS). 그래서 우리 서버가 대신 부릅니다.
   손님 화면과 대쉬보드는 우리 주소인 /.netlify/functions/fx 만 부르면 됩니다.

   돌려주는 값
     { base: 1588.47, at: "2026-09-01 09:12", source: "하나은행 매매기준율", ok: true }
   받아오지 못하면 ok:false 를 돌려주고, 화면은 data.js 에 박힌 값을 그대로 씁니다.  */

const SRC = [
  {
    name: '하나은행 매매기준율',
    url: 'https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWEUR',
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

export default async () => {
  const head = {
    'Content-Type': 'application/json; charset=utf-8',
    /* 30분 동안은 같은 답을 재사용합니다. 손님이 몰려도 바깥 API 를 두들기지 않습니다. */
    'Cache-Control': 'public, max-age=1800, s-maxage=1800',
    'Access-Control-Allow-Origin': '*'
  };

  for (const s of SRC) {
    try {
      const ctl = AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined;
      const r = await fetch(s.url, { signal: ctl });
      if (!r.ok) continue;
      const v = Number(s.pick(await r.json()));
      if (!(v > 500 && v < 4000)) continue;          // 말이 되는 값인지 한 번 봅니다
      return new Response(JSON.stringify({
        ok: true,
        base: Math.round(v * 100) / 100,
        at: seoulNow(),
        source: s.name
      }), { headers: head });
    } catch (e) { /* 다음 곳으로 */ }
  }

  return new Response(JSON.stringify({ ok: false, reason: 'no-source' }), {
    status: 200,
    headers: Object.assign({}, head, { 'Cache-Control': 'no-store' })
  });
};

export const config = { path: '/api/fx' };
