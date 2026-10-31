import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { queryClient } from "@/lib/queryClient";
import type { Profile } from "@/types";
import { slugify } from "@/data/profiles";

const QUERY_KEY = ["listings"] as const;

async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("data")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => row.data as unknown as Profile);
}

export const useProfilesQuery = () =>
  useQuery({ queryKey: QUERY_KEY, queryFn: fetchProfiles, staleTime: 30_000 });

export const useAllProfiles = () => useProfilesQuery().data ?? [];

export const usePublishedProfiles = () => {
  const all = useAllProfiles();
  return useMemo(() => all.filter((p) => p.status === "published"), [all]);
};

export const useProfileBySlug = (slug: string) => useAllProfiles().find((p) => p.slug === slug);
export const useProfileById = (id: string) => useAllProfiles().find((p) => p.id === id);

const now = () => new Date().toISOString();

async function upsertRows(profiles: Profile[]) {
  const rows = profiles.map((p) => ({
    id: p.id,
    slug: p.slug,
    status: p.status,
    data: p as unknown as Json,
    updated_at: p.updatedAt,
  }));
  const { error } = await supabase.from("listings").upsert(rows);
  if (error) throw error;
  await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
}

export const profileService = {
  async save(p: Profile) {
    const next: Profile = { ...p, updatedAt: now() };
    await upsertRows([next]);
    return next;
  },
  async remove(ids: string[]) {
    const { error } = await supabase.from("listings").delete().in("id", ids);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  },
  async setStatus(ids: string[], status: Profile["status"]) {
    const current = (queryClient.getQueryData<Profile[]>(QUERY_KEY) ?? []).filter((p) =>
      ids.includes(p.id),
    );
    await upsertRows(current.map((p) => ({ ...p, status, updatedAt: now() })));
  },
  async duplicate(source: Profile) {
    const all = queryClient.getQueryData<Profile[]>(QUERY_KEY) ?? [];
    const copy: Profile = {
      ...structuredClone(source),
      id: newId("p"),
      slug: uniqueSlug(source.slug + "-copie", all),
      displayName: source.displayName + " (copie)",
      status: "draft",
      createdAt: now(),
      updatedAt: now(),
    };
    await upsertRows([copy]);
    return copy;
  },
};

export const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

export const uniqueSlug = (base: string, profiles: Profile[], ignoreId?: string) => {
  const slugs = new Set(profiles.filter((p) => p.id !== ignoreId).map((p) => p.slug));
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

/** Profile for the public signup form: minimal defaults the admin fills in later. */
export const pendingProfile = (): Profile => ({
  ...emptyProfile(),
  status: "pending",
});
