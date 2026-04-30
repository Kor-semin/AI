export type LanguageCode =
  | "ko"
  | "en"
  | "ja"
  | "zh-CN"
  | "zh-TW"
  | "es"
  | "fr"
  | "de"
  | "pt"
  | "it"
  | "vi"
  | "th"
  | "id"
  | "ar"
  | "hi";

export const SUPPORTED_LANGUAGES: Array<{ code: LanguageCode; label: string }> = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "zh-CN", label: "简体中文" },
  { code: "zh-TW", label: "繁體中文" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "th", label: "ไทย" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
];

export const DEFAULT_LANGUAGE: LanguageCode = "ko";
export const LANGUAGE_STORAGE_KEY = "sensora-language";

export type TranslationKey =
  | "brand.name"
  | "product.name"
  | "brand.slogan"
  | "brand.identity"
  | "product.shortDesc"
  | "hero.description"
  | "cta.joinBeta"
  | "cta.viewDemo"
  | "header.cover"
  | "header.landing"
  | "header.workspace"
  | "auth.checkingLogin"
  | "auth.signOut"
  | "auth.salesRegistration"
  | "join.title"
  | "join.intro"
  | "join.backHome"
  | "join.formLegend"
  | "join.fillAllFields"
  | "join.invalidEmail"
  | "form.name"
  | "form.contact"
  | "form.email"
  | "form.dealership"
  | "form.currentCrm"
  | "form.motivation"
  | "join.submit"
  | "join.submitting"
  | "register.title"
  | "register.continueWithGoogle"
  | "crm.stat.todayFollowups"
  | "crm.stat.dealProbability"
  | "crm.stat.followupNeeded"
  | "crm.stat.recentConsultations"
  | "crm.addCustomer"
  | "crm.nextAction"
  | "crm.aiRecommendation"
  | "crm.consultationSummary"
  | "crm.financeMarketInfo"
  | "crm.tradeInSummary"
  | "crm.tab.customers"
  | "crm.tab.next"
  | "crm.tab.events"
  | "crm.tab.templates"
  | "crm.section.customerList"
  | "crm.section.customerDetails"
  | "crm.section.aiRecommendation"
  | "crm.section.consultationSummary"
  | "crm.section.nextAction"
  | "crm.section.allNextActions"
  | "crm.section.eventsPreview"
  | "crm.section.templates"
  | "common.copy"
  | "common.save"
  | "common.reset"
  | "common.backup"
  | "common.select"
  | "common.search"
  | "common.contact"
  | "common.status"
  | "common.interestedVehicle"
  | "common.potential"
  | "landing.feature.profile.title"
  | "landing.feature.profile.desc"
  | "landing.feature.followup.title"
  | "landing.feature.followup.desc"
  | "landing.feature.memory.title"
  | "landing.feature.memory.desc"
  | "landing.feature.delivery.title"
  | "landing.feature.delivery.desc";

type TranslationDict = Partial<Record<TranslationKey, string>>;

