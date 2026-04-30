import type { LanguageCode } from "@/lib/i18n";

/** Preset brand keys — display names are international proper nouns. */
export const SEASON_CARE_BRAND_PRESETS = [
  "mercedes-benz",
  "bmw",
  "mini",
  "audi",
  "porsche",
  "lexus",
  "volvo",
  "genesis",
] as const;

export type SeasonCareBrandPreset = (typeof SEASON_CARE_BRAND_PRESETS)[number];

export const SEASON_CARE_SEASONS = [
  "spring_cherry",
  "summer_monsoon",
  "summer_heat",
  "autumn_foliage",
  "winter_cold",
  "winter_snow",
  "holiday_lunar_new_year",
  "holiday_chuseok",
  "vacation_season",
  "before_long_trip",
  "tire_check",
  "battery_check",
  "oil_check",
  "wiper_ac_filter_check",
] as const;

export type SeasonCareSeason = (typeof SEASON_CARE_SEASONS)[number];

export const SEASON_CARE_PURPOSES = [
  "greeting",
  "maintenance_info",
  "tire_reminder",
  "promotion",
  "revisit",
  "delivery_customer_care",
  "reengage_silent",
  "personal_branding",
] as const;

export type SeasonCarePurpose = (typeof SEASON_CARE_PURPOSES)[number];

export const SEASON_CARE_TONES = ["polite", "warm", "premium", "brief", "promo"] as const;

export type SeasonCareTone = (typeof SEASON_CARE_TONES)[number];

const BRAND_LABEL: Record<SeasonCareBrandPreset, string> = {
  "mercedes-benz": "Mercedes-Benz",
  bmw: "BMW",
  mini: "MINI",
  audi: "Audi",
  porsche: "Porsche",
  lexus: "Lexus",
  volvo: "Volvo",
  genesis: "Genesis",
};

export type SeasonCareMessageLocale = "ko" | "en";

export function seasonCareMessageLocale(language: LanguageCode): SeasonCareMessageLocale {
  return language === "ko" ? "ko" : "en";
}

export interface SeasonCareInput {
  brandPreset: SeasonCareBrandPreset | "other";
  brandCustom: string;
  season: SeasonCareSeason;
  purpose: SeasonCarePurpose;
  tone: SeasonCareTone;
  sellerName: string;
  showroom: string;
  contact: string;
  jobTitle: string;
}

export function resolveSeasonCareBrand(input: SeasonCareInput): string {
  if (input.brandPreset === "other") {
    const c = input.brandCustom.trim();
    return c || "";
  }
  return BRAND_LABEL[input.brandPreset];
}

interface MsgPack {
  webLine: string;
  adLine: string;
  optOutLine: string;
  inquiryLabel: string;
  thanks: string;
  placeholderShowroom: string;
  placeholderName: string;
  placeholderContact: string;
  dreem: string;
  subjects: Record<SeasonCareSeason, string>;
  seasonBodies: Record<SeasonCareSeason, string>;
  purposeLines: Record<SeasonCarePurpose, string>;
  careByPurpose: Record<SeasonCarePurpose, string>;
  toneOpen: Record<SeasonCareTone, string>;
  toneClose: Record<SeasonCareTone, string>;
  genericSellerHint: string;
  placeholderBrand: string;
}

