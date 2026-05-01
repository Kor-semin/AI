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
  | "cta.tryAppExperience"
  | "cta.openAppWorkspace"
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
  | "crm.workspaceAi.title"
  | "crm.workspaceAi.subtitle"
  | "crm.workspaceAi.customerPickLabel"
  | "crm.workspaceAi.selectPlaceholder"
  | "crm.workspaceAi.pickCustomer"
  | "crm.workspaceAi.memoLabel"
  | "crm.workspaceAi.toneLabel"
  | "crm.workspaceAi.needsHeading"
  | "crm.workspaceAi.salesHeading"
  | "crm.workspaceAi.smsHeading"
  | "crm.workspaceAi.copySms"
  | "crm.workspaceAi.saveMemo"
  | "crm.workspaceAi.saveToast"
  | "crm.workspaceAi.createFollowUp"
  | "crm.workspaceAi.followUpToast"
  | "crm.workspaceAi.smsCopyToast"
  | "crm.workspaceAi.followUpDefaultTitle"
  | "crm.workspaceAi.analyzing"
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
  | "landing.feature.delivery.desc"
  | "cta.tryAIDemo"
  | "landing.aiDemo.sectionTitle"
  | "landing.aiDemo.sectionDesc"
  | "landing.aiDemo.inputLabel"
  | "landing.aiDemo.inputHint"
  | "landing.aiDemo.sampleCustomerLabel"
  | "landing.aiDemo.sampleCustomerPlaceholder"
  | "landing.aiDemo.sampleDataNotice"
  | "landing.aiDemo.inputExample"
  | "landing.aiDemo.status"
  | "landing.aiDemo.readyStatus"
  | "landing.aiDemo.resetExample"
  | "landing.aiDemo.summaryTitle"
  | "landing.aiDemo.nextActionTitle"
  | "landing.aiDemo.recommendedMessageTitle"
  | "landing.aiDemo.liveNotice"
  | "landing.aiDemo.salesStyleLabel"
  | "landing.aiDemo.salesStyle.polite"
  | "landing.aiDemo.salesStyle.simple"
  | "landing.aiDemo.salesStyle.premium"
  | "landing.aiDemo.salesStyle.friendly"
  | "landing.aiDemo.salesStyle.active"
  | "landing.aiDemo.emptyNotice"
  | "landing.aiDemo.aiResponseLabel"
  | "landing.aiDemo.aiResponseExample"
  | "landing.aiDemo.messageLabel"
  | "landing.aiDemo.messageExample"
  | "landing.aiDemo.applyCta"
  | "landing.aiDemo.careCoachLabel"
  | "landing.aiDemo.tabNeeds"
  | "landing.aiDemo.tabSales"
  | "landing.aiDemo.tabSms"
  | "landing.aiDemo.copySms"
  | "landing.aiDemo.statusBarAnalyzing"
  | "landing.aiDemo.statusBarReady"
  | "landing.aiDemo.betaJoinShort"
  | "landing.aiDemo.applyShort"
  | "landing.aiDemo.simpleHint"
  | "landing.aiDemo.previewHeading"
  | "landing.aiDemo.continueInWorkspace"
  | "landing.aiDemo.loadSampleSnippet"
  | "landing.aiDemo.previewWorkspaceNote"
  | "landing.crmDemo.sectionTitle"
  | "landing.crmDemo.sectionDesc"
  | "landing.crmDemo.startCta"
  | "landing.showroom.hero.leadLine1"
  | "landing.showroom.hero.leadLine2"
  | "landing.showroom.hero.desc"
  | "landing.showroom.heroPreview.needsSnippet"
  | "landing.showroom.heroPreview.smsSnippet"
  | "landing.showroom.heroPreview.followupSnippet"
  | "landing.showroom.flow.title"
  | "landing.showroom.flow.desc"
  | "landing.showroom.flow.mock.contactTitle"
  | "landing.showroom.flow.mock.contactBody"
  | "landing.showroom.flow.mock.needsTitle"
  | "landing.showroom.flow.mock.needsBody"
  | "landing.showroom.flow.mock.smsTitle"
  | "landing.showroom.flow.mock.smsBody"
  | "landing.showroom.flow.mock.followupTitle"
  | "landing.showroom.flow.mock.followupBody"
  | "landing.showroom.guide.title"
  | "landing.showroom.guide.desc"
  | "landing.showroom.guide.memoLabel"
  | "landing.showroom.guide.memoQuote"
  | "landing.showroom.guide.guideQuote"
  | "landing.showroom.features.title"
  | "landing.showroom.closing.desc"
  | "cover.aiGuide.title"
  | "cover.aiGuide.subtitle"
  | "cover.aiGuide.step1.title"
  | "cover.aiGuide.step1.desc"
  | "cover.aiGuide.step2.title"
  | "cover.aiGuide.step2.desc"
  | "cover.aiGuide.step3.title"
  | "cover.aiGuide.step3.desc"
  | "cover.aiGuide.step4.title"
  | "cover.aiGuide.step4.desc"
  | "cover.aiGuide.tryCta"
  | "cover.aiGuide.startCta"
  | "cover.aiGuide.memoExampleHint"
  | "crm.seasonCare.title"
  | "crm.seasonCare.intro"
  | "crm.seasonCare.previewLabel"
  | "crm.seasonCare.brandLabel"
  | "crm.seasonCare.brandOtherHint"
  | "crm.seasonCare.customBrandPlaceholder"
  | "crm.seasonCare.seasonLabel"
  | "crm.seasonCare.purposeLabel"
  | "crm.seasonCare.toneLabel"
  | "crm.seasonCare.sellerHeading"
  | "crm.seasonCare.optionalHint"
  | "crm.seasonCare.sellerName"
  | "crm.seasonCare.showroom"
  | "crm.seasonCare.sellerContactField"
  | "crm.seasonCare.jobTitle"
  | "crm.seasonCare.generate"
  | "crm.seasonCare.copy"
  | "crm.seasonCare.copyToast"
  | "crm.seasonCare.copyFail"
  | "crm.seasonCare.copyEmptyHint"
  | "crm.seasonCare.disclaimer"
  | "crm.seasonCare.stepConditions"
  | "crm.seasonCare.stepSender"
  | "crm.seasonCare.adNoticeHeading"
  | "crm.seasonCare.brand.mercedesBenz"
  | "crm.seasonCare.brand.bmw"
  | "crm.seasonCare.brand.mini"
  | "crm.seasonCare.brand.audi"
  | "crm.seasonCare.brand.porsche"
  | "crm.seasonCare.brand.lexus"
  | "crm.seasonCare.brand.volvo"
  | "crm.seasonCare.brand.genesis"
  | "crm.seasonCare.brand.other"
  | "crm.seasonCare.season.springCherry"
  | "crm.seasonCare.season.summerMonsoon"
  | "crm.seasonCare.season.summerHeat"
  | "crm.seasonCare.season.autumnFoliage"
  | "crm.seasonCare.season.winterCold"
  | "crm.seasonCare.season.winterSnow"
  | "crm.seasonCare.season.lunarNewYear"
  | "crm.seasonCare.season.chuseok"
  | "crm.seasonCare.season.vacation"
  | "crm.seasonCare.season.beforeLongTrip"
  | "crm.seasonCare.season.tireCheck"
  | "crm.seasonCare.season.batteryCheck"
  | "crm.seasonCare.season.oilCheck"
  | "crm.seasonCare.season.wiperAcFilterCheck"
  | "crm.seasonCare.purpose.greeting"
  | "crm.seasonCare.purpose.maintenance"
  | "crm.seasonCare.purpose.tire"
  | "crm.seasonCare.purpose.promotion"
  | "crm.seasonCare.purpose.revisit"
  | "crm.seasonCare.purpose.deliveryCare"
  | "crm.seasonCare.purpose.reengage"
  | "crm.seasonCare.purpose.personalBranding"
  | "crm.seasonCare.tone.polite"
  | "crm.seasonCare.tone.warm"
  | "crm.seasonCare.tone.premium"
  | "crm.seasonCare.tone.brief"
  | "crm.seasonCare.tone.promo"
  | "pwa.install.title"
  | "pwa.install.description"
  | "pwa.install.ios"
  | "pwa.install.android"
  | "pwa.install.dismiss";

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
    "cta.tryAppExperience": "앱 체험하기",
    "cta.openAppWorkspace": "앱 워크스페이스 열기",
    "cta.viewDemo": "데모 보기",
    "cta.tryAIDemo": "AI 비서 체험하기",
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
    "crm.workspaceAi.title": "AI 비서 (작업)",
    "crm.workspaceAi.subtitle": "메모 기준으로 초안을 만들고, 저장·복사·후속 연락까지 한 패널에서 처리합니다.",
    "crm.workspaceAi.customerPickLabel": "고객",
    "crm.workspaceAi.selectPlaceholder": "고객을 선택해 주세요",
    "crm.workspaceAi.pickCustomer": "워크플로를 시작하려면 고객을 선택하거나 새로 추가하세요.",
    "crm.workspaceAi.memoLabel": "상담 메모",
    "crm.workspaceAi.toneLabel": "문구 톤",
    "crm.workspaceAi.needsHeading": "고객 니즈",
    "crm.workspaceAi.salesHeading": "영업 포인트",
    "crm.workspaceAi.smsHeading": "발송 문자",
    "crm.workspaceAi.copySms": "문자 복사",
    "crm.workspaceAi.saveMemo": "CRM에 저장",
    "crm.workspaceAi.saveToast": "상담 메모가 저장되었습니다.",
    "crm.workspaceAi.createFollowUp": "후속 연락 만들기",
    "crm.workspaceAi.followUpToast": "후속 연락이 추가되었습니다.",
    "crm.workspaceAi.smsCopyToast": "문자 초안을 복사했습니다.",
    "crm.workspaceAi.followUpDefaultTitle": "다음 연락",
    "crm.workspaceAi.analyzing": "정리 중…",
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
    "landing.feature.profile.title": "고객 CRM",
    "landing.feature.profile.desc": "상담과 기록을 한곳에 두고, 다음 연락까지 자연스럽게 이어집니다.",
    "landing.feature.memory.title": "AI 비서",
    "landing.feature.memory.desc": "SensoraGuide가 메모를 기준으로 니즈·포인트·발송 문장을 간결하게 묶어줍니다.",
    "landing.feature.followup.title": "시즌 케어 메시지",
    "landing.feature.followup.desc": "계절·점검·안부 명분에 맞춰, 짧은 메시지 초안을 차분한 톤으로 정리합니다.",
    "landing.feature.delivery.title": "출고 안내서",
    "landing.feature.delivery.desc": "인도 일정과 준비 항목을 한 흐름으로 정리해, 고객 안내를 빠뜨리지 않게 만듭니다.",
    "landing.aiDemo.sectionTitle": "AI 비서 체험하기",
    "landing.aiDemo.sectionDesc":
      "상담 메모를 입력하면 AI가 고객 요약, 다음 액션, 연락 문구를 즉시 제안합니다.",
    "landing.aiDemo.inputLabel": "상담 메모 (예시)",
    "landing.aiDemo.inputHint":
      "직접 입력하거나 아래 샘플 고객을 선택해 보세요. 입력은 약간의 디바운스 후 갱신되고, 샘플 선택 시에는 즉시 반영됩니다.",
    "landing.aiDemo.sampleCustomerLabel": "샘플 고객 선택",
    "landing.aiDemo.sampleCustomerPlaceholder": "직접 입력 또는 샘플 고객 선택",
    "landing.aiDemo.sampleDataNotice":
      "아래 정보는 기능 체험을 위한 가상 샘플 고객입니다.",
    "landing.aiDemo.inputExample":
      "고객은 조용한 승차감과 가족 이동을 중요하게 생각했고, 선납금·보증금을 반영한 리스와 할부 견적서 라인 검토 및 월 납입금 확인을 원했습니다.",
    "landing.aiDemo.status": "상담 내용을 분석하고 있습니다…",
    "landing.aiDemo.readyStatus": "SensoraGuide · 데모 응답 준비됨",
    "landing.aiDemo.resetExample": "예시 다시 넣기",
    "landing.aiDemo.summaryTitle": "상담 요약",
    "landing.aiDemo.nextActionTitle": "다음 액션",
    "landing.aiDemo.recommendedMessageTitle": "추천 메시지",
    "landing.aiDemo.liveNotice": "입력값은 저장되지 않습니다. (데모)",
    "landing.aiDemo.salesStyleLabel": "영업사원 스타일",
    "landing.aiDemo.salesStyle.polite": "정중한 스타일",
    "landing.aiDemo.salesStyle.simple": "담백한 스타일",
    "landing.aiDemo.salesStyle.premium": "프리미엄 스타일",
    "landing.aiDemo.salesStyle.friendly": "친근한 스타일",
    "landing.aiDemo.salesStyle.active": "적극적인 스타일",
    "landing.aiDemo.emptyNotice": "상담 메모를 입력하면 요약/다음 액션/추천 메시지가 바뀝니다.",
    "landing.aiDemo.aiResponseLabel": "AI 요약",
    "landing.aiDemo.aiResponseExample":
      "이 고객은 실용성과 고급감을 함께 고려하는 고객입니다. 오늘은 월 납입금, 장기 보유 가치, 가족 이동 편의성을 중심으로 연락하는 것이 좋습니다.",
    "landing.aiDemo.messageLabel": "추천 메시지",
    "landing.aiDemo.messageExample":
      "안녕하세요. 지난 상담에서 말씀하신 승차감과 가족 이동 편의성을 기준으로 정리해봤습니다. 오늘 편하실 때 금융 조건까지 함께 안내드리겠습니다.",
    "landing.aiDemo.applyCta": "CRM에 적용하기",
    "landing.aiDemo.careCoachLabel": "SensoraGuide · 배려 응대 포인트",
    "landing.aiDemo.tabNeeds": "고객 니즈",
    "landing.aiDemo.tabSales": "영업 포인트",
    "landing.aiDemo.tabSms": "발송 문자",
    "landing.aiDemo.copySms": "문자 복사",
    "landing.aiDemo.statusBarAnalyzing": "SensoraGuide · 분석 중…",
    "landing.aiDemo.statusBarReady": "SensoraGuide · 분석 완료",
    "landing.aiDemo.betaJoinShort": "베타 신청",
    "landing.aiDemo.applyShort": "CRM 적용",
    "landing.aiDemo.simpleHint": "짧게 입력하면 바로 초안 형태만 미리 확인할 수 있어요. 저장·후속 업무는 워크스페이스에서 이어지면 됩니다.",
    "landing.aiDemo.previewHeading": "결과 미리보기",
    "landing.aiDemo.continueInWorkspace": "앱 워크스페이스에서 계속하기",
    "landing.aiDemo.loadSampleSnippet": "예시 문장 불러오기",
    "landing.aiDemo.previewWorkspaceNote":
      "실제 저장·복사·후속 연락은 워크스페이스의 AI 비서 패널에서 이어 할 수 있습니다.",
    "landing.crmDemo.sectionTitle": "고객관리 흐름을 한 화면에",
    "landing.crmDemo.sectionDesc":
      "오늘 연락할 고객, 계약 가능성, 상담 요약, 출고 안내서를 한 번에 확인합니다.",
    "landing.crmDemo.startCta": "고객관리 시작하기",
    "landing.showroom.hero.leadLine1": "자동차 영업의 모든 흐름을",
    "landing.showroom.hero.leadLine2": "AI가 조용하게 정리합니다.",
    "landing.showroom.hero.desc":
      "고객 상담, 후속 연락, 금융 조건, 출고 안내까지. SensoraGuide가 영업사원의 다음 행동을 제안합니다.",
    "landing.showroom.heroPreview.needsSnippet": "패밀리 이동·승차감·승하차 동선 중심. 예산 검토 다음 단계: 금융 조건 초안 안내.",
    "landing.showroom.heroPreview.smsSnippet": "말씀해 주신 기준 위주로 짧게 정리해 두었습니다. 오늘 편하실 때 조건 초안부터 함께 보시죠.",
    "landing.showroom.heroPreview.followupSnippet": "내일 오전 · 금융 옵션 정리 후 연락",
    "landing.showroom.flow.title": "하루의 영업 흐름을 한 화면에서",
    "landing.showroom.flow.desc":
      "상담 기록, 고객 니즈, 다음 연락, 발송 문구를 하나의 흐름으로 정리합니다.",
    "landing.showroom.flow.mock.contactTitle": "오늘 연락할 고객",
    "landing.showroom.flow.mock.contactBody": "김민준 · 견적 검토 · 금융 조건 회신 필요",
    "landing.showroom.flow.mock.needsTitle": "고객 니즈 요약",
    "landing.showroom.flow.mock.needsBody": "패밀리 이동, 승하차 편의, 월 부담·보증 선택지 비교 필요",
    "landing.showroom.flow.mock.smsTitle": "발송 문자",
    "landing.showroom.flow.mock.smsBody":
      "지난번 말씀 기준으로 정리했습니다. 오늘 잠깐이라도 시간 내주시면 조건 초안 차분히 안내드리겠습니다.",
    "landing.showroom.flow.mock.followupTitle": "후속 연락",
    "landing.showroom.flow.mock.followupBody": "내일 오전 11시 재연락 · 전화",
    "landing.showroom.guide.title": "고객의 말을 영업의 다음 행동으로 바꿉니다.",
    "landing.showroom.guide.desc":
      "SensoraGuide는 상담 메모를 읽고 고객 니즈, 영업 포인트, 고객 발송 문장을 정리합니다. 민감한 상담 원문은 그대로 되풀이하지 않고, 승차감·승하차 편의성·예산·일정처럼 응대 기준으로 바꿔줍니다.",
    "landing.showroom.guide.memoLabel": "상담 메모",
    "landing.showroom.guide.memoQuote": "가족 이동이 많고 승하차 편의성을 중요하게 보심.",
    "landing.showroom.guide.guideQuote": "2열 공간, 승하차 동선, 탑승 편안함을 중심으로 안내하세요.",
    "landing.showroom.features.title": "영업사원을 위한 조용한 자동화",
    "landing.showroom.closing.desc":
      "Sensora는 자동차 영업사원의 상담과 후속 관리를 하나의 흐름으로 정리합니다.",
    "cover.aiGuide.title": "AI 사용법",
    "cover.aiGuide.subtitle":
      "상담 내용을 입력하면 SensoraGuide가 고객 요약, 다음 액션, 연락 문구를 제안합니다.",
    "cover.aiGuide.step1.title": "상담 메모 입력",
    "cover.aiGuide.step1.desc": "고객과 나눈 대화, 관심 차량, 예산, 구매 시기 등을 편하게 기록하세요.",
    "cover.aiGuide.step2.title": "AI 요약 확인",
    "cover.aiGuide.step2.desc": "SensoraGuide가 고객의 핵심 니즈와 구매 가능성을 정리합니다.",
    "cover.aiGuide.step3.title": "다음 액션 추천",
    "cover.aiGuide.step3.desc": "언제 연락하면 좋을지, 어떤 내용을 안내하면 좋을지 제안합니다.",
    "cover.aiGuide.step4.title": "메시지와 출고 안내서 활용",
    "cover.aiGuide.step4.desc": "추천 문구와 출고 안내서를 고객 응대에 바로 활용할 수 있습니다.",
    "cover.aiGuide.tryCta": "AI 비서 체험하기",
    "cover.aiGuide.startCta": "고객관리 시작하기",
    "cover.aiGuide.memoExampleHint": "상담 메모 예시는 홈 `#ai-demo`에서 바로 불러올 수 있어요.",
    "crm.seasonCare.title": "시즌 케어 메시지",
    "crm.seasonCare.intro":
      "계절·정비 명분으로 고객에게 보낼 장문 문자 초안입니다. 선택 값에 맞춰 조합되며 추후 AI 연결을 위해 구조가 분리되어 있습니다.",
    "crm.seasonCare.previewLabel": "생성 결과",
    "crm.seasonCare.brandLabel": "브랜드",
    "crm.seasonCare.brandOtherHint": "기타 브랜드명 입력",
    "crm.seasonCare.customBrandPlaceholder": "브랜드명 입력",
    "crm.seasonCare.seasonLabel": "시즌 / 상황",
    "crm.seasonCare.purposeLabel": "메시지 목적",
    "crm.seasonCare.toneLabel": "문체 / 톤",
    "crm.seasonCare.sellerHeading": "영업사원 정보",
    "crm.seasonCare.optionalHint": "선택 입력",
    "crm.seasonCare.sellerName": "이름",
    "crm.seasonCare.showroom": "전시장명",
    "crm.seasonCare.sellerContactField": "연락처",
    "crm.seasonCare.jobTitle": "직함",
    "crm.seasonCare.generate": "메시지 생성",
    "crm.seasonCare.copy": "복사하기",
    "crm.seasonCare.copyToast": "클립보드에 복사했습니다.",
    "crm.seasonCare.copyFail": "복사할 수 없습니다. 텍스트를 길게 눌러 복사해 주세요.",
    "crm.seasonCare.copyEmptyHint": "먼저 메시지 생성을 실행해 주세요.",
    "crm.seasonCare.disclaimer":
      "광고성 문자 발송 시 수신 동의, (광고) 표시, 발신자 명칭, 연락처, 무료수신거부 표기가 필요할 수 있습니다. 실제 발송 전 관련 법규와 회사 정책을 확인하세요.",
    "crm.seasonCare.stepConditions": "1 · 조건 선택",
    "crm.seasonCare.stepSender": "2 · 발신자 정보",
    "crm.seasonCare.adNoticeHeading": "광고·정보 문자 안내",
    "crm.seasonCare.brand.mercedesBenz": "Mercedes-Benz",
    "crm.seasonCare.brand.bmw": "BMW",
    "crm.seasonCare.brand.mini": "MINI",
    "crm.seasonCare.brand.audi": "Audi",
    "crm.seasonCare.brand.porsche": "Porsche",
    "crm.seasonCare.brand.lexus": "Lexus",
    "crm.seasonCare.brand.volvo": "Volvo",
    "crm.seasonCare.brand.genesis": "Genesis",
    "crm.seasonCare.brand.other": "기타 (직접 입력)",
    "crm.seasonCare.season.springCherry": "봄 / 벚꽃",
    "crm.seasonCare.season.summerMonsoon": "여름 / 장마",
    "crm.seasonCare.season.summerHeat": "여름 / 폭염",
    "crm.seasonCare.season.autumnFoliage": "가을 / 단풍",
    "crm.seasonCare.season.winterCold": "겨울 / 한파",
    "crm.seasonCare.season.winterSnow": "겨울 / 눈길",
    "crm.seasonCare.season.lunarNewYear": "설 연휴",
    "crm.seasonCare.season.chuseok": "추석 연휴",
    "crm.seasonCare.season.vacation": "휴가철",
    "crm.seasonCare.season.beforeLongTrip": "장거리 운행 전",
    "crm.seasonCare.season.tireCheck": "타이어 점검",
    "crm.seasonCare.season.batteryCheck": "배터리 점검",
    "crm.seasonCare.season.oilCheck": "엔진오일 점검",
    "crm.seasonCare.season.wiperAcFilterCheck": "와이퍼 / 에어컨 필터 점검",
    "crm.seasonCare.purpose.greeting": "안부 인사",
    "crm.seasonCare.purpose.maintenance": "정비 안내",
    "crm.seasonCare.purpose.tire": "타이어 점검 안내",
    "crm.seasonCare.purpose.promotion": "프로모션 안내",
    "crm.seasonCare.purpose.revisit": "재방문 유도",
    "crm.seasonCare.purpose.deliveryCare": "출고 고객 케어",
    "crm.seasonCare.purpose.reengage": "장기 미연락 고객 재접촉",
    "crm.seasonCare.purpose.personalBranding": "영업사원 개인 브랜딩",
    "crm.seasonCare.tone.polite": "정중한 톤",
    "crm.seasonCare.tone.warm": "따뜻한 톤",
    "crm.seasonCare.tone.premium": "프리미엄 톤",
    "crm.seasonCare.tone.brief": "짧고 담백한 톤",
    "crm.seasonCare.tone.promo": "장문 홍보 톤",
    "pwa.install.title": "앱처럼 사용하기",
    "pwa.install.description":
      "앱처럼 사용하려면 브라우저 메뉴에서 ‘홈 화면에 추가’를 선택하세요.",
    "pwa.install.ios":
      "iPhone에서는 Safari 공유 버튼을 누른 뒤 ‘홈 화면에 추가’를 선택하세요.",
    "pwa.install.android":
      "Android에서는 Chrome 메뉴에서 ‘앱 설치’ 또는 ‘홈 화면에 추가’를 선택하세요.",
    "pwa.install.dismiss": "닫기",
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
    "cta.tryAppExperience": "Explore the App",
    "cta.openAppWorkspace": "Open the Workspace",
    "cta.viewDemo": "View Demo",
    "cta.tryAIDemo": "Try the AI Assistant",
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
    "crm.workspaceAi.title": "AI assistant (workspace)",
    "crm.workspaceAi.subtitle": "Draft from your memo, then copy, save, or create a follow-up in one panel.",
    "crm.workspaceAi.customerPickLabel": "Customer",
    "crm.workspaceAi.selectPlaceholder": "Select a customer",
    "crm.workspaceAi.pickCustomer": "Select or add a customer to begin.",
    "crm.workspaceAi.memoLabel": "Consultation memo",
    "crm.workspaceAi.toneLabel": "Message tone",
    "crm.workspaceAi.needsHeading": "Customer needs",
    "crm.workspaceAi.salesHeading": "Sales angles",
    "crm.workspaceAi.smsHeading": "Outbound SMS",
    "crm.workspaceAi.copySms": "Copy message",
    "crm.workspaceAi.saveMemo": "Save to CRM",
    "crm.workspaceAi.saveToast": "Memo saved.",
    "crm.workspaceAi.createFollowUp": "Create follow-up",
    "crm.workspaceAi.followUpToast": "Follow-up added.",
    "crm.workspaceAi.smsCopyToast": "Message copied.",
    "crm.workspaceAi.followUpDefaultTitle": "Follow-up",
    "crm.workspaceAi.analyzing": "Working…",
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
    "landing.feature.profile.title": "Customer CRM",
    "landing.feature.profile.desc": "Keep consultations and records in one place, so the thread continues smoothly to the next contact.",
    "landing.feature.memory.title": "AI assistant",
    "landing.feature.memory.desc": "SensoraGuide turns your memo into needs, angles, and a calm outbound SMS draft—in one concise pass.",
    "landing.feature.followup.title": "Season care messaging",
    "landing.feature.followup.desc": "Draft restrained check-in messages anchored to seasonal maintenance—without leaning on hype.",
    "landing.feature.delivery.title": "Delivery guide",
    "landing.feature.delivery.desc": "Structure timelines and readiness items into a steady hand-off flow for buyers.",
    "landing.aiDemo.sectionTitle": "Try the AI Assistant",
    "landing.aiDemo.sectionDesc":
      "Paste a consultation memo and Sensora will instantly suggest a customer summary, next actions, and a follow-up message.",
    "landing.aiDemo.inputLabel": "Consultation memo (example)",
    "landing.aiDemo.inputHint":
      "Type your memo—or pick a sample customer below. Typing waits briefly (debounced); sample selections update immediately.",
    "landing.aiDemo.sampleCustomerLabel": "Select Sample Customer",
    "landing.aiDemo.sampleCustomerPlaceholder": "Enter manually or select a sample customer",
    "landing.aiDemo.sampleDataNotice":
      "The information below is sample data for product demonstration.",
    "landing.aiDemo.inputExample":
      "The customer values a quiet ride and family comfort, and asked for lease vs installment quote lines—including down payment, deposit, and monthly payment—with a printable quote attachment later.",
    "landing.aiDemo.status": "Analyzing your consultation notes…",
    "landing.aiDemo.readyStatus": "SensoraGuide · Ready",
    "landing.aiDemo.resetExample": "Restore example",
    "landing.aiDemo.summaryTitle": "Consultation summary",
    "landing.aiDemo.nextActionTitle": "Next action",
    "landing.aiDemo.recommendedMessageTitle": "Recommended message",
    "landing.aiDemo.liveNotice": "Your input is not stored. (Demo)",
    "landing.aiDemo.salesStyleLabel": "Sales outreach style",
    "landing.aiDemo.salesStyle.polite": "Polite & courteous",
    "landing.aiDemo.salesStyle.simple": "Plain & concise",
    "landing.aiDemo.salesStyle.premium": "Premium & calm",
    "landing.aiDemo.salesStyle.friendly": "Friendly & warm",
    "landing.aiDemo.salesStyle.active": "Light follow-up prompts",
    "landing.aiDemo.emptyNotice": "Enter a memo to see the summary, next action, and message update.",
    "landing.aiDemo.aiResponseLabel": "AI Summary",
    "landing.aiDemo.aiResponseExample":
      "This customer is balancing practicality with premium comfort. Today, focus your outreach on monthly payments, long-term value, and family-friendly convenience.",
    "landing.aiDemo.messageLabel": "Suggested message",
    "landing.aiDemo.messageExample":
      "Hello—based on what you shared about ride comfort and family convenience, I summarized the key points. When you’re free today, I can also walk you through financing options.",
    "landing.aiDemo.applyCta": "Apply in CRM",
    "landing.aiDemo.careCoachLabel": "SensoraGuide · Accessible care cues",
    "landing.aiDemo.tabNeeds": "Customer needs",
    "landing.aiDemo.tabSales": "Sales angles",
    "landing.aiDemo.tabSms": "SMS draft",
    "landing.aiDemo.copySms": "Copy message",
    "landing.aiDemo.statusBarAnalyzing": "SensoraGuide · Analyzing…",
    "landing.aiDemo.statusBarReady": "SensoraGuide · Analysis complete",
    "landing.aiDemo.betaJoinShort": "Beta",
    "landing.aiDemo.applyShort": "Use CRM",
    "landing.aiDemo.simpleHint":
      "Paste a quick memo to preview a lightweight draft—save and workflows continue in your workspace.",
    "landing.aiDemo.previewHeading": "Draft preview",
    "landing.aiDemo.continueInWorkspace": "Continue in workspace",
    "landing.aiDemo.loadSampleSnippet": "Load sample text",
    "landing.aiDemo.previewWorkspaceNote":
      "Saving, copying, and follow-ups are handled in the workspace AI assistant panel.",
    "landing.crmDemo.sectionTitle": "The CRM flow—at a glance",
    "landing.crmDemo.sectionDesc":
      "See today’s follow-ups, deal probability, consultation summaries, and delivery guides in one place.",
    "landing.crmDemo.startCta": "Start in CRM",
    "landing.showroom.hero.leadLine1": "Every step of automotive sales—",
    "landing.showroom.hero.leadLine2": "composed quietly, end to end.",
    "landing.showroom.hero.desc":
      "Consultations through follow-ups, finance conditions, and hand-off cues. SensoraGuide suggests what to address next—with calm precision.",
    "landing.showroom.heroPreview.needsSnippet":
      "Family use, cabin comfort, easy entry/exit. Next: align on financing options calmly.",
    "landing.showroom.heroPreview.smsSnippet":
      "Summarized what you prioritized last time—happy to walk through preliminary terms whenever works today.",
    "landing.showroom.heroPreview.followupSnippet": "Tomorrow AM · Financing outline, then callback",
    "landing.showroom.flow.title": "A full day—on one deliberate screen.",
    "landing.showroom.flow.desc":
      "Notes, needs, the next outreach, and a send-ready SMS line—woven into one flow.",
    "landing.showroom.flow.mock.contactTitle": "Today’s outreach",
    "landing.showroom.flow.mock.contactBody": "Minjun Kim · Estimate review · finance reply pending",
    "landing.showroom.flow.mock.needsTitle": "Needs distilled",
    "landing.showroom.flow.mock.needsBody": "Family hauling, ingress/egress ease, weighing monthly burden vs coverage choices.",
    "landing.showroom.flow.mock.smsTitle": "Outbound SMS",
    "landing.showroom.flow.mock.smsBody":
      "Tight recap from our last conversation—could we carve a few quiet minutes later today for preliminary financing terms?",
    "landing.showroom.flow.mock.followupTitle": "Next follow-up",
    "landing.showroom.flow.mock.followupBody": "Tomorrow · 11:00 · outbound call",
    "landing.showroom.guide.title": "Turn spoken intent into disciplined next acts.",
    "landing.showroom.guide.desc":
      "SensoraGuide reads memo lines and organizes needs, sales angles, and customer-facing copy—to practical criteria like ride ease, ergonomics, budget, timing—without repeating sensitive detail verbatim.",
    "landing.showroom.guide.memoLabel": "Consultation memo",
    "landing.showroom.guide.memoQuote":
      "Heavy family hauling; entry/exit comfort is decisive for them.",
    "landing.showroom.guide.guideQuote": "Lead with cabin space, egress paths, boarding comfort—not generic claims.",
    "landing.showroom.features.title": "Quiet automation—for sales desks",
    "landing.showroom.closing.desc":
      "Sensora aligns consultation work and disciplined follow-through into a single understated flow.",
    "cover.aiGuide.title": "How to Use AI",
    "cover.aiGuide.subtitle":
      "Enter consultation notes and SensoraGuide will suggest customer summaries, next actions, and follow-up messages.",
    "cover.aiGuide.step1.title": "Enter Consultation Notes",
    "cover.aiGuide.step1.desc":
      "Record conversations, vehicle interests, budget, and purchase timing naturally.",
    "cover.aiGuide.step2.title": "Review AI Summary",
    "cover.aiGuide.step2.desc":
      "SensoraGuide organizes the customer’s key needs and deal potential.",
    "cover.aiGuide.step3.title": "Get Next Actions",
    "cover.aiGuide.step3.desc": "See when to follow up and what to say next.",
    "cover.aiGuide.step4.title": "Use Messages and Delivery Guide",
    "cover.aiGuide.step4.desc":
      "Apply recommended messages and delivery guides directly to customer communication.",
    "cover.aiGuide.tryCta": "Try AI Assistant",
    "cover.aiGuide.startCta": "Start Customer Management",
    "cover.aiGuide.memoExampleHint":
      "Sample memo lines are easiest to load from the home page section `#ai-demo`.",
    "crm.seasonCare.title": "Season Care Message",
    "crm.seasonCare.intro":
      "Draft a longer seasonal care or outreach SMS aligned to dealership context. Outputs are templated locally for now and separated for future AI generation.",
    "crm.seasonCare.previewLabel": "Generated message",
    "crm.seasonCare.brandLabel": "Brand",
    "crm.seasonCare.brandOtherHint": "Custom brand name",
    "crm.seasonCare.customBrandPlaceholder": "Enter brand name",
    "crm.seasonCare.seasonLabel": "Season / situation",
    "crm.seasonCare.purposeLabel": "Purpose",
    "crm.seasonCare.toneLabel": "Tone",
    "crm.seasonCare.sellerHeading": "Consultant info",
    "crm.seasonCare.optionalHint": "Optional",
    "crm.seasonCare.sellerName": "Name",
    "crm.seasonCare.showroom": "Showroom",
    "crm.seasonCare.sellerContactField": "Contact number",
    "crm.seasonCare.jobTitle": "Title",
    "crm.seasonCare.generate": "Generate message",
    "crm.seasonCare.copy": "Copy message",
    "crm.seasonCare.copyToast": "Copied to clipboard.",
    "crm.seasonCare.copyFail": "Copy failed. Select the text manually.",
    "crm.seasonCare.copyEmptyHint": "Generate a message first.",
    "crm.seasonCare.disclaimer":
      "Advertising-style messages may require prior consent, an “Ad” marker, sender identity, contact information, and an opt-out line. Confirm local laws and dealer policy before sending.",
    "crm.seasonCare.stepConditions": "1 · Scenario",
    "crm.seasonCare.stepSender": "2 · Sender details",
    "crm.seasonCare.adNoticeHeading": "Advertising & compliance note",
    "crm.seasonCare.brand.mercedesBenz": "Mercedes-Benz",
    "crm.seasonCare.brand.bmw": "BMW",
    "crm.seasonCare.brand.mini": "MINI",
    "crm.seasonCare.brand.audi": "Audi",
    "crm.seasonCare.brand.porsche": "Porsche",
    "crm.seasonCare.brand.lexus": "Lexus",
    "crm.seasonCare.brand.volvo": "Volvo",
    "crm.seasonCare.brand.genesis": "Genesis",
    "crm.seasonCare.brand.other": "Other (custom)",
    "crm.seasonCare.season.springCherry": "Spring / cherry blossoms",
    "crm.seasonCare.season.summerMonsoon": "Summer / monsoon",
    "crm.seasonCare.season.summerHeat": "Summer / heat wave",
    "crm.seasonCare.season.autumnFoliage": "Autumn / foliage",
    "crm.seasonCare.season.winterCold": "Winter / cold spell",
    "crm.seasonCare.season.winterSnow": "Winter / snow",
    "crm.seasonCare.season.lunarNewYear": "Lunar New Year",
    "crm.seasonCare.season.chuseok": "Chuseok holiday",
    "crm.seasonCare.season.vacation": "Vacation season",
    "crm.seasonCare.season.beforeLongTrip": "Before a long trip",
    "crm.seasonCare.season.tireCheck": "Tyre inspection",
    "crm.seasonCare.season.batteryCheck": "Battery check",
    "crm.seasonCare.season.oilCheck": "Engine-oil check",
    "crm.seasonCare.season.wiperAcFilterCheck": "Wiper / A/C filter check",
    "crm.seasonCare.purpose.greeting": "Seasonal greeting",
    "crm.seasonCare.purpose.maintenance": "Service reminder",
    "crm.seasonCare.purpose.tire": "Tyre-care reminder",
    "crm.seasonCare.purpose.promotion": "Promotion notice",
    "crm.seasonCare.purpose.revisit": "Visit follow-up",
    "crm.seasonCare.purpose.deliveryCare": "Post-delivery care",
    "crm.seasonCare.purpose.reengage": "Reconnect after silence",
    "crm.seasonCare.purpose.personalBranding": "Consultant positioning",
    "crm.seasonCare.tone.polite": "Formal",
    "crm.seasonCare.tone.warm": "Warm",
    "crm.seasonCare.tone.premium": "Premium",
    "crm.seasonCare.tone.brief": "Short & plain",
    "crm.seasonCare.tone.promo": "Long promotional",
    "pwa.install.title": "Install Sensora like an app",
    "pwa.install.description":
      "To use Sensora like an app, open your browser menu and choose ‘Add to Home screen’.",
    "pwa.install.ios":
      "On iPhone Safari, tap the Share button, then choose ‘Add to Home Screen’.",
    "pwa.install.android":
      "On Android Chrome, choose ‘Install app’ or ‘Add to Home screen’ from the ⋮ menu.",
    "pwa.install.dismiss": "Dismiss",
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

