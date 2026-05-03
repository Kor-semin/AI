"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  applyTextSizeToDocument,
  readStoredTextSize,
  type TextSizeOption,
  writeStoredTextSize,
} from "@/lib/textSizePreference";

type TextSizeContextValue = {
  textSize: TextSizeOption;
  setTextSize: (size: TextSizeOption) => void;
};

const TextSizeContext = createContext<TextSizeContextValue | null>(null);

export function TextSizeProvider({ children }: { children: React.ReactNode }) {
  const [textSize, setTextSizeState] = useState<TextSizeOption>("medium");

  useEffect(() => {
    const next = readStoredTextSize();
    setTextSizeState(next);
    applyTextSizeToDocument(next);
  }, []);

  const setTextSize = useCallback((next: TextSizeOption) => {
    setTextSizeState(next);
    applyTextSizeToDocument(next);
    writeStoredTextSize(next);
  }, []);

  const value = useMemo<TextSizeContextValue>(() => ({ textSize, setTextSize }), [setTextSize, textSize]);

  return <TextSizeContext.Provider value={value}>{children}</TextSizeContext.Provider>;
}

export function useTextSize(): TextSizeContextValue {
  const ctx = useContext(TextSizeContext);
  if (!ctx) throw new Error("useTextSize must be used within TextSizeProvider");
  return ctx;
}

/** 설정 컨트롤처럼 옵션만 필요할 때(프로바이더 밖에서는 medium 가정 불가피 시 사용) */
export function useOptionalTextSize(): TextSizeContextValue | null {
  return useContext(TextSizeContext);
}
