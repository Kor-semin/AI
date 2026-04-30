# /join → Google Sheet 연결 (Apps Script)

`/join` 페이지는 클라이언트에서 `NEXT_PUBLIC_BETA_SIGNUP_ENDPOINT`로 JSON `POST`를 보냅니다.  
이 값을 **Google Apps Script 웹 앱 URL**로 설정하면, 제출 데이터가 Google Sheet에 저장됩니다.

## 1) Google Sheet 준비

- 새 Google Sheet 생성 (예: `Sensora Auto CRM · Beta Signups`)
- 첫 시트 이름은 임의로 두어도 됩니다 (예: `Sheet1`)

권장 헤더(첫 행):

- `createdAt`
- `fullName`
- `contact`
- `email`
- `dealership`
- `currentCrmApproach`
- `motivation`
- `userAgent`
- `ip` (옵션: Apps Script에서 직접 수집은 제한적일 수 있음)

## 2) Apps Script 웹 앱 만들기

1. Google Sheet에서 **확장 프로그램 → Apps Script** 열기
2. 아래 코드를 `Code.gs`에 붙여넣기

```javascript
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0]; // 첫 시트 사용 (원하면 이름으로 변경)

    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }

    var now = new Date();
    var ua = (e && e.parameter && e.parameter.ua) ? e.parameter.ua : "";

    sheet.appendRow([
      now.toISOString(),
      body.fullName || "",
      body.contact || "",
      body.email || "",
      body.dealership || "",
      body.currentCrmApproach || "",
      body.motivation || "",
      ua || "",
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 3) 배포(Deploy) → 웹 앱

1. **배포 → 새 배포**
2. 유형: **웹 앱**
3. 실행: **나**
4. 액세스: **모든 사용자** (또는 “링크가 있는 사용자”)
5. 배포 후 **웹 앱 URL** 복사

## 4) Vercel 환경 변수 설정

Vercel 프로젝트에서 다음 환경 변수를 **Production**에 추가:

- `NEXT_PUBLIC_BETA_SIGNUP_ENDPOINT` = (위 웹 앱 URL)

저장 후 **재배포(또는 git push로 자동 재배포)**.

## 5) 동작 확인

1. 프로덕션에서 `/join` 제출
2. Google Sheet에 새 행이 추가되는지 확인

## 보안 메모

- 이 방식은 “간단한 베타 접수” 용도입니다. 스팸/봇 방지가 필요하면:
  - Apps Script에서 간단한 rate-limit / 키 검증(헤더 토큰) 추가
  - 또는 서버 라우트(`app/api/...`)에서 검증 후 Sheet에 기록하는 방식 권장

