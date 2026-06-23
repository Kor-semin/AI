## Sensora · Sensora Auto CRM

**Sensora**는 B2B AI SaaS 기업입니다. 슬로건: «작은 시작에서부터 시작된다». 브랜드 의미는 Sense + Aura(감각과 방향성)입니다.

**Sensora Auto CRM**은 자동차 영업사원을 위한 AI 고객관리 SaaS입니다. (제품 레이어·UX 참고 개념: Sales Concierge AI)

### 공개 URL (Vercel Production)

- **대표 URL (베타·외부 공용):** https://customer-manager-seven.vercel.app  
  - 웹 랜딩: `/` · 앱 워크스페이스: `/?view=app` · AI 비서 진입 예: `/?view=app#crm-ai-assistant`  
- **보조 도메인 (동일 배포):** https://ai-neon-alpha.vercel.app  
- **미리보기용 긴 deployment URL** (`…-projects.vercel.app` 등)은 내부 검증용으로 두고, **베타 사용자에게는 공유하지 않습니다.**

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Firebase setup (Google login + Firestore sync)

1) Create a Firebase project, add a **Web app**, and enable:
- **Authentication → Sign-in method → Google**
- **Firestore Database**

2) Create `\.env.local` in the project root using `.env.example` as a template and fill in `NEXT_PUBLIC_FIREBASE_*`.

3) Firestore Security Rules (recommended)

- Apply rules from `firestore.rules` so only the signed-in user can access their own data under `users/{uid}/...`.

3) Run the dev server and sign in:

```bash
pnpm dev
```

### Sensora Lead persistence beta

`/sensora/workspace`의 Lead 접수 기능은 브라우저 저장소로 대체하지 않고 다음 Firestore 경로를 사용합니다.

```text
sensoraWorkspaces/sensora-beta-workspace/leads/{leadId}
```

로컬에서는 `.env.example`을 `.env.local`로 복사한 뒤 아래 Firebase Web App 공개 설정을 채우고 개발 서버를 다시 시작합니다. 실제 값과 `.env.local`은 커밋하지 않습니다.

```text
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Lead 저장과 조회에는 Firebase 로그인이 필요하며, `sellerProfiles/{uid}.approvalStatus`가 `approved`인 사용자만 자기 `createdByUid`와 일치하는 Lead를 읽거나 생성할 수 있습니다. `firestore.rules`를 같은 Firebase 프로젝트에 배포해야 하며, 이 베타 단계에서는 Lead 수정과 삭제를 허용하지 않습니다. 환경변수가 없거나 인증·권한이 충족되지 않으면 화면에 원인을 표시하고 입력값은 유지합니다.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

<!-- Deployment trigger: Git-based Vercel build -->
<!-- Deployment trigger #2: Git-based Vercel build -->