const KO: MsgPack = {
  webLine: "[Web발신]",
  adLine: "(광고)",
  optOutLine: "무료수신거부 080-000-0000",
  placeholderBrand: "브랜드명",
  inquiryLabel: "문의:",
  thanks: "감사합니다.",
  placeholderShowroom: "전시장명",
  placeholderName: "영업사원명",
  placeholderContact: "연락처",
  dreem: "드림",
  subjects: {
    spring_cherry: "봄의 시작, 고객님의 드라이빙도 더 안전하고 산뜻하게 준비해 보세요.",
    summer_monsoon: "장마철 빗길 안전운전을 위해, 차량 상태를 함께 점검해 보세요.",
    summer_heat: "폭염 속에서도 차량과 고객님 모두 무리 없이 준비하실 수 있도록 안내드립니다.",
    autumn_foliage: "단풍과 함께하는 드라이빙, 여유로운 장거리 준비로 더 안전하게 즐겨 보세요.",
    winter_cold: "한파에도 안정적인 시동과 주행을 위해 간단 점검을 권장드립니다.",
    winter_snow: "미끄러운 노면에 대비해 타이어·제동·유리 세정 상태를 챙겨 주세요.",
    holiday_lunar_new_year: "새해를 맞이하며 차량 상태를 정리하면 한 해 운행이 더 편안해집니다.",
    holiday_chuseok: "가족 귀향과 명절 장거리를 앞두고 간단 확인으로 마음 놓고 이동하세요.",
    vacation_season: "휴가철 이동이 잦아지는 만큼, 출발 전 간단 체크로 여정을 준비해 보세요.",
    before_long_trip: "장거리 여행 전, 연료·오일·라이팅 등 기본 상태를 확인해 주세요.",
    tire_check: "타이어는 접지력과 안전의 기본 — 공기압·마모·이상 유무를 함께 살펴보세요.",
    battery_check: "배터리는 계절 변화에 민감합니다. 시동감과 경고등 유무를 가볍게 점검해 보세요.",
    oil_check: "엔진오일은 장기 주행 품질에 큰 영향을 줍니다. 적정량·교환 시기를 확인해 주세요.",
    wiper_ac_filter_check: "시야와 실내 공기 질까지 — 와이퍼와 에어컨 필터를 함께 챙겨 보세요.",
  },
  seasonBodies: {
    spring_cherry:
      "따뜻한 바람과 함께 봄기운이 느껴지는 계절입니다. 벚꽃 길 드라이빙을 즐기시는 분들이 많아지는 시기인 만큼, 차량 컨디션도 한 번 챙겨보시면 좋겠습니다. 겨울철을 지나온 차량은 타이어 공기압, 배터리, 와이퍼, 브레이크, 엔진오일을 가볍게 확인하시면 이동이 한결 편안해집니다. 특히 주말 나들이 전에는 간단 점검만으로 주행 안정감을 높이실 수 있습니다.",
    summer_monsoon:
      "갑작스러운 소나기와 빗길 노면에서는 제동 거리와 시야 확보가 더 중요합니다. 빗물에 젖은 상태에서 라이팅·와이퍼 작동 상태를 확인하시고, 타이어 패턴 마모와 공기압도 함께 살펴보시면 안전 마진을 확보하기 좋습니다. 장마가 길어질 때는 차체 하부와 에어컨 드레인 상태도 간단히 점검해 보실 것을 추천드립니다.",
    summer_heat:
      "높은 기온은 냉각·타이어·배터리에 부담으로 작용할 수 있습니다. 장시간 정차 후 출발 전에는 에어컨 필터 공기 순환 상태를 확인하시고, 타이어 과열 신호와 냉각수 수준을 간단히 점검해 보세요. 과도한 직사광선을 피해 주차하실 때 인테리어와 전자 장치 피로도도 함께 줄여 주실 수 있습니다.",
    autumn_foliage:
      "쾌적한 계절이지만 안개와 낙엽, 일교차로 브레이크 캘리퍼·와이퍼 고무가 부담될 수 있습니다. 간단 진단만으로 장거리 노면 변화를 여유 있게 받아들일 수 있습니다. 단풍 드라이빙 전 브레이크 핏과 타이어 윤간을 확인하시면 회전 구간 주행 안정성에 도움이 됩니다.",
    winter_cold:
      "추워지면 배터리 출력과 유동성에 변화가 생기기 쉽습니다. 시동 시간을 짧게 유지하면서 필요 시 전문 점검을 활용해 보세요. 브레이크와 헤드램프 스팟 상태를 함께 확인하면 이른 어둠 시간대 주행 준비에 유리합니다.",
    winter_snow:
      "눈길·빙판에서는 타이어가 가장 중요합니다. 패턴 깊이와 공기압을 우선 확인하시고, 와이로 시야와 워셔액 상태도 함께 준비해 주세요. 출발 후 저속 순응 거리 확보 습관이 예기치 않은 상황에 큰 차이를 만듭니다.",
    holiday_lunar_new_year:
      "명절 전후 차량 상태를 정돈하면 가족과의 이동이 한결 매끄럽습니다. 장거리·혼잡 구간에서는 연료량과 타이어·제동 상태를 간단히 확인하면 여유 있습니다. 교통 상황이 길게 이어지는 시간대에는 휴식과 함께 실내 순환 상태도 가볍게 점검해 보실 수 있습니다.",
    holiday_chuseok:
      "성묘·방문 이동이 겹치는 고속·국도에서는 연료 계획과 타이어 컨디션이 신뢰를 좌우합니다. 짐 적재 상태도 함께 고려하면 주행 균형이 좋아집니다. 복귀 전에는 라이팅과 워셔액량을 간단 확인해 두시면 밤 시간대 장거리에 도움이 됩니다.",
    vacation_season:
      "휴가철 교통량이 늘면서 예기 정비 수요도 함께 올라갑니다. 출발 예정이라면 간단 진단 시간을 미리 잡아두시면 바쁠 때 무리하지 않습니다. 적재 높이와 타이어 하중도 함께 살펴보면 고속 안정 주행 준비에 긍정적으로 작용합니다.",
    before_long_trip:
      "장거리에서는 작은 변수가 결과에 영향을 줍니다. 엔진오일·냉각수·헤드램프 비전·워셔액 같은 기본 항목을 출발 전에 확인해 주세요. 타이어와 스페어 상태를 함께 보면 예상 밖 노면 변화에서도 차분히 대처하실 수 있습니다.",
    tire_check:
      "타이어는 안전운전과 연비 두 가지에 동시에 연결됩니다. 공기압은 도어 접착 라벨을 기준으로 점검하시고, 편마모·외상 여부와 마모 표시 상태를 간단 확인해 주세요. 고속 회전에서는 작은 차이도 핸들 반응에 반영되니 귀찮더라도 짧게라도 챙겨 주시길 바랍니다.",
    battery_check:
      "배터리는 시간이 지나면서 충방전 패턴이 달라질 수 있습니다. 시동 순간 회전 상태와 헤드램프 디밍, 경고 표시등을 통해 가벼운 이상 신호가 없는지 살펴보실 수 있습니다. 한랭·더운 계절이 겹치는 시점에는 상태 확인의 효과가 특히 분명합니다.",
    oil_check:
      "오일 농도가 변하면 진동과 연비 패턴까지 변함을 느끼시는 분들이 많습니다. 적정 레벨을 유지하시면 엔진 구성품 수명 안정화에 도움이 됩니다. 교환 주기는 주행 패턴과 환경마다 차이가 있으니 상태를 근거로 상담받으시면 과도한 부담 없이 선택하실 수 있습니다.",
    wiper_ac_filter_check:
      "실내 공기에는 필터 상태가 즉각 영향을 줍니다. 시야에는 와이퍼 고무 밀림·발진음이 단서입니다. 교체 주기보다 상태를 근거로 판단하시면 낭비 없이 교체 타이밍을 잡을 수 있습니다.",
  },
  purposeLines: {
    greeting: "항상 차량 이용에 애착 주셔서 감사드리며, 가벼운 안부와 함께 도움이 될 정보를 안내드리고 있습니다.",
    maintenance_info: "예방 점검은 큰 불편을 줄이고 주행 신뢰를 높이는 간단한 습관에 가깝습니다. 상태를 함께 살피실 수 있도록 도와드립니다.",
    tire_reminder: "타이어는 노면 상태를 직접적으로 전달합니다. 교체 적기와 공기압 관리 안내 위주로 간단히 짚어보았습니다.",
    promotion: "시즌별 혜택이나 프로그램이 준비될 경우 편하게 문의 주시면 상황에 맞게 안내드리겠습니다.",
    revisit: "이전 상담 이후 간단 근황을 나누며, 필요하면 일정 재조정이나 새로운 옵션도 함께 정리해 드리고 싶습니다.",
    delivery_customer_care:
      "출고 이후에도 차량 상태나 서비스 문의가 있으시면 망설임 없이 연락 주세요. 꾸준한 관계를 소중하게 생각합니다.",
    reengage_silent:
      "한동안 안부 차 연락을 드리며, 간단 상태 확인 또는 상담이 필요하실 때 빠르게 도와드릴 수 있습니다.",
    personal_branding: "언제든지 편하게 주시면, 고객님 패턴과 선호를 기준으로 실무적인 제안부터 정리까지 맞춤으로 도와드리겠습니다.",
  },
  careByPurpose: {
    greeting:
      "이번에는 부담 없이 확인할 수 있는 항목 위주만 짚어보면 다음 주행이 한결 차분해집니다.",
    maintenance_info:
      "정비 간격보다 상태 기반 접근으로 불필요한 비용 없이 신뢰를 유지할 수 있습니다. 타이어·배터리·오일 상태를 순서 없이 간단 참고해 보세요.",
    tire_reminder: "패턴 깊이·공기압·스페어 유무 순으로 확인하시면 대부분의 일상 패턴 대응 가능합니다.",
    promotion: "연락 시점에 제공 가능한 프로그램이 다를 수 있음을 안내드리며, 과장 없이 명확한 조건부터 공유 드립니다.",
    revisit: "필요하시면 짧게라도 상태나 선호 변경 사항부터 맞춰 새 제안 포인트를 정리해 보겠습니다.",
    delivery_customer_care:
      "출고 초기 패턴에서는 소모품 상태와 기능 습관이 동시에 잡히곤 하니 간단 피드백도 귀하게 받겠습니다.",
    reengage_silent:
      "긴 공백 뒤에도 부담 없이 상담부터 재개하실 수 있도록 경량 접점 형태를 유지했습니다.",
    personal_branding:
      "상담·정비 일정까지 연속 라인으로 잡아드리면 시간 절약에 도움이 되곤 해서 참고 차원에서도 제안 가능합니다.",
  },
  toneOpen: {
    polite: "고객님, 안녕하세요.",
    warm: "고객님, 오랜만에 안부 인사 드립니다.",
    premium: "고객님, 일정에 방해가 되지 않도록 간결히 인사드립니다.",
    brief: "고객님, 안녕하세요.",
    promo: "고객님, 이번 시즌에 맞춰 유용한 안내를 전해드리고자 연락드립니다.",
  },
  toneClose: {
    polite: "차량 점검이나 향후 상담·프로모션 관련 문의가 있으시면 편하게 연락 주시기 바랍니다. 고객님의 이용 상황에 맞춰 안내드리겠습니다.",
    warm: "작은 궁금증이라도 부담 없이 말씀 주세요. 언제든 도와드리겠습니다.",
    premium: "필요하신 범위만 정확히 정리해 드리겠습니다. 일정 맞춰 방문이나 연락 주시면 성심껏 안내드리겠습니다.",
    brief: "필요하시면 연락 주세요. 빠르게 도와드리겠습니다.",
    promo: "상세 혜택과 일정은 문의 시 상황에 맞게 상세히 안내드릴 수 있습니다. 기회가 되시면 편히 연락 주세요.",
  },
  genericSellerHint: "차량 관련 문의는 언제든지 편하게 연락 주시면 됩니다.",
};

