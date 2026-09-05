/* 유포리아투어 — 여행 상품과 쓰레드 자동 게시 설정

   쇼핑몰(Mediterráneo)과 완전히 나뉘어 있습니다.
     상품 쇼핑몰 → assets/data.js  + policy.js 의 window.THREADS
     여행사      → 이 파일 (window.TOURS + window.TOURTHREADS)

   대쉬보드 [여행사] 탭에서 고치고 [반영·배포] 로 올립니다.  */

/* 여행 상품 목록.
   비어 있으면 여행사 계정은 아무것도 올리지 않습니다.
   사진은 assets/img/tours/ 에 올리고 파일 이름만 적으면 됩니다
   (예: 'assets/img/tours/andalucia.jpg'). 다른 사이트 주소를 그대로 적어도 됩니다. */
window.TOURS = [];

/* 여행사 쓰레드 계정 설정.

   글 안에서 쓸 수 있는 자리표:
     {name}  상품 이름        {tag}   한 줄 소개
     {area}  지역             {days}  기간
     {price} 요금             {from}  출발
     {link}  문의 주소 (아래 kakao)  {tags} 해시태그          */
window.TOURTHREADS = {
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
