import { createFileRoute } from "@tanstack/react-router";
import { Globe, MapPin } from "lucide-react";
import { Breadcrumbs, EmptyState } from "@/components/site/Breadcrumbs";
import { Media } from "@/components/site/Media";
import { ProfileGrid } from "@/components/site/ProfileCard";
import { Button } from "@/components/ui/button";
import { useStudiosQuery, fetchStudios } from "@/services/studios";
import { usePublishedProfiles } from "@/services/profiles";
import { useCountries, cityName } from "@/services/geo";
import { useT, useLocaleStore, locales } from "@/i18n";
import { SITE } from "@/config/site";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/studios/$slug")({
  head: async ({ params }) => {
    const t = locales[useLocaleStore.getState().locale];
    const studios = await fetchStudios();
    const n = studios.find((s) => s.slug === params.slug)?.name ?? t.geo.studioNotFound;
    return pageHead({
      title: `${n} — ${SITE.name}`,
      description: t.geo.studioMetaDescription(n),
      path: `/studios/${params.slug}`,
    });
  },
  component: StudioPage,
});

function StudioPage() {
  const t = useT();
  const { slug } = Route.useParams();
  const { data: studios, isLoading } = useStudiosQuery();
  const s = studios?.find((x) => x.slug === slug);
  const profiles = usePublishedProfiles();
  const countries = useCountries();
  if (isLoading) return null;
  if (!s)
    return (
      <div className="container-site py-20">
        <EmptyState title={t.geo.studioNotFound} />
      </div>
    );
  const list = profiles.filter((p) => p.studioId === s.id);
  return (
    <div className="container-site pt-8">
      <Breadcrumbs items={[{ label: t.nav.studios, to: "/studios" }, { label: s.name }]} />
      <div className="mt-6 grid items-end gap-8 md:grid-cols-[2fr_3fr]">
        <div className="aspect-[4/3] overflow-hidden rounded-lg border border-border">
          <Media src={s.image} alt={s.name} eager />
        </div>
        <div className="space-y-3">
          <p className="eyebrow">Studio</p>
          <h1 className="text-5xl">{s.name}</h1>
          <p className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {cityName(countries, s.cityId)} — {s.address}
          </p>
          {s.website && (
            <Button asChild variant="gold">
              <a href={s.website} target="_blank" rel="noreferrer">
                <Globe /> {t.geo.studioWebsite}
              </a>
            </Button>
          )}
        </div>
      </div>
      <h2 className="mb-6 mt-16 text-3xl">{t.geo.studioProfiles}</h2>
      {list.length ? (
        <ProfileGrid profiles={list} />
      ) : (
        <EmptyState title={t.geo.noProfilesForStudio} />
      )}
    </div>
  );
}
