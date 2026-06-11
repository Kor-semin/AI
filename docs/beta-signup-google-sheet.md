# 베타 신청(/join) → Google Sheets 연결 가이드

Sensora 웹 앱의 `/join` 폼 제출은 `NEXT_PUBLIC_BETA_SIGNUP_ENDPOINT`가 설정되어 있으면 **Google Apps Script 웹 앱 URL**로 요청합니다.

브라우저에서는 **CORS·응답 본문을 읽을 수 없는 `fetch` 모드(no-cors)** 를 쓰고, **`Content-Type: text/plain`** 으로 **JSON 문자열**을 붙입니다. Apps Script 의 `e.postData.contents` 는 그대로 문자열을 받으며 `JSON.parse` 하면 됩니다.

**실제 웹앱 실행 URL은 Git에 넣지 마세요.** Vercel(또는 로컬 `.env.local`)에만 저장합니다.

**베타 승인 조회**(이메일별 `status`)는 브라우저가 아니라 **Next.js API Route**(`/api/beta-access/check`)가 **서버 환경변수** `BETA_ACCESS_ENDPOINT`(및 선택 `BETA_ACCESS_SECRET`)로 Apps Script에 요청합니다.

---

## 1. Google Sheet 만들기

1. [Google Sheets](https://sheets.google.com)에서 새 스프레드시트를 만듭니다.
2. 첫 행에 헤더를 권장 순서대로 적습니다.

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `submittedAt` | `source` | `fullName` | `contact` | `email` | `dealership` | `jobRole` | `usePurpose` | `currentCrmApproach` | `status` | `approvedAt` | `approvedBy` | `reviewNote` |

- 신규 접수 시 **`status` 기본값은 `승인 대기`** 입니다(스크립트 `doPost`에서 설정).
- **`승인 완료`**: 앱·클라우드 경로 허용 · **`승인 대기`**: 대표 검토 대기 · **`승인 거절`**: 해당 이메일 사용 불가 안내 · **`status` 빈 칸**: 조회 시 “신청 없음”과 동일하게 처리(아래 스크립트 예시 참고).
- `approvedAt`, `approvedBy`, `reviewNote`는 운영자가 수동으로 채울 수 있습니다.

3. 스프레드시트 메뉴 **확장 프로그램 → Apps Script**로 이동합니다.

---

## 2. Apps Script `doPost` 예시

스크립트 편집기에 아래와 같이 저장합니다. (시트 이름이 다르면 `getSheetByName`을 수정하세요.)

```javascript
/** 시트 이름(한국어 기본 탭 이름 예: 시트1) */
var SHEET_NAME = "시트1";

/**
 * /join 에서 오는 POST — 본문은 JSON 문자열(text/plain 또는 application/json).
 */
function doPost(e) {
  const lock = LockService.getDocumentLock();
  lock.waitLock(10000);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("empty body");
    }

    var data = JSON.parse(e.postData.contents);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();

    sheet.appendRow([
      data.submittedAt || "",
      data.source || "",
      data.fullName || "",
      data.contact || "",
      data.email || "",
      data.dealership || "",
      data.jobRole || "",
      data.usePurpose || data.motivation || "",
      data.currentCrmApproach || "",
      "승인 대기",
      "",
      "",
      "",
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err && err.message ? err.message : err) }),
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/** no-cors + text/plain 은 브라우저에서 간단 요청으로 보내는 경우가 많아 프리플라이트가 생기지 않을 수 있습니다. */
```

> **참고:** 시트 헤더와 `appendRow` 열 순서를 맞추세요.

---

## 3. Apps Script `doGet` — 베타 승인 조회 (`action=checkAccess`)

Vercel 서버는 **GET**으로 다음 쿼리를 붙여 호출합니다.

- `action=checkAccess`
- `email=` (소문자·trim은 서버에서도 처리하지만, 스크립트에서도 동일 규칙 권장)
- 선택: `key=` — `BETA_ACCESS_SECRET`과 일치할 때만 조회 허용(아래 예시는 스크립트 속성 `BETA_ACCESS_SECRET`과 비교)

**응답 JSON**에는 **`ok`**, **`status`**, **`approved`** 만 포함합니다. 이름·연락처·신청 사유 등 **개인정보 필드는 절대 반환하지 않습니다.**

시트 **`status`** 는 운영에서 한국어로 관리합니다. 조회 결과의 `status` 필드에는 아래처럼 **시트 값 그대로(또는 `not_found`)** 를 담습니다. Next.js **`/api/beta-access/check`** 가 이를 받아 클라이언트에는 표준 코드(`approved` / `pending` / `rejected` / `not_found`)로만 넘깁니다.

이메일이 시트에 없거나, 해당 행의 `status`가 **비어 있으면**: `{ "ok": true, "approved": false, "status": "not_found" }`  
같은 이메일이 여러 행이면 **가장 아래 행(최근 append 기준)** 을 사용합니다.

```javascript
function doGet(e) {
  var p = e && e.parameter ? e.parameter : {};
  if (p.action !== "checkAccess") {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, approved: false, status: "error" }),
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var expected = PropertiesService.getScriptProperties().getProperty("BETA_ACCESS_SECRET") || "";
  if (expected && String(p.key || "") !== expected) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, approved: false, status: "error" }),
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var email = String(p.email || "")
    .trim()
    .toLowerCase();
  if (!email) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, approved: false, status: "error" }),
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, approved: false, status: "not_found" }),
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var header = values[0];
  var emailCol = header.indexOf("email");
  var statusCol = header.indexOf("status");
  if (emailCol < 0 || statusCol < 0) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, approved: false, status: "error" }),
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var rawStatus = null;
  for (var r = values.length - 1; r >= 1; r--) {
    var cell = String(values[r][emailCol] || "")
      .trim()
      .toLowerCase();
    if (cell === email) {
      rawStatus = String(values[r][statusCol] || "").trim();
      break;
    }
  }

  if (rawStatus === null) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, approved: false, status: "not_found" }),
    ).setMimeType(ContentService.MimeType.JSON);
  }

  /** 빈 칸·알 수 없는 값은 신청 없음(not_found)으로 통일해 앱에서는 동일 안내를 씁니다. */
  if (!rawStatus) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, approved: false, status: "not_found" }),
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var approved = false;
  var outStatus = rawStatus;

  /** 기존 시트에 영문이 남아 있으면 매핑(선택). */
  var lowerLegacy = rawStatus.toLowerCase();
  if (lowerLegacy === "approved") {
    approved = true;
    outStatus = "승인 완료";
  } else if (lowerLegacy === "pending") {
    outStatus = "승인 대기";
  } else if (lowerLegacy === "rejected") {
    outStatus = "승인 거절";
  } else if (rawStatus === "승인 완료") {
    approved = true;
  } else if (rawStatus === "승인 대기" || rawStatus === "승인 거절") {
    approved = false;
  } else {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, approved: false, status: "not_found" }),
    ).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, approved: approved, status: outStatus }),
  ).setMimeType(ContentService.MimeType.JSON);
}
```

> `BETA_ACCESS_SECRET`을 쓰지 않으면 스크립트 속성을 비워 두고, Vercel의 `BETA_ACCESS_SECRET`도 비웁니다.  
> URL만 알면 조회가 가능해지므로, 운영 환경에서는 **시크릿 일치**를 권장합니다.

---

## 4. 배포 방법 (웹 앱 URL 발급)

1. Apps Script 편집기에서 **배포 → 새 배포**.
2. 유형 선택: **웹 앱**.
3. 설명은 자유 입력.
4. **실행 사용자:** 나.
5. **액세스 권한:**  
   - `/join` 공개 POST: 팀 정책에 맞게 **「모든 사용자」** 등.  
   - **GET `checkAccess`는 서버에서만 호출**하지만, 웹 앱 배포 정책상 외부에서 URL을 직접 호출할 수 있으면 **3절의 `key` 검증**으로 제한하는 것이 안전합니다.
6. **배포** 후 표시되는 **웹 앱 URL**을 복사합니다.

- **제출용:** `NEXT_PUBLIC_BETA_SIGNUP_ENDPOINT` (기존과 동일, 동일 스크립트의 `doPost`에 연결 가능)
- **승인 조회용(서버 전용):** `BETA_ACCESS_ENDPOINT` — **클라이언트·`NEXT_PUBLIC_`에 넣지 않습니다.**  
  동일 웹앱 URL을 써도 되고, 별도 배포 URL을 써도 됩니다(같은 스프레드시트를 바라보는 스크립트여야 함).

이후 코드를 수정했다면 **새 버전으로 배포**해야 변경 사항이 반영됩니다.

---

## 5. Vercel / 로컬 환경 변수

### `/join` 시트 저장

1. 이름: `NEXT_PUBLIC_BETA_SIGNUP_ENDPOINT`
2. 값: 제출용 웹 앱 실행 URL

### 베타 승인 조회(서버)

1. 이름: `BETA_ACCESS_ENDPOINT` — `doGet`이 응답하는 웹 앱 URL(일반적으로 `.../exec`)
2. 선택: `BETA_ACCESS_SECRET` — Apps Script가 `key`로 검증하는 값과 동일하게 설정

```bash
# .env.local (Git에 포함하지 마세요.)
NEXT_PUBLIC_BETA_SIGNUP_ENDPOINT=https://script.google.com/macros/s/.../exec
BETA_ACCESS_ENDPOINT=https://script.google.com/macros/s/.../exec
BETA_ACCESS_SECRET=

## 내부 승인 페이지(Firestore 운영 시)
BETA_APPROVAL_ADMIN_EMAILS=admin@example.com
BETA_APPROVAL_FIRESTORE_COLLECTION=betaSignups
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"..."}'
```

앱 쪽 API: **`POST /api/beta-access/check`** — Body `{ "email": "user@example.com" }` — 응답은 `ok`, `approved`, `status`만 클라이언트로 전달합니다.  
`status`는 항상 **`approved` \| `pending` \| `rejected` \| `not_found` \| `error`**(Apps Script 및 시트 표기와 무관하게 서버에서 정규화)입니다.

---

## 6. POST 로 전송되는 JSON 필드 (/join)

| 필드 | 설명 |
|------|------|
| `fullName` | 이름 |
| `contact` | 연락처 |
| `email` | 이메일 |
| `dealership` | 소속 전시장 등 |
| `jobRole` | 직무 |
| `usePurpose` | 사용 목적 |
| `currentCrmApproach` | 현재 고객관리 방식 |
| `submittedAt` | 제출 시각(ISO 8601 문자열, 클라이언트 생성) |
| `source` | 고정 문자열 `sensora-alpha-join`(구분용) |

---

## 7. 내부 승인 페이지(Firestore 운영)

`/internal/beta-approval?v=firestore`는 서버 API를 통해서만 신청 목록을 읽고 승인/반려를 처리합니다.

필요 환경변수:

- `BETA_APPROVAL_ADMIN_EMAILS`: 쉼표로 구분한 관리자 이메일 목록. 실제 주소는 Git에 넣지 말고 Vercel/로컬 환경변수에만 둡니다.
- `BETA_APPROVAL_FIRESTORE_COLLECTION`: 기본값 `betaSignups`.
- `FIREBASE_SERVICE_ACCOUNT_JSON`: 서버 API가 Firestore REST를 호출할 서비스 계정 JSON. 저장소에 커밋하지 않습니다.
- `NEXT_PUBLIC_FIREBASE_*`: 관리자 Google 로그인과 Firebase ID 토큰 발급용 public 설정.

권한 구조:

1. 클라이언트는 신청 목록을 Firestore에서 직접 읽지 않고 `/api/internal/beta-approval` 서버 API를 호출합니다.
2. 서버 API는 Firebase ID 토큰으로 로그인 이메일을 확인하고, `BETA_APPROVAL_ADMIN_EMAILS`에 포함된 경우에만 목록/승인/반려를 처리합니다.
3. Firestore rules는 직접 클라이언트 접근에 대비해 `betaSignups` 읽기/수정을 `request.auth.token.betaAdmin == true`로 제한합니다.
4. `betaAdmin` custom claim은 Firebase Admin SDK 또는 운영 스크립트에서 대상 관리자 UID에 설정해야 합니다.

custom claim 설정 예시(운영 로컬 스크립트 또는 Firebase Admin 콘솔 환경에서만 실행):

```js
await admin.auth().setCustomUserClaims(uid, { betaAdmin: true });
```

> 서비스 계정 JSON, 실제 UID, 실제 관리자 이메일은 저장소에 커밋하지 마세요.

---

## 8. 테스트 및 확인

1. **엔드포인트 미설정:** `/join`에서 제출 시 **테스트 제출** 안내(저장 미연결)가 나오는지 확인합니다.
2. **엔드포인트 설정 후:** 클라이언트는 **`no-cors`** 로 요청하므로 **응답 상태·본문은 페이지 스크립트에서 확인 불가**합니다. Network 에 전송 행만 보일 수 있습니다. 최종 검증은 **시트 새 행 추가** 여부입니다. **Console 에 입력값을 찍지 않습니다.**
3. 성공 후 **Spreadsheet 새 행**의 `status`가 **`승인 대기`**인지 확인합니다.
4. **`BETA_ACCESS_ENDPOINT` 설정 후:** 시트에서 해당 이메일을 **`승인 완료`**로 바꾼 뒤 `/register` 또는 로그인 상태의 앱에서 정상 진입하는지 확인합니다.

---

## 9. 보안 주의

- 웹 앱 URL이 유출되면 누구나 POST를 보낼 수 있습니다. 필요하면 Apps Script 또는 별도 백엔드에서 간단한 토큰 검증을 추가하는 것을 검토하세요.
- **승인 조회 URL**은 `NEXT_PUBLIC_`로 노출하지 말고, **`BETA_ACCESS_ENDPOINT` + 선택적 시크릿**으로 서버에서만 호출하세요.
- 시트에는 개인정보가 쌓이므로 접근 권한·공유 범위를 최소화하세요.
- 서버·클라이언트 **Console에 이메일·이름·연락처 등을 로그로 남기지 않습니다.**
- `/internal/beta-approval`은 `BETA_APPROVAL_ADMIN_EMAILS`와 Firebase ID 토큰 검증이 모두 통과해야 목록/승인/반려가 가능합니다.
- Firestore rules 변경(`betaSignups` 보호)은 Firebase Console 또는 CLI로 별도 배포해야 운영 DB에 반영됩니다.
