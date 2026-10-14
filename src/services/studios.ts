import { useStore } from "@/store/useStore";
import type { Studio } from "@/types";

/** Studios. TODO(Supabase) : table "studios". */
export const useStudios = () => useStore((s) => s.studios);

export const studioService = {
  save(st: Studio) {
    useStore.getState().set((s) => ({
      studios: s.studios.some((x) => x.id === st.id) ? s.studios.map((x) => (x.id === st.id ? st : x)) : [...s.studios, st],
    }));
  },
  remove(id: string) {
    useStore.getState().set((s) => ({
      studios: s.studios.filter((x) => x.id !== id),
      profiles: s.profiles.map((p) => (p.studioId === id ? { ...p, studioId: undefined } : p)),
    }));
  },
};
