# Sensora Auto CRM — Cursor / 에이전트 운영 가이드

이 문서는 Sensora Auto CRM 저장소에서 AI 코딩 에이전트(Cursor 등)가 **일관된 기준**으로 작업하도록 정리한 운영 원칙입니다. 요청서는 내부 역할(Management, Product, Copy, Audit 등)을 거쳐 전달될 수 있으며, 에이전트는 그 **의도와 제약**을 반영합니다.

---

## 1. 프로젝트

**Sensora Auto CRM**은 자동차 영업사원을 위한 **AI 고객관리 앱**입니다.

다음을 **한 흐름**으로 다루는 것을 목표로 합니다.

- 고객 상담 · 고객관리 · 상담 메모  
- AI 비서  
- 차량 조건 정리  
- **사후관리** (「후속관리」 대신 **사후관리** 사용)  
- 출고 안내  
- 주소록 가져오기  

**최종 실행은 Cursor(에이전트)**이지만, 요청서는 **Sensora 내부 팀 관점**으로 정리됩니다.

---

## 2. Sensora upper teams (상위 조직)

**Sensora**는 **대표님 확정 기준**에 따라, **Sensora.Management** 아래 다섯 개의 **상위 팀**으로 운영됩니다.

요청서에 **Development**, **ProductExperience**, **BrandGrowth**, **Operations**, **Risk**가 언급되면, 아래 포함 역할들의 원칙을 함께 적용합니다.

### 조직 트리

```
대표
└─ Sensora.Management
   ├─ Sensora.Strategy
   │
   ├─ Sensora.Development
   │  ├─ Sensora.DevGuide
   │  ├─ Sensora.QA
   │  └─ Sensora.Security
   │
   ├─ Sensora.ProductExperience
   │  ├─ Sensora.Product
   │  ├─ Sensora.Copy
   │  ├─ Sensora.Design
   │  └─ Sensora.QA
   │
   ├─ Sensora.BrandGrowth
   │  ├─ Sensora.Brand
   │  ├─ Sensora.Marketing
   │  ├─ Sensora.Copy
   │  ├─ Sensora.PR
   │  └─ Sensora.imageAI
   │
   ├─ Sensora.Operations
   │  ├─ Sensora.Finance
   │  ├─ Sensora.Legal
   │  ├─ Sensora.Marketing
   │  └─ Sensora.Audit
   │
   └─ Sensora.Risk
      ├─ Sensora.Audit
      ├─ Sensora.Security
      └─ Sensora.Legal
```

### Sensora.Development

**Development**는 코드, QA 실행, 빌드, 커밋, 배포, 기술적 보안을 책임집니다.

**포함 역할:** Sensora.DevGuide, Sensora.QA, Sensora.Security

**주요 책임:**

- 승인된 요청을 안전한 구현 계획으로 변환  
- AGENTS.md 및 건드리지 말 파일 규칙 준수  
- 코드 변경 시 `npm run build` 실행  
- 기능별 커밋 분리 유지  
- Vercel 배포 커밋 SHA 검증  
- 구현 전 기술·보안 리스크 검토  

### Sensora.ProductExperience

**ProductExperience**는 웹·앱의 **실제 사용자 경험**을 책임집니다.

**포함 역할:** Sensora.Product, Sensora.Copy, Sensora.Design, Sensora.QA

**주요 책임:**

- 제품 플로우·메뉴 구조  
- 모바일 사용성  
- 화면 명확성  
- 한국 베타 사용자용 카피  
- 버튼·카드·여백·타이포·사용성 점검  
- 자동차 영업 현장 사용자가 이해하기 쉽게 쓰일 수 있는지 확인  

### Sensora.BrandGrowth

**BrandGrowth**는 브랜드·마케팅·대외 메시지·비주얼 자산을 책임집니다.

**포함 역할:** Sensora.Brand, Sensora.Marketing, Sensora.Copy, Sensora.PR, Sensora.imageAI (필요 시 Sensora.Design과 교차 조율)

**주요 책임:**

- 브랜드 톤  
- 랜딩·베타 모집 문구  
- 마케팅 이미지·설명 비주얼  
- 블로그·Notion·발표 자료 등  
- 차별점·신뢰 중심의 대외 카피·홍보 문구**(Sensora.PR 원칙과 정합)**  
- 과장된 AI 표현·저가형 스타트업 인상 지양 (**확정 로고/PWA/아이콘 변경은 별도 지시 시에만**)  

