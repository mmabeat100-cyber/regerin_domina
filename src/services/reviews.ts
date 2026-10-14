import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import type { Review } from "@/types";
import { newId } from "./profiles";

/** Avis. TODO(Supabase) : table "reviews" + RLS (insert authentifié, lecture des approuvés). */
export const useReviews = () => useStore((s) => s.reviews);

export const useApprovedReviews = (profileId: string) => {
  const all = useReviews();
  return useMemo(() => all.filter((r) => r.profileId === profileId && r.status === "approved"), [all, profileId]);
};

/** Recalcule la note d'un profil à partir des avis approuvés. */
const recompute = (reviews: Review[], profileId: string) => {
  const ok = reviews.filter((r) => r.profileId === profileId && r.status === "approved");
  const avg = ok.length ? ok.reduce((a, r) => a + r.rating, 0) / ok.length : 0;
  return { average: Math.round(avg * 10) / 10, count: ok.length };
};

export const reviewService = {
  add(profileId: string, authorName: string, rating: number, comment: string) {
    useStore.getState().set((s) => ({
      reviews: [
        { id: newId("r"), profileId, authorName, rating, comment, status: "pending", createdAt: new Date().toISOString() },
        ...s.reviews,
      ],
    }));
  },
  setStatus(id: string, status: Review["status"]) {
    useStore.getState().set((s) => {
      const reviews = s.reviews.map((r) => (r.id === id ? { ...r, status } : r));
      const pid = s.reviews.find((r) => r.id === id)?.profileId;
      return {
        reviews,
        profiles: s.profiles.map((p) => (p.id === pid ? { ...p, rating: recompute(reviews, p.id) } : p)),
      };
    });
  },
  remove(id: string) {
    useStore.getState().set((s) => {
      const pid = s.reviews.find((r) => r.id === id)?.profileId;
      const reviews = s.reviews.filter((r) => r.id !== id);
      return { reviews, profiles: s.profiles.map((p) => (p.id === pid ? { ...p, rating: recompute(reviews, p.id) } : p)) };
    });
  },
};
