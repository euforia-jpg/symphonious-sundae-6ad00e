/* Mediterráneo — 결제 · 배송 · 취소/환불 안내와 택배사 목록.

   이 파일은 상품(data.js)과 따로 둡니다. 문구는 상품보다 훨씬 드물게 바뀌고,
   바뀔 때는 통째로 바뀌기 때문입니다.
   관리자 대쉬보드 [안내·결제] 탭에서 고치고 [반영·배포]를 누르면 이 파일이 새로 만들어집니다.

   글은 한국어(ko) · 스페인어(es) · 영어(en) 세 가지를 넣어 둡니다.
   프랑스어·독일어·이탈리아어·중국어로 보는 손님에게는 영어가 나갑니다.
   (대쉬보드 [번역] 기능으로 나머지 언어도 채울 수 있습니다.)                              */

window.POLICY = {
  updated: '2026-08-30',

  /* ───────────────── 결제 ───────────────── */
  pay: [
    { h: { ko: '표시 가격과 통화',
           es: 'Precios y moneda',
           en: 'Prices and currency' },
      b: { ko: '모든 상품 가격은 유로(EUR)가 기준입니다. 원화(₩) 금액은 그날의 환율로 환산한 참고 금액이며, 실제 청구 금액은 결제하시는 시점의 환율과 카드사·은행 수수료에 따라 조금 달라질 수 있습니다.',
           es: 'Todos los precios se fijan en euros (EUR). El importe en won (₩) es orientativo, calculado al tipo de cambio del día; el cargo real puede variar según el tipo de cambio del momento del pago y las comisiones de su banco.',
           en: 'All prices are set in euros (EUR). Won (₩) amounts are indicative, converted at the day’s rate; the actual charge may differ slightly depending on the exchange rate at the time of payment and your bank’s fees.' } },

    { h: { ko: '결제 수단',
           es: 'Formas de pago',
           en: 'Payment methods' },
      b: { ko: '현재는 해외 계좌이체(전신송금)로 받고 있습니다. 주문 요청을 보내 주시면 입금 계좌와 총액을 메일로 안내해 드립니다. 신용·체크카드 결제는 준비 중이며, 준비가 끝나는 대로 이 페이지에서 안내해 드리겠습니다.',
           es: 'Por ahora aceptamos transferencia bancaria internacional. Tras recibir su solicitud le enviamos por correo los datos bancarios y el importe total. El pago con tarjeta está en preparación y se anunciará en esta página.',
           en: 'For now we accept international bank transfer. After you send your order request we email you the bank details and the total. Card payment is in preparation and will be announced on this page.' } },

    { h: { ko: '주문이 확정되는 시점',
           es: 'Cuándo se confirma el pedido',
           en: 'When an order is confirmed' },
      b: { ko: '입금이 확인된 때 주문이 확정됩니다. 확정 전에는 현지 생산자에게 수배를 넣지 않으므로, 그 사이에는 언제든 전액 취소하실 수 있습니다.',
           es: 'El pedido queda confirmado cuando recibimos el pago. Hasta entonces no lo encargamos al productor, por lo que puede cancelarlo íntegramente en cualquier momento.',
           en: 'An order is confirmed when payment arrives. Until then we place nothing with the producer, so you can cancel in full at any time.' } },

    { h: { ko: '관세 · 부가세',
           es: 'Aranceles e IVA',
           en: 'Duties and import VAT' },
      b: { ko: '상품 가격과 국제 운임에는 수입국의 관세·부가세가 포함되어 있지 않습니다. 한국으로 보내는 물품의 관세·부가세는 관련 법령에 따라 수취인(구매자) 부담이며, 통관 시 별도로 부과됩니다. 한국 배송에는 개인통관고유부호가 반드시 필요합니다.',
           es: 'El precio y el transporte no incluyen aranceles ni IVA de importación. En los envíos a Corea, estos corren por cuenta del destinatario según la normativa vigente y se liquidan en aduana. Para Corea es obligatorio el código personal de despacho aduanero (PCCC).',
           en: 'Prices and shipping do not include import duties or VAT. For shipments to Korea these are payable by the recipient under applicable law and are assessed at customs. A Personal Customs Clearance Code (PCCC) is required for Korea.' } },

    { h: { ko: '영수증 · 세금계산서',
           es: 'Factura',
           en: 'Invoices' },
      b: { ko: '요청하시면 주문 건별로 인보이스(영수증)를 메일로 보내 드립니다. 사업자용 서류가 필요하시면 주문 요청 시 요청사항에 적어 주십시오.',
           es: 'Enviamos factura por correo a petición. Si necesita documentación para empresa, indíquelo en el campo de observaciones al hacer el pedido.',
           en: 'We email an invoice on request. If you need business documentation, please note it in the remarks field when ordering.' } }
  ],

  /* ───────────────── 배송 ───────────────── */
  ship: [
    { h: { ko: '어디서 어떻게 갑니까',
           es: 'Desde dónde y cómo',
           en: 'Where from, and how' },
      b: { ko: '스페인 · 포르투갈 · 이탈리아 현지에서 모아 항공편으로 한국까지 직접 보냅니다. 중간 유통 창고를 거치지 않습니다.',
           es: 'Reunimos los productos en España, Portugal e Italia y los enviamos por vía aérea directamente a Corea, sin pasar por almacenes intermedios.',
           en: 'We consolidate in Spain, Portugal and Italy and fly the parcel directly to Korea — no intermediate distribution warehouse.' } },

    { h: { ko: '출고까지 걸리는 시간',
           es: 'Plazo de salida',
           en: 'Time to dispatch' },
      b: { ko: '입금 확인 후 영업일 기준 2~5일 안에 현지에서 출고합니다. 생산자가 주문을 받고 만드는 상품이나 재고가 없는 상품은 더 걸릴 수 있으며, 이 경우 미리 알려 드립니다.',
           es: 'Salimos desde origen en 2–5 días laborables tras confirmar el pago. Los productos elaborados bajo pedido o sin stock pueden tardar más; en ese caso se lo comunicamos de antemano.',
           en: 'We dispatch from origin within 2–5 business days of confirmed payment. Made-to-order or out-of-stock items can take longer; we tell you in advance if so.' } },

    { h: { ko: '받으실 때까지',
           es: 'Plazo de entrega',
           en: 'Delivery time' },
      b: { ko: '출고 후 항공 운송과 통관을 포함해 보통 7~14 영업일이 걸립니다. 통관 심사, 현지 공휴일, 항공편 사정에 따른 지연은 저희가 통제할 수 없는 부분이라 이 기간에 포함되지 않습니다.',
           es: 'Desde la salida suelen pasar 7–14 días laborables, incluidos el transporte aéreo y el despacho de aduanas. No se incluyen las demoras por inspección aduanera, festivos locales o incidencias del vuelo.',
           en: 'From dispatch it usually takes 7–14 business days including air transport and customs. Delays from customs inspection, local holidays or flight disruption are outside our control and not counted in that window.' } },

    { h: { ko: '배송 조회',
           es: 'Seguimiento del envío',
           en: 'Tracking' },
      b: { ko: '출고하면 운송장번호를 메일로 보내 드립니다. 사이트 상단 [배송 조회]에서 택배사를 고르고 번호를 넣으시면 바로 확인하실 수 있습니다.',
           es: 'Al salir el paquete le enviamos el número de seguimiento por correo. Puede consultarlo en [Seguimiento], eligiendo el transportista e introduciendo el número.',
           en: 'We email the tracking number at dispatch. You can check it under [Tracking] — pick the carrier and enter the number.' } },

    { h: { ko: '개인통관고유부호 (한국 배송)',
           es: 'Código de despacho personal (Corea)',
           en: 'Personal Customs Clearance Code (Korea)' },
      b: { ko: '한국으로 보내는 모든 물품에는 수취인의 개인통관고유부호(P로 시작하는 13자리)가 필요합니다. 관세청 누리집에서 무료로 발급받으실 수 있습니다. 번호가 틀리면 통관이 멈추고 반송될 수 있으니 주문 시 정확히 적어 주십시오.',
           es: 'Todo envío a Corea requiere el código personal de despacho del destinatario (13 caracteres, empieza por P). Se obtiene gratis en la web del Servicio de Aduanas de Corea. Un código erróneo puede detener el despacho y provocar la devolución del paquete.',
           en: 'Every shipment to Korea needs the recipient’s Personal Customs Clearance Code (13 characters, starting with P), issued free by Korea Customs Service. An incorrect code can stop clearance and cause the parcel to be returned.' } },

    { h: { ko: '보낼 수 없는 물품',
           es: 'Artículos no enviables',
           en: 'What we cannot ship' },
      b: { ko: '주류, 일부 육가공품·유제품, 종자·생과일 등은 항공 운송 규정이나 수입국 검역 규정에 따라 보낼 수 없거나 수량이 제한됩니다. 해당 상품은 주문 전에 미리 안내해 드립니다.',
           es: 'Bebidas alcohólicas, algunos derivados cárnicos y lácteos, semillas y fruta fresca pueden estar prohibidos o limitados por las normas de transporte aéreo o de sanidad del país de destino. Se lo indicamos antes del pedido.',
           en: 'Alcohol, certain meat and dairy products, seeds and fresh fruit may be prohibited or limited by air-transport rules or the destination country’s quarantine regulations. We flag these before you order.' } },

    { h: { ko: '배송비',
           es: 'Gastos de envío',
           en: 'Shipping cost' },
      b: { ko: '국제배송비는 무게로 계산합니다. 장바구니에 담으신 상품의 무게(포장 포함)를 합쳐 1kg 단위로 올린 뒤, 1kg당 15유로를 더합니다. 1kg 미만도 최소 1kg으로 봅니다. 예를 들어 합계가 1.4kg이면 2kg으로 보아 30유로입니다. 부피가 아주 크거나 무거운 상품은 따로 견적을 드릴 수 있습니다.',
           es: 'El envío internacional se calcula por peso: sumamos el peso de los artículos (embalaje incluido), lo redondeamos al kilo superior y aplicamos 15 € por kilo, con un mínimo de 1 kg. Por ejemplo, 1,4 kg se factura como 2 kg: 30 €. Los artículos muy voluminosos o pesados pueden presupuestarse aparte.',
           en: 'International shipping is charged by weight: we add up the weight of your items (packaging included), round up to the next kilo and charge €15 per kilo, with a 1 kg minimum. For example, 1.4 kg is billed as 2 kg — €30. Very bulky or heavy items may be quoted separately.' } }
  ],

  /* ───────────────── 취소 · 반품 · 환불 ───────────────── */
  cancel: [
    { h: { ko: '이 안내의 성격',
           es: 'Naturaleza de este servicio',
           en: 'What this service is' },
      b: { ko: 'Mediterráneo는 남유럽 현지에서 상품을 확보해 한국까지 항공으로 직접 보내 드리는 해외 직배송 서비스입니다. 국내 창고에 재고를 두고 파는 방식이 아니어서, 한번 현지에서 출고된 물품을 되돌리는 데에는 실제 비용이 큽니다. 아래 조건은 그 사정을 반영한 것입니다.',
           es: 'Mediterráneo es un servicio de envío directo: adquirimos el producto en origen y lo enviamos por vía aérea a Corea. No mantenemos stock en el país de destino, por lo que devolver un paquete ya expedido tiene un coste real elevado. Las condiciones siguientes reflejan esa realidad.',
           en: 'Mediterráneo is a direct-shipping service: we source at origin and fly the goods to Korea. We hold no stock in the destination country, so returning a dispatched parcel carries a real and substantial cost. The terms below reflect that.' } },

    { h: { ko: '출고 전 취소 — 전액 환불',
           es: 'Cancelación antes de la salida — reembolso íntegro',
           en: 'Cancellation before dispatch — full refund' },
      b: { ko: '현지 출고 전이라면 언제든지 취소하실 수 있고, 받은 금액을 전액 돌려드립니다. 취소는 문의 메일로 접수해 주십시오. 다만 이미 생산자에게 주문이 들어간 맞춤·소량 생산 상품은 생산자 측 취소 규정에 따라 일부 비용이 발생할 수 있으며, 이 경우 미리 알려 드리고 동의를 받은 뒤에만 공제합니다.',
           es: 'Puede cancelar en cualquier momento antes de la expedición y le devolvemos el importe íntegro. Solicítelo por correo. En productos hechos bajo pedido o de producción muy limitada, el productor puede aplicar un coste de cancelación; se lo comunicaremos y solo lo descontaremos con su conformidad.',
           en: 'You may cancel any time before dispatch and we refund in full. Request it by email. For made-to-order or very small-batch items the producer may charge a cancellation cost; we will tell you first and only deduct it with your agreement.' } },

    { h: { ko: '출고 후 · 단순 변심',
           es: 'Tras la salida · cambio de opinión',
           en: 'After dispatch · change of mind' },
      b: { ko: '현지에서 출고된 뒤의 단순 변심 반품은 해외 직배송의 특성상 원칙적으로 어렵습니다. 부득이하게 반품을 원하시는 경우, 미개봉·재판매가 가능한 상태여야 하며 왕복 국제운임, 통관·반송 비용, 환급되지 않는 관세·부가세를 고객께서 부담하십니다. 이 비용은 상품 가격을 넘는 경우도 있으므로 주문 전에 꼭 확인해 주십시오.',
           es: 'Una vez expedido el paquete, la devolución por cambio de opinión no suele ser viable en un envío internacional directo. Si aun así desea devolverlo, el artículo debe estar sin abrir y en estado revendible, y usted asume el transporte internacional de ida y vuelta, los costes de aduana y devolución y los impuestos no recuperables. Ese importe puede superar el precio del producto.',
           en: 'Once dispatched, a change-of-mind return is generally not viable on a direct international shipment. If you still wish to return an item it must be unopened and resaleable, and you bear the round-trip international carriage, customs and return costs, and any non-refundable duties or taxes. That total can exceed the price of the goods.' } },

    { h: { ko: '식품 · 개봉한 상품',
           es: 'Alimentos y productos abiertos',
           en: 'Food and opened goods' },
      b: { ko: '식품, 화장품 등 위생과 안전이 걸린 상품은 개봉하신 뒤에는 단순 변심으로 반품하실 수 없습니다. 상품 자체에 하자가 있는 경우는 아래 항목에 따릅니다.',
           es: 'Los alimentos y cosméticos, por razones de higiene y seguridad, no admiten devolución por cambio de opinión una vez abiertos. Si el producto presenta un defecto, se aplica el apartado siguiente.',
           en: 'Food and cosmetics cannot be returned for change of mind once opened, for hygiene and safety reasons. Defective goods are covered by the next clause.' } },

    { h: { ko: '하자 · 파손 · 오배송 — 저희 부담',
           es: 'Defecto, rotura o error — a nuestro cargo',
           en: 'Defective, damaged or wrong item — our cost' },
      b: { ko: '상품에 하자가 있거나, 운송 중 파손되었거나, 주문과 다른 물건이 도착했다면 전적으로 저희가 부담합니다. 새 상품으로 다시 보내 드리거나 전액 환불해 드리며, 반송이 필요한 경우 반송비도 저희가 냅니다. 파손은 수령 후 24시간 이내, 그 밖의 하자는 수령 후 7일 이내에 사진(가능하면 개봉 영상)과 함께 알려 주십시오.',
           es: 'Si el producto llega defectuoso, roto o equivocado, el coste es enteramente nuestro: reponemos el artículo o reembolsamos el importe completo, y asumimos el transporte de devolución si es necesario. Avísenos con fotografías (y vídeo de apertura si es posible) en 24 horas para roturas y en 7 días para otros defectos.',
           en: 'If an item arrives defective, broken or incorrect, the cost is entirely ours: we replace it or refund in full, and we pay return carriage where needed. Please notify us with photographs (and an unboxing video if possible) within 24 hours for breakage and within 7 days for other defects.' } },

    { h: { ko: '통관에서 막히거나 반송된 경우',
           es: 'Retención o devolución en aduana',
           en: 'Held or returned at customs' },
      b: { ko: '개인통관고유부호 오류, 수취인 정보 오류, 수취 거부, 관세 미납 등 고객 사유로 통관이 되지 않아 반송된 경우에는 왕복 국제운임과 반송·보관 비용을 공제한 뒤 환불해 드립니다. 수입국의 법령 변경이나 검역 조치처럼 어느 쪽 잘못도 아닌 사유로 반송된 경우에는 실제 발생한 운임만 공제합니다.',
           es: 'Si el envío se devuelve por causa del cliente (código de despacho o datos erróneos, rechazo de la entrega, impuestos no abonados), reembolsamos descontando el transporte de ida y vuelta y los gastos de devolución y almacenaje. Si la devolución se debe a un cambio normativo o a una medida sanitaria ajena a ambas partes, solo descontamos el transporte realmente incurrido.',
           en: 'If a parcel is returned for reasons on your side (wrong clearance code or address, refused delivery, unpaid duties) we refund after deducting round-trip carriage and return/storage costs. If it is returned because of a regulatory or quarantine change beyond either party’s control, we deduct only the carriage actually incurred.' } },

    { h: { ko: '환불 방법과 기간',
           es: 'Forma y plazo del reembolso',
           en: 'How and when we refund' },
      b: { ko: '환불 사유가 확인되면 영업일 기준 5~10일 안에 처음 결제하신 수단으로 돌려드립니다. 해외 계좌이체로 받으신 경우 국제 송금 수수료는 실비로 공제될 수 있습니다. 카드 결제가 열린 뒤에는 카드 취소로 처리되며, 카드사 사정에 따라 실제 반영까지 며칠 더 걸릴 수 있습니다.',
           es: 'Una vez verificado el motivo, reembolsamos en 5–10 días laborables por el mismo medio de pago. En transferencias internacionales pueden descontarse las comisiones bancarias reales. Cuando el pago con tarjeta esté disponible, se tramitará como anulación y su banco puede tardar unos días más en reflejarlo.',
           en: 'Once the reason is verified we refund within 5–10 business days to the original payment method. For international transfers, actual bank fees may be deducted. When card payment goes live, refunds are processed as a card reversal, which your bank may take a few extra days to show.' } },

    { h: { ko: '문의와 분쟁',
           es: 'Consultas y reclamaciones',
           en: 'Questions and disputes' },
      b: { ko: '취소·반품·환불에 관한 모든 요청은 문의 메일로 접수해 주십시오. 접수 순서대로 처리하며, 진행 상황을 메일로 알려 드립니다. 저희는 스페인 마드리드에 소재한 Euforia Das Nuvens, S.L. 이며, 손님과의 분쟁은 먼저 협의로 해결하는 것을 원칙으로 합니다.',
           es: 'Curse cualquier solicitud de cancelación, devolución o reembolso por correo electrónico. Las atendemos por orden de entrada y le informamos del estado. Somos Euforia Das Nuvens, S.L., con domicilio en Madrid (España), y procuramos resolver cualquier discrepancia de forma amistosa en primer lugar.',
           en: 'Please send any cancellation, return or refund request by email. We handle them in order received and keep you informed. We are Euforia Das Nuvens, S.L., based in Madrid, Spain, and we aim to settle any dispute by agreement first.' } }
  ]
};

