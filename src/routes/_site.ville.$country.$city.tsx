import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs, EmptyState, PageHeader } from "@/components/site/Breadcrumbs";
import { ProfileGrid } from "@/components/site/ProfileCard";
import { usePublishedProfiles } from "@/services/profiles";
import { useCountriesQuery, fetchCountries, findCountry } from "@/services/geo";
import { useT, useLocaleStore, locales } from "@/i18n";
import { SITE } from "@/config/site";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_site/ville/$country/$city")({
  head: async ({ params }) => {
    const t = locales[useLocaleStore.getState().locale];
    const countries = await fetchCountries();
    const name =
      countries.flatMap((c) => c.cities).find((c) => c.slug === params.city)?.name ??
      t.geo.cityNotFound;
    return pageHead({
      title: `${t.geo.cityTitle(name)} — ${SITE.name}`,
      description: t.geo.cityMetaDescription(name),
      path: `/ville/${params.country}/${params.city}`,
    });
  },
  component: CityPage,
});

function CityPage() {
  const t = useT();
  const { country, city } = Route.useParams();
  const { data: countries, isLoading } = useCountriesQuery();
  const profiles = usePublishedProfiles();
  const c = countries && findCountry(countries, country);
  const ci = c?.cities.find((x) => x.slug === city);
  if (isLoading) return null;
  if (!c || !ci)
    return (
      <div className="container-site py-20">
        <EmptyState title={t.geo.cityNotFound} />
      </div>
    );
  const list = profiles.filter((p) => p.availability.some((a) => a.cities.includes(ci.slug)));
  const nearby = c.cities.filter((x) => x.slug !== ci.slug);
  return (
    <div className="container-site pt-8">
      <Breadcrumbs
        items={[
          { label: c.name, to: "/pays/$country", params: { country: c.slug } },
          { label: ci.name },
        ]}
      />
      <PageHeader eyebrow={c.name} title={t.geo.cityTitle(ci.name)}>
        {ci.seoText}
      </PageHeader>
      {list.length ? (
        <ProfileGrid profiles={list} />
      ) : (
        <EmptyState title={t.geo.noProfilesYet} text={t.geo.comeBackSoon} />
      )}
      {nearby.length > 0 && (
        <section className="mt-16">
          <h2 className="text-3xl">{t.geo.nearbyCities}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {nearby.map((n) => (
              <Link
                key={n.slug}
                to="/ville/$country/$city"
                params={{ country: c.slug, city: n.slug }}
                className="rounded-full border border-border px-4 py-1.5 text-sm hover:border-gold hover:text-gold"
              >
                {n.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
