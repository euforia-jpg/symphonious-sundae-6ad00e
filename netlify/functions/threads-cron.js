/* 정해진 요일·시각에 쓰레드에 올리도록 시키는 알람입니다.

   아래 schedule 은 세계표준시(UTC)입니다.
     "0 11 * * 1,3,5"  = 월·수·금 UTC 11시 = 한국 시각 저녁 8시
   요일이나 시각을 바꾸시려면 이 한 줄을 고치고 다시 배포하시면 됩니다.
     한국 시각 → UTC 는 9시간을 빼면 됩니다.
     (뺐더니 0시보다 작아지면 하루 앞 요일이 됩니다)

   실제로 무엇을 올릴지는 threads.js 가 정합니다.  */

export default async () => {
  const base = (process.env.URL || 'https://symphonious-sundae-6ad00e.netlify.app').replace(/\/+$/, '');
  const key = process.env.THREADS_HOOK_KEY || '';
  if (key.length < 12) {
    console.error('[threads-cron] THREADS_HOOK_KEY 가 없습니다 — 아무것도 올리지 않았습니다');
    return new Response('no key');
  }
  try {
    const r = await fetch(base + '/api/threads?post=1&key=' + encodeURIComponent(key));
    const t = await r.text();
    console.log('[threads-cron]', r.status, t.slice(0, 500));
  } catch (e) {
    console.error('[threads-cron]', e);
  }
  return new Response('ok');
};

export const config = { schedule: '0 11 * * 1,3,5' };
