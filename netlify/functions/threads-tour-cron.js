/* 여행사 계정 자동 게시 알람.

   아래 schedule 은 세계표준시(UTC)입니다.
     "0 11 * * 2,4"  = 화·목 UTC 11시 = 한국 시각 저녁 8시
   요일이나 시각을 바꾸시려면 이 한 줄을 고치고 다시 배포하시면 됩니다.
   (한국 시각에서 9시간 빼면 UTC 입니다)

   상품 쇼핑몰 쪽은 threads-cron.js 가 따로 돕니다 — 서로 건드리지 않습니다.  */

export default async () => {
  const base = (process.env.URL || 'https://symphonious-sundae-6ad00e.netlify.app').replace(/\/+$/, '');
  const key = process.env.THREADS_HOOK_KEY || '';
  if (key.length < 12) {
    console.error('[threads-tour-cron] THREADS_HOOK_KEY 가 없습니다 — 아무것도 올리지 않았습니다');
    return new Response('no key');
  }
  try {
    const r = await fetch(base + '/api/threads?ch=tour&post=1&key=' + encodeURIComponent(key));
    const t = await r.text();
    console.log('[threads-tour-cron]', r.status, t.slice(0, 500));
  } catch (e) {
    console.error('[threads-tour-cron]', e);
  }
  return new Response('ok');
};

export const config = { schedule: '0 11 * * 2,4' };
