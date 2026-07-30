"use client";

import { useState, useSyncExternalStore } from "react";

import {
  clearAllCustomers,
  getCrmServerSnapshot,
  getCrmStateSnapshot,
  resetToSeedData,
  subscribeCrmState,
} from "./crmLocalStore";
import { SEED_SPECS } from "./sensoraSeedCustomers";

/** 고객 데이터 관리 — 예시 데이터 재적용 / 전체 비우기. 되돌릴 수 없어 확인 단계를 둡니다. */
export function SensoraDataControl() {
  const state = useSyncExternalStore(subscribeCrmState, getCrmStateSnapshot, getCrmServerSnapshot);
  const [confirming, setConfirming] = useState<"reset" | "clear" | null>(null);
  const [notice, setNotice] = useState("");

  const run = (action: "reset" | "clear") => {
    if (action === "reset") {
      resetToSeedData();
      setNotice(`예시 고객 ${SEED_SPECS.length}명으로 초기화했습니다.`);
    } else {
      clearAllCustomers();
      setNotice("고객 데이터를 모두 비웠습니다.");
    }
    setConfirming(null);
  };

  return (
    <div className="mt-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] p-4">
          <p className="text-sm font-semibold text-[var(--s-text)]">현재 저장 상태</p>
          <p className="mt-2 text-[0.8125rem] leading-6 text-[var(--s-text-2)]">
            고객 {state.customers.length}명 · 다음 연락 {state.nextActions.length}건
          </p>
          <p className="mt-1 text-xs text-[var(--s-text-4)]">대시보드·고객관리·상담 메모가 이 데이터를 공유합니다.</p>
        </div>

        <div className="rounded-lg border border-[var(--s-border)] bg-[var(--s-inner)] p-4">
          <p className="text-sm font-semibold text-[var(--s-text)]">데이터 관리</p>
          {confirming === null ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setConfirming("reset"); setNotice(""); }}
                className="rounded-lg border border-[var(--s-border-2)] px-3 py-2 text-xs font-medium text-[var(--s-text-2)] transition-colors hover:border-[var(--s-brand-border-soft)] hover:text-[var(--s-text)]"
              >
                예시 {SEED_SPECS.length}명으로 초기화
              </button>
              <button
                type="button"
                onClick={() => { setConfirming("clear"); setNotice(""); }}
                className="rounded-lg border border-[var(--s-err-border)] px-3 py-2 text-xs font-medium text-[var(--s-err-text)] transition-colors hover:bg-[var(--s-err-tint)]"
              >
                전체 비우기
              </button>
            </div>
          ) : (
            <div className="mt-3" role="group" aria-label="실행 확인">
              <p className="text-xs leading-5 text-[var(--s-warn-text)]">
                {confirming === "reset"
                  ? "직접 추가·수정한 고객이 모두 예시 데이터로 대체됩니다. 되돌릴 수 없습니다."
                  : "저장된 고객과 다음 연락이 모두 삭제됩니다. 되돌릴 수 없습니다."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => run(confirming)}
                  className="rounded-lg bg-[var(--s-brand)] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--s-brand-hover)]"
                >
                  확인, 실행합니다
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(null)}
                  className="rounded-lg border border-[var(--s-border-2)] px-3 py-2 text-xs font-medium text-[var(--s-text-2)] transition-colors hover:text-[var(--s-text)]"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div aria-live="polite">
        {notice ? <p className="mt-3 text-xs text-[var(--s-ok-text)]" role="status">{notice}</p> : null}
      </div>
    </div>
  );
}
