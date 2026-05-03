# 베타 신청(/join) → Google Sheets 연결 가이드

Sensora 웹 앱의 `/join` 폼 제출은 `NEXT_PUBLIC_BETA_SIGNUP_ENDPOINT`가 설정되어 있으면 **Google Apps Script 웹 앱 URL**로 **JSON POST** 됩니다.

**실제 웹앱 실행 URL은 Git에 넣지 마세요.** Vercel(또는 로컬 `.env.local`)에만 저장합니다.

---

## 1. Google Sheet 만들기

1. [Google Sheets](https://sheets.google.com)에서 새 스프레드시트를 만듭니다.
2. 첫 행에 헤더를 권장 순서대로 적습니다.

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| `submittedAt` | `source` | `fullName` | `contact` | `email` | `dealership` | `currentCrmApproach` | `motivation` |

3. 스프레드시트 메뉴 **확장 프로그램 → Apps Script**로 이동합니다.

---

## 2. Apps Script `doPost` 예시

스크립트 편집기에 아래와 같이 저장합니다. (시트 이름이 다르면 `getSheetByName`을 수정하세요.)

```javascript
/**
 * /join 에서 오는 POST JSON 저장
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
    var sheet =
      ss.getSheetByName("Responses") ||
      ss.getActiveSheet();

    sheet.appendRow([
      data.submittedAt || "",
      data.source || "",
      data.fullName || "",
      data.contact || "",
      data.email || "",
      data.dealership || "",
      data.currentCrmApproach || "",
      data.motivation || "",
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

/** 브라우저에서 OPTIONS 프리플라이트가 올 경우(환경에 따라) */
function doOptions() {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON);
}
```

> **참고:** 시트 헤더와 `appendRow` 열 순서를 맞추세요.

---

## 3. 배포 방법 (웹 앱 URL 발급)

1. Apps Script 편집기에서 **배포 → 새 배포**.
2. 유형 선택: **웹 앱**.
3. 설명은 자유 입력.
4. **실행 사용자:** 나.
5. **액세스 권한:**  
   - 팀 외 일반 접수까지 받을 경우 보통 **「모든 사용자」** 또는 조직 정책에 맞는 항목.  
   - Sensora처럼 공개 폼이라면 브라우저 `fetch`가 동작하려면 게스트 접근 가능한 설정이 필요할 수 있습니다(조직에서는 관리자 정책 확인).
6. **배포** 후 표시되는 **웹 앱 URL**을 복사합니다. 이 URL이 `NEXT_PUBLIC_BETA_SIGNUP_ENDPOINT` 값입니다.

이후 코드를 수정했다면 **새 버전으로 배포**해야 변경 사항이 반영됩니다.

---

## 4. Vercel 환경 변수

1. Vercel 프로젝트 → **Settings → Environment Variables**.
2. 이름: `NEXT_PUBLIC_BETA_SIGNUP_ENDPOINT`
3. 값: 위에서 복사한 **웹 앱 실행 URL**(끝에 `/exec` 등이 포함된 형태 유지).
4. Production(및 필요 시 Preview)에 적용 후 **재배포**.

로컬에서는 프로젝트 루트의 `.env.local`에 같은 키로 넣고 `npm run dev` 후 `/join`에서 테스트합니다.

```bash
# .env.local (이 파일은 Git에 포함하지 마세요.)
NEXT_PUBLIC_BETA_SIGNUP_ENDPOINT=https://script.google.com/macros/s/.../exec
```

---

## 5. POST 로 전송되는 JSON 필드

| 필드 | 설명 |
|------|------|
| `fullName` | 이름 |
| `contact` | 연락처 |
| `email` | 이메일 |
| `dealership` | 소속 전시장 등 |
| `currentCrmApproach` | 현재 고객관리 방식 |
| `motivation` | 사용 사유 등 |
| `submittedAt` | 제출 시각(ISO 8601 문자열, 클라이언트 생성) |
| `source` | 고정 문자열 `sensora-alpha-join`(구분용) |

---

## 6. 테스트 및 확인

1. **엔드포인트 미설정:** `/join`에서 제출 시 **테스트 제출** 안내(저장 미연결)가 나오는지 확인합니다.
2. **엔드포인트 설정 후:** 브라우저 개발자 도구 **Network**에서 POST가 웹 앱으로 가는지, 응답이 200 근처인지 확인합니다. **Console에 입력 내용 로그가 남으면 안 됩니다**(앱 코드는 개인정보를 찍지 않도록 유지합니다).
3. 성공 후 **Spreadsheet 새 행**이 추가되었는지 확인합니다.

---

## 7. 보안 주의

- 웹 앱 URL이 유출되면 누구나 POST를 보낼 수 있습니다. 필요하면 Apps Script 또는 별도 백엔드에서 간단한 토큰 검증을 추가하는 것을 검토하세요.
- 시트에는 개인정보가 쌓이므로 접근 권한·공유 범위를 최소화하세요.