const EN: MsgPack = {
  webLine: "[Web]",
  adLine: "(Ad)",
  optOutLine: "Opt-out / Free refusal: 080-000-0000",
  placeholderBrand: "Brand name",
  inquiryLabel: "Contact:",
  thanks: "Thank you.",
  placeholderShowroom: "Showroom",
  placeholderName: "Sales consultant",
  placeholderContact: "Phone",
  dreem: "", // no Korean-style signature in EN
  subjects: {
    spring_cherry: "Welcome spring—and keep your drives safe and fresh.",
    summer_monsoon: "Rainy-season driving deserves a quick vehicle readiness check.",
    summer_heat: "Hot weather asks more of cooling, tires, and the battery—a light check helps.",
    autumn_foliage: "Comfortable cruising season—prep for fog, leaves, and longer trips.",
    winter_cold: "Cold snaps affect starting and fluids—consider a concise winter check.",
    winter_snow: "Snow and ice demand tires, braking margin, and clear visibility.",
    holiday_lunar_new_year: "Before holiday travel, a short checklist keeps family trips smoother.",
    holiday_chuseok: "Holiday highway runs go easier with tires, brakes, and fuel planned ahead.",
    vacation_season: "Peak travel times reward early, light vehicle preparation.",
    before_long_trip: "Ahead of long drives, cover basics—fluids, lights, tires, and washer fluid.",
    tire_check: "Traction starts with tires—pressure, tread, and wear in one glance.",
    battery_check: "Seasonal swings stress batteries—note slow cranks or warning cues.",
    oil_check: "Oil condition supports smooth running—level and interval matter.",
    wiper_ac_filter_check: "Cabin filters and wipers quietly shape comfort and visibility.",
  },
  seasonBodies: {
    spring_cherry:
      "Warm air is back and many drivers enjoy scenic routes again. After winter, a quick look at tire pressure, battery health, wipers, brakes, and engine oil keeps weekend trips predictable. Small checks before outings often create the biggest safety margin.",
    summer_monsoon:
      "Sudden showers change grip and braking distance fast. Confirm lighting and wiper sweep, tread depth, and tire pressure—small items that shine in wet conditions. During long rainy spells, a brief look at drains and airflow helps avoid odors and fogging buildup.",
    summer_heat:
      "Heat adds load on cooling circuits and tires, and batteries fatigue faster. Before long idle-to-drive transitions, glance at coolant level cues and tire condition. Shade parking when possible protects interior trims and lowers cabin recovery time.",
    autumn_foliage:
      "Mild weather still brings fog and debris on roads. Brake feel and rubber on wipers degrade gradually—catching drift early avoids surprises on winding foliage routes. Brake noise or uneven pull is easier to clarify before stacking highway miles.",
    winter_cold:
      "Cold thickens fluids and slows electrochemical reactions in batteries. Keep eyes on sluggish starts and lamp dimming cues. Checking headlamps pays off during earlier sunsets.",
    winter_snow:
      "Frozen surfaces amplify every tire choice—start with tread depth and pressure, then wiper blades and washer volume. Leaving extra following distance remains the multiplier for safety margins.",
    holiday_lunar_new_year:
      "Holiday trips cluster on similar corridors—fuel planning and brake/tire confidence reduce rushing stress. Packing weight changes handling slightly; aligning expectations helps.",
    holiday_chuseok:
      "Returning routes overlap with dusk driving—fluid top-ups and lighting checks matter at both ends of the journey. Washer reserve prevents streaking when roads are dusty after rain clears.",
    vacation_season:
      "Higher traffic increases wait times at service bays—booking a concise inspection early avoids peak friction. Cargo height changes aero subtly; tightening loose items preserves stability cues.",
    before_long_trip:
      "Long distances normalize small anomalies into audible or tactile hints—oil clarity, coolant level windows, beam aim, washer volume, tires (including spare) cover most preventable delays.",
    tire_check:
      "Door-jamb pressure targets beat guessing; scan for scalloping, nails, or sidewall cues. Minor adjustments change steering weight more than drivers expect.",
    battery_check:
      "Warning clusters and dimming lamps often precede hard failures—a short conversation can align testing before you are stranded in weather extremes.",
    oil_check:
      "Shear and soot shift perceived smoothness across seasons—guided interval choices respect actual usage instead of averages alone.",
    wiper_ac_filter_check:
      "Streak chatter and musty vents are honest signals—targeted swaps beat calendar guesses for both comfort spend and windshield clarity.",
  },
  purposeLines: {
    greeting: "Sending a brief seasonal note—and a handful of lightweight checks worth remembering.",
    maintenance_info: "Preventive attention usually costs less downtime than corrective surprises—we can help prioritize what matters now.",
    tire_reminder: "Tires interpret the road surface first—timing and inflation guidance are the quickest wins.",
    promotion: "If seasonal programs align with your needs, reply anytime and we will outline options clearly.",
    revisit: "If plans shifted since last time, a short refresh on timing or trims may save you effort later.",
    delivery_customer_care:
      "After delivery, small questions deserve quick answers—we are glad to remain your practical contact.",
    reengage_silent:
      "It has been quiet—no pressure—just a brief touchpoint if a status check helps.",
    personal_branding:
      "Prefer a single concierge-style contact for scheduling and summaries—happy to tailor pace to how you like to communicate.",
  },
  careByPurpose: {
    greeting: "Keeping it light keeps the checklist approachable for your next outing.",
    maintenance_info:
      "We favor condition-based cues over rigid calendars—tyres, battery, fluids are sensible first reads.",
    tire_reminder: "Pressure plus tread cues catch most commuter edge cases efficiently.",
    promotion: "We will state eligibility plainly without stacking unclear claims.",
    revisit: "We can reshape talking points gently from any new priorities you mention.",
    delivery_customer_care: "Early ownership patterns clarify habit vs. anomaly—tell us either way.",
    reengage_silent: "Minimal obligation—resume only if the timing genuinely helps.",
    personal_branding: "Bundling test drives, service reminders, or trade chatter under one coordinator can reduce context switching.",
  },
  toneOpen: {
    polite: "Dear customer,",
    warm: "Hello—hope this note finds you well.",
    premium: "A concise seasonal note:",
    brief: "Hi,",
    promo: "We have a concise seasonal update for you:",
  },
  toneClose: {
    polite: "Should you wish to discuss inspections, replacements, or current offers, contact us anytime—we will steer guidance to match your usage pattern.",
    warm: "Even small questions are welcome—we enjoy keeping things practical and calm for you.",
    premium: "We will keep recommendations precise—reach out when a brief call or visit suits your schedule.",
    brief: "Need anything? Reply or call—we will respond quickly.",
    promo: "For timing-sensitive details or availability, contacting us sooner helps secure the smoothest arrangement.",
  },
  genericSellerHint: "Questions about vehicle care or upgrades are welcome whenever convenient.",
};

