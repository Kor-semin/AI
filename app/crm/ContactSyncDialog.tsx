"use client";

import { useRef, type Dispatch, type SetStateAction } from "react";
import { parseContactPaste } from "./importContacts";
import { CONTACT_SYNC_SOURCES } from "./contactSyncSources";

type Props = {
  open: boolean;
  onClose: () => void;
  pasteText: string;
  setPasteText: Dispatch<SetStateAction<string>>;
  onIngestFromParsed: (rows: ReturnType<typeof parseContactPaste>) => void;
  showToast: (msg: string) => void;
};

async function pickDeviceContacts(showToast: (msg: string) => void): Promise<string[]> {
  const nav = navigator as Navigator & {
    contacts?: {
      select: (
        props: ("name" | "tel")[],
        opts?: { multiple?: boolean },
      ) => Promise<Array<{ name?: string[]; tel?: string[] }>>;
    };
  };
  if (!nav.contacts?.select) {
    showToast(
      "이 브라우저는 기기 연락처 직접 선택을 지원하지 않습니다. 아래 외부 링크·붙여넣기를 사용해 주세요.",
    );
    return [];
  }

  try {
    const contacts = await nav.contacts.select(["name", "tel"], { multiple: true });
    const lines: string[] = [];
    for (const c of contacts) {
      const nameRaw = c.name as string[] | undefined;
      const name = Array.isArray(nameRaw) ? nameRaw.join(" ") : "";
      const tels =
        typeof c.tel === "undefined"
          ? []
          : Array.isArray(c.tel)
          ? c.tel
          : [String(c.tel)];
      const tel = (tels[0] ?? "").trim();
      if (name || tel) lines.push([name || "(이름없음)", tel].join("\t"));
    }
    return lines;
  } catch {
    showToast("기기 연락처 선택이 취소되었거나 허용되지 않았습니다.");
    return [];
  }
}

export function ContactSyncDialog({
  open,
  onClose,
  pasteText,
  setPasteText,
  onIngestFromParsed,
  showToast,
}: Props) {
  const vcfInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto bg-black/50 p-4 pb-10 pt-10 sm:pt-14"
      onClick={() => onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-sync-title"
        className="my-auto w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="contact-sync-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          연락처 연동
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          외부 주소록은 새 탭에서 여신 뒤, 이름·전화번호를 골라 복사해 아래 영역에 붙여 넣거나, 받은 내보내기(.vcf) 파일을
          불러오세요. 앱 제작자에게 자동 업로드되지 않으며, 기존 수첩 저장·동기화 방식과 같습니다.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CONTACT_SYNC_SOURCES.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-center transition hover:border-emerald-500/50 hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/70 dark:hover:border-emerald-500/35 dark:hover:bg-zinc-900"
            >
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">{s.label}</span>
              <span className="text-[10px] font-medium leading-tight text-zinc-500 dark:text-zinc-400">
                {s.description}
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">열기 →</span>
            </a>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg border border-emerald-600/50 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-950/50 dark:text-emerald-100 dark:hover:bg-emerald-900/50"
            onClick={() => {
              void (async () => {
                const lines = await pickDeviceContacts(showToast);
                if (lines.length === 0) return;
                setPasteText((prev) => (prev.trim() ? `${prev.trim()}\n${lines.join("\n")}` : lines.join("\n")));
                showToast(`기기 연락처 ${lines.length}건을 붙임 영역에 넣었습니다. 확인 후 아래 버튼을 눌러 주세요.`);
              })();
            }}
          >
            이 기기에서 선택 (HTTPS·지원 브라우저)
          </button>
          <button
            type="button"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            onClick={() => vcfInputRef.current?.click()}
          >
            .vcf / 내보내기 파일 불러오기
          </button>
          <input
            ref={vcfInputRef}
            type="file"
            accept=".vcf,.vcard,text/plain,text/vcard,text/directory,text/x-vcard"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              const reader = new FileReader();
              reader.onload = () => {
                const text = typeof reader.result === "string" ? reader.result : "";
                if (!text.trim()) {
                  showToast("파일 내용이 비어 있습니다.");
                  return;
                }
                setPasteText((prev) => (prev.trim() ? `${prev.trim().trimEnd()}\n${text.trim()}` : text.trim()));
                showToast("파일 내용을 붙임 영역에 넣었습니다. 확인 후 반영 버튼을 눌러 주세요.");
              };
              reader.onerror = () => showToast("파일을 읽지 못했습니다.");
              reader.readAsText(f);
            }}
          />
        </div>

        <label className="mt-4 block">
          <span className="sr-only">붙여넣기</span>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={10}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            placeholder={`예) 한 줄당 이름과 전화, 또는 VCARD 블록\n홍길동\t010-1234-5678`}
          />
        </label>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            onClick={() => onClose()}
          >
            닫기
          </button>
          <button
            type="button"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
            onClick={() => onIngestFromParsed(parseContactPaste(pasteText))}
          >
            정리해서 고객으로 넣기
          </button>
        </div>
      </div>
    </div>
  );
}