/* 결제 수단. on:false 이면 손님 화면에 "준비중"으로 회색 표시됩니다.
   카드결제를 열 때는 대쉬보드 [안내·결제] 탭에서 켜기만 하면 됩니다. */
window.PAYMETHODS = [
  { id: 'bank', on: true,
    name: { ko: '해외 계좌이체', es: 'Transferencia bancaria', en: 'Bank transfer' },
    desc: { ko: '주문 요청을 보내시면 입금 계좌와 총액을 메일로 안내해 드립니다.',
            es: 'Le enviamos por correo los datos bancarios y el importe total.',
            en: 'We email you the bank details and the total.' } },
  { id: 'card', on: false, via: 'Stripe',
    name: { ko: '신용 · 체크카드', es: 'Tarjeta de crédito o débito', en: 'Credit / debit card' },
    desc: { ko: 'Visa · Mastercard · American Express. 지금은 준비 중입니다.',
            es: 'Visa · Mastercard · American Express. En preparación.',
            en: 'Visa · Mastercard · American Express. In preparation.' } }
];

/* 국제배송비 규칙.
   perKg = 1kg 당 요금(유로) · step = 올림 단위(kg) · minKg = 최소 청구 무게(kg)
   지금 규칙: 무게를 kg 단위로 올린 뒤 kg당 15유로. 1kg 미만도 1kg 으로 봅니다.
   상품마다 kg(포장 포함 실측 무게)을 넣어 두어야 계산됩니다. */
