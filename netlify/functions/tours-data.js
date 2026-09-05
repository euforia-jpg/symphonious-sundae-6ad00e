/* 유포리아투어 — 여행 상품과 쓰레드 자동 게시 설정

   ★ 이 파일은 일부러 netlify/functions 폴더에 있습니다.
     이 폴더의 파일은 서버 안에서만 돌아가고 손님에게 파일로 내려가지 않습니다.
     주소를 아는 사람도 열어 볼 수 없습니다.
     assets 폴더에 두면 누구나 열 수 있으니 절대 옮기지 마십시오.

   쇼핑몰(Mediterráneo)과 완전히 나뉘어 있습니다.
     상품 쇼핑몰 → assets/data.js  + policy.js 의 window.THREADS
     여행사      → 이 파일 (TOURS + TOURTHREADS)

   대쉬보드 [여행사] 탭에서 고치고 [반영·배포] 로 올립니다.  */

/* 여행 상품 목록.
   비어 있으면 여행사 계정은 아무것도 올리지 않습니다.
   사진(img)은 비워 두시면 글만 올라갑니다.
   넣으실 때는 반드시 https:// 로 시작하는 전체 주소여야 합니다
   (회사 홈페이지 등 여행사 쪽에 올린 사진). 쇼핑몰에는 여행 사진을 올리지 않습니다. */
export const TOURS = [];

/* 여행사 쓰레드 계정 설정.

   글 안에서 쓸 수 있는 자리표:
     {name}  상품 이름        {tag}   한 줄 소개
     {area}  지역             {days}  기간
     {price} 요금             {from}  출발
     {link}  문의 주소 (아래 kakao)  {tags} 해시태그          */
export const TOURTHREADS = {
  on: true,
  days: [2, 4],               // 화 · 목 (0=일 1=월 … 6=토)
  hourKST: 20,                // 한국 시각 기준 시
  langs: ['ko'],

  /* 글 끝에 붙는 문의 주소. 여행사용 카카오 채널이 따로 있으면 바꿔 주세요. */
  kakao: 'https://pf.kakao.com/_BSxggn/chat',

  tagsBy: {
    ko: ['#스페인여행', '#유럽여행', '#포르투갈여행', '#유포리아투어'],
    en: ['#SpainTravel', '#EuropeTravel', '#Portugal', '#EuforiaTour']
  },

  postsBy: {
    ko: [
      '{name}\n\n{tag}\n\n{area} · {days}\n{price}\n출발 {from}\n\n문의 → {link}\n\n{tags}',

      '{area} {days} 일정입니다.\n\n{name}\n{tag}\n\n{price} · 출발 {from}\n\n문의 → {link}\n\n{tags}',

      '이번에 소개할 일정 — {name}\n\n{tag}\n\n{area}를 {days} 동안 돕니다.\n{price}\n\n문의 → {link}\n\n{tags}',

      '{name} · {days}\n\n{tag}\n\n{price}\n출발 {from}\n현지에 사무실을 두고 직접 진행합니다.\n\n문의 → {link}\n\n{tags}',

      '{area}로 가시나요.\n\n{name}\n{tag}\n\n{days} · {price}\n\n문의 → {link}\n\n{tags}',

      '{name}\n{tag}\n\n{price}\n\n문의 → {link}\n\n{tags}'
    ],
    en: [
      '{name}\n\n{tag}\n\n{area} · {days}\n{price}\nDepartures {from}\n\nAsk us → {link}\n\n{tags}',

      '{days} through {area}.\n\n{name}\n{tag}\n\n{price} · departures {from}\n\nAsk us → {link}\n\n{tags}',

      "This one's worth a look — {name}\n\n{tag}\n\n{area}, {days}.\n{price}\n\nAsk us → {link}\n\n{tags}",

      '{name} · {days}\n\n{tag}\n\n{price}\nRun by our own office on the ground.\n\nAsk us → {link}\n\n{tags}',

      '{name}\n{tag}\n\n{price}\n\nAsk us → {link}\n\n{tags}'
    ]
  }
};
