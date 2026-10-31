import { en } from "./en";
import { fr } from "./fr";
import { de } from "./de";
import { useLocaleStore, type Locale } from "./store";

export type { Locale } from "./store";
export { useLocaleStore } from "./store";

export const locales = { en, fr, de } satisfies Record<Locale, typeof en>;

export const localeLabels: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
};

/** Current UI dictionary, reactive to the visitor's chosen language. */
export const useT = () => useLocaleStore((s) => locales[s.locale]);

export const useLocale = () => useLocaleStore((s) => s.locale);
