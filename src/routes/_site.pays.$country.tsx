import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs, EmptyState, PageHeader } from "@/components/site/Breadcrumbs";
import { ProfileGrid } from "@/components/site/ProfileCard";
import { usePublishedProfiles } from "@/services/profiles";
import { useCountries, findCountry } from "@/services/geo";
import { seedCountries } from "@/data/geo";
import { SITE } from "@/config/site";

export const Route = createFileRoute("/_site/pays/$country")({
  head: ({ params }) => {
    const name = seedCountries.find((c) => c.slug === params.country)?.name ?? "Pays";
    const t = `Domina en ${name} — ${SITE.name}`;
    const d = `Dominas, bizarrladies et studios en ${name} : profils vérifiés, tarifs et contact direct.`;
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] };
  },
  component: CountryPage,
});

function CountryPage() {
  const { country } = Route.useParams();
  const countries = useCountries();
  const profiles = usePublishedProfiles();
  const c = findCountry(countries, country);
  if (!c) return <div className="container-site py-20"><EmptyState title="Pays introuvable" /></div>;
  const list = profiles.filter((p) => p.availability.some((a) => a.countryCode === c.code));
  return (
    <div className="container-site pt-8">
      <Breadcrumbs items={[{ label: "Villes", to: "/villes" }, { label: c.name }]} />
      <PageHeader eyebrow="Pays" title={`Domina en ${c.name}`}>
        Une sélection discrète de profils disponibles en {c.name}, présentés par notre équipe éditoriale.
      </PageHeader>
      <div className="mb-10 flex flex-wrap gap-2">
        {c.cities.map((city) => (
          <Link key={city.slug} to="/ville/$country/$city" params={{ country: c.slug, city: city.slug }} className="rounded-full border border-border px-4 py-1.5 text-sm hover:border-gold hover:text-gold">{city.name}</Link>
        ))}
      </div>
      {list.length ? <ProfileGrid profiles={list} /> : <EmptyState title="Aucun profil pour le moment" />}
    </div>
  );
}