### Sensora.Operations

**Operations**는 사업 운영·재무·법무 준비·베타 운영·실무적 회사 계획을 책임집니다.

**포함 역할:** Sensora.Finance, Sensora.Legal, Sensora.Marketing, Sensora.Audit

**주요 책임:**

- 예산·비용 계획  
- 가족·투자자 설명 자료  
- 베타 사용자 운영  
- 가격·사업 계획  
- 개인정보 처리방침·이용약관 준비 **지원**(법적 확정 문구는 전문가 검토 전제)  
- 상표·특허·세무·법률 검토 준비, 필요 시 **전문가 검토 표시**  

### Sensora.Risk

**Risk**는 감사·보안·법적 리스크·개인정보·고객 데이터·배포 리스크를 책임집니다.

**포함 역할:** Sensora.Audit, Sensora.Security, Sensora.Legal

**주요 책임:**

- 개인정보·보안 리스크 검토  
- 고객 데이터 처리 방식 점검  
- 자동 수집·자동 덮어쓰기로 **오인**될 표현·동작 방지  
- 법률·상표·특허·정책 리스크 검토  
- 위험한 카피·과장 검토  
- 커밋·배포 리스크 점검  
- 불안전한 요청 중단 또는 **더 안전한 대안** 제안  

### Sensora.Strategy

Sensora.Strategy is responsible for company strategy, product roadmap, market positioning, business model, competitive analysis, and growth planning.

It works directly under Sensora.Management and coordinates with ProductExperience, BrandGrowth, Operations, Risk, and Development.

Main responsibilities:

- Define Sensora’s company direction  
- Prioritize MVP and beta-stage work  
- Decide what should be built now vs later  
- Analyze competitors and similar services  
- Clarify Sensora’s differentiation  
- Plan the growth path from individual salespeople to showrooms, dealers, and automotive brands  
- Review B2B licensing and white-label possibilities  
- Support business plan and proposal structure  
- Connect product decisions to business viability  

Strategy principles:

- Start with individual automotive salespeople before large brand deals  
- Validate real usage before expanding features  
- Keep the product light enough for daily sales work  
- Focus on consultation notes, customer needs, aftercare, delivery guide, and message drafts  
- Avoid exaggerated AI automation claims  
- Avoid privacy-risky growth tactics  
- Separate urgent beta work from later enterprise features  
- Consider legal, security, cost, and brand risks before recommending expansion  

Decision criteria:

- Does this help beta users now?  
- Does it match automotive sales workflow?  
- Does it strengthen Sensora’s differentiation?  
- Is the impact worth the development cost?  
- Does it increase privacy/security risk?  
- Does it support future dealer or brand licensing?  
- Is this needed now or later?  
- Does it connect to revenue or retention?  

Default response format:

1. Strategic judgment  
2. What to do now  
3. What can wait  
4. Expected effect  
5. Risks  
6. Related teams  
7. Execution order  
8. Whether a Cursor request is needed  

### Sensora.PR

Sensora.PR is responsible for public messaging, product positioning, differentiation, beta recruitment communication, and trust-building promotional copy.

It works under Sensora.BrandGrowth with Sensora.Brand, Sensora.Marketing, Sensora.Copy, and Sensora.Design.

Main responsibilities:

- Define Sensora’s differentiation  
- Write beta recruitment messages  
- Prepare promotional copy for automotive salespeople  
- Prepare dealer, showroom, and brand-facing explanation copy  
- Prepare blog, KakaoTalk, Instagram, Threads, Notion, and presentation messages  
- Review public wording for trust and clarity  
- Prevent exaggerated AI claims  
- Prevent privacy-risky wording  

PR principles:

- Sensora does not replace automotive salespeople  
- AI helps organize consultation content and draft messages  
- Final judgment belongs to the salesperson  
- Avoid “AI does everything” claims  
- Avoid automatic collection or automatic synchronization impressions  
- Use calm, trustworthy Korean copy  
- Focus on automotive sales workflow: consultation notes, customer needs, aftercare, delivery guide, message drafts  

Good phrases:

- 상담부터 사후관리까지 한 흐름으로 관리합니다.  
- 고객의 말을 놓치지 않도록, AI가 상담 내용을 정리합니다.  
- AI는 초안을 돕고, 최종 판단은 영업사원이 합니다.  
- 고객관리, 상담 메모, 사후관리, 출고 안내를 한 곳에서 정리합니다.  
- 자동차 영업사원을 위한 AI 고객관리 워크스페이스.  

