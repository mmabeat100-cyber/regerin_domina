import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/Breadcrumbs";
import { usePublishedProfiles } from "@/services/profiles";
import { useCountries } from "@/services/geo";
import { SITE } from "@/config/site";

export const Route = createFileRoute("/_site/villes")({
  head: () => ({
    meta: [
      { title: `Toutes les villes — ${SITE.name}` },
      { name: "description", content: "Parcourez les villes de France, Belgique, Suisse et Luxembourg et le nombre de profils disponibles." },
      { property: "og:title", content: `Villes — ${SITE.name}` },
      { property: "og:description", content: "Toutes les villes couvertes par l'annuaire." },
    ],
  }),
  component: Cities,
});

function Cities() {
  const countries = useCountries();
  const profiles = usePublishedProfiles();
  const count = (slug: string) => profiles.filter((p) => p.availability.some((a) => a.cities.includes(slug))).length;
  return (
    <div className="container-site">
      <PageHeader eyebrow="Villes" title="Où nous trouver" />
      <div className="grid gap-6 md:grid-cols-2">
        {countries.map((c) => (
          <section key={c.code} className="rounded-lg border border-border bg-card p-6">
            <Link to="/pays/$country" params={{ country: c.slug }} className="font-serif text-3xl hover:text-gold">{c.name}</Link>
            <ul className="mt-4 divide-y divide-border">
              {c.cities.map((ci) => (
                <li key={ci.slug}>
                  <Link to="/ville/$country/$city" params={{ country: c.slug, city: ci.slug }} className="flex justify-between py-2.5 text-sm hover:text-gold">
                    <span>{ci.name}</span><span className="text-muted-foreground">{count(ci.slug)} profils</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