export const translations: Record<LanguageCode, TranslationDict> = {
  ko: {
    "brand.name": "Sensora",
    "product.name": "Sensora Auto CRM",
    "brand.slogan": "작은 시작에서부터 시작된다",
    "brand.identity": "B2B AI SaaS Company",
    "product.shortDesc": "자동차 영업사원을 위한 AI 고객관리 SaaS",
    "hero.description":
      "고객 상담, 관심 차량, 후속 연락, 메시지 작성, 영업 파이프라인을 AI가 정리하고 제안합니다.",
    "cta.joinBeta": "베타 신청하기",
    "cta.viewDemo": "데모 보기",
    "header.cover": "표지",
    "header.landing": "랜딩",
    "header.workspace": "Workspace",
    "auth.checkingLogin": "로그인 확인 중…",
    "auth.signOut": "로그아웃",
    "auth.salesRegistration": "영업 계정 등록",
    "join.title": "베타 신청",
    "join.intro":
      "Sensora Auto CRM 초기 접수입니다. 정보는 검토 후 연락드립니다.",
    "join.backHome": "홈으로 돌아가기",
    "join.formLegend": "Sensora Auto CRM 베타 신청 폼",
    "join.fillAllFields": "모든 항목을 입력해 주세요.",
    "join.invalidEmail": "이메일 형식을 확인해 주세요.",
    "form.name": "이름",
    "form.contact": "연락처",
    "form.email": "이메일",
    "form.dealership": "소속 브랜드 / 전시장",
    "form.currentCrm": "현재 고객관리 방식",
    "form.motivation": "사용해 보고 싶은 이유",
    "join.submit": "베타 신청 제출",
    "join.submitting": "제출 중…",
    "register.title": "영업 계정 등록",
    "register.continueWithGoogle": "Google로 시작하기",
    "crm.stat.todayFollowups": "오늘 연락",
    "crm.stat.dealProbability": "계약 가능성",
    "crm.stat.followupNeeded": "후속 연락",
    "crm.stat.recentConsultations": "최근 상담",
    "crm.addCustomer": "고객 추가",
    "crm.nextAction": "다음 액션",
    "crm.aiRecommendation": "AI 추천 메시지",
    "crm.consultationSummary": "상담 요약",
    "crm.financeMarketInfo": "금융·예산·시세 정보",
    "crm.tradeInSummary": "중고차 정리",
    "crm.tab.customers": "고객",
    "crm.tab.next": "다음 연락",
    "crm.tab.events": "일정",
    "crm.tab.templates": "문자 템플릿",
    "crm.section.customerList": "고객 리스트",
    "crm.section.customerDetails": "고객 상세",
    "crm.section.aiRecommendation": "AI 추천 메시지",
    "crm.section.consultationSummary": "상담 요약",
    "crm.section.nextAction": "다음 액션",
    "crm.section.allNextActions": "전체 다음 할 일",
    "crm.section.eventsPreview": "일정 미리보기",
    "crm.section.templates": "문자 템플릿",
    "common.copy": "복사",
    "common.save": "저장",
    "common.reset": "초기화",
    "common.backup": "백업",
    "common.select": "선택",
    "common.search": "검색",
    "common.contact": "연락처",
    "common.status": "상태",
    "common.interestedVehicle": "관심 차량",
    "common.potential": "가능성",
    "landing.feature.profile.title": "고객 프로필 자동 정리",
    "landing.feature.profile.desc": "상담 메모·관심 포인트·예산·성향을 카드로 정리해 다음 대화를 빠르게 이어갑니다.",
    "landing.feature.followup.title": "후속 연락 제안",
    "landing.feature.followup.desc": "상담 흐름과 단계에 맞춰, 오늘 해야 할 연락과 톤을 제안합니다.",
    "landing.feature.memory.title": "차량 추천 메모리",
    "landing.feature.memory.desc": "고객이 중요하게 보는 기준을 기억해, 비교 포인트를 상담 기록에 남깁니다.",
    "landing.feature.delivery.title": "출고 후 관리",
    "landing.feature.delivery.desc": "인도/등록/사후관리까지 체크리스트로 정리해 ‘다음 행동’을 놓치지 않습니다.",
  },
  en: {
    "brand.name": "Sensora",
    "product.name": "Sensora Auto CRM",
    "brand.slogan": "Every great system begins with a small start.",
    "brand.identity": "B2B AI SaaS Company",
    "product.shortDesc": "AI customer management SaaS for automotive sales professionals.",
    "hero.description":
      "Sensora organizes customer conversations, vehicle interests, follow-ups, message drafts, and sales pipelines with AI.",
    "cta.joinBeta": "Join the Beta",
    "cta.viewDemo": "View Demo",
    "header.cover": "Cover",
    "header.landing": "Landing",
    "header.workspace": "Workspace",
    "auth.checkingLogin": "Checking sign-in…",
    "auth.signOut": "Sign out",
    "auth.salesRegistration": "Sales registration",
    "join.title": "Join the Beta",
    "join.intro":
      "Apply for early access to Sensora Auto CRM. We’ll review your request and contact you.",
    "join.backHome": "Back to home",
    "join.formLegend": "Sensora Auto CRM beta request form",
    "join.fillAllFields": "Please fill in all fields.",
    "join.invalidEmail": "Please check your email format.",
    "form.name": "Name",
    "form.contact": "Contact Number",
    "form.email": "Email",
    "form.dealership": "Brand / Showroom",
    "form.currentCrm": "Current Customer Management Method",
    "form.motivation": "Why You Want to Try Sensora",
    "join.submit": "Submit Beta Request",
    "join.submitting": "Submitting…",
    "register.title": "Sales Account Registration",
    "register.continueWithGoogle": "Continue with Google",
    "crm.stat.todayFollowups": "Today’s Follow-ups",
    "crm.stat.dealProbability": "Deal Probability",
    "crm.stat.followupNeeded": "Follow-up Needed",
    "crm.stat.recentConsultations": "Recent Consultations",
    "crm.addCustomer": "Add Customer",
    "crm.nextAction": "Next Action",
    "crm.aiRecommendation": "AI Recommendation",
    "crm.consultationSummary": "Consultation Summary",
    "crm.financeMarketInfo": "Finance, Budget & Market Info",
    "crm.tradeInSummary": "Trade-in Vehicle Summary",
    "crm.tab.customers": "Customers",
    "crm.tab.next": "Next Contact",
    "crm.tab.events": "Schedule",
    "crm.tab.templates": "Message Templates",
    "crm.section.customerList": "Customer List",
    "crm.section.customerDetails": "Customer Details",
    "crm.section.aiRecommendation": "AI Recommendation",
    "crm.section.consultationSummary": "Consultation Summary",
    "crm.section.nextAction": "Next Action",
    "crm.section.allNextActions": "All Next Actions",
    "crm.section.eventsPreview": "Schedule Preview",
    "crm.section.templates": "Message Templates",
    "common.copy": "Copy",
    "common.save": "Save",
    "common.reset": "Reset",
    "common.backup": "Backup",
    "common.select": "Select",
    "common.search": "Search",
    "common.contact": "Contact",
    "common.status": "Status",
    "common.interestedVehicle": "Interested Vehicle",
    "common.potential": "Potential",
    "landing.feature.profile.title": "Auto-organized Customer Profiles",
    "landing.feature.profile.desc": "Turn notes, preferences, budget, and intent into concise cards—so you can pick up the conversation instantly.",
    "landing.feature.followup.title": "Follow-up Suggestions",
    "landing.feature.followup.desc": "Get recommended next steps and tone based on the customer’s stage and the consultation flow.",
    "landing.feature.memory.title": "Vehicle Preference Memory",
    "landing.feature.memory.desc": "Remember what matters to each customer and keep comparison points captured in context.",
    "landing.feature.delivery.title": "Post-delivery Care",
    "landing.feature.delivery.desc": "Track delivery, registration, and aftercare with checklists so the next action never slips.",
  },
  ja: {},
  "zh-CN": {},
  "zh-TW": {},
  es: {},
  fr: {},
  de: {},
  pt: {},
  it: {},
  vi: {},
  th: {},
  id: {},
  ar: {},
  hi: {},
};

export function isRtlLanguage(lang: LanguageCode): boolean {
  return lang === "ar";
}

export function normalizeLanguage(input: string | null | undefined): LanguageCode {
  const raw = (input ?? "").trim();
  const hit = SUPPORTED_LANGUAGES.find((l) => l.code === raw);
  return (hit?.code ?? DEFAULT_LANGUAGE) as LanguageCode;
}

export function translate(lang: LanguageCode, key: TranslationKey): string {
  const en = translations.en[key];
  const ko = translations.ko[key];
  const v = translations[lang]?.[key] ?? en ?? ko;
  return typeof v === "string" ? v : key;
}