Avoid:

- AI가 영업을 대신합니다.  
- 고객을 자동으로 관리합니다.  
- 무조건 계약으로 연결합니다.  
- 완벽하게 자동화합니다.  
- 매출을 폭발적으로 올립니다.  
- 고객 정보를 자동 수집합니다.  
- 전체 주소록을 자동 동기화합니다.  
- AI가 알아서 연락합니다.  

### 상위 팀 이름이 요청에 있을 때 (How to use upper teams)

앞으로 Cursor 요청에는 상위 팀이 명시될 수 있습니다.

**예시:**

- 「**Development** 기준으로 구현해줘」  
- 「**ProductExperience** 기준으로 모바일 UX를 점검해줘」  
- 「**BrandGrowth** 기준으로 랜딩 문구를 정리해줘」  
- 「**Operations** 기준으로 베타 운영 자료를 정리해줘」  
- 「**Risk** 기준으로 개인정보와 보안 리스크를 먼저 봐줘」  
- 「**Strategy** 관점에서 베타 대비 기능 우선순위를 판단해줘」  
- 「**PR** 기준으로 대외 카피·베타 모집 메시지를 검토해줘」  

**매핑:** 요청에 상위 팀이 있으면, **포함된 개별 역할**의 원칙을 함께 적용합니다. **Strategy·PR**이 명시되면 각각 본 문서의 Sensora.Strategy · Sensora.PR 절을 우선 적용합니다.

| 상위 팀 / 역할 | 포함 관점 요약 |
|---------|----------------|
| Development | DevGuide · QA · Security 기준 준수 |
| ProductExperience | Product · Copy · Design · QA |
| BrandGrowth | Brand · Marketing · Copy · PR · imageAI |
| Operations | Finance · Legal · Marketing · Audit |
| Risk | Audit · Security · Legal |
| Strategy (Management 하위) | 본 문서 「Sensora.Strategy」 원칙·응답 형식 |
| PR (BrandGrowth 하위) | 본 문서 「Sensora.PR」 원칙·표현 가이드 |

일부 역할(QA·Copy·Marketing·Audit 등)은 **여러 상위 팀에 걸쳐** 있으므로, 요청 문맥과 우선순위를 함께 봅니다.

---

## 3. Sensora 내부 팀 역할 (요약)

| 역할 | 관심사 |
|------|--------|
| **Sensora.Management** | 총괄, 우선순위, 작업 분배, Cursor 요청서 최종 정리. 베타 완성도, 커밋 분리, 건드리지 말 파일 명시, 보고 형식·Vercel SHA. |
| **Sensora.Strategy** | 회사 방향, 제품 로드맵, 시장·수익 모델, 경쟁·차별점, 개인 영업사원→딜러·브랜드 확장·B2B 검토. 과장·개인정보 위험 확장 지양. 상세는 본 문서 「Sensora.Strategy」 참고. |
| **Sensora.Product** | 메뉴·기능 흐름, 영업 실무와의 정합성, 빈 화면 방지, 모바일에서 탭/행동 명확성. 데이터 구조·해시·`activeSection` 무분별 변경 금지. |
| **Sensora.Copy** | 한국 베타용 문구. 신뢰·실무 톤. 과장·「AI가 다 해줌」·자동 수집 인상 금지. 「검토용 초안」「사용자 확인 후 저장」 선호. |
| **Sensora.Design / Sensora.imageAI** | 조용한 미래감·프리미엄·실무 도구 톤. 모바일 가독성. **로고/PWA/아이콘 확정분은 별도 지시 없이 수정 금지.** |
| **Sensora.DevGuide** | 요청서 구조화, 커밋·빌드·배포 절차. |
| **Sensora.QA** | 실제 사용성·기능 동작. **QA-only 요청 시 수정·커밋·push 없이 보고만.** |
| **Sensora.Brand** | 신뢰·정리·차분함·프리미엄·실무성. |
| **Sensora.PR** | 대외 차별점·홍보·베타 모집·신뢰 커뮤니케이션. 과장 AI·자동 수집·동기화 인상 금지. 상세는 본 문서 「Sensora.PR」 참고. |
| **Sensora.Finance** | 비용·견적·가격 UI 등 (세무 확정 아님). |
| **Sensora.Marketing** | 랜딩·베타·`/join` 등. 과장·「AI가 영업 대신」 금지. |
| **Sensora.Legal** | 개인정보·약관·고지. 법적 확정 문구는 전문가 확인 전제. |
| **Sensora.Audit** | 리스크·품질. 자동 수집 인상, 죽은 버튼, unrelated 커밋, build 누락, Production SHA 불일치 등 민감. |
| **Sensora.Security** | 방어 관점. 개인정보·저장소·주소록·업로드·XSS·키 노출·권한. **악용 구현 금지.** |

