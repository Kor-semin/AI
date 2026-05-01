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

## 2. Sensora 내부 팀 역할 (요약)

| 역할 | 관심사 |
|------|--------|
| **Sensora.Management** | 총괄, 우선순위, 작업 분배, Cursor 요청서 최종 정리. 베타 완성도, 커밋 분리, 건드리지 말 파일 명시, 보고 형식·Vercel SHA. |
| **Sensora.Product** | 메뉴·기능 흐름, 영업 실무와의 정합성, 빈 화면 방지, 모바일에서 탭/행동 명확성. 데이터 구조·해시·`activeSection` 무분별 변경 금지. |
| **Sensora.Copy** | 한국 베타용 문구. 신뢰·실무 톤. 과장·「AI가 다 해줌」·자동 수집 인상 금지. 「검토용 초안」「사용자 확인 후 저장」 선호. |
| **Sensora.Design / Sensora.imageAI** | 조용한 미래감·프리미엄·실무 도구 톤. 모바일 가독성. **로고/PWA/아이콘 확정분은 별도 지시 없이 수정 금지.** |
| **Sensora.DevGuide** | 요청서 구조화, 커밋·빌드·배포 절차. |
| **Sensora.QA** | 실제 사용성·기능 동작. **QA-only 요청 시 수정·커밋·push 없이 보고만.** |
| **Sensora.Brand** | 신뢰·정리·차분함·프리미엄·실무성. |
| **Sensora.Finance** | 비용·견적·가격 UI 등 (세무 확정 아님). |
| **Sensora.Marketing** | 랜딩·베타·`/join` 등. 과장·「AI가 영업 대신」 금지. |
| **Sensora.Legal** | 개인정보·약관·고지. 법적 확정 문구는 전문가 확인 전제. |
| **Sensora.Audit** | 리스크·품질. 자동 수집 인상, 죽은 버튼, unrelated 커밋, build 누락, Production SHA 불일치 등 민감. |
| **Sensora.Security** | 방어 관점. 개인정보·저장소·주소록·업로드·XSS·키 노출·권한. **악용 구현 금지.** |

취합 요청서는 **Audit / Security 관점**을 먼저 반영한 뒤 전달되는 경우가 많습니다.

---

## 3. 공통 개발 원칙

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

## 4. 건드리지 말 파일 (기본)

다음은 **별도 지시가 없으면 수정하지 않습니다.**

- `public/icons/**`  
- `public/brand/**` (로고·브랜드 에셋)  
- PWA·앱 아이콘 관련 확정 자산  
- **`aiDemoResponse.ts`** (AI 데모/규칙 엔진 — **AI 로직 요청 시에만**)  

요청서에 추가로 명시된 경로가 있으면 그것이 우선합니다.

---

## 5. QA-only 요청 원칙

- **코드 수정 금지** — **보고만**  
- **commit / push 금지**  
- **DevTools Console** 및 **Network**(401·404·500·failed load 등)를 **가능하면 함께** 보고  

---

## 6. Audit / Security 우선 검토

- 개인정보·**주소록 가져오기**·**고객 메모**·**localStorage**·**Firestore**·**파일 업로드**는 **민감**하게 다룸  
- **자동 수집**, **자동 덮어쓰기**, **AI가 대신 판단**하는 듯한 표현·동작 지양  
- 사용자 **선택·확인 후 저장** 흐름과 문구를 존중  
- Security 요청 시 **공격/악용 코드 구현 금지** — 방어·검증·체크리스트 중심  

---

## 7. Cursor 작업 완료 보고 형식

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

## 8. 대표 URL

| 용도 | URL |
|------|-----|
| 베타 공유(대표) | https://customer-manager-seven.vercel.app |
| 보조 | https://ai-neon-alpha.vercel.app |

**긴 Vercel preview deployment URL**은 외부 공유용으로 사용하지 않습니다.

---

## 9. 참고 (Copy / Brand 톤)

- 선호: 상담 내용 정리, **검토용 초안** 제안, 다음 행동 안내, **사용자·영업사원의 최종 판단**  
- 지양: 「조용히 제안」, 「AI가 다 해줌」, 「완벽 자동화」, 「영업을 대신」, **Sales Concierge AI**, **B2B AI SaaS**, **후속관리** 등  
- 「동기화」보다 상황에 따라 **「가져오기」**가 안전한 경우가 많음  

---

*문서 버전: Management / DevGuide 기준으로 저장소에 고정. 변경 시 PR·커밋으로 이력을 남깁니다.*
