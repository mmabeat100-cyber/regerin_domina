import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AdminHeader, StatCard } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { useAllProfiles } from "@/services/profiles";
import { useReviews } from "@/services/reviews";
import { useCountries } from "@/services/geo";
import { fr } from "@/i18n/fr";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const profiles = useAllProfiles();
  const reviews = useReviews();
  const countries = useCountries();
  const published = profiles.filter((p) => p.status === "published").length;
  const max = Math.max(1, ...countries.map((c) => profiles.filter((p) => p.availability.some((a) => a.countryCode === c.code)).length));
  return (
    <>
      <AdminHeader
        title={fr.admin.dashboard}
        actions={<Button asChild variant="velvet"><Link to="/admin/profils/nouveau"><Plus /> {fr.admin.addProfile}</Link></Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Profils" value={profiles.length} hint={`${published} publiés · ${profiles.length - published} brouillons`} />
        <StatCard label="Vérifiés" value={profiles.filter((p) => p.verified).length} />
        <StatCard label="VIP" value={profiles.filter((p) => p.vip).length} />
        <StatCard label="Avis en attente" value={<Link to="/admin/avis" className="text-gold hover:underline">{reviews.filter((r) => r.status === "pending").length}</Link>} />
      </div>
      <section className="mt-8 rounded-lg border border-border bg-card p-6">
        <h2 className="text-2xl">Répartition par pays</h2>
        <ul className="mt-5 space-y-3">
          {countries.map((c) => {
            const n = profiles.filter((p) => p.availability.some((a) => a.countryCode === c.code)).length;
            return (
              <li key={c.code} className="grid grid-cols-[110px_1fr_30px] items-center gap-3 text-sm">
                <span>{c.name}</span>
                <div className="h-2 overflow-hidden rounded bg-secondary"><div className="h-full bg-velvet" style={{ width: `${(n / max) * 100}%` }} /></div>
                <span className="text-right text-muted-foreground">{n}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