취합 요청서는 **Audit / Security 관점**을 먼저 반영한 뒤 전달되는 경우가 많습니다.

### Sensora 랜딩·브랜드 메시지 방향 원칙

Sensora Auto CRM의 외부 메시지는 “멋있는 AI 앱”이 아니라 **“자동차 영업사원의 상담과 사후관리를 정확하게 정리해주는 실무형 AI 고객관리 워크스페이스”**로 잡는다. 랜딩, 베타 안내, 홍보 문구, 개발 요청서(Cursor 포함)에서 동일 기준을 적용한다.

핵심 기준:

1. AI가 영업사원을 대신한다는 인상을 주지 않는다.  
2. AI는 상담 내용을 정리하고 검토용 초안을 제안하는 보조 역할로 표현한다.  
3. 최종 판단과 수정은 항상 영업사원이 직접 한다.  
4. 고객 정보를 자동 수집하거나 임의 저장하는 느낌을 주지 않는다.  
5. 한국 자동차 영업 현장에서 바로 이해되는 문구를 우선한다.  
6. 과장된 AI 표현보다 신뢰감·실무성·정돈된 프리미엄 이미지를 우선한다.  

기준 메인 문구:

- 자동차 영업사원을 위한 AI 고객관리 워크스페이스  

기준 보조 문구:

- 상담 메모, 관심 차량, 다음 연락, 사후관리까지 흩어진 고객 정보를 한 흐름으로 정리합니다.  
- AI는 초안을 돕고, 최종 판단은 영업사원이 합니다.  

피해야 할 표현:

- AI가 영업을 대신합니다.  
- 고객을 자동으로 관리합니다.  
- 계약률을 폭발적으로 올립니다.  
- 완벽한 영업 자동화  
- AI가 다 해줍니다.  
- B2B AI SaaS 중심 표현  
- 고객 정보를 자동 수집합니다.  
- 전체 주소록을 자동 동기화합니다.  
- 자동으로 고객을 저장합니다.  
- 무조건 계약으로 연결합니다.  

관련:

- 공통 원칙·권장 문구·금지 표현의 전체 기준은 §3 「**Sensora Common Messaging Standard**」를 따른다.  
- 본 문서 §2 「Sensora.PR」·「Sensora.Strategy」 원칙, §7 Audit / Security, §10 Copy / Brand 톤 요약과 함께 적용한다.  

### Sensora Common Messaging Standard

한국어 고정 요약·기준 메인·보조 문구·「피해야 할 표현」 목록은 위 「**Sensora 랜딩·브랜드 메시지 방향 원칙**」을 따른다. 이 절에서는 동일 방향을 **영문 원칙**, **역할별 적용**, 브랜드 톤 요약(한글)으로만 확장한다.

All Sensora roles must follow this standard when writing product copy, landing copy, beta-user messages, PR copy, marketing content, QA feedback, development requests, legal/privacy explanations, and internal strategy documents.

Core messaging principles (aligned with the numbered criteria in the Korean summary):

- Do not imply that AI replaces automotive salespeople.  
- Express AI as a support tool that organizes consultation content and proposes review drafts.  
- Make it clear that the salesperson makes the final judgment, edits, and decisions.  
- Do not imply automatic customer data collection, automatic saving, or arbitrary modification of customer information.  
- Prioritize language that Korean automotive salespeople can immediately understand.  
- Prioritize trust, practicality, calmness, and organized premium quality over exaggerated AI claims.  
- Keep the product positioned as a practical customer-management workspace, not a flashy AI automation tool.  

Tone and delivery (same intent as the Korean “핵심 기준”; for international or mixed-language requests):

- Prefer practical features over hype.  
- Prefer trustworthy, calm copy.  
- Present AI as quiet assistance, not the hero.  
- Keep the brand restrained and premium.  
- Protect personal data and customer trust from the beta stage onward.  

추가 한국어 표현 예시·보강 목록이 필요하면 §2 「Sensora.PR」의 Good phrases / Avoid 목록과 조율한다.

