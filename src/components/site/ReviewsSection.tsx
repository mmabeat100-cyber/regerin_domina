import { useState } from "react";
import { toast } from "sonner";
import type { Profile } from "@/types";
import { StarInput, StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useApprovedReviews, reviewService } from "@/services/reviews";
import { useStore } from "@/store/useStore";
import { useT } from "@/i18n";

/** Reviews: fake visitor login (TODO Supabase Auth) + moderated submission form. */
export function ReviewsSection({ profile }: { profile: Profile }) {
  const t = useT();
  const reviews = useApprovedReviews(profile.id);
  const visitor = useStore((s) => s.visitor);
  const [loginOpen, setLoginOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;

  const startReview = () => (visitor ? setFormOpen(true) : setLoginOpen(true));

  return (
    <section aria-labelledby="reviews-title" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="reviews-title" className="text-3xl">
          {t.profile.reviews}
        </h2>
        <Button variant="gold" onClick={startReview}>
          {t.profile.leaveReview}
        </Button>
      </div>
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.card.noReviews}</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-[200px_1fr]">
          <div>
            <p className="font-serif text-6xl text-gold">{avg.toFixed(1)}</p>
            <StarRating value={avg} />
            <p className="mt-1 text-xs text-muted-foreground">
              {t.reviewsDialog.count(reviews.length)}
            </p>
            <div className="mt-4 space-y-1">
              {[5, 4, 3, 2, 1].map((s) => {
                const c = reviews.filter((r) => r.rating === s).length;
                return (
                  <div key={s} className="flex items-center gap-2 text-xs">
                    <span className="w-3">{s}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded bg-secondary">
                      <div
                        className="h-full bg-velvet"
                        style={{ width: `${(c / reviews.length) * 100}%` }}
                      />
                    </div>
                    <span className="w-4 text-muted-foreground">{c}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{r.authorName}</p>
                  <StarRating value={r.rating} size={12} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                <p className="mt-2 text-xs text-muted-foreground/60">
                  {new Date(r.createdAt).toLocaleDateString(t.dateLocale)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {t.reviewsDialog.visitorLoginTitle}
            </DialogTitle>
            <DialogDescription>{t.reviewsDialog.visitorLoginText}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim().length < 2) return toast.error(t.reviewsDialog.nicknameTooShort);
              useStore.getState().set(() => ({ visitor: { name: name.trim() } }));
              setLoginOpen(false);
              setFormOpen(true);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="v-name">{t.reviewsDialog.nickname}</Label>
              <Input id="v-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-pass">{t.reviewsDialog.password}</Label>
              <Input id="v-pass" type="password" />
            </div>
            <DialogFooter>
              <Button type="submit" variant="velvet">
                {t.reviewsDialog.signIn}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {t.reviewsDialog.formTitle(profile.displayName)}
            </DialogTitle>
            <DialogDescription>{t.reviewsDialog.loggedInAs(visitor?.name ?? "")}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (comment.trim().length < 10) return toast.error(t.reviewsDialog.commentTooShort);
              reviewService.add(profile.id, visitor?.name ?? "Anonymous", rating, comment.trim());
              setComment("");
              setFormOpen(false);
              toast.success(t.profile.pending);
            }}
            className="space-y-4"
          >
            <StarInput value={rating} onChange={setRating} />
            <div className="space-y-2">
              <Label htmlFor="r-comment">{t.reviewsDialog.comment}</Label>
              <Textarea
                id="r-comment"
                rows={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
              />
            </div>
            <DialogFooter>
              <Button type="submit" variant="velvet">
                {t.reviewsDialog.send}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
