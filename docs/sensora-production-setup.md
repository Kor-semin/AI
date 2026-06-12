# Sensora production setup

## 확정 운영 URL

| 용도 | URL | 역할 |
| --- | --- | --- |
| 메인/공개 사이트 | `https://sensora-alpha.vercel.app/` | 랜딩, 앱 미리보기, `/join` 베타 신청 |
| 관리자 채널 | `https://ai-neon-alpha.vercel.app/internal/beta-approval?v=firestore` | Firestore `betaSignups` 신청자 조회, 승인, 반려 |

두 Vercel 프로젝트는 **같은 Firebase 프로젝트**와 **같은 Firestore 컬렉션(`betaSignups`)**을 보아야 합니다.

## 메인 사이트 env (`sensora-alpha`)

공개 사이트에는 신청과 Firebase Web SDK에 필요한 값만 둡니다.

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true
NEXT_PUBLIC_BETA_SIGNUP_FIRESTORE_COLLECTION=betaSignups

# 선택: Firestore 미설정 환경에서만 쓰는 legacy webhook fallback
NEXT_PUBLIC_BETA_SIGNUP_ENDPOINT=
```

주의:

- 실제 Firebase 값은 Vercel env에만 넣고 Git에 커밋하지 않습니다.
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`는 관리자 채널과 반드시 같은 Firebase project id여야 합니다.
- `NEXT_PUBLIC_BETA_SIGNUP_FIRESTORE_COLLECTION`은 관리자 채널의 `BETA_APPROVAL_FIRESTORE_COLLECTION`과 같은 `betaSignups`여야 합니다.
- `/join`은 기본적으로 Firestore `betaSignups` 컬렉션에 `status: "pending"`으로 신청서를 생성합니다.
- 메인 사이트에는 승인/반려용 private env(`BETA_APPROVAL_ADMIN_EMAILS`, `FIREBASE_SERVICE_ACCOUNT_JSON`)를 두지 않습니다.

## 관리자 채널 env (`ai-neon-alpha`)

관리자 채널에는 같은 Firebase public env와 승인/반려 서버 API용 private env를 둡니다.

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true
NEXT_PUBLIC_BETA_SIGNUP_FIRESTORE_COLLECTION=betaSignups

BETA_APPROVAL_ADMIN_EMAILS=admin@example.com
BETA_APPROVAL_FIRESTORE_COLLECTION=betaSignups
FIREBASE_SERVICE_ACCOUNT_JSON=
```

주의:

- `BETA_APPROVAL_ADMIN_EMAILS`에는 실제 관리자 이메일을 Vercel env에만 쉼표 구분으로 넣습니다.
- `FIREBASE_SERVICE_ACCOUNT_JSON`은 서비스 계정 JSON 문자열입니다. 저장소에 커밋하지 않습니다.
- `BETA_APPROVAL_FIRESTORE_COLLECTION`은 메인 사이트의 `NEXT_PUBLIC_BETA_SIGNUP_FIRESTORE_COLLECTION`과 같은 값이어야 합니다.
- 관리자 채널의 운영 상태 확인 섹션은 값 자체를 표시하지 않고 `설정됨 / 미설정`만 표시합니다.

## `/join` 신청 → 관리자 조회 흐름

1. 사용자가 `https://sensora-alpha.vercel.app/join`에서 신청서를 제출합니다.
2. 클라이언트 Firebase SDK가 같은 Firebase 프로젝트의 Firestore `betaSignups` 컬렉션에 문서를 생성합니다.
3. Firestore rules는 공개 create만 제한적으로 허용하고, read/update는 `betaAdmin` claim이 있는 관리자에게만 허용합니다.
4. 관리자는 `https://ai-neon-alpha.vercel.app/internal/beta-approval?v=firestore`에서 Google 로그인합니다.
5. 관리자 페이지는 `/api/internal/beta-approval` 서버 API를 호출합니다.
6. 서버 API는 Firebase ID 토큰의 이메일을 확인하고 `BETA_APPROVAL_ADMIN_EMAILS`에 포함된 경우에만 Firestore REST로 목록을 읽습니다.
7. 승인/반려 버튼은 `/api/internal/beta-approval/[id]` PATCH를 호출하며, 서버에서 관리자 이메일을 다시 검증한 뒤 `status`, `approvedAt`, `approvedBy` 또는 `rejectedAt`, `rejectedBy`를 갱신합니다.

## Firestore rules 배포

`firestore.rules` 변경은 운영 Firebase 프로젝트에 별도 배포해야 합니다.

```bash
firebase deploy --only firestore:rules --project <firebase-project-id>
```

현재 rules 의도:

- `betaSignups`: 공개 신청 create 허용(필드/길이/status 검증), read/update는 `request.auth.token.betaAdmin == true`만 허용, delete 금지.
- `users/{uid}`: 기존처럼 본인만 read/write.

## `betaAdmin` custom claim

Firestore 직접 접근 보호를 위해 관리자 Firebase 사용자에는 `betaAdmin` custom claim 설정이 필요합니다.

