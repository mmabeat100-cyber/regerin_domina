import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import type { Profile } from "@/types";
import { slugify } from "@/data/profiles";

/** Couche d'accès aux profils. TODO(Supabase) : remplacer par supabase.from("profiles"). */
export const useAllProfiles = () => useStore((s) => s.profiles);

export const usePublishedProfiles = () => {
  const all = useAllProfiles();
  return useMemo(() => all.filter((p) => p.status === "published"), [all]);
};

export const useProfileBySlug = (slug: string) => useStore((s) => s.profiles.find((p) => p.slug === slug));
export const useProfileById = (id: string) => useStore((s) => s.profiles.find((p) => p.id === id));

const now = () => new Date().toISOString();

export const profileService = {
  save(p: Profile) {
    useStore.getState().set((s) => {
      const exists = s.profiles.some((x) => x.id === p.id);
      const next = { ...p, updatedAt: now() };
      return { profiles: exists ? s.profiles.map((x) => (x.id === p.id ? next : x)) : [next, ...s.profiles] };
    });
  },
  remove(ids: string[]) {
    useStore.getState().set((s) => ({ profiles: s.profiles.filter((p) => !ids.includes(p.id)) }));
  },
  setStatus(ids: string[], status: Profile["status"]) {
    useStore.getState().set((s) => ({
      profiles: s.profiles.map((p) => (ids.includes(p.id) ? { ...p, status, updatedAt: now() } : p)),
    }));
  },
  duplicate(id: string) {
    const src = useStore.getState().profiles.find((p) => p.id === id);
    if (!src) return;
    const copy: Profile = {
      ...structuredClone(src),
      id: newId("p"),
      slug: uniqueSlug(src.slug + "-copie"),
      displayName: src.displayName + " (copie)",
      status: "draft",
      createdAt: now(),
      updatedAt: now(),
    };
    profileService.save(copy);
  },
};

export const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

export const uniqueSlug = (base: string, ignoreId?: string) => {
  const slugs = new Set(useStore.getState().profiles.filter((p) => p.id !== ignoreId).map((p) => p.slug));
  let s = slugify(base) || "profil";
  let n = 2;
  const root = s;
  while (slugs.has(s)) s = `${root}-${n++}`;
  return s;
};

export const emptyProfile = (): Profile => ({
  id: newId("p"),
  slug: "",
  displayName: "",
  category: "cat-1",
  status: "draft",
  verified: false,
  vip: false,
  featured: false,
  createdAt: now(),
  updatedAt: now(),
  languages: [],
  servesFor: [],
  avatar: "grad:1",
  gallery: [],
  availability: [],
  mode: "recoit",
  price: { perHour: 200, currency: "EUR" },
  specialOffers: [],
  contact: {},
  headline: "",
  descriptionFr: "",
  descriptionEn: "",
  services: [],
  equipment: [],
  taboos: [],
  rating: { average: 0, count: 0 },
});