window.SHIPPING = { perKg: 15, step: 1, minKg: 1 };

/* 문의 창구. 화면 오른쪽 아래에 뜨는 단추입니다.
   kakao 에 카카오톡 채널 주소(http://pf.kakao.com/_xxxxx/chat)를 넣으면
   노란 [카카오톡 문의] 단추가 같이 나옵니다. 비워 두면 메일 단추만 나옵니다. */
window.CONTACT = {
  kakao: 'https://pf.kakao.com/_BSxggn/chat',
  kakaoOn: true
};

/* 배송 조회에 쓰는 택배사 목록.
   {n} 자리에 손님이 넣은 운송장번호가 들어갑니다.
   조회 주소가 바뀌면 대쉬보드 [안내·결제] 탭에서 고치시면 됩니다. */
window.CARRIERS = [
  { id: 'auto', name: { ko: '어느 택배사인지 모를 때 (통합 조회)', es: 'No sé el transportista (búsqueda global)', en: 'Not sure which carrier (global lookup)' },
    url: 'https://t.17track.net/en?nums={n}' },
  { id: 'ems', name: { ko: '우체국 EMS · 국제우편', es: 'Correos de Corea · EMS', en: 'Korea Post · EMS' },
    url: 'https://t.17track.net/en?nums={n}' },
  { id: 'correos', name: { ko: 'Correos (스페인 우체국)', es: 'Correos (España)', en: 'Correos (Spain)' },
    url: 'https://www.correos.es/es/es/herramientas/localizador/envios/detalle?tracking-number={n}' },
  { id: 'dhl', name: { ko: 'DHL Express', es: 'DHL Express', en: 'DHL Express' },
    url: 'https://www.dhl.com/kr-ko/home/tracking/tracking-express.html?submit=1&tracking-id={n}' },
  { id: 'ups', name: { ko: 'UPS', es: 'UPS', en: 'UPS' },
    url: 'https://www.ups.com/track?loc=ko_KR&tracknum={n}' },
  { id: 'fedex', name: { ko: 'FedEx', es: 'FedEx', en: 'FedEx' },
    url: 'https://www.fedex.com/fedextrack/?trknbr={n}' },
  { id: 'cj', name: { ko: 'CJ대한통운 (한국 국내)', es: 'CJ Logistics (Corea)', en: 'CJ Logistics (Korea)' },
    url: 'https://trace.cjlogistics.com/next/tracking.html?wblNo={n}' }
];