function shortenParagraphs(body: string, locale: SeasonCareMessageLocale): string {
  const parts = body.split(/\.\s+/).filter((s) => s.trim().length > 0);
  const sliced = parts.slice(0, 2).join(locale === "ko" ? ". " : ". ");
  const end = sliced.endsWith(".") ? "" : ".";
  return `${sliced}${end}`;
}

function promoStretch(body: string, locale: SeasonCareMessageLocale): string {
  const extraKo =
    " 고객님의 패턴과 일정에 가장 무리 없는 방식으로 차량 상태를 준비하실 수 있도록 다양한 옵션을 함께 비교 안내 드립니다.";
  const extraEn =
    " We can benchmark multiple practical paths—service, tyre, retention—without rushing your decision timeline.";
  if (locale === "ko") return `${body}${extraKo}`;
  return `${body}${extraEn}`;
}

function formatSellerBlock(
  M: MsgPack,
  input: SeasonCareInput,
  locale: SeasonCareMessageLocale,
): string {
  const name = input.sellerName.trim();
  const showroom = input.showroom.trim();
  const contact = input.contact.trim();
  const title = input.jobTitle.trim();

  const namePh = `[${M.placeholderName}]`;
  const roomPh = `[${M.placeholderShowroom}]`;
  const contactPh = `[${M.placeholderContact}]`;

  const lines: string[] = [];

  if (locale === "ko") {
    const nm = name || namePh;
    const sr = showroom || roomPh;
    const titleSuffix = title ? ` ${title}` : "";
    lines.push(`${sr} ${nm}${titleSuffix} ${M.dreem}`.replace(/\s{2,}/g, " ").trim());
    lines.push(`${M.inquiryLabel} ${contact || contactPh}`);
    return lines.join("\n");
  }

  const parts: string[] = [];
  if (showroom) parts.push(showroom);
  if (name) parts.push(name);
  if (title) parts.push(`(${title})`);
  lines.push(parts.length ? parts.join(" · ") : `${roomPh} · ${namePh}`);
  lines.push(`${M.inquiryLabel} ${contact || contactPh}`);
  return lines.join("\n");
}

