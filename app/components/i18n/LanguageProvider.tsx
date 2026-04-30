"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  type LanguageCode,
  isRtlLanguage,
  normalizeLanguage,
  translate,
  type TranslationKey,
} from "@/lib/i18n";

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey) => string;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): LanguageCode {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return normalizeLanguage(stored);
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    setLanguageState(readStoredLanguage());
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, []);

  const dir: "ltr" | "rtl" = isRtlLanguage(language) ? "rtl" : "ltr";

  useEffect(() => {
    // Prepare for RTL support without forcing layout rewrites.
    try {
      document.documentElement.lang = language;
      document.documentElement.dir = dir;
    } catch {
      /* ignore */
    }
  }, [language, dir]);

  const t = useCallback(
    (key: TranslationKey) => {
      return translate(language, key);
    },
    [language],
  );

  const value = useMemo<LanguageContextValue>(() => ({ language, setLanguage, t, dir }), [dir, language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

