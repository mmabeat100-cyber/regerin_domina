import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Visitor-local preferences (age gate, review nickname). All directory data
 * (profiles, countries, studios, catalogs, reviews) now lives in Supabase —
 * see src/services/*.
 */
export interface DataState {
  ageVerified: boolean;
  visitor: { name: string } | null;
  set: (fn: (s: DataState) => Partial<DataState>) => void;
}

export const useStore = create<DataState>()(
  persist(
    (set) => ({
      ageVerified: false,
      visitor: null,
      set: (fn) => set((s) => fn(s)),
    }),
    {
      name: "dominacompass-store-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ set: _s, ...rest }) => rest,
    },
  ),
);

export const useHydratedStore = () => {
  // helper flag: true once localStorage state has been applied
  return useStore.persist?.hasHydrated?.() ?? false;
};
