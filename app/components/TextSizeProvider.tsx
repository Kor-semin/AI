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
  const [textSize, setTextSizeState] = useState<TextSizeOption>("100");

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
