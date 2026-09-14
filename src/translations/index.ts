import en from "./en";
import id from "./id";
import ja from "./ja";
import type { TranslationKeys } from "./en";

export type Language = "en" | "id" | "ja";

const translations: Record<Language, TranslationKeys> = { en, id, ja };

/**
 * Get a nested translation value by dot-notation key.
 * Supports simple `{placeholder}` interpolation.
 *
 * Example: getTranslation("id", "profile.logoutConfirm")
 */
export function getTranslation(
  lang: Language,
  key: string,
  params?: Record<string, string | number>
): string {
  const keys = key.split(".");
  let value: any = translations[lang];

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to English if key missing in target language
      value = translations.en;
      for (const fk of keys) {
        value = value?.[fk];
        if (value === undefined) return key; // key itself as last resort
      }
      break;
    }
  }

  if (typeof value !== "string") return key;

  // Simple interpolation: replace {placeholder} with params
  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, p) =>
      params[p] !== undefined ? String(params[p]) : `{${p}}`
    );
  }

  return value;
}

export { en, id, ja };
export type { TranslationKeys };
