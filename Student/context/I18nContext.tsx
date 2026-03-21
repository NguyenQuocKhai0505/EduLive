"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import en from "@/lib/i18n/locales/en.json";
import vi from "@/lib/i18n/locales/vi.json";
import {
  DEFAULT_LOCALE,
  type Locale,
  translate as runTranslate,
  getStoredLocale,
  setStoredLocale,
} from "@/lib/i18n/translate";

const dictionaries: Record<Locale, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  vi: vi as Record<string, unknown>,
};

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocaleState(getStoredLocale());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale === "vi" ? "vi" : "en";
    setStoredLocale(locale);
    window.dispatchEvent(new CustomEvent("localechange", { detail: locale }));
  }, [locale, ready]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
  }, []);

  const dict = dictionaries[locale];

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      runTranslate(dict, key, params),
    [dict]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

/** Dùng khi component có thể nằm ngoài provider (fallback tiếng Anh). */
export function useOptionalI18n(): I18nContextValue | null {
  return useContext(I18nContext);
}
