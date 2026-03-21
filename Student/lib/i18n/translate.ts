export type Locale = "en" | "vi";

const STORAGE_KEY = "student-locale";

export const DEFAULT_LOCALE: Locale = "en";

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "vi" || v === "en" ? v : DEFAULT_LOCALE;
}

export function setStoredLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, locale);
}

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce((acc: unknown, key: string) => {
    if (acc != null && typeof acc === "object" && !Array.isArray(acc) && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function translate(
  dict: Record<string, unknown>,
  key: string,
  params?: Record<string, string | number>
): string {
  const rawVal = getByPath(dict, key);
  if (typeof rawVal !== "string") {
    return key;
  }
  let result = rawVal;
  if (params) {
    Object.entries(params).forEach(([k, val]) => {
      result = result.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), String(val));
    });
  }
  return result;
}
