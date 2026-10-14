import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CatalogItem, Country, Profile, Review, Studio } from "@/types";
import { seedProfiles } from "@/data/profiles";
import { seedCountries } from "@/data/geo";
import { seedStudios } from "@/data/studios";
import { seedReviews } from "@/data/reviews";
import { seedCatalogs } from "@/data/catalogs";

/**
 * Store démo persisté dans localStorage.
 * TODO(Supabase) : remplacer par des requêtes dans src/services/* — les composants ne lisent
 * jamais le store directement mais passent par les services.
 */
export interface DataState {
  profiles: Profile[];
  countries: Country[];
  studios: Studio[];
  reviews: Review[];
  catalogs: CatalogItem[];
  ageVerified: boolean;
  visitor: { name: string } | null;
  set: (fn: (s: DataState) => Partial<DataState>) => void;
  resetDemo: () => void;
}

const seed = () => ({
  profiles: seedProfiles,
  countries: seedCountries,
  studios: seedStudios,
  reviews: seedReviews,
  catalogs: seedCatalogs,
});

export const useStore = create<DataState>()(
  persist(
    (set) => ({
      ...seed(),
      ageVerified: false,
      visitor: null,
      set: (fn) => set((s) => fn(s)),
      resetDemo: () => set(seed()),
    }),
    {
      name: "dominacompass-store-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ set: _s, resetDemo: _r, ...rest }) => rest,
    },
  ),
);

export const useHydratedStore = () => {
  // helper flag: true once localStorage state has been applied
  return useStore.persist?.hasHydrated?.() ?? false;
};
