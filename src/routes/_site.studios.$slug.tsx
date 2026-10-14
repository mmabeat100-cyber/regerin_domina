import { createFileRoute } from "@tanstack/react-router";
import { Globe, MapPin } from "lucide-react";
import { Breadcrumbs, EmptyState } from "@/components/site/Breadcrumbs";
import { Media } from "@/components/site/Media";
import { ProfileGrid } from "@/components/site/ProfileCard";
import { Button } from "@/components/ui/button";
import { useStudios } from "@/services/studios";
import { usePublishedProfiles } from "@/services/profiles";
import { useCountries, cityName } from "@/services/geo";
import { seedStudios } from "@/data/studios";
import { SITE } from "@/config/site";

export const Route = createFileRoute("/_site/studios/$slug")({
  head: ({ params }) => {
    const n = seedStudios.find((s) => s.slug === params.slug)?.name ?? "Studio";
    const d = `${n} : présentation du studio et des profils qui y reçoivent.`;
    return { meta: [{ title: `${n} — ${SITE.name}` }, { name: "description", content: d }, { property: "og:title", content: `${n} — ${SITE.name}` }, { property: "og:description", content: d }] };
  },
  component: StudioPage,
});

function StudioPage() {
  const { slug } = Route.useParams();
  const s = useStudios().find((x) => x.slug === slug);
  const profiles = usePublishedProfiles();
  const countries = useCountries();
  if (!s) return <div className="container-site py-20"><EmptyState title="Studio introuvable" /></div>;
  const list = profiles.filter((p) => p.studioId === s.id);
  return (
    <div className="container-site pt-8">
      <Breadcrumbs items={[{ label: "Studios", to: "/studios" }, { label: s.name }]} />
      <div className="mt-6 grid items-end gap-8 md:grid-cols-[2fr_3fr]">
        <div className="aspect-[4/3] overflow-hidden rounded-lg border border-border"><Media src={s.image} alt={s.name} eager /></div>
        <div className="space-y-3">
          <p className="eyebrow">Studio</p>
          <h1 className="text-5xl">{s.name}</h1>
          <p className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" />{cityName(countries, s.cityId)} — {s.address}</p>
          {s.website && <Button asChild variant="gold"><a href={s.website} target="_blank" rel="noreferrer"><Globe /> Site du studio</a></Button>}
        </div>
      </div>
      <h2 className="mb-6 mt-16 text-3xl">Profils du studio</h2>
      {list.length ? <ProfileGrid profiles={list} /> : <EmptyState title="Aucun profil rattaché" />}
    </div>
  );
}
