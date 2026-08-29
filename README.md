# Mercado Euforia — 웹 버전

이 폴더를 통째로 GitHub 저장소에 올리고 Netlify에 연결하면 사이트가 뜹니다.

## 배포 순서

1. GitHub에 새 저장소를 만들고 이 폴더의 파일을 전부 올립니다.
2. Netlify → Add new site → Import an existing project → 그 저장소를 고릅니다.
3. 빌드 설정은 건드리지 않습니다. Publish directory 는 `.` 입니다.
4. 배포되면 주소가 나옵니다. `robots.txt` 와 `sitemap.xml` 의 `symphonious-sundae-6ad00e.netlify.app` 을 그 주소로 바꿔 주세요.

## 주문서 받기

주문 요청은 Netlify Forms 로 들어옵니다. 별도 서버가 필요 없습니다.

- Netlify 사이트 → Forms → `order` 폼에서 접수 내역을 볼 수 있습니다.
- 메일로 받으려면: Forms → Settings → Form notifications → Email notification 에 받을 주소를 넣습니다.
- 첫 배포 후 폼이 목록에 안 보이면, 사이트를 한 번 더 배포하면 잡힙니다.

이 단계에서는 **결제가 일어나지 않습니다.** 재고와 배송비를 확인해 메일로 결제 안내를 보내는 방식입니다.
카드 결제(Stripe)는 상품과 배송 요율이 확정된 뒤에 붙이는 것이 안전합니다.

## 파일 구조

```
index.html          홈 (관 전환 · 히어로 · 셀렉션 · 생산자 · 전체 상품)
shop.html           전체 상품 (카테고리 · 정렬 · 가격대 필터)
product.html        상품 상세 (?id=1)
brands.html         생산자 목록
brand.html          생산자 상세 (?id=casa-olivar)
cart.html           장바구니 + 주문 요청서
thanks.html         주문 접수 완료
assets/data.js      상품 30종 + 생산자 7곳 + 환율      ← 상품을 늘릴 때 고치는 파일
assets/i18n.js      화면 문구 7개 언어                  ← 문구를 고칠 때 보는 파일
assets/styles.css   색 · 서체 · 레이아웃                ← 색을 바꿀 때 맨 위 3줄만 고치면 됩니다
assets/app.js       공통 동작 (언어 · 통화 · 장바구니)
```

## 자주 하는 수정

**색 바꾸기** — `assets/styles.css` 맨 위
```
--cobalt:#1E4FD8;   /* Shop Spain */
--jade:#0F7A6C;     /* Shop Korea */
--pom:#D6265A;      /* 포인트 */
```

**환율 바꾸기** — `assets/data.js` 맨 아래
```
window.FX = { base: 1614.20, buffer: 0.03, at: "2026-08-27 09:00", source: "하나은행 매매기준율" };
```
`base` 에 하나은행 매매기준율, `buffer` 에 판매 버퍼를 넣습니다. 원화 표시가 전부 따라 바뀝니다.

**상품 추가** — `assets/data.js` 의 `window.PRODUCTS` 배열에 한 줄 추가
```js
{id:31, hall:"es", cat:"food", brand:"casa-olivar", eur:19.00, g:"250g", badge:null, stock:30,
 name:{ko:"...",es:"...",en:"...",fr:"...",de:"...",it:"...",zh:"..."},
 tag: {ko:"...",es:"...",en:"...",fr:"...",de:"...",it:"...",zh:"..."}},
```
`hall` 은 `es`(Shop Spain) 또는 `kr`(Shop Korea),
`cat` 은 `food · wine · craft · home · fashion · beauty` 중 하나입니다.

## 아직 없는 것

- 상품 사진 (지금은 카테고리별 색 타일로 대체되어 있습니다)
- 카드 결제
- 회원가입 · 주문 조회
- 상품 검색

사진이 준비되면 `assets/img/` 폴더를 만들어 넣고 상품마다 `img` 항목을 추가하는 방식으로 연결합니다.