설정 순서:

1. Firebase Console에서 관리자 계정이 같은 Firebase 프로젝트에 생성되어 있는지 확인합니다.
2. 관리자 계정의 Firebase Auth UID를 확인합니다.
3. 안전한 로컬 또는 운영 터미널에 `FIREBASE_SERVICE_ACCOUNT_JSON`을 환경변수로 설정합니다.
4. 아래 명령을 실행합니다.

```bash
npx tsx scripts/set-beta-admin-claim.ts --uid=FIREBASE_AUTH_UID
```

스크립트 동작:

- Firebase Admin SDK와 `FIREBASE_SERVICE_ACCOUNT_JSON`만 사용합니다.
- 인자로 받은 UID에 `betaAdmin: true` custom claim을 설정합니다.
- UID, 관리자 이메일, 서비스 계정 JSON 내용은 로그에 출력하지 않습니다.
- 실행 전 확인 메시지를 출력하고, 실행 후 성공/실패만 출력합니다.
- 실제 UID, 관리자 이메일, 서비스 계정 키는 저장소에 커밋하지 않습니다.

## 실제 신청 테스트 순서

1. `https://sensora-alpha.vercel.app/join`에 접속합니다.
2. 테스트 신청 1건을 제출합니다.
3. Firebase Console에서 Firestore `betaSignups` 컬렉션에 새 문서가 생성되었는지 확인합니다.
4. 문서의 `status`가 `pending`인지 확인합니다.
5. 문서에 `fullName`, `contact`, `email`, `dealership`, `jobRole`, `usePurpose`, `currentCrmApproach`, `submittedAt`, `source`가 들어왔는지 확인합니다.
6. 브라우저 콘솔에 신청자 개인정보 전체값이 출력되지 않는지 확인합니다.

## 관리자 승인/반려 테스트 순서

1. `https://ai-neon-alpha.vercel.app/internal/beta-approval?v=firestore`에 접속합니다.
2. 운영 상태 확인 섹션에서 Firebase public env, 관리자 env, 서비스 계정, 컬렉션명이 `설정됨`으로 표시되는지 확인합니다.
3. Google 관리자 계정으로 로그인합니다.
4. 신청자 목록에 테스트 신청이 표시되는지 확인합니다.
5. 기본 목록에서 이메일과 연락처가 마스킹되는지 확인합니다.
6. `상세보기`를 눌러 관리자 확인 상황에서만 전체값이 보이는지 확인합니다.
7. `승인하기`를 눌러 상태가 `approved`로 변경되는지 확인합니다.
8. 별도 테스트 신청 건에서 `반려하기`를 눌러 상태가 `rejected`로 변경되는지 확인합니다.
9. Firebase Console에서 `approvedAt`/`approvedBy` 또는 `rejectedAt`/`rejectedBy`가 기록되는지 확인합니다.

## 내부 승인 API 오류 코드

| 코드 | 의미 | 빠른 확인 |
| --- | --- | --- |
| `503` | 운영 env 미설정 | `BETA_APPROVAL_ADMIN_EMAILS` 및 관리자 채널 env 설정 확인 |
| `401` | 미로그인 또는 Firebase ID 토큰 없음 | Google 관리자 로그인 상태 확인 |
| `403` | 로그인했지만 관리자 이메일 아님 | `BETA_APPROVAL_ADMIN_EMAILS` 목록과 로그인 이메일 확인 |

## 운영 점검 체크리스트

- 두 Vercel 프로젝트의 `NEXT_PUBLIC_FIREBASE_PROJECT_ID`가 동일한지 확인합니다.
- 두 Vercel 프로젝트의 신청 컬렉션명이 모두 `betaSignups`인지 확인합니다.
- `sensora-alpha`에는 관리자 승인/반려 private env가 없는지 확인합니다.
- `ai-neon-alpha`에는 `BETA_APPROVAL_ADMIN_EMAILS`, `BETA_APPROVAL_FIRESTORE_COLLECTION`, `FIREBASE_SERVICE_ACCOUNT_JSON`이 설정되어 있는지 확인합니다.
- 관리자 env 또는 Firebase env가 없을 때 내부 페이지가 개인정보를 노출하지 않고 보안 게이트를 표시하는지 확인합니다.
- 서버/API/콘솔 로그에 신청자 전체 이메일, 연락처, 이름을 출력하지 않습니다.
- `sensora-alpha /join`에서 테스트 신청 1건을 제출합니다.
- Firestore `betaSignups`에 `pending` 문서 생성 여부를 확인합니다.
- `ai-neon-alpha` 관리자 채널 접속과 관리자 로그인 여부를 확인합니다.
- 신청자 목록에 테스트 신청 표시 여부를 확인합니다.
- 개인정보가 기본 목록에서 마스킹되는지 확인합니다.
- 상세보기 동작을 확인합니다.
- 승인하기 동작과 `approved` 상태 변경을 확인합니다.
- 반려 테스트 시 `rejected` 상태 변경을 확인합니다.
