import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Locale = "en" | "fr" | "de";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "ringerin-domina-locale-v1",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
