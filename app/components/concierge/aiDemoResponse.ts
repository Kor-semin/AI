export type DemoConsultingResponse = {
  summary: string;
  nextAction: string;
  message: string;
};

function hasHangul(input: string) {
  return /[가-힣]/.test(input);
}

function hasAny(input: string, keywords: string[]) {
  const s = input.toLowerCase();
  return keywords.some((k) => s.includes(k.toLowerCase()));
}

function detectVehicleType(input: string): "SUV" | "세단" | "전기차" | null {
  const s = input.toLowerCase();
  if (s.includes("suv")) return "SUV";
  if (s.includes("세단")) return "세단";
  if (s.includes("전기차") || s.includes("ev")) return "전기차";
  return null;
}

/** Single entry-point for replacing with real AI later. */
export function generateDemoConsultingResponse(inputRaw: string): DemoConsultingResponse {
  const input = (inputRaw ?? "").trim();
  const ko = hasHangul(input) || input.length === 0;
  const vehicleType = detectVehicleType(input);

  const rideComfort = hasAny(input, ["승차감", "조용", "정숙", "정숙성"]);
  const family = hasAny(input, ["가족", "아이", "등하원"]);
  const finance = hasAny(input, ["리스", "할부", "금융", "월납입", "월 납입", "월납", "납입"]);
  const tradeIn = hasAny(input, ["중고차", "트레이드인", "대차", "기존차", "기존 차량", "매각"]);
  const deliverySoon = hasAny(input, ["출고", "일정", "빨리", "빠르게", "빠른"]);
  const compare = hasAny(input, ["고민", "비교", "타브랜드", "다른 브랜드"]);

  const focus: string[] = [];
  if (rideComfort) focus.push("정숙·승차감");
  if (family) focus.push("가족 이동 편의");
  if (finance) focus.push("금융 조건");
  if (tradeIn) focus.push("기존 차량 대차/매각");
  if (deliverySoon) focus.push("출고 가능 일정");
  if (vehicleType) focus.push(`관심 차종(${vehicleType})`);
  if (compare) focus.push("비교 포인트 정리");

  if (!input) {
    return {
      summary: ko
        ? "상담 메모가 비어 있습니다. 예시 문구를 넣거나 고객의 니즈/예산/희망 일정 등을 한두 문장으로 입력해 보세요."
        : "Your memo is empty. Restore the example or write 1–2 sentences about needs, budget, and timing.",
      nextAction: ko
        ? "예시 문구를 넣고 반응을 확인하거나, 핵심 키워드를 포함해 메모를 작성합니다."
        : "Restore the example or add a few keywords (comfort, family, financing, trade-in, delivery timing).",
      message: ko
        ? "안녕하세요. 지난 상담 내용을 바탕으로 고객님 상황에 맞는 옵션과 일정/금융 안내를 정리해 드릴 수 있습니다. 편하실 때 간단히 답장 부탁드립니다."
        : "Hello—based on your last consultation, I can summarize options and timing/financing in a simple way. When you’re free, a quick reply is appreciated.",
    };
  }

  const focusText = focus.length ? focus.join(" · ") : (ko ? "핵심 니즈" : "key needs");

  const summaryLines: string[] = [];
  summaryLines.push(
    ko ? `이 고객은 ${focusText}를 중심으로 고려하고 있습니다.` : `This customer is primarily focused on ${focusText}.`,
  );
  if (vehicleType) summaryLines.push(ko ? `관심 차종은 ${vehicleType}로 보입니다.` : `Likely vehicle interest: ${vehicleType}.`);
  if (compare)
    summaryLines.push(
      ko
        ? "타브랜드/대안과의 비교 기준을 명확히 잡아주는 것이 효과적입니다."
        : "Clarifying comparison criteria against other brands/options will help decision speed.",
    );
  if (finance)
    summaryLines.push(
      ko
        ? "월 납입/선납/만기 옵션 등 금융 조건을 함께 제시하면 응답률이 올라갑니다."
        : "Including monthly payment framing (lease/finance) tends to lift reply rate.",
    );
  if (tradeIn)
    summaryLines.push(
      ko
        ? "기존 차량 대차(트레이드인) 가능 여부와 대략적인 범위를 먼저 확인해 두면 좋습니다."
        : "A quick trade-in baseline (year/mileage/accident history) will reduce back-and-forth.",
    );
  if (deliverySoon)
    summaryLines.push(
      ko
        ? "희망 출고 시점이 빠를 수 있어 재고/납기 가능성을 선제적으로 안내하는 편이 좋습니다."
        : "Delivery timing sounds urgent—lead with inventory vs order lead-time options.",
    );

  const nextActionParts: string[] = [];
  nextActionParts.push(
    ko
      ? "오늘 1회 연락 시도 후, 2가지 선택지를 제시하는 짧은 질문으로 응답 허들을 낮춥니다."
      : "Reach out once today with a short 2-choice question to lower reply friction.",
  );
  if (vehicleType)
    nextActionParts.push(
      ko ? `${vehicleType} 기준으로 2~3개 트림/옵션을 비교 카드로 정리합니다.` : `Prepare a 2–3 option comparison for ${vehicleType}.`,
    );
  if (rideComfort)
    nextActionParts.push(
      ko
        ? "정숙/승차감 관련 핵심 포인트(타이어·서스·NVH·시승 코스)를 3줄로 요약합니다."
        : "Summarize comfort/quietness talking points (NVH, ride, test route) in 3 bullet lines.",
    );
  if (family)
    nextActionParts.push(
      ko
        ? "가족 이동 기준(2열 편의·카시트·트렁크·등하원 동선)에 맞춘 체크리스트를 제안합니다."
        : "Offer a family-use checklist (2nd row, trunk, car seat, school routes).",
    );
  if (finance)
    nextActionParts.push(
      ko
        ? "월 납입 범위/선납 여부/리스·할부 선호를 확인하는 질문 1개를 포함합니다."
        : "Ask one question to confirm monthly payment range and lease vs finance preference.",
    );
  if (tradeIn)
    nextActionParts.push(
      ko
        ? "기존차 연식/주행거리/사고 여부 3가지를 먼저 받는 템플릿 질문을 보냅니다."
        : "Send a quick template asking year/mileage/accident history for trade-in.",
    );
  if (deliverySoon)
    nextActionParts.push(
      ko
        ? "가능 납기(재고/주문) 옵션을 분리해 안내하고, 빠른 출고 가능 범위를 확인합니다."
        : "Split the story into inventory vs order lead-times and confirm earliest delivery window.",
    );
  if (compare)
    nextActionParts.push(
      ko ? "비교 대상 1~2개를 받아 ‘차이 3가지’로 정리해 다시 제시합니다." : "Ask for 1–2 comparables, then reply with “3 clear differences”.",
    );

  const messageParts: string[] = [];
  messageParts.push(
    ko
      ? "안녕하세요. 지난 상담 내용 바탕으로 핵심 포인트를 간단히 정리해 드렸습니다."
      : "Hello—based on our last conversation, I summarized the key points in a concise way.",
  );
  if (rideComfort)
    messageParts.push(
      ko ? "승차감/정숙성을 기준으로 옵션과 시승 포인트를 우선 정리했습니다." : "I prioritized ride comfort and quietness talking points and test-drive cues.",
    );
  if (family)
    messageParts.push(
      ko ? "가족 이동 편의 기준(2열/적재/등하원 동선)도 함께 체크했습니다." : "I also checked family-use criteria (2nd row, cargo, school-route convenience).",
    );
  if (vehicleType)
    messageParts.push(
      ko ? `${vehicleType} 기준으로 추천 조합을 2~3가지로 압축해 두었습니다.` : `I narrowed recommendations to 2–3 combinations for a ${vehicleType}.`,
    );
  if (finance)
    messageParts.push(
      ko ? "월 납입 기준으로 리스/할부 조건도 함께 비교해 드릴 수 있습니다." : "I can also compare lease vs finance options around a monthly payment target.",
    );
  if (tradeIn)
    messageParts.push(
      ko ? "기존 차량 대차(트레이드인) 가능하시면 대략 범위도 같이 안내드리겠습니다." : "If you have a trade-in, I can estimate a rough range as well.",
    );
  if (deliverySoon)
    messageParts.push(
      ko ? "원하시는 출고 일정에 맞춰 재고/납기 가능 옵션도 확인해 드릴게요." : "For timing, I can confirm inventory vs order lead-times that match your schedule.",
    );
  if (compare)
    messageParts.push(
      ko ? "비교하시는 타브랜드가 있다면 1~2개만 알려주시면 차이점을 3가지로 정리해 드리겠습니다." : "If you’re comparing another brand, share 1–2 and I’ll summarize 3 clear differences.",
    );
  messageParts.push(
    ko ? "오늘 오후에 짧게 통화 가능하실까요? 가능 시간대만 편하게 답장 부탁드립니다." : "Could you do a quick call this afternoon? A preferred time window is perfect.",
  );

  return {
    summary: summaryLines.join(" "),
    nextAction: nextActionParts.join(" "),
    message: messageParts.join(" "),
  };
}

