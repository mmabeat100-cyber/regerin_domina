import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs, EmptyState, PageHeader } from "@/components/site/Breadcrumbs";
import { ProfileGrid } from "@/components/site/ProfileCard";
import { usePublishedProfiles } from "@/services/profiles";
import { useCountries, findCountry } from "@/services/geo";
import { seedCountries } from "@/data/geo";
import { SITE } from "@/config/site";

export const Route = createFileRoute("/_site/ville/$country/$city")({
  head: ({ params }) => {
    const name = seedCountries.flatMap((c) => c.cities).find((c) => c.slug === params.city)?.name ?? "Ville";
    const t = `Domina à ${name} — ${SITE.name}`;
    const d = `Trouvez une domina ou bizarrlady à ${name} : profils vérifiés, disponibilités et tarifs.`;
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] };
  },
  component: CityPage,
});

function CityPage() {
  const { country, city } = Route.useParams();
  const countries = useCountries();
  const profiles = usePublishedProfiles();
  const c = findCountry(countries, country);
  const ci = c?.cities.find((x) => x.slug === city);
  if (!c || !ci) return <div className="container-site py-20"><EmptyState title="Ville introuvable" /></div>;
  const list = profiles.filter((p) => p.availability.some((a) => a.cities.includes(ci.slug)));
  const nearby = c.cities.filter((x) => x.slug !== ci.slug);
  return (
    <div className="container-site pt-8">
      <Breadcrumbs items={[{ label: c.name, to: "/pays/$country", params: { country: c.slug } }, { label: ci.name }]} />
      <PageHeader eyebrow={c.name} title={`Domina à ${ci.name}`}>{ci.seoText}</PageHeader>
      {list.length ? <ProfileGrid profiles={list} /> : <EmptyState title="Aucun profil pour le moment" text="Revenez bientôt, de nouveaux profils sont ajoutés régulièrement." />}
      {nearby.length > 0 && (
        <section className="mt-16">
          <h2 className="text-3xl">Villes voisines</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {nearby.map((n) => <Link key={n.slug} to="/ville/$country/$city" params={{ country: c.slug, city: n.slug }} className="rounded-full border border-border px-4 py-1.5 text-sm hover:border-gold hover:text-gold">{n.name}</Link>)}
          </div>
        </section>
      )}
    </div>
  );
}
