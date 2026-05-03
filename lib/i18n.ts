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
  | "brand.subline"
  | "product.shortDesc"
  | "hero.description"
  | "cta.joinBeta"
  | "cta.tryAppExperience"
  | "cta.openAppWorkspace"
  | "cta.viewDemo"
  | "header.cover"
  | "header.landing"
  | "header.workspace"
  | "header.zoomHint"
  | "auth.checkingLogin"
  | "auth.signOut"
  | "auth.salesRegistration"
  | "join.title"
  | "join.intro"
  | "join.backHome"
  | "join.loading"
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
  | "join.trustNoticeLine1"
  | "join.trustNoticeLine2"
  | "join.trustNoticeLine3"
  | "join.alert.betaReceivedRemote"
  | "join.alert.betaNotPersisted"
  | "join.alert.betaSaveFailed"
  | "join.devBetaEndpointHint"
  | "register.title"
  | "register.continueWithGoogle"
  | "register.intro"
  | "register.flowLeadGoogleOn"
  | "register.flowLeadGoogleOff"
  | "register.trustNoticeLine1"
  | "register.trustNoticeLine2"
  | "register.stepIdentify"
  | "register.stepCard"
  | "register.stepInfrastructure"
  | "register.errorGoogleDisabled"
  | "register.errorFirebaseEnv"
  | "register.errorPickCard"
  | "register.errorLoginFirst"
  | "register.errorUploadFailed"
  | "register.loadingProfile"
  | "register.pendingTitle"
  | "register.pendingBody"
  | "register.linkMain"
  | "register.doneTitle"
  | "register.doneBody"
  | "register.linkWorkspace"
  | "register.uploadLead"
  | "register.uploadLeadRetry"
  | "register.buttonSubmitCard"
  | "register.busyRedirecting"
  | "register.busyUploading"
  | "register.footerNote"
  | "register.fallbackUnavailableTitle"
  | "register.fallbackUnavailableBody"
  | "register.linkBetaSignup"
  | "register.firebaseDevHint"
  | "register.access.checking"
  | "register.access.pendingTitle"
  | "register.access.pendingBody"
  | "register.access.notFoundTitle"
  | "register.access.notFoundBody"
  | "register.access.rejectedTitle"
  | "register.access.rejectedBody"
  | "register.access.errorTitle"
  | "register.access.errorBody"
  | "register.access.goJoin"
  | "register.access.goHome"
  | "register.access.betaCheckEmailLabel"
  | "register.access.betaCheckEmailGoogleNote"
  | "crm.stat.todayFollowups"
  | "crm.stat.dealProbability"
  | "crm.stat.followupNeeded"
  | "crm.stat.recentConsultations"
  | "crm.demoContextNotice.primary"
  | "crm.demoContextNotice.secondary"
  | "crm.demoContextNotice.accessAfterBeta"
  | "crm.previewMode.headerSubtitle"
  | "crm.previewGate.title"
  | "crm.previewGate.body"
  | "crm.previewGate.join"
  | "crm.previewGate.register"
  | "crm.previewGate.continuePreview"
  | "crm.guideTip.body"
  | "crm.guideTip.openViewer"
  | "crm.sensoraTip.openButton"
  | "crm.import.heroTitle"
  | "crm.import.heroSub"
  | "crm.import.trustNoSync"
  | "crm.import.trustUserChoice"
  | "crm.import.step1Title"
  | "crm.import.step1Desc"
  | "crm.import.step2Title"
  | "crm.import.step2Desc"
  | "crm.import.step3Title"
  | "crm.import.step3Desc"
  | "crm.import.ctaUpload"
  | "crm.import.ctaGuide"
  | "crm.import.footerPrinciples"
  | "crm.import.iosFileHint"
  | "crm.import.iosTabShortcut"
  | "crm.import.pasteShort"
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
  | "crm.nav.mobileSubtitle.dashboard"
  | "crm.nav.mobileSubtitle.customers"
  | "crm.nav.mobileSubtitle.consulting"
  | "crm.nav.mobileSubtitle.ai"
  | "crm.nav.mobileSubtitle.pipeline"
  | "crm.nav.mobileSubtitle.vehicle"
  | "crm.nav.mobileSubtitle.followup"
  | "crm.nav.mobileSubtitle.settings"
  | "crm.workspaceAi.title"
  | "crm.workspaceAi.subtitle"
  | "crm.workspaceAi.customerPickLabel"
  | "crm.workspaceAi.selectPlaceholder"
  | "crm.workspaceAi.pickCustomer"
  | "crm.workspaceAi.memoLabel"
  | "crm.workspaceAi.toneLabel"
  | "crm.workspaceAi.consultSummaryHeading"
  | "crm.workspaceAi.consultSummaryLead"
  | "crm.workspaceAi.nextActionLead"
  | "crm.workspaceAi.smsDraftLead"
  | "crm.workspaceAi.needsHeading"
  | "crm.workspaceAi.customerNeedsHelper"
  | "crm.workspaceAi.customerNeedsPlaceholder"
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
  | "crm.sensoraFlow.banner"
  | "crm.sensoraFlow.memoUserEditableHint"
  | "crm.sensoraFlow.memoStaleHint"
  | "crm.sensoraFlow.toneHintsReanalyze"
  | "crm.sensoraFlow.aiSuggestionBadge"
  | "crm.sensoraFlow.appliedEditableHint"
  | "crm.sensoraFlow.previewEmptyHint"
  | "crm.sensoraFlow.needMemoForAnalyze"
  | "crm.sensoraFlow.analyzeAgain"
  | "crm.sensoraFlow.newProposal"
  | "crm.sensoraFlow.rewriteSms"
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
  | "landing.showroom.hero.quietFuture"
  | "landing.showroom.hero.senseAuraTag"
  | "landing.showroom.hero.kickerBadge"
  | "landing.showroom.hero.headline"
  | "landing.showroom.hero.headlineLine1"
  | "landing.showroom.hero.headlineLine2"
  | "landing.showroom.hero.sub"
  | "landing.showroom.bridge.line1"
  | "landing.showroom.bridge.line2"
  | "landing.showroom.header.subline"
  | "landing.showroom.heroDash.windowSubline"
  | "landing.showroom.heroDash.greetingLine"
  | "landing.showroom.heroDash.greetingSub"
  | "landing.showroom.heroDash.detailCta"
  | "landing.showroom.heroDash.messageCta"
  | "landing.showroom.heroDash.todayTitle"
  | "landing.showroom.heroDash.todaySnippet"
  | "landing.showroom.heroDash.priorityTitle"
  | "landing.showroom.heroDash.prioritySnippet"
  | "landing.showroom.heroDash.followupTitle"
  | "landing.showroom.heroDash.followupSnippet"
  | "landing.showroom.heroDash.aiDraftTitle"
  | "landing.showroom.heroDash.aiDraftSnippet"
  | "landing.showroom.heroDash.summaryTitle"
  | "landing.showroom.heroDash.summarySnippet"
  | "landing.showroom.heroMock.previewBadge"
  | "landing.showroom.heroMock.greeting"
  | "landing.showroom.heroMock.draftLabel"
  | "landing.showroom.heroMock.nav.home"
  | "landing.showroom.heroMock.nav.customers"
  | "landing.showroom.heroMock.nav.consult"
  | "landing.showroom.heroMock.nav.schedule"
  | "landing.showroom.heroMock.nav.messages"
  | "landing.showroom.heroMock.nav.aiAssistant"
  | "landing.showroom.heroMock.nav.stats"
  | "landing.showroom.heroMock.nav.settings"
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
  | "landing.showroom.tip.title"
  | "landing.showroom.tip.subtitle"
  | "landing.showroom.tip.card1.title"
  | "landing.showroom.tip.card1.desc"
  | "landing.showroom.tip.card2.title"
  | "landing.showroom.tip.card2.desc"
  | "landing.showroom.tip.card3.title"
  | "landing.showroom.tip.card3.desc"
  | "landing.showroom.tip.card4.title"
  | "landing.showroom.tip.card4.desc"
  | "landing.showroom.tip.close"
  | "landing.showroom.tip.closeOverlay"
  | "landing.showroom.tip.guideWord"
  | "landing.showroom.tip.imageMissing"
  | "landing.showroom.tip.prev"
  | "landing.showroom.tip.next"
  | "landing.showroom.tip.openOriginal"
  | "landing.showroom.tip.openOriginalAria"
  | "landing.showroom.tip.openOriginalHint"
  | "preview.toc.title"
  | "preview.toc.subtitle"
  | "preview.toc.disclaimer1"
  | "preview.toc.disclaimer2"
  | "preview.toc.disclaimer3"
  | "preview.toc.disclaimer4"
  | "preview.toc.close"
  | "preview.toc.openDashboard"
  | "preview.toc.summaryTitle"
  | "preview.toc.summaryDesc"
  | "preview.toc.customersTitle"
  | "preview.toc.customersDesc"
  | "preview.toc.notesTitle"
  | "preview.toc.notesDesc"
  | "preview.toc.aiTitle"
  | "preview.toc.aiDesc"
  | "preview.toc.followupTitle"
  | "preview.toc.followupDesc"
  | "preview.toc.betaTitle"
  | "preview.toc.betaDesc"
  | "preview.flow.step1.intro"
  | "preview.flow.step1.startCta"
  | "preview.flow.step1.registerCta"
  | "preview.flow.step2.headline"
  | "preview.flow.step2.sub"
  | "preview.flow.step2.card.customersTitle"
  | "preview.flow.step2.card.customersDesc"
  | "preview.flow.step2.card.aiTitle"
  | "preview.flow.step2.card.aiDesc"
  | "preview.flow.step2.card.followTitle"
  | "preview.flow.step2.card.followDesc"
  | "preview.flow.step3.headline"
  | "preview.flow.step3.sub"
  | "preview.flow.step3.enterWorkspace"
  | "preview.flow.step3.enterAi"
  | "preview.flow.footer.prev"
  | "preview.flow.footer.next"
  | "preview.flow.storyRailTitle"
  | "preview.guide.pageTitle"
  | "preview.guide.headerKicker"
  | "preview.guide.headerSub"
  | "preview.guide.tapMainToExpand"
  | "preview.guide.viewerTitle"
  | "guide.sensora-guide-01.title"
  | "guide.sensora-guide-01.desc"
  | "guide.sensora-guide-02.title"
  | "guide.sensora-guide-02.desc"
  | "guide.sensora-guide-03.title"
  | "guide.sensora-guide-03.desc"
  | "guide.sensora-guide-04.title"
  | "guide.sensora-guide-04.desc"
  | "guide.sensora-guide-05.title"
  | "guide.sensora-guide-05.desc"
  | "guide.unified.pageTitle"
  | "guide.unified.header.kicker"
  | "guide.unified.header.sub"
  | "guide.unified.intro.title"
  | "guide.unified.intro.body"
  | "guide.unified.flow.kicker"
  | "guide.unified.flow.title"
  | "guide.unified.flow.lead"
  | "guide.unified.flow.rail"
  | "guide.unified.guideNav.prev"
  | "guide.unified.guideNav.next"
  | "guide.unified.start.title"
  | "guide.unified.start.lead"
  | "guide.unified.disclaimer"
  | "preview.diagram.caption.security"
  | "preview.diagram.caption.workspace"
  | "preview.diagram.caption.hub"
  | "preview.diagram.security.view"
  | "preview.diagram.security.review"
  | "preview.diagram.security.confirm"
  | "preview.diagram.security.save"
  | "preview.diagram.path.register"
  | "preview.diagram.path.approve"
  | "preview.diagram.path.setup"
  | "preview.diagram.path.workspace"
  | "preview.diagram.hub.core"
  | "preview.diagram.hub.customers"
  | "preview.diagram.hub.ai"
  | "preview.diagram.hub.messages"
  | "preview.diagram.hub.schedule"
  | "preview.diagram.hub.aftercare"
  | "preview.diagram.consult.memo"
  | "preview.diagram.consult.needs"
  | "preview.diagram.consult.draft"
  | "preview.diagram.consult.next"
  | "concept.story.security.title"
  | "concept.story.security.desc"
  | "concept.story.path.title"
  | "concept.story.path.desc"
  | "concept.story.hub.title"
  | "concept.story.hub.desc"
  | "concept.story.memo.title"
  | "concept.story.memo.desc"
  | "landing.showroom.concept.sectionTitle"
  | "landing.showroom.concept.sectionSub"
  | "landing.showroom.concept.tapToExpand"
  | "settings.display.title"
  | "settings.textSize.title"
  | "settings.textSize.description"
  | "settings.textSize.small.label"
  | "settings.textSize.small.description"
  | "settings.textSize.medium.label"
  | "settings.textSize.medium.description"
  | "settings.textSize.large.label"
  | "settings.textSize.large.description"
  | "settings.textSize.storageNotice"
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
  | "cover.onboarding.page1.title"
  | "cover.onboarding.page1.description"
  | "cover.onboarding.page2.title"
  | "cover.onboarding.page2.customer"
  | "cover.onboarding.page2.ai"
  | "cover.onboarding.page2.followup"
  | "cover.onboarding.page2.season"
  | "cover.onboarding.page2.delivery"
  | "cover.onboarding.page3.title"
  | "cover.onboarding.page3.description"
  | "cover.onboarding.next"
  | "cover.onboarding.prev"
  | "cover.onboarding.start"
  | "cover.onboarding.close"
  | "cover.onboarding.startApp"
  | "cover.onboarding.goWorkspace"
  | "cover.onboarding.page3.workspaceCta"
  | "cover.onboarding.page3.aiCta"
  | "cover.onboarding.themeLabel"
  | "cover.onboarding.themeHint"
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
    "brand.identity": "자동차 영업을 위한 업무 소프트웨어",
    "brand.subline": "차량 영업 · 상담·사후관리 정리",
    "product.shortDesc": "자동차 영업사원을 위한 고객 상담·일정 정리 도구",
    "hero.description":
      "고객 상담과 일정까지 한 화면에 모읍니다. AI는 검토용 요약과 문자 초안을 정리하고, 저장·판단은 항상 영업사원이 합니다.",
    "cta.joinBeta": "베타 신청하기",
    "cta.tryAppExperience": "앱 화면 미리보기",
    "cta.openAppWorkspace": "앱 워크스페이스 열기",
    "cta.viewDemo": "데모 보기",
    "cta.tryAIDemo": "AI 비서 체험하기",
    "header.cover": "표지",
    "header.landing": "랜딩",
    "header.workspace": "영업 워크스페이스",
    "header.zoomHint": "화면 배율 · Ctrl/Cmd + 플러스·마이너스, 원래 크기 · Ctrl/Cmd + 0",
    "auth.checkingLogin": "로그인 확인 중…",
    "auth.signOut": "로그아웃",
    "auth.salesRegistration": "영업 계정 등록",
    "join.title": "베타 신청",
    "join.intro":
      "Sensora Auto CRM 베타 신청을 받고 있습니다.\n신청 내용을 검토한 뒤 순차적으로 연락드리겠습니다.",
    "join.backHome": "홈으로 돌아가기",
    "join.loading": "불러오는 중…",
    "join.formLegend": "Sensora Auto CRM 베타 신청 폼",
    "join.fillAllFields": "모든 항목을 입력해 주세요.",
    "join.invalidEmail": "이메일 형식을 확인해 주세요.",
    "form.name": "이름",
    "form.contact": "연락처",
    "form.email": "이메일",
    "form.dealership": "소속 브랜드 / 전시장",
    "form.currentCrm": "현재 고객관리 방식",
    "form.motivation": "사용해 보고 싶은 이유",
    "join.submit": "베타 신청 제출하기",
    "join.submitting": "제출 중…",
    "join.trustNoticeLine1": "입력하신 정보는 베타 안내와 사용자 확인을 위해서만 사용됩니다.",
    "join.trustNoticeLine2": "Sensora는 고객 연락처나 고객 정보를 자동으로 수집하지 않습니다.",
    "join.trustNoticeLine3": "고객 정보는 사용자가 직접 확인하고 저장하는 구조를 기준으로 합니다.",
    "join.alert.betaReceivedRemote": "베타 신청이 접수되었습니다.",
    "join.alert.betaNotPersisted":
      "테스트 제출이 완료되었습니다.\n현재는 저장 기능이 연결되지 않은 상태입니다.",
    "join.alert.betaSaveFailed": "제출 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    "join.devBetaEndpointHint":
      "개발 전용: 베타 폼을 시트·웹훅으로 보내려면 NEXT_PUBLIC_BETA_SIGNUP_ENDPOINT(예: Google Apps Script URL)를 설정하세요. 비어 있으면 원격 저장 없이 제출만 확인할 수 있습니다.",
    "register.title": "영업 계정 등록",
    "register.continueWithGoogle": "Google로 시작하기",
    "register.intro":
      "Sensora Auto CRM 사용을 위한 영업 계정 정보를 등록합니다.\n입력한 정보는 계정 확인과 베타 승인 상태 안내에 사용됩니다.",
    "register.flowLeadGoogleOn":
      "Google 계정으로 로그인한 뒤, 직접 촬영·선택한 명함 이미지를 올리면 운영 검토가 시작됩니다.",
    "register.flowLeadGoogleOff":
      "현재 Google 로그인은 준비 중입니다. 메인 화면에서 로컬 저장(MVP) 모드로 먼저 이용해 주세요.",
    "register.trustNoticeLine1":
      "입력하신 정보는 영업 계정 확인과 베타 승인 안내를 위해서만 사용됩니다.",
    "register.trustNoticeLine2": "Sensora는 고객 연락처나 고객 정보를 자동으로 수집하지 않습니다.",
    "register.stepIdentify": "Google 로그인으로 계정을 확인합니다(SMS 없음).",
    "register.stepCard": "명함 이미지는 사용자가 직접 촬영·파일 선택해 업로드합니다.",
    "register.stepInfrastructure":
      "Firestore·Storage는 무료 한도(Spark) 안에서 쓰시는 것을 권장합니다.",
    "register.errorGoogleDisabled": "현재 Google 로그인은 잠시 꺼져 있습니다(준비중).",
    "register.errorFirebaseEnv": "지금은 이 화면에서 계정 등록을 이어 갈 수 없습니다. 베타 신청을 통해 남겨 주세요.",
    "register.errorPickCard": "명함 이미지를 선택해 주세요.",
    "register.errorLoginFirst": "먼저 Google 계정으로 로그인해 주세요.",
    "register.errorUploadFailed": "업로드 실패.",
    "register.loadingProfile": "계정 상태를 불러오는 중…",
    "register.pendingTitle": "명함 접수 후 검토 중입니다.",
    "register.pendingBody": "승인이 완료되면 같은 계정으로 메인에서 바로 이용할 수 있습니다.",
    "register.linkMain": "메인으로",
    "register.doneTitle": "명함을 접수했습니다.",
    "register.doneBody":
      "승인 전까지 같은 Google 계정으로 로그인해 두시면, 승인 직후 워크스페이스가 열립니다.",
    "register.linkWorkspace": "시작 화면으로",
    "register.uploadLead": "명함 한 장이 또렷하게 보이도록 촬영한 이미지를 직접 선택해 올려 주세요.",
    "register.uploadLeadRetry": "다시 접수합니다. 업로드를 완료해 주세요.",
    "register.buttonSubmitCard": "명함 제출 후 검토 요청",
    "register.busyRedirecting": "이동 중…",
    "register.busyUploading": "업로드 중…",
    "register.footerNote":
      "Sensora Auto CRM · SMS 발신 요금 없음 · Firebase Spark(무료) 한도는 사용량에 따라 달라질 수 있습니다.",
    "register.fallbackUnavailableTitle": "영업 계정 등록은 준비 중입니다.",
    "register.fallbackUnavailableBody":
      "Sensora Auto CRM은 현재 베타 신청을 먼저 받고 있습니다.\n베타 신청을 남겨주시면 검토 후 순차적으로 안내드리겠습니다.",
    "register.linkBetaSignup": "베타 신청으로 이동하기",
    "register.firebaseDevHint":
      "개발 전용: Firebase 클라이언트 설정값이 비어 있습니다. 로컬 .env.local 또는 문서를 확인하세요.",
    "register.access.checking": "베타 신청 승인 여부를 확인하는 중입니다…",
    "register.access.pendingTitle": "베타 승인 대기 중입니다.",
    "register.access.pendingBody":
      "신청 내용을 확인한 뒤 순차적으로 안내드리겠습니다.",
    "register.access.notFoundTitle": "베타 신청 내역을 찾을 수 없습니다.",
    "register.access.notFoundBody": "먼저 베타 신청을 남겨주세요.",
    "register.access.rejectedTitle": "베타 사용 승인이 완료되지 않았습니다.",
    "register.access.rejectedBody": "현재 계정은 베타 사용 대상에 포함되지 않았습니다.",
    "register.access.errorTitle": "베타 승인 여부를 확인하지 못했습니다.",
    "register.access.errorBody":
      "네트워크 또는 설정 문제일 수 있습니다. 잠시 후 다시 시도해 주세요. 문제가 이어지면 베타 신청 경로를 통해 문의해 주세요.",
    "register.access.goJoin": "베타 신청하러 가기",
    "register.access.goHome": "홈으로 돌아가기",
    "register.access.betaCheckEmailLabel": "현재 확인 중인 이메일",
    "register.access.betaCheckEmailGoogleNote":
      "위 주소는 지금 브라우저에 로그인된 Google 계정 이메일입니다. 베타 신청 시 남긴 이메일과 같아야 승인 완료로 표시됩니다.",
    "crm.stat.todayFollowups": "오늘 연락",
    "crm.stat.dealProbability": "계약 가능성",
    "crm.stat.followupNeeded": "예정된 할 일",
    "crm.stat.recentConsultations": "최근 상담",
    "crm.demoContextNotice.primary":
      "이 화면은 자동차 영업사원이 상담 메모, 관심 차량, 다음 연락, 사후관리를 한 곳에서 정리하는 예시 화면입니다.",
    "crm.demoContextNotice.secondary":
      "AI는 상담 내용을 정리하고 검토용 초안을 제안하지만, 최종 확인과 저장은 사용자가 직접 합니다.",
    "crm.demoContextNotice.accessAfterBeta":
      "실제 고객 저장과 영업 계정 기능은 베타 승인 후 사용할 수 있습니다.",
    "crm.previewMode.headerSubtitle":
      "예시 미리보기 · 화면을 닫기 전까지는 이 브라우저에만 예시 데이터가 남을 수 있습니다(클라우드·영업 계정 저장 아님).",
    "crm.previewGate.title": "베타 승인 후 사용할 수 있는 기능입니다.",
    "crm.previewGate.body":
      "고객 추가, AI 비서, 실제 저장 기능은 베타 신청 후 승인된 사용자에게 제공됩니다. 먼저 베타 신청을 남겨주시면 검토 후 순차적으로 안내드리겠습니다.",
    "crm.previewGate.join": "베타 신청하기",
    "crm.previewGate.register": "영업 계정 등록",
    "crm.previewGate.continuePreview": "미리보기 계속 보기",
    "crm.guideTip.body":
      "처음 보는 분도 쉽게 이해할 수 있도록, 핵심 사용 흐름을 이미지로 정리했습니다.",
    "crm.guideTip.openViewer": "가이드 보기",
    "crm.sensoraTip.openButton": "Sensora TIP",
    "crm.import.heroTitle": "주소록 가져오기",
    "crm.import.heroSub": "연락처 파일을 올리고, 필요한 고객만 확인해 저장합니다.",
    "crm.import.trustNoSync": "전체 주소록을 자동 동기화하지 않습니다.",
    "crm.import.trustUserChoice":
      "사용자가 선택한 파일만 확인하고, 저장할 고객도 직접 선택합니다.",
    "crm.import.step1Title": "연락처 파일 준비",
    "crm.import.step1Desc": "iPhone, Galaxy, Google 연락처에서 CSV 또는 vCard 파일을 준비합니다.",
    "crm.import.step2Title": "파일 올리기",
    "crm.import.step2Desc": "선택한 연락처 파일만 업로드합니다.",
    "crm.import.step3Title": "확인 후 저장",
    "crm.import.step3Desc": "미리보기에서 필요한 고객만 확인하고 저장합니다.",
    "crm.import.ctaUpload": "연락처 파일 올리기",
    "crm.import.ctaGuide": "준비 방법 보기",
    "crm.import.footerPrinciples":
      "가져오기·선택·저장은 사용자가 직접 하며, Sensora는 고객 정보를 임의로 저장하지 않습니다.",
    "crm.import.iosFileHint": "iPhone에서는 연락처 파일을 준비한 뒤 올리는 방식을 권장합니다.",
    "crm.import.iosTabShortcut": "iPhone·iCloud 안내",
    "crm.import.pasteShort": "파일 대신 CSV·vCard 글자를 붙여넣을 수도 있습니다.",
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
    "crm.nav.mobileSubtitle.dashboard": "오늘의 흐름",
    "crm.nav.mobileSubtitle.customers": "목록·상태",
    "crm.nav.mobileSubtitle.consulting": "직접 수정",
    "crm.nav.mobileSubtitle.ai": "초안·정리",
    "crm.nav.mobileSubtitle.pipeline": "단계별",
    "crm.nav.mobileSubtitle.vehicle": "조건·예산",
    "crm.nav.mobileSubtitle.followup": "할 일·일정",
    "crm.nav.mobileSubtitle.settings": "계정·언어",
    "crm.workspaceAi.title": "AI 비서 (작업)",
    "crm.workspaceAi.subtitle":
      "「다시 분석」 등 버튼을 눌렀을 때만 새 제안이 만들어집니다. 저장·복사·다음 연락 등은 확인 후 원하는 항목만 적용하세요.",
    "crm.workspaceAi.customerPickLabel": "고객",
    "crm.workspaceAi.selectPlaceholder": "고객을 선택해 주세요",
    "crm.workspaceAi.pickCustomer": "워크플로를 시작하려면 고객을 선택하거나 새로 추가하세요.",
    "crm.workspaceAi.memoLabel": "상담 메모",
    "crm.workspaceAi.toneLabel": "문구 톤",
    "crm.workspaceAi.consultSummaryHeading": "상담 요약",
    "crm.workspaceAi.consultSummaryLead": "케어 코치 카드와 별개로, 상담 진행 요약입니다.",
    "crm.workspaceAi.needsHeading": "고객 니즈",
    "crm.workspaceAi.customerNeedsHelper": "메모·배려 맥락에서 읽힌 포인트",
    "crm.workspaceAi.customerNeedsPlaceholder":
      "메모에 승차감·가족·금융 등 구체 맥락이 있으면, AI 비서 카드에 배려·관심 포인트가 표시됩니다.",
    "crm.workspaceAi.nextActionLead": "전화·문자 전 확인할 업무 순서 제안입니다.",
    "crm.workspaceAi.salesHeading": "다음 행동",
    "crm.workspaceAi.smsHeading": "검토용 문자 초안",
    "crm.workspaceAi.smsDraftLead": "발송 전 수정·검토하는 초안입니다.",
    "crm.workspaceAi.copySms": "문자 복사",
    "crm.workspaceAi.saveMemo": "CRM에 저장",
    "crm.workspaceAi.saveToast": "상담 메모가 저장되었습니다.",
    "crm.workspaceAi.createFollowUp": "다음 연락 만들기",
    "crm.workspaceAi.followUpToast": "다음 연락이 추가되었습니다.",
    "crm.workspaceAi.smsCopyToast": "문자 초안을 복사했습니다.",
    "crm.workspaceAi.followUpDefaultTitle": "다음 연락",
    "crm.workspaceAi.analyzing": "정리 중…",
    "crm.sensoraFlow.banner":
      "Sensora Flow · AI 제안은 미리보기일 뿐이며 저장된 CRM 데이터와 분리되어 있습니다. AI는 명시 버튼(다시 분석·문자 다시 작성)을 눌렀을 때만 새 제안을 만듭니다. 메모 수정 중에는 자동 재분석·자동 덮어쓰기를 하지 않습니다.",
    "crm.sensoraFlow.memoUserEditableHint": "저장 후 고객 상세에서 언제든 직접 수정 가능합니다.",
    "crm.sensoraFlow.memoStaleHint": "메모가 마지막 분석본과 다릅니다. 제안 맞춤을 위해 「다시 분석」 또는 「제안 새로 만들기」를 눌러 주세요.",
    "crm.sensoraFlow.toneHintsReanalyze": "문구 톤을 바꾼 경우에도 새 제안을 보려면 분석 버튼이 필요합니다.",
    "crm.sensoraFlow.aiSuggestionBadge": "AI 제안",
    "crm.sensoraFlow.appliedEditableHint":
      "적용되어 CRM에 들어 간 메모·다음 행동·발송 문자는 같은 화면·고객 상세에서 직접 고칩니다. 수정 중 AI가 자동으로 끼어들지 않습니다.",
    "crm.sensoraFlow.previewEmptyHint": "아래에서 「다시 분석」 또는 「제안 새로 만들기」로 제안 카드를 채워 주세요.",
    "crm.sensoraFlow.needMemoForAnalyze": "메모 내용을 먼저 입력해 주세요.",
    "crm.sensoraFlow.analyzeAgain": "다시 분석",
    "crm.sensoraFlow.newProposal": "제안 새로 만들기",
    "crm.sensoraFlow.rewriteSms": "문자 다시 작성",
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
    "landing.feature.memory.desc": "상담 메모를 기준으로 니즈·영업 포인트·발송 문장 초안을 한 화면에 정리합니다.",
    "landing.feature.followup.title": "시즌 케어 메시지",
    "landing.feature.followup.desc": "계절·점검·안부 명분에 맞춰, 짧은 메시지 초안을 차분한 톤으로 정리합니다.",
    "landing.feature.delivery.title": "출고 안내서",
    "landing.feature.delivery.desc": "인도 일정과 준비 항목을 한 흐름으로 정리해, 고객 안내를 빠뜨리지 않게 만듭니다.",
    "landing.aiDemo.sectionTitle": "AI 비서 체험하기",
    "landing.aiDemo.sectionDesc":
      "상담 메모를 입력하면 검토용 요약과 다음 진행 초안을 정리해 드립니다. 적용 여부는 직접 선택합니다.",
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
    "landing.aiDemo.simpleHint": "짧게 입력하면 바로 초안 형태만 미리 확인할 수 있어요. 저장·다음 연락은 워크스페이스에서 이어지면 됩니다.",
    "landing.aiDemo.previewHeading": "결과 미리보기",
    "landing.aiDemo.continueInWorkspace": "앱 워크스페이스에서 계속하기",
    "landing.aiDemo.loadSampleSnippet": "예시 문장 불러오기",
    "landing.aiDemo.previewWorkspaceNote":
      "실제 저장·복사·다음 연락은 워크스페이스의 AI 비서 화면에서 이어 할 수 있습니다.",
    "landing.crmDemo.sectionTitle": "고객관리 흐름을 한 화면에",
    "landing.crmDemo.sectionDesc":
      "오늘 연락할 고객, 계약 가능성, 상담 요약, 출고 안내서를 한 번에 확인합니다.",
    "landing.crmDemo.startCta": "고객관리 시작하기",
    "landing.showroom.hero.quietFuture": "실무 현장 안내형",
    "landing.showroom.hero.senseAuraTag": "Sense · Aura",
    "landing.showroom.hero.kickerBadge": "자동차 영업사원 업무용",
    "landing.showroom.hero.headline": "자동차 영업사원을 위한\nAI 고객관리 워크스페이스",
    "landing.showroom.hero.headlineLine1": "자동차 영업사원을 위한",
    "landing.showroom.hero.headlineLine2": "AI 고객관리 워크스페이스",
    "landing.showroom.hero.sub":
      "상담부터 사후관리까지 한 흐름으로 관리합니다.\n\nAI는 초안을 돕고, 최종 판단은 영업사원이 합니다.",
    "landing.showroom.bridge.line1": "상담은 기록으로,",
    "landing.showroom.bridge.line2": "기록은 다음 행동으로.",
    "landing.showroom.header.subline": "자동차 영업사원을 위한 AI 고객관리 워크스페이스",
    "landing.showroom.heroDash.windowSubline": "오늘의 연락 · 업무 요약",
    "landing.showroom.heroDash.greetingLine": "오늘 진행하면 좋은 일이에요",
    "landing.showroom.heroDash.greetingSub": "연락 우선 확인과 검토용 초안을 한 화면에 모았습니다.",
    "landing.showroom.heroDash.detailCta": "상세 보기",
    "landing.showroom.heroDash.messageCta": "메시지 보기",
    "landing.showroom.heroDash.todayTitle": "오늘 연락 대상",
    "landing.showroom.heroDash.todaySnippet": "시승 후 금융 조건 검토 예정",
    "landing.showroom.heroDash.priorityTitle": "우선 확인할 고객",
    "landing.showroom.heroDash.prioritySnippet": "관심 차량과 예산 조건이 정리된 고객",
    "landing.showroom.heroDash.followupTitle": "후속 연락 필요",
    "landing.showroom.heroDash.followupSnippet": "출고 안내 후 사후관리 예정",
    "landing.showroom.heroDash.aiDraftTitle": "AI 제안 메시지",
    "landing.showroom.heroDash.aiDraftSnippet": "상담 내용을 바탕으로 검토용 문자 초안을 제안합니다.",
    "landing.showroom.heroDash.summaryTitle": "최근 상담 요약",
    "landing.showroom.heroDash.summarySnippet":
      "관심 차량, 예산, 희망 출고 시점, 다음 연락 일정을 한눈에 정리합니다.",
    "landing.showroom.heroMock.previewBadge": "미리보기",
    "landing.showroom.heroMock.greeting": "김현우 매니저님, 오늘도 좋은 하루 보내세요!",
    "landing.showroom.heroMock.draftLabel": "초안",
    "landing.showroom.heroMock.nav.home": "홈",
    "landing.showroom.heroMock.nav.customers": "고객",
    "landing.showroom.heroMock.nav.consult": "상담",
    "landing.showroom.heroMock.nav.schedule": "일정·알림",
    "landing.showroom.heroMock.nav.messages": "메시지",
    "landing.showroom.heroMock.nav.aiAssistant": "AI 도우미",
    "landing.showroom.heroMock.nav.stats": "통계",
    "landing.showroom.heroMock.nav.settings": "설정",
    "landing.showroom.flow.title": "상담에서 다음 연락까지, 한 흐름으로",
    "landing.showroom.flow.desc":
      "상담 → 니즈 → 발송 문자 → 다음 연락 순으로 업무 블록을 이어 두어 바쁜 딜플로어에서 빠져나가지 않게 합니다.",
    "landing.showroom.flow.mock.contactTitle": "상담 정리 · 기록",
    "landing.showroom.flow.mock.contactBody": "김민준 시승 상담 · 견적 단계 진입 · 회신 대기 확인",
    "landing.showroom.flow.mock.needsTitle": "고객 니즈 요약",
    "landing.showroom.flow.mock.needsBody": "패밀리 이동, 승하차 편의, 월 부담·보증 선택지 비교 필요",
    "landing.showroom.flow.mock.smsTitle": "발송 문자",
    "landing.showroom.flow.mock.smsBody":
      "지난번 말씀 기준으로 정리했습니다. 오늘 잠깐이라도 시간 내주시면 조건 초안 차분히 안내드리겠습니다.",
    "landing.showroom.flow.mock.followupTitle": "다음 연락",
    "landing.showroom.flow.mock.followupBody": "내일 오전 11시 재연락 · 전화",
    "landing.showroom.guide.title": "고객의 신호가 영업 액션으로 이어지는 지점입니다.",
    "landing.showroom.guide.desc": "메모에서 응대 포인트를 정리해 SensoraGuide가 검토용 제안으로 이어 줍니다.",
    "landing.showroom.guide.memoLabel": "상담 메모",
    "landing.showroom.guide.memoQuote": "가족 이동이 많고 승하차 편의성을 중요하게 보심.",
    "landing.showroom.guide.guideQuote": "2열 공간, 승하차 동선, 탑승 편안함을 중심으로 안내하세요.",
    "landing.showroom.features.title": "영업 현장 업무가 덜 헤매도록 돕습니다",
    "landing.showroom.closing.desc":
      "상담·고객 응대·사후관리까지 한 흐름으로 묶어, 오늘 해야 할 일을 분명하게 보여 줍니다.",
    "landing.showroom.tip.title": "Sensora 알아가면 좋은 TIP",
    "landing.showroom.tip.subtitle":
      "처음 보는 분도 쉽게 이해할 수 있도록, 핵심 내용을 이미지로 정리했습니다.",
    "landing.showroom.tip.card1.title": "이용 시작 방법",
    "landing.showroom.tip.card1.desc":
      "베타 신청부터 승인, 계정 등록 후 사용까지의 흐름을 확인하세요.",
    "landing.showroom.tip.card2.title": "기능 설명",
    "landing.showroom.tip.card2.desc": "Sensora Auto CRM의 핵심 기능을 한눈에 확인할 수 있습니다.",
    "landing.showroom.tip.card3.title": "실제 사용 흐름",
    "landing.showroom.tip.card3.desc": "상담부터 사후관리까지 실제 사용 흐름을 단계별로 살펴보세요.",
    "landing.showroom.tip.card4.title": "베타 사용 안내",
    "landing.showroom.tip.card4.desc": "베타 사용 시 유의사항과 활용 팁을 안내합니다.",
    "landing.showroom.tip.close": "닫기",
    "landing.showroom.tip.closeOverlay": "가이드 닫기",
    "landing.showroom.tip.guideWord": "가이드",
    "landing.showroom.tip.imageMissing":
      "가이드 이미지를 불러오지 못했습니다. 곧 이미지를 추가하면 이 자리에 표시됩니다.",
    "landing.showroom.tip.prev": "이전 가이드",
    "landing.showroom.tip.next": "다음 가이드",
    "landing.showroom.tip.openOriginal": "원본 크게 보기",
    "landing.showroom.tip.openOriginalAria": "현재 가이드를 원본 크기로 새 탭에서 엽니다.",
    "landing.showroom.tip.openOriginalHint": "이미지를 누르면 원본 크기로 볼 수 있습니다. 핀치로 확대해 글자를 확인해 보세요.",
    "preview.toc.title": "앱 화면을 미리 살펴보세요.",
    "preview.toc.subtitle": "아래 항목을 선택하면 예시 화면으로 이동합니다.",
    "preview.toc.disclaimer1": "표시되는 내용은 예시 화면입니다.",
    "preview.toc.disclaimer2": "미리보기에서는 실제 고객 정보가 서버에 저장되지 않습니다. (로컬 데모)",
    "preview.toc.disclaimer3": "실제 고객 저장과 계정 기능은 베타 승인 후 사용할 수 있습니다.",
    "preview.toc.disclaimer4":
      "AI는 검토용 초안을 제안합니다. 최종 표현과 판단은 항상 영업사원이 합니다.",
    "preview.toc.close": "닫기",
    "preview.toc.openDashboard": "전체 요약부터 보기",
    "preview.toc.summaryTitle": "전체 요약 보기",
    "preview.toc.summaryDesc": "오늘의 연락·일정·최근 상담 흐름을 한눈에 봅니다.",
    "preview.toc.customersTitle": "고객관리 보기",
    "preview.toc.customersDesc": "고객 목록과 관심 차량, 상태를 확인합니다.",
    "preview.toc.notesTitle": "상담 메모 보기",
    "preview.toc.notesDesc": "상담 내용을 정리하고 다시 확인합니다.",
    "preview.toc.aiTitle": "AI 비서 보기",
    "preview.toc.aiDesc": "상담 메모를 바탕으로 요약과 검토용 초안을 확인합니다.",
    "preview.toc.followupTitle": "사후관리 보기",
    "preview.toc.followupDesc": "다음 연락과 출고 안내를 놓치지 않게 정리합니다.",
    "preview.toc.betaTitle": "베타 신청하기",
    "preview.toc.betaDesc": "실제 저장 기능과 영업 계정은 베타 승인 후 사용할 수 있습니다.",
    "preview.flow.step1.intro":
      "자동차 영업 현장의 상담·고객 기록·다음 연락을 한 흐름에서 정리합니다. 아래는 예시 화면으로, 실제 저장은 베타 승인 후에 가능합니다.",
    "preview.flow.step1.startCta": "앱 시작하기",
    "preview.flow.step1.registerCta": "영업 계정 등록",
    "preview.flow.step2.headline": "무엇을 도와드릴까요?",
    "preview.flow.step2.sub": "실제 기능은 업무 화면에서 순서대로 열립니다.",
    "preview.flow.step2.card.customersTitle": "고객관리",
    "preview.flow.step2.card.customersDesc": "상담 메모와 관심 차량을 한 흐름으로 정리합니다.",
    "preview.flow.step2.card.aiTitle": "AI 비서",
    "preview.flow.step2.card.aiDesc": "상담 내용을 바탕으로 검토용 초안을 제안합니다.",
    "preview.flow.step2.card.followTitle": "사후관리",
    "preview.flow.step2.card.followDesc": "다음 연락·출고 안내 같은 일정을 놓치지 않게 돕습니다.",
    "preview.flow.step3.headline": "한 번 기록하면, 다음 행동까지 이어집니다.",
    "preview.flow.step3.sub":
      "예시 미리보기입니다. 선택한 화면에서 흐름을 둘러본 뒤, 저장이 필요하면 베타 신청을 검토해 주세요.",
    "preview.flow.step3.enterWorkspace": "업무 화면으로 들어가기",
    "preview.flow.step3.enterAi": "AI 비서 화면으로",
    "preview.flow.footer.prev": "이전",
    "preview.flow.footer.next": "다음",
    "preview.flow.storyRailTitle": "예시 속 흐름",
    "preview.guide.pageTitle": "기능 안내",
    "preview.guide.headerKicker": "앱 미리보기",
    "preview.guide.headerSub": "아래 카드로 안내 이미지를 바꿀 수 있습니다. 큰 이미지를 누르면 자세히 볼 수 있습니다.",
    "preview.guide.tapMainToExpand": "탭하여 크게 보기",
    "preview.guide.viewerTitle": "가이드 이미지",
    "guide.sensora-guide-01.title": "실제 사용 흐름",
    "guide.sensora-guide-01.desc": "상담 기록부터 고객 요약, 메시지, 일정까지 한 흐름으로 이어집니다.",
    "guide.sensora-guide-02.title": "저장과 검토 원칙",
    "guide.sensora-guide-02.desc":
      "고객 정보는 사용자가 확인한 뒤 저장합니다. 초안만 덧씌우지 않으며, 바로 저장되지 않는 흐름을 지향합니다.",
    "guide.sensora-guide-03.title": "이용 시작 방법",
    "guide.sensora-guide-03.desc": "베타 신청부터 승인·계정 등록 후 업무 화면까지 진행되는 단계 안내입니다.",
    "guide.sensora-guide-04.title": "Sensora 전체 구조",
    "guide.sensora-guide-04.desc": "고객관리, AI 비서, 일정, 사후관리를 한 업무 표면에서 묶어둔 구조 소개입니다.",
    "guide.sensora-guide-05.title": "Sensora 비주얼 레퍼런스",
    "guide.sensora-guide-05.desc": "Sensora의 미래형 UI 분위기를 보여주는 보조 이미지입니다.",
    "guide.unified.pageTitle": "Sensora 안내·온보딩",
    "guide.unified.header.kicker": "Sensora 안내",
    "guide.unified.header.sub": "4단계로 소개 예시 안내 이미지를 이어 확인할 수 있습니다. 마지막에서 업무 화면 또는 계정 안내를 선택합니다.",
    "guide.unified.intro.title": "Sensora Auto CRM",
    "guide.unified.intro.body":
      "전시장·상담 현장에서 고객 이야기와 다음 연락, 보낼 문구까지 한곳에 이어 둘 수 있습니다.\n기록을 쌓아 가면 오늘 할 일이 더 선명해집니다.",
    "guide.unified.flow.kicker": "예시 화면 · 4단계 중 3",
    "guide.unified.flow.title": "실제 사용 흐름",
    "guide.unified.flow.lead":
      "큰 미리보기와 카드에서 예시를 고릅니다. 이미지를 누르면 이 화면 안에서 크고 선명하게 봅니다.",
    "guide.unified.flow.rail": "상담 정리 · 고객 니즈 요약 · 발송 문자 · 다음 연락",
    "guide.unified.guideNav.prev": "이전 안내",
    "guide.unified.guideNav.next": "다음 안내",
    "guide.unified.start.title": "시작하기",
    "guide.unified.start.lead":
      "준비되셨으면 업무 화면이나 AI 비서로 들어가거나, 영업 계정 등록과 베타 신청 안내를 이어가실 수 있습니다.",
    "guide.unified.disclaimer": "예시 화면이며 저장은 베타 승인·계정 준비 후 제공 경로에서 가능합니다. 메뉴나 문구는 베타에서 달라질 수 있습니다.",
    "preview.diagram.caption.security": "불러온 연락처는 미리보기·검토 후 저장됩니다.",
    "preview.diagram.caption.workspace": "베타·영업 계정 흐름을 거친 뒤 동일 계정으로 업무 화면이 열립니다.",
    "preview.diagram.caption.hub": "고객·상담·일정·문자를 한 화면 구조로 오갑니다.",
    "preview.diagram.security.view": "보기",
    "preview.diagram.security.review": "검토",
    "preview.diagram.security.confirm": "확인",
    "preview.diagram.security.save": "저장·승인",
    "preview.diagram.path.register": "등록",
    "preview.diagram.path.approve": "승인",
    "preview.diagram.path.setup": "초기 설정",
    "preview.diagram.path.workspace": "업무 화면",
    "preview.diagram.hub.core": "워크스페이스 허브",
    "preview.diagram.hub.customers": "고객관리",
    "preview.diagram.hub.ai": "AI 비서",
    "preview.diagram.hub.messages": "메시지",
    "preview.diagram.hub.schedule": "일정",
    "preview.diagram.hub.aftercare": "사후관리",
    "preview.diagram.consult.memo": "상담 메모",
    "preview.diagram.consult.needs": "니즈 정리",
    "preview.diagram.consult.draft": "보낼 문구 초안",
    "preview.diagram.consult.next": "다음 연락 제안",
    "concept.story.security.title": "확인하고 저장하기",
    "concept.story.security.desc": "연락처는 직접 선택·파일 업로드로만 불러오고, 저장 전에 미리보기로 확인합니다.",
    "concept.story.path.title": "가입 → 승인 → 업무 화면",
    "concept.story.path.desc": "베타 신청과 영업 계정 등록 흐름을 거친 뒤, 동일 계정으로 워크스페이스를 엽니다.",
    "concept.story.hub.title": "고객·일정·문자 한 허브",
    "concept.story.hub.desc": "고객 목록, 상담 메모, 일정·다음 연락을 탭으로 오갈 수 있는 구조입니다.",
    "concept.story.memo.title": "메모에서 다음 행동까지",
    "concept.story.memo.desc": "상담 메모를 바탕으로 니즈 정리·보낼 문구 초안·다음 연락 제안을 이어서 봅니다.",
    "landing.showroom.concept.sectionTitle": "Sensora로 이어지는 흐름",
    "landing.showroom.concept.sectionSub": "이미지를 누르면 크게 볼 수 있습니다. 예시 화면이며 실제 고객 데이터는 저장되지 않습니다.",
    "landing.showroom.concept.tapToExpand": "탭하여 확대",
    "settings.display.title": "화면 설정",
    "settings.textSize.title": "글씨 크기",
    "settings.textSize.description": "앱에서 보이는 글자의 크기를 조정합니다.",
    "settings.textSize.small.label": "작게",
    "settings.textSize.small.description": "한 화면에 더 많이 보기",
    "settings.textSize.medium.label": "기본",
    "settings.textSize.medium.description": "균형 있게 보기",
    "settings.textSize.large.label": "크게",
    "settings.textSize.large.description": "편하게 크게 보기",
    "settings.textSize.storageNotice": "글씨 크기는 이 브라우저에 저장됩니다.",
    "cover.aiGuide.title": "AI 사용법",
    "cover.aiGuide.subtitle":
      "상담 내용을 입력하면 SensoraGuide가 요약과 다음 진행 초안·연락 문구를 검토용으로 정리합니다.",
    "cover.aiGuide.step1.title": "상담 메모 입력",
    "cover.aiGuide.step1.desc": "고객과 나눈 대화, 관심 차량, 예산, 구매 시기 등을 편하게 기록하세요.",
    "cover.aiGuide.step2.title": "AI 요약 확인",
    "cover.aiGuide.step2.desc": "SensoraGuide가 핵심 니즈와 구매 검토 포인트를 정리합니다.",
    "cover.aiGuide.step3.title": "다음 액션 추천",
    "cover.aiGuide.step3.desc": "언제 어떻게 연락하면 좋을지 초안을 정리합니다. 최종 판단은 영업사원이 합니다.",
    "cover.aiGuide.step4.title": "메시지와 출고 안내서 활용",
    "cover.aiGuide.step4.desc": "추천 문구와 출고 안내서를 고객 응대에 바로 활용할 수 있습니다.",
    "cover.aiGuide.tryCta": "AI 비서 체험하기",
    "cover.aiGuide.startCta": "고객관리 시작하기",
    "cover.aiGuide.memoExampleHint": "상담 메모 예시는 홈 `#ai-demo`에서 바로 불러올 수 있어요.",
    "cover.onboarding.page1.title": "Sensora Auto CRM",
    "cover.onboarding.page1.description":
      "전시장·상담 현장에서 고객 이야기와 다음 연락, 보낼 문구까지 한곳에 이어 둘 수 있습니다.\n기록을 쌓아 가면 오늘 할 일이 더 선명해집니다.",
    "cover.onboarding.page2.title": "무엇을 도와드릴까요?",
    "cover.onboarding.page2.customer": "고객관리\n상담 메모와 관심 차량을 한 흐름으로 정리합니다.",
    "cover.onboarding.page2.ai": "AI 비서\n상담 내용을 바탕으로 검토용 초안을 제안합니다.",
    "cover.onboarding.page2.followup": "사후관리\n다음 연락과 출고 안내를 놓치지 않도록 돕습니다.",
    "cover.onboarding.page2.season":
      "시즌 케어 메시지\n계절·명분에 맞는 고객 메시지 초안을 차분하게 준비합니다.",
    "cover.onboarding.page2.delivery": "출고 안내서\n출고 전후 고객 안내와 체크 항목을 문서처럼 정리합니다.",
    "cover.onboarding.page3.title": "한 번 기록하면, 다음 행동까지 이어집니다.",
    "cover.onboarding.page3.description":
      "상담 메모를 남기면 Sensora AI 비서 화면에서 요약과 보낼 문장 초안을 검토용으로 제안합니다.\n제안은 참고용이며, 저장·수정은 항상 본인이 결정합니다.",
    "cover.onboarding.next": "다음",
    "cover.onboarding.prev": "이전",
    "cover.onboarding.start": "시작하기",
    "cover.onboarding.close": "닫기",
    "cover.onboarding.startApp": "앱 시작하기",
    "cover.onboarding.goWorkspace": "바로 업무 화면",
    "cover.onboarding.page3.workspaceCta": "업무 화면으로 들어가기",
    "cover.onboarding.page3.aiCta": "AI 비서 화면으로",
    "cover.onboarding.themeLabel": "화면 표현 스타일",
    "cover.onboarding.themeHint":
      "표지 화면의 분위기만 바꿉니다. 자연은 은은한 색감, 흑백은 낮은 채도 톤입니다.",
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
    "brand.identity": "Work software for automotive sales teams",
    "brand.subline": "Automotive sales workspace",
    "product.shortDesc": "AI customer management SaaS for automotive sales professionals.",
    "hero.description":
      "Sensora organizes customer conversations, vehicle interests, follow-ups, message drafts, and sales pipelines with AI.",
    "cta.joinBeta": "Join the Beta",
    "cta.tryAppExperience": "Preview app screens",
    "cta.openAppWorkspace": "Open the Workspace",
    "cta.viewDemo": "View Demo",
    "cta.tryAIDemo": "Try the AI Assistant",
    "header.cover": "Cover",
    "header.landing": "Landing",
    "header.workspace": "Workspace",
    "header.zoomHint": "Zoom · Ctrl/Cmd + +/-, reset · Ctrl/Cmd + 0",
    "auth.checkingLogin": "Checking sign-in…",
    "auth.signOut": "Sign out",
    "auth.salesRegistration": "Sales registration",
    "join.title": "Join the Beta",
    "join.intro":
      "We’re inviting applications for Sensora Auto CRM beta access.\nWe’ll review what you submit and follow up with you in order.",
    "join.backHome": "Back to home",
    "join.loading": "Loading…",
    "join.formLegend": "Sensora Auto CRM beta request form",
    "join.fillAllFields": "Please fill in all fields.",
    "join.invalidEmail": "Please check your email format.",
    "form.name": "Name",
    "form.contact": "Contact Number",
    "form.email": "Email",
    "form.dealership": "Brand / Showroom",
    "form.currentCrm": "Current Customer Management Method",
    "form.motivation": "Why You Want to Try Sensora",
    "join.submit": "Submit beta signup",
    "join.submitting": "Submitting…",
    "join.trustNoticeLine1":
      "The information you enter is used only for beta communications and to confirm your details.",
    "join.trustNoticeLine2": "Sensora does not automatically collect your customers’ contacts or CRM data.",
    "join.trustNoticeLine3": "Customer records stay under your review: you confirm and save anything that’s stored.",
    "join.alert.betaReceivedRemote": "Thanks — your beta signup was received.",
    "join.alert.betaNotPersisted":
      "Your test submission is complete.\nSaving to our systems isn’t connected yet.",
    "join.alert.betaSaveFailed": "Something went wrong while submitting. Please try again in a moment.",
    "join.devBetaEndpointHint":
      "Dev only: set NEXT_PUBLIC_BETA_SIGNUP_ENDPOINT (e.g. a Google Apps Script web app URL) to POST submissions to a sheet/webhook. If unset, submit actions are not sent remotely.",
    "register.title": "Sales Account Registration",
    "register.continueWithGoogle": "Continue with Google",
    "register.intro":
      "Register the sales account details we need for Sensora Auto CRM.\nWhat you enter is used only to verify your account and communicate beta approval status.",
    "register.flowLeadGoogleOn":
      "After you sign in with Google, upload a business-card photo you chose or took—then our team can review it.",
    "register.flowLeadGoogleOff":
      "Google sign-in for registration is temporarily unavailable. From the home screen you can still try local-save (MVP) mode.",
    "register.trustNoticeLine1":
      "Information you submit is used only to verify your sales account and send beta approval updates.",
    "register.trustNoticeLine2":
      "Sensora does not automatically collect your customers’ contacts or CRM data.",
    "register.stepIdentify": "Confirm your account with Google sign-in (no SMS codes).",
    "register.stepCard":
      "You photograph or pick the card image file yourself, then upload it—we don’t pull contacts automatically.",
    "register.stepInfrastructure":
      "Firestore and Storage are easiest to stay within the free Spark quotas.",
    "register.errorGoogleDisabled": "Google sign-in is temporarily disabled.",
    "register.errorFirebaseEnv": "Registration can’t continue on this screen right now. Please use the beta signup form.",
    "register.errorPickCard": "Please choose a business-card image.",
    "register.errorLoginFirst": "Please sign in with Google first.",
    "register.errorUploadFailed": "Upload failed.",
    "register.loadingProfile": "Loading account status…",
    "register.pendingTitle": "Your card is submitted and under review.",
    "register.pendingBody":
      "Once approved, you can open the workspace from the home screen with the same account.",
    "register.linkMain": "Go to home",
    "register.doneTitle": "We received your card.",
    "register.doneBody":
      "Stay signed in with the same Google account until approval—the workspace unlocks right after.",
    "register.linkWorkspace": "Back to start",
    "register.uploadLead":
      "Choose a clear photo of one card—something you captured or selected yourself.",
    "register.uploadLeadRetry": "Submitting again—please finish the upload.",
    "register.buttonSubmitCard": "Submit card for review",
    "register.busyRedirecting": "Redirecting…",
    "register.busyUploading": "Uploading…",
    "register.footerNote":
      "Sensora Auto CRM · no SMS sending charges · Firebase Spark free-tier limits depend on usage.",
    "register.fallbackUnavailableTitle": "Sales account registration isn’t available yet.",
    "register.fallbackUnavailableBody":
      "Sensora Auto CRM is currently taking beta signup requests first.\nSubmit your request and we’ll follow up after review.",
    "register.linkBetaSignup": "Go to beta signup",
    "register.firebaseDevHint":
      "Dev only: Firebase client config is missing. Check .env.local or internal docs.",
    "register.access.checking": "Checking your beta approval status…",
    "register.access.pendingTitle": "Your beta signup is awaiting approval.",
    "register.access.pendingBody":
      "We’ll review your request and reach out in turn.",
    "register.access.notFoundTitle": "We couldn’t find a beta signup for this email.",
    "register.access.notFoundBody": "Please submit a beta request first.",
    "register.access.rejectedTitle": "Beta approval wasn’t granted for this account.",
    "register.access.rejectedBody": "This account isn’t included in the current Sensora beta.",
    "register.access.errorTitle": "We couldn’t verify beta approval.",
    "register.access.errorBody":
      "This may be a network or setup issue. Try again shortly, or contact us via the beta signup flow if it keeps happening.",
    "register.access.goJoin": "Go to beta signup",
    "register.access.goHome": "Back to home",
    "register.access.betaCheckEmailLabel": "Email being checked",
    "register.access.betaCheckEmailGoogleNote":
      "This is the Google account email signed into this browser. It must match the email on your beta signup to show as approved.",
    "crm.stat.todayFollowups": "Today’s Follow-ups",
    "crm.stat.dealProbability": "Deal Probability",
    "crm.stat.followupNeeded": "Follow-up Needed",
    "crm.stat.recentConsultations": "Recent Consultations",
    "crm.demoContextNotice.primary":
      "This is a sample CRM layout for automotive sales reps—consultation notes, interested vehicles, follow-ups, and aftercare in one place.",
    "crm.demoContextNotice.secondary":
      "AI summarizes memos and suggests drafts for review; you decide what to confirm and save.",
    "crm.demoContextNotice.accessAfterBeta":
      "Saving real customer data and sales-account features are available after beta approval.",
    "crm.previewMode.headerSubtitle":
      "Sample preview · example data may stay in this browser only until you leave (not cloud or sales-account storage).",
    "crm.previewGate.title": "This feature is available after beta approval.",
    "crm.previewGate.body":
      "Adding customers, the AI assistant, and real save features are available to approved beta users. Submit a beta request first—we’ll review and follow up in order.",
    "crm.previewGate.join": "Join the beta",
    "crm.previewGate.register": "Sales account registration",
    "crm.previewGate.continuePreview": "Continue preview",
    "crm.guideTip.body":
      "We distilled the essentials into images so newcomers can skim the workflow quickly.",
    "crm.guideTip.openViewer": "View guide",
    "crm.sensoraTip.openButton": "Sensora tips",
    "crm.import.heroTitle": "Import address book",
    "crm.import.heroSub": "Upload a contacts file, review, then save only who you need.",
    "crm.import.trustNoSync": "We never auto-sync your entire address book.",
    "crm.import.trustUserChoice":
      "You upload the file you chose, and you choose which customers to save.",
    "crm.import.step1Title": "Prepare a file",
    "crm.import.step1Desc": "Export CSV or vCard from iPhone, Galaxy, or Google Contacts.",
    "crm.import.step2Title": "Upload",
    "crm.import.step2Desc": "Only the file you select is read for this import.",
    "crm.import.step3Title": "Review & save",
    "crm.import.step3Desc": "In the preview, check rows and save only what you want.",
    "crm.import.ctaUpload": "Upload contacts file",
    "crm.import.ctaGuide": "How to prepare",
    "crm.import.footerPrinciples":
      "You choose what to import and save; Sensora does not store customer data on its own.",
    "crm.import.iosFileHint": "On iPhone, exporting a contacts file first is usually easiest.",
    "crm.import.iosTabShortcut": "iPhone · iCloud tips",
    "crm.import.pasteShort": "Or paste CSV / vCard text instead of uploading a file.",
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
    "crm.nav.mobileSubtitle.dashboard": "Today's flow",
    "crm.nav.mobileSubtitle.customers": "List · status",
    "crm.nav.mobileSubtitle.consulting": "Edit your notes",
    "crm.nav.mobileSubtitle.ai": "Drafts · tidy-ups",
    "crm.nav.mobileSubtitle.pipeline": "By stage",
    "crm.nav.mobileSubtitle.vehicle": "Match & budget",
    "crm.nav.mobileSubtitle.followup": "Tasks · schedule",
    "crm.nav.mobileSubtitle.settings": "Account · language",
    "crm.workspaceAi.title": "AI assistant (workspace)",
    "crm.workspaceAi.subtitle":
      "Sensora Flow: proposals refresh only via explicit buttons. CRM rows stay untouched until you copy, save, or add follow-ups deliberately.",
    "crm.workspaceAi.customerPickLabel": "Customer",
    "crm.workspaceAi.selectPlaceholder": "Select a customer",
    "crm.workspaceAi.pickCustomer": "Select or add a customer to begin.",
    "crm.workspaceAi.memoLabel": "Consultation memo",
    "crm.workspaceAi.toneLabel": "Message tone",
    "crm.workspaceAi.consultSummaryHeading": "Consultation summary",
    "crm.workspaceAi.consultSummaryLead": "High-level recap—separate from the care-coach cues card.",
    "crm.workspaceAi.needsHeading": "Customer needs",
    "crm.workspaceAi.customerNeedsHelper": "Signals from memo & care cues",
    "crm.workspaceAi.customerNeedsPlaceholder":
      "Add specifics (comfort, family, financing, timing) so care/interest cues appear here.",
    "crm.workspaceAi.nextActionLead": "Suggested task order before you call or text.",
    "crm.workspaceAi.salesHeading": "Next actions",
    "crm.workspaceAi.smsHeading": "SMS draft for review",
    "crm.workspaceAi.smsDraftLead": "Draft for you to edit and verify before sending.",
    "crm.workspaceAi.copySms": "Copy message",
    "crm.workspaceAi.saveMemo": "Save to CRM",
    "crm.workspaceAi.saveToast": "Memo saved.",
    "crm.workspaceAi.createFollowUp": "Create follow-up",
    "crm.workspaceAi.followUpToast": "Follow-up added.",
    "crm.workspaceAi.smsCopyToast": "Message copied.",
    "crm.workspaceAi.followUpDefaultTitle": "Follow-up",
    "crm.workspaceAi.analyzing": "Working…",
    "crm.sensoraFlow.banner":
      "Sensora Flow · AI output is preview-only—separate from stored CRM rows. Sensora proposes again only after explicit actions (analyze again · rewrite SMS). While you edit memo text there is no auto re‑analysis or auto‑overwrite.",
    "crm.sensoraFlow.memoUserEditableHint": "After saving, edit anytime in customer details.",
    "crm.sensoraFlow.memoStaleHint": "Memo changed since last analysis · choose “Analyze again” or “New proposal”.",
    "crm.sensoraFlow.toneHintsReanalyze": "Tone changes apply on the next explicit analysis.",
    "crm.sensoraFlow.aiSuggestionBadge": "AI proposal",
    "crm.sensoraFlow.appliedEditableHint":
      "Anything applied to memo, follow-ups, or SMS lives as normal CRM data—edit freely on this workspace or detail views; AI never silently overwrites.",
    "crm.sensoraFlow.previewEmptyHint": "Use Analyze again or New proposal to populate suggestion cards.",
    "crm.sensoraFlow.needMemoForAnalyze": "Add memo text before asking for proposals.",
    "crm.sensoraFlow.analyzeAgain": "Analyze again",
    "crm.sensoraFlow.newProposal": "Fresh proposal",
    "crm.sensoraFlow.rewriteSms": "Rewrite SMS draft",
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
    "landing.showroom.hero.quietFuture": "Quiet futurism",
    "landing.showroom.hero.senseAuraTag": "Sense · Aura",
    "landing.showroom.hero.kickerBadge": "Built for automotive sales reps",
    "landing.showroom.hero.headline": "AI customer-relationship workspace\nfor automotive sales reps",
    "landing.showroom.hero.headlineLine1": "AI customer-relationship workspace",
    "landing.showroom.hero.headlineLine2": "for automotive sales reps",
    "landing.showroom.hero.sub":
      "We keep consultation through after-sales care on one disciplined flow.\n\nAI helps with draft ideas; salespeople make the final calls.",
    "landing.showroom.bridge.line1": "Consultation settles into notes,",
    "landing.showroom.bridge.line2": "notes guide the disciplined next touch.",
    "landing.showroom.header.subline": "AI customer-relationship workspace for automotive sales reps",
    "landing.showroom.heroDash.windowSubline": "Today's queue · workspace digest",
    "landing.showroom.heroDash.greetingLine": "Here's a calm starting lane for today.",
    "landing.showroom.heroDash.greetingSub": "Catch priority follow-ups alongside draft snippets in one glance.",
    "landing.showroom.heroDash.detailCta": "Details",
    "landing.showroom.heroDash.messageCta": "Messages",
    "landing.showroom.heroDash.todayTitle": "Today's follow-ups",
    "landing.showroom.heroDash.todaySnippet": "Test drive logged—finance options review next.",
    "landing.showroom.heroDash.priorityTitle": "Needs review soon",
    "landing.showroom.heroDash.prioritySnippet": "Buyer with vehicle preference and budget already aligned.",
    "landing.showroom.heroDash.followupTitle": "Aftercare outreach due",
    "landing.showroom.heroDash.followupSnippet": "Delivery walkthrough logged—planned aftercare cadence.",
    "landing.showroom.heroDash.aiDraftTitle": "Suggested message draft",
    "landing.showroom.heroDash.aiDraftSnippet": "Offers a respectful SMS outline from your notes—you edit before sending.",
    "landing.showroom.heroDash.summaryTitle": "Recent consultation recap",
    "landing.showroom.heroDash.summarySnippet":
      "Keeps stated vehicle interests, budgets, hopeful timing, and the next outreach date on one line.",
    "landing.showroom.heroMock.previewBadge": "Preview",
    "landing.showroom.heroMock.greeting": "Good day, Manager Hyunwoo Kim—here’s a calm read on today’s lane.",
    "landing.showroom.heroMock.draftLabel": "Draft",
    "landing.showroom.heroMock.nav.home": "Home",
    "landing.showroom.heroMock.nav.customers": "Customers",
    "landing.showroom.heroMock.nav.consult": "Consultation",
    "landing.showroom.heroMock.nav.schedule": "Schedule",
    "landing.showroom.heroMock.nav.messages": "Messages",
    "landing.showroom.heroMock.nav.aiAssistant": "AI assistant",
    "landing.showroom.heroMock.nav.stats": "Insights",
    "landing.showroom.heroMock.nav.settings": "Settings",
    "landing.showroom.flow.title": "From consultation cues to dependable follow‑through.",
    "landing.showroom.flow.desc":
      "Consultation · needs · outbound SMS · next follow-up stacked in one calm SaaS‑style rail so nothing slips on the showroom floor.",
    "landing.showroom.flow.mock.contactTitle": "Consultation notes",
    "landing.showroom.flow.mock.contactBody": "Minjun · test drive recap · quoting stage entered · pending reply flagged",
    "landing.showroom.flow.mock.needsTitle": "Needs distilled",
    "landing.showroom.flow.mock.needsBody": "Family hauling, ingress/egress ease, weighing monthly burden vs coverage choices.",
    "landing.showroom.flow.mock.smsTitle": "Outbound SMS",
    "landing.showroom.flow.mock.smsBody":
      "Tight recap from our last conversation—could we carve a few quiet minutes later today for preliminary financing terms?",
    "landing.showroom.flow.mock.followupTitle": "Next follow-up",
    "landing.showroom.flow.mock.followupBody": "Tomorrow · 11:00 · outbound call",
    "landing.showroom.guide.title": "Where customer signals tighten into salesperson action.",
    "landing.showroom.guide.desc":
      "Memo lines become reviewable talking points that SensoraGuide keeps tied to your judgement.",
    "landing.showroom.guide.memoLabel": "Consultation memo",
    "landing.showroom.guide.memoQuote":
      "Heavy family hauling; entry/exit comfort is decisive for them.",
    "landing.showroom.guide.guideQuote": "Lead with cabin space, egress paths, boarding comfort—not generic claims.",
    "landing.showroom.features.title": "Quiet automation—for sales desks",
    "landing.showroom.closing.desc":
      "Sensora aligns consultation work and disciplined follow-through into a single understated flow.",
    "landing.showroom.tip.title": "Sensora tips worth knowing",
    "landing.showroom.tip.subtitle":
      "We distilled the essentials into a short image guide you can skim in a minute.",
    "landing.showroom.tip.card1.title": "Getting started",
    "landing.showroom.tip.card1.desc":
      "Beta signup, approval, and how to resume in the workspace after onboarding.",
    "landing.showroom.tip.card2.title": "Feature overview",
    "landing.showroom.tip.card2.desc": "A quick visual tour of Sensora Auto CRM essentials.",
    "landing.showroom.tip.card3.title": "Typical workspace flow",
    "landing.showroom.tip.card3.desc": "Consultation cues through aftercare follow-up, step by step.",
    "landing.showroom.tip.card4.title": "Beta etiquette",
    "landing.showroom.tip.card4.desc": "Things to note while the beta windows are open—and how to get the most value.",
    "landing.showroom.tip.close": "Close",
    "landing.showroom.tip.closeOverlay": "Close guide",
    "landing.showroom.tip.guideWord": "Guide",
    "landing.showroom.tip.imageMissing":
      "We couldn't load this guide image yet. Adding the asset will display it automatically here.",
    "landing.showroom.tip.prev": "Previous slide",
    "landing.showroom.tip.next": "Next slide",
    "landing.showroom.tip.openOriginal": "Open full-size original",
    "landing.showroom.tip.openOriginalAria": "Opens the current guide image at full size in a new tab.",
    "landing.showroom.tip.openOriginalHint":
      "Tap the image to view the original PNG. Pinch-zoom on your phone to read small text comfortably.",
    "preview.toc.title": "Browse the workspace screens.",
    "preview.toc.subtitle": "Choose a topic to jump to its sample workspace view.",
    "preview.toc.disclaimer1": "These are illustrative screens—not live customer accounts.",
    "preview.toc.disclaimer2":
      "In this preview your data stays on your device for the demo—it is not saved to our servers.",
    "preview.toc.disclaimer3": "Real customer storage and account features unlock after beta approval.",
    "preview.toc.disclaimer4": "AI suggests review drafts—you stay in charge of wording and decisions.",
    "preview.toc.close": "Close",
    "preview.toc.openDashboard": "Start from overview",
    "preview.toc.summaryTitle": "Overview",
    "preview.toc.summaryDesc": "See today’s follow-ups, schedule cues, and recent consultation flow at a glance.",
    "preview.toc.customersTitle": "Customers",
    "preview.toc.customersDesc": "Explore the sample list with vehicles and deal status.",
    "preview.toc.notesTitle": "Consultation notes",
    "preview.toc.notesDesc": "Capture and revisit memo-style consultation details.",
    "preview.toc.aiTitle": "AI assistant",
    "preview.toc.aiDesc": "Review summaries and drafts grounded in memo context.",
    "preview.toc.followupTitle": "Aftercare",
    "preview.toc.followupDesc": "Keep outreach and delivery cues organized without skipping steps.",
    "preview.toc.betaTitle": "Join the beta",
    "preview.toc.betaDesc": "Apply for beta access before enabling full storage with your seller account.",
    "preview.flow.step1.intro":
      "Bring consultations, customer notes, and next steps into one calm workspace. This is a sample preview—cloud saving unlocks after beta approval.",
    "preview.flow.step1.startCta": "Start the app preview",
    "preview.flow.step1.registerCta": "Seller account signup",
    "preview.flow.step2.headline": "What would you like to explore?",
    "preview.flow.step2.sub": "You’ll open features in sequence from the workspace.",
    "preview.flow.step2.card.customersTitle": "Customers",
    "preview.flow.step2.card.customersDesc": "Keep consultation notes and interested vehicles in one calm flow.",
    "preview.flow.step2.card.aiTitle": "AI assistant",
    "preview.flow.step2.card.aiDesc": "Suggest review-ready drafts grounded in your consultation notes.",
    "preview.flow.step2.card.followTitle": "Aftercare",
    "preview.flow.step2.card.followDesc": "Keep outreach and delivery cues from slipping through the cracks.",
    "preview.flow.step3.headline": "Capture once, carry the next action forward.",
    "preview.flow.step3.sub":
      "Sample screens only. Explore the flow, then join the beta if you need real storage with your seller account.",
    "preview.flow.step3.enterWorkspace": "Open the workspace",
    "preview.flow.step3.enterAi": "Open the AI assistant",
    "preview.flow.footer.prev": "Back",
    "preview.flow.footer.next": "Next",
    "preview.flow.storyRailTitle": "How it connects",
    "preview.guide.pageTitle": "Feature guide",
    "preview.guide.headerKicker": "App preview",
    "preview.guide.headerSub": "Use the cards to switch guide images. Tap the large image to zoom in.",
    "preview.guide.tapMainToExpand": "Tap to view full screen",
    "preview.guide.viewerTitle": "Guide images",
    "guide.sensora-guide-01.title": "End-to-end workspace flow",
    "guide.sensora-guide-01.desc": "Consultation notes carry into customer summaries, messages, and schedule cues.",
    "guide.sensora-guide-02.title": "Save and review discipline",
    "guide.sensora-guide-02.desc": "Customer records are saved after deliberate review—no silent overwrites.",
    "guide.sensora-guide-03.title": "How to get started",
    "guide.sensora-guide-03.desc": "From beta request and approval to account setup and your workspace.",
    "guide.sensora-guide-04.title": "Sensora map",
    "guide.sensora-guide-04.desc": "Customers, assistant, schedule, and follow-up on one calm surface.",
    "guide.sensora-guide-05.title": "Visual reference",
    "guide.sensora-guide-05.desc": "A supporting render of the futuristic, quiet UI direction.",
    "guide.unified.pageTitle": "Sensora onboarding",
    "guide.unified.header.kicker": "Sensora guide",
    "guide.unified.header.sub":
      "Four short steps preview how Sensora connects your work—a sample-first walkthrough ending with workspace or signup choices.",
    "guide.unified.intro.title": "Sensora Auto CRM",
    "guide.unified.intro.body":
      "Bring customer conversations, next follow-ups, and draft messages onto one workspace built for showroom and field sales rhythm.\nAs your notes build, today’s priorities become clearer.",
    "guide.unified.flow.kicker": "Sample screens · Step 3 of 4",
    "guide.unified.flow.title": "How it connects in practice",
    "guide.unified.flow.lead":
      "Choose a sample with the large preview or cards—tap any image to view it large and sharp inside the app.",
    "guide.unified.flow.rail": "Consult notes · Customer needs recap · Outreach draft · Next follow-up",
    "guide.unified.guideNav.prev": "Previous sample",
    "guide.unified.guideNav.next": "Next sample",
    "guide.unified.start.title": "Start",
    "guide.unified.start.lead":
      "Open your workspace or the AI assistant—or continue with seller registration and the beta signup link.",
    "guide.unified.disclaimer":
      "Sample screens only; persisted storage arrives after beta approval or your seller path. Placement and wording may evolve during beta.",
    "preview.diagram.caption.security": "Imports stay preview-first: review before anything is committed.",
    "preview.diagram.caption.workspace": "After signup paths clear, you return with the same account.",
    "preview.diagram.caption.hub": "Customers, consultation, schedules, and messages share one calm spine.",
    "preview.diagram.security.view": "View",
    "preview.diagram.security.review": "Review",
    "preview.diagram.security.confirm": "Confirm",
    "preview.diagram.security.save": "Commit",
    "preview.diagram.path.register": "Signup",
    "preview.diagram.path.approve": "Approval",
    "preview.diagram.path.setup": "Setup",
    "preview.diagram.path.workspace": "Workspace",
    "preview.diagram.hub.core": "Central hub",
    "preview.diagram.hub.customers": "Customers",
    "preview.diagram.hub.ai": "Assistant",
    "preview.diagram.hub.messages": "Messages",
    "preview.diagram.hub.schedule": "Schedule",
    "preview.diagram.hub.aftercare": "Aftercare",
    "preview.diagram.consult.memo": "Consultation note",
    "preview.diagram.consult.needs": "Needs distilled",
    "preview.diagram.consult.draft": "Message draft",
    "preview.diagram.consult.next": "Next outreach",
    "concept.story.security.title": "Choose, preview, then save",
    "concept.story.security.desc": "Contacts come from files or paste-ins you provide—review before anything is stored.",
    "concept.story.path.title": "Signup → approval → workspace",
    "concept.story.path.desc": "Beta signup and seller registration keep the same account when you return to work.",
    "concept.story.hub.title": "Customers, schedule, messages",
    "concept.story.hub.desc": "Move between the list, memos, and follow-up cues without losing context.",
    "concept.story.memo.title": "From memo to next step",
    "concept.story.memo.desc": "Trace needs, message drafts, and suggested follow-ups from the consultation note.",
    "landing.showroom.concept.sectionTitle": "How Sensora connects the day",
    "landing.showroom.concept.sectionSub": "Tap an image to view it full screen. Sample visuals—no live customer data is stored here.",
    "landing.showroom.concept.tapToExpand": "Tap to expand",
    "settings.display.title": "Display",
    "settings.textSize.title": "Text size",
    "settings.textSize.description": "Adjust the text size used across the app.",
    "settings.textSize.small.label": "Small",
    "settings.textSize.small.description": "See more at once",
    "settings.textSize.medium.label": "Default",
    "settings.textSize.medium.description": "Balanced view",
    "settings.textSize.large.label": "Large",
    "settings.textSize.large.description": "Easier to read",
    "settings.textSize.storageNotice": "Text size is saved in this browser.",
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
    "cover.onboarding.page1.title": "Sensora Auto CRM",
    "cover.onboarding.page1.description":
      "Keep consultation notes, next touches, and outbound wording in one calm workspace.\nSmall records add up to a clearer day.",
    "cover.onboarding.page2.title": "What can we help you with?",
    "cover.onboarding.page2.customer":
      "Customer records\nConsultation notes and vehicle interest in one simple flow.",
    "cover.onboarding.page2.ai":
      "AI assistant\nSuggests review-ready drafts grounded in your consultation notes.",
    "cover.onboarding.page2.followup":
      "After-sales care\nKeeps next touches and delivery guidance from slipping through.",
    "cover.onboarding.page2.season":
      "Seasonal care messages\nPrepare composed customer messages anchored to seasons and prompts.",
    "cover.onboarding.page2.delivery":
      "Delivery guide\nStructure pre- and post-delivery reassurance like a concise checklist.",
    "cover.onboarding.page3.title": "One note captures the cue—until the disciplined next touch.",
    "cover.onboarding.page3.description":
      "After a memo, the Sensora AI assistant screen suggests review-ready summaries and message drafts.\nSuggestions are for review; you choose what to save or change.",
    "cover.onboarding.next": "Next",
    "cover.onboarding.prev": "Back",
    "cover.onboarding.start": "Enter workspace",
    "cover.onboarding.close": "Close",
    "cover.onboarding.startApp": "Launch app",
    "cover.onboarding.goWorkspace": "Open workspace",
    "cover.onboarding.page3.workspaceCta": "Open workspace",
    "cover.onboarding.page3.aiCta": "Open AI assistant",
    "cover.onboarding.themeLabel": "Visual tone",
    "cover.onboarding.themeHint":
      "Fine-tunes the cover’s lightness and softness. Does not affect core CRM workflows.",
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