Role-specific application:

- **Product** must use this standard when defining user flows and feature priorities.  
- **Copy, PR, Marketing, and Brand** must use this standard when writing external-facing messages.  
- **DevGuide** must include this standard in Cursor-ready development requests when copy or UI messaging is involved.  
- **QA** must check whether screens create misunderstanding around AI automation or customer data handling.  
- **Audit and Security** must flag any phrase or feature that suggests automatic collection, automatic saving, AI replacement, or exaggerated sales outcomes.  
- **Strategy** must use this standard when explaining Sensora’s positioning, roadmap, and B2B expansion direction.  

---

## 4. 공통 개발 원칙

1. 작업 전 **`git status`** 확인  
2. **관련 파일만** 수정 (무관한 리팩터·파일 혼입 금지)  
3. 요청서의 **「건드리지 말 것」** 엄수  
4. **`public/icons`**, **`public/brand`**, 로고·**PWA 아이콘** 관련 파일은 **별도 지시 없으면 수정 금지**  
5. **`app/components/concierge/aiDemoResponse.ts`** — **AI 로직 변경 요청이 아니면 수정 금지**  
6. **Firebase / CRM 데이터 구조**는 꼭 필요할 때만 변경  
7. **`npm run build`** 통과 (문서만 추가하는 작업은 생략 가능할 수 있으나, 코드 변경 시 **필수**)  
8. **기능별 커밋 분리**  
9. **push 후** `git status` 확인 (clean 권장)  
10. **Vercel Production**에서 확인할 **최신 커밋 SHA**를 보고에 포함  

---

## 5. 건드리지 말 파일 (기본)

다음은 **별도 지시가 없으면 수정하지 않습니다.**

- `public/icons/**`  
- `public/brand/**` (로고·브랜드 에셋)  
- PWA·앱 아이콘 관련 확정 자산  
- **`aiDemoResponse.ts`** (AI 데모/규칙 엔진 — **AI 로직 요청 시에만**)  

요청서에 추가로 명시된 경로가 있으면 그것이 우선합니다.

---

## 6. QA-only 요청 원칙

- **코드 수정 금지** — **보고만**  
- **commit / push 금지**  
- **DevTools Console** 및 **Network**(401·404·500·failed load 등)를 **가능하면 함께** 보고  

---

## 7. Audit / Security 우선 검토

- 개인정보·**주소록 가져오기**·**고객 메모**·**localStorage**·**Firestore**·**파일 업로드**는 **민감**하게 다룸  
- **자동 수집**, **자동 덮어쓰기**, **AI가 대신 판단**하는 듯한 표현·동작 지양  
- 사용자 **선택·확인 후 저장** 흐름과 문구를 존중  
- Security 요청 시 **공격/악용 코드 구현 금지** — 방어·검증·체크리스트 중심  

---

## 8. Cursor 작업 완료 보고 형식

작업 완료 후 아래 항목을 채워 보고합니다.

1. 수정한 파일  
2. 변경 내용 요약  
3. `npm run build` 결과  
4. `git status`  
5. 커밋 메시지  
6. 커밋 SHA  
7. push 결과  
8. Vercel에서 확인해야 할 최신 커밋  
9. 남은 리스크 또는 추가 확인 필요 사항  

---

## 9. 대표 URL

| 용도 | URL |
|------|-----|
| 베타 공유(대표) | https://customer-manager-seven.vercel.app |
| 보조 | https://ai-neon-alpha.vercel.app |

**긴 Vercel preview deployment URL**은 외부 공유용으로 사용하지 않습니다.

---

## 10. 참고 (Copy / Brand 톤)

- 랜딩·브랜드·대외 메시지의 기준은 §3 「Sensora 랜딩·브랜드 메시지 방향 원칙」「Sensora Common Messaging Standard」 및 아래 톤 불릿을 함께 본다.  
- 선호: 상담 내용 정리, **검토용 초안** 제안, 다음 행동 안내, **사용자·영업사원의 최종 판단**  
- 지양: 「조용히 제안」, 「AI가 다 해줌」, 「완벽 자동화」, 「영업을 대신」, **Sales Concierge AI**, **B2B AI SaaS**, **후속관리** 등  
- 「동기화」보다 상황에 따라 **「가져오기」**가 안전한 경우가 많음  

---

*문서 버전: Management / DevGuide 기준으로 저장소에 고정. 변경 시 PR·커밋으로 이력을 남깁니다.*
