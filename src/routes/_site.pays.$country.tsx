import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs, EmptyState, PageHeader } from "@/components/site/Breadcrumbs";
import { ProfileGrid } from "@/components/site/ProfileCard";
import { usePublishedProfiles } from "@/services/profiles";
import { useCountriesQuery, fetchCountries, findCountry } from "@/services/geo";
import { useT, useLocaleStore, locales } from "@/i18n";
import { SITE } from "@/config/site";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/pays/$country")({
  head: async ({ params }) => {
    const t = locales[useLocaleStore.getState().locale];
    const countries = await fetchCountries();
    const name = findCountry(countries, params.country)?.name ?? t.geo.countryNotFound;
    return pageHead({
      title: `${t.geo.countryTitle(name)} — ${SITE.name}`,
      description: t.geo.countryMetaDescription(name),
      path: `/pays/${params.country}`,
    });
  },
  component: CountryPage,
});

function CountryPage() {
  const t = useT();
  const { country } = Route.useParams();
  const { data: countries, isLoading } = useCountriesQuery();
  const profiles = usePublishedProfiles();
  const c = countries && findCountry(countries, country);
  if (isLoading) return null;
  if (!c)
    return (
      <div className="container-site py-20">
        <EmptyState title={t.geo.countryNotFound} />
      </div>
    );
  const list = profiles.filter((p) => p.availability.some((a) => a.countryCode === c.code));
  return (
    <div className="container-site pt-8">
      <Breadcrumbs items={[{ label: t.nav.cities, to: "/villes" }, { label: c.name }]} />
      <PageHeader eyebrow={t.geo.countryEyebrow} title={t.geo.countryTitle(c.name)}>
        {t.geo.countryIntro(c.name)}
      </PageHeader>
      <div className="mb-10 flex flex-wrap gap-2">
        {c.cities.map((city) => (
          <Link
            key={city.slug}
            to="/ville/$country/$city"
            params={{ country: c.slug, city: city.slug }}
            className="rounded-full border border-border px-4 py-1.5 text-sm hover:border-gold hover:text-gold"
          >
            {city.name}
          </Link>
        ))}
      </div>
      {list.length ? (
        <ProfileGrid profiles={list} />
      ) : (
        <EmptyState title={t.geo.noProfilesYet} />
      )}
    </div>
  );
}
