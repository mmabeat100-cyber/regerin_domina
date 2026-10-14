import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Trash2, X } from "lucide-react";
import type { Review } from "@/types";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StarRating } from "@/components/site/StarRating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { reviewService, useReviews } from "@/services/reviews";
import { useAllProfiles } from "@/services/profiles";

export const Route = createFileRoute("/admin/avis")({ component: AdminReviews });

const LABEL: Record<Review["status"], string> = { pending: "En attente", approved: "Approuvé", rejected: "Refusé" };

function AdminReviews() {
  const reviews = useReviews();
  const profiles = useAllProfiles();
  const [tab, setTab] = useState<"all" | Review["status"]>("pending");
  const list = reviews.filter((r) => tab === "all" || r.status === tab);
  return (
    <>
      <AdminHeader title="Avis" subtitle={`${reviews.filter((r) => r.status === "pending").length} en attente de modération`} />
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mb-4">
        <TabsList><TabsTrigger value="pending">En attente</TabsTrigger><TabsTrigger value="approved">Approuvés</TabsTrigger><TabsTrigger value="rejected">Refusés</TabsTrigger><TabsTrigger value="all">Tous</TabsTrigger></TabsList>
      </Tabs>
      {list.length === 0 && <p className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">Aucun avis</p>}
      <ul className="space-y-3">
        {list.map((r) => {
          const p = profiles.find((x) => x.id === r.profileId);
          return (
            <li key={r.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{r.authorName}</span>
                <span className="text-muted-foreground">sur</span>
                {p ? <Link to="/admin/profils/$id" params={{ id: p.id }} className="text-gold hover:underline">{p.displayName}</Link> : "—"}
                <StarRating value={r.rating} size={12} />
                <Badge variant="outline" className="ml-auto">{LABEL[r.status]}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
              <div className="mt-3 flex gap-2">
                {r.status !== "approved" && <Button size="sm" variant="velvet" onClick={() => { reviewService.setStatus(r.id, "approved"); toast.success("Avis approuvé"); }}><Check /> Approuver</Button>}
                {r.status !== "rejected" && <Button size="sm" variant="outline" onClick={() => { reviewService.setStatus(r.id, "rejected"); toast.success("Avis refusé"); }}><X /> Refuser</Button>}
                <Button size="sm" variant="ghost" onClick={() => { reviewService.remove(r.id); toast.success("Avis supprimé"); }}><Trash2 /> Supprimer</Button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
