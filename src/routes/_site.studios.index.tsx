import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { PageHeader } from "@/components/site/Breadcrumbs";
import { Media } from "@/components/site/Media";
import { useStudios } from "@/services/studios";
import { useAllProfiles } from "@/services/profiles";
import { useCountries, cityName } from "@/services/geo";
import { SITE } from "@/config/site";

export const Route = createFileRoute("/_site/studios/")({
  head: () => ({
    meta: [
      { title: `Studios — ${SITE.name}` },
      { name: "description", content: "Studios et lieux équipés partenaires, et les profils qui y exercent." },
      { property: "og:title", content: `Studios — ${SITE.name}` },
      { property: "og:description", content: "Les studios référencés et leurs profils." },
    ],
  }),
  component: Studios,
});

function Studios() {
  const studios = useStudios();
  const profiles = useAllProfiles();
  const countries = useCountries();
  return (
    <div className="container-site">
      <PageHeader eyebrow="Studios" title="Lieux d'exception" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {studios.map((s) => (
          <Link key={s.id} to="/studios/$slug" params={{ slug: s.slug }} className="group overflow-hidden rounded-lg border border-border bg-card hover:border-gold/40">
            <div className="aspect-[4/3] overflow-hidden"><Media src={s.image} alt={s.name} className="transition-transform duration-700 group-hover:scale-105" /></div>
            <div className="p-5">
              <h2 className="text-2xl">{s.name}</h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3 w-3" />{cityName(countries, s.cityId)}</p>
              <p className="mt-2 text-xs text-gold">{profiles.filter((p) => p.studioId === s.id && p.status === "published").length} profils rattachés</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
