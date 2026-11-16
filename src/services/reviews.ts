import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { queryClient } from "@/lib/queryClient";
import type { Review } from "@/types";
import { newId } from "./profiles";

const QUERY_KEY = ["reviews"] as const;

async function fetchReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, profile_id, author_name, rating, comment, status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    profileId: r.profile_id,
    authorName: r.author_name,
    rating: r.rating,
    comment: r.comment,
    status: r.status as Review["status"],
    createdAt: r.created_at,
  }));
}

export const useReviewsQuery = () =>
  useQuery({ queryKey: QUERY_KEY, queryFn: fetchReviews, staleTime: 30_000 });

export const useReviews = () => useReviewsQuery().data ?? [];

export const useApprovedReviews = (profileId: string) => {
  const all = useReviews();
  return useMemo(
    () => all.filter((r) => r.profileId === profileId && r.status === "approved"),
    [all, profileId],
  );
};

/** Recalcule la note d'un profil à partir des avis approuvés. */
const recompute = (reviews: Review[], profileId: string) => {
  const ok = reviews.filter((r) => r.profileId === profileId && r.status === "approved");
  const avg = ok.length ? ok.reduce((a, r) => a + r.rating, 0) / ok.length : 0;
  return { average: Math.round(avg * 10) / 10, count: ok.length };
};

async function syncProfileRating(profileId: string, reviews: Review[]) {
  const { data, error } = await supabase
    .from("listings")
    .select("data")
    .eq("id", profileId)
    .maybeSingle();
  if (error || !data) return;
  const profile = data.data as Record<string, unknown>;
  const next = { ...profile, rating: recompute(reviews, profileId) };
  await supabase
    .from("listings")
    .update({ data: next as unknown as Json })
    .eq("id", profileId);
  await queryClient.invalidateQueries({ queryKey: ["listings"] });
}

export const reviewService = {
  async add(profileId: string, authorName: string, rating: number, comment: string) {
    const { error } = await supabase.from("reviews").insert({
      id: newId("r"),
      profile_id: profileId,
      author_name: authorName,
      rating,
      comment,
      status: "pending",
    });
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  },
  async setStatus(id: string, status: Review["status"]) {
    const current = queryClient.getQueryData<Review[]>(QUERY_KEY) ?? [];
    const target = current.find((r) => r.id === id);
    const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
    if (error) throw error;
    const updated = current.map((r) => (r.id === id ? { ...r, status } : r));
    await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    if (target) await syncProfileRating(target.profileId, updated);
  },
  async remove(id: string) {
    const current = queryClient.getQueryData<Review[]>(QUERY_KEY) ?? [];
    const target = current.find((r) => r.id === id);
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) throw error;
    const updated = current.filter((r) => r.id !== id);
    await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    if (target) await syncProfileRating(target.profileId, updated);
  },
};