/* ─────────────────────────────────────────────────────────────
   쓰레드(Threads) 자동 게시

   서버(netlify/functions/threads.js)가 정한 요일·시각에 이 설정을 읽어
   상품 하나를 골라 사진 + 글 + 상품 링크로 올립니다.
   문구는 대쉬보드 [쓰레드] 탭에서 고치실 수 있습니다.

   글 안에서 쓸 수 있는 자리표:
     {name} 상품 이름      {tag}   한 줄 소개
     {brand} 생산자 이름   {loc}   생산지
     {won} 원화 가격       {eur}   유로 가격
     {g}    용량·무게      {link}  상품 페이지 주소
     {tags} 해시태그 (아래 tags 목록)

   같은 상품·같은 문구가 붙어 나오지 않도록 상품과 문구를
   서로 다른 보폭으로 돌립니다. 문구를 여러 개 둘수록 덜 겹칩니다.
   ───────────────────────────────────────────────────────────── */
window.THREADS = {
  on: true,
  hall: 'es',                 // 어느 관의 상품을 올릴지 (es = Europa)
  days: [1, 3, 5],            // 0=일 1=월 … 6=토
  hourKST: 20,                // 한국 시각 기준 시
  tags: ['#유럽직구', '#스페인직구', '#해외직구', '#올리브오일', '#메디테라네오'],
  posts: [
    '{name}\n\n{tag}\n\n{brand} · {loc}\n{won} ({eur}) · {g}\n\n남유럽에서 항공으로 바로 보냅니다.\n{link}\n\n{tags}',

    '{loc}에서 왔습니다.\n\n{name}\n{tag}\n\n{won} ({eur}) · {g}\n{link}\n\n{tags}',

    '오늘 소개할 것 — {name}\n\n{tag}\n\n만든 곳은 {brand}, {loc} 입니다.\n{won} ({eur})\n\n{link}\n\n{tags}',

    '{brand}의 {name}\n\n{tag}\n\n{g} · {won} ({eur})\n주문하시면 항공편으로 한국까지 보내 드립니다.\n\n{link}\n\n{tags}',

    '{name} · {g}\n\n{tag}\n\n{won} ({eur})\n{loc}에서 직접 골라 담았습니다.\n\n{link}\n\n{tags}',

    '현지에서는 이렇게 먹습니다 — {name}\n\n{tag}\n\n{brand}, {loc}\n{won} ({eur}) · {g}\n\n{link}\n\n{tags}',

    '{name}\n{tag}\n\n{won} ({eur})\n\n{link}\n\n{tags}',

    '{loc}의 {brand}.\n\n{name} — {tag}\n\n{g} · {won} ({eur})\n항공 직송, 관세·부가세는 도착 국가 규정에 따릅니다.\n\n{link}\n\n{tags}'
  ]
};