/** Template-based seasonal care SMS/long-form marketing text — replaceable with AI later. */
export function generateSeasonCareMessage(input: SeasonCareInput, locale: SeasonCareMessageLocale): string {
  const M = locale === "ko" ? KO : EN;
  const brand = resolveSeasonCareBrand(input);
  const brandBracket = brand ? `[${brand}]` : `[${M.placeholderBrand}]`;

  let subject = M.subjects[input.season];
  let seasonBody = M.seasonBodies[input.season];
  const purposeLine = M.purposeLines[input.purpose];
  const careLine = M.careByPurpose[input.purpose];
  let openLine = M.toneOpen[input.tone];
  let closeLine = M.toneClose[input.tone];

  if (input.tone === "brief") {
    seasonBody = shortenParagraphs(seasonBody, locale);
    const maxSubject = locale === "ko" ? 40 : 55;
    subject =
      subject.length > maxSubject ? `${subject.slice(0, maxSubject - 1)}…` : subject;
  }

  if (input.tone === "promo") {
    seasonBody = promoStretch(seasonBody, locale);
    closeLine =
      locale === "ko"
        ? `${closeLine} 지금 필요하신 분야부터 우선 순위를 맞춰 보실 수 있도록 차분하게 제안 드립니다.`
        : `${closeLine} We can stack priorities calmly so promotions never feel noisy.`;
  }

  const blocks: string[] = [
    M.webLine,
    M.adLine,
    brandBracket,
    subject,
    "",
    openLine,
    "",
    purposeLine,
    "",
    seasonBody,
    "",
    careLine,
    "",
    closeLine,
    "",
    M.genericSellerHint,
    "",
    M.thanks,
    "",
    formatSellerBlock(M, input, locale),
    "",
    M.optOutLine,
  ];

  return blocks.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd();
}
