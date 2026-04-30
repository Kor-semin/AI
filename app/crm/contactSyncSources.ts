/** 외부 주소록 웹으로 바로 이동(새 탭). 로그인은 각 서비스에서 처리됩니다. */
export type ContactSyncSource = {
  id: string;
  label: string;
  description: string;
  url: string;
};

export const CONTACT_SYNC_SOURCES: ContactSyncSource[] = [
  {
    id: "google",
    label: "구글 연락처",
    description: "웹 주소록 · 복사",
    url: "https://contacts.google.com/",
  },
  {
    id: "naver",
    label: "네이버 통합연락처",
    description: "로그인 후 주소록",
    url: "https://contacts.naver.com/",
  },
  {
    id: "outlook",
    label: "Outlook",
    description: "Microsoft 주소록",
    url: "https://outlook.live.com/mail/0/people/",
  },
];
