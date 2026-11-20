import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState, PageHeader } from "@/components/site/Breadcrumbs";
import { ProfileGrid } from "@/components/site/ProfileCard";
import { usePublishedProfiles } from "@/services/profiles";
import { useCatalog, useCatalogT } from "@/services/catalogs";
import { SITE } from "@/config/site";
import { pageHead } from "@/lib/seo";
import { slugify } from "@/data/profiles";

export const Route = createFileRoute("/_site/categorie/$slug")({
  head: ({ params }) => {
    const title = `${params.slug.replace(/-/g, " ")} — ${SITE.name}`;
    return pageHead({
      title,
      description: `Profils de catégorie ${params.slug.replace(/-/g, " ")} : sélection vérifiée, tarifs et contact direct.`,
      path: `/categorie/${params.slug}`,
    });
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  // Slugs are derived from the stable French label so the URL stays the same
  // regardless of the visitor's chosen display language.
  const rawCategories = useCatalog("category");
  const categories = useCatalogT("category");
  const match = rawCategories.find((c) => slugify(c.label) === slug);
  const label = categories.find((c) => c.id === match?.id)?.label;
  const profiles = usePublishedProfiles();

  if (!match) {
    return (
      <div className="container-site py-20">
        <title>{`Catégorie introuvable — ${SITE.name}`}</title>
        <meta name="robots" content="noindex, nofollow" />
        <EmptyState title="Catégorie introuvable" />
      </div>
    );
  }

  const list = profiles.filter((p) => p.category === match.id);
  const others = rawCategories.filter((c) => c.id !== match.id);

  return (
    <div className="container-site pt-8">
      <PageHeader eyebrow="Catégorie" title={label ?? match.label}>
        Une sélection de profils {label ?? match.label}, vérifiés et présentés par notre équipe
        éditoriale.
      </PageHeader>
      {list.length ? (
        <ProfileGrid profiles={list} />
      ) : (
        <EmptyState title="Aucun profil pour le moment" />
      )}
      {others.length > 0 && (
        <section className="mt-16">
          <h2 className="text-3xl">Autres catégories</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {others.map((c) => (
              <Link
                key={c.id}
                to="/categorie/$slug"
                params={{ slug: slugify(c.label) }}
                className="rounded-full border border-border px-4 py-1.5 text-sm hover:border-gold hover:text-gold"
              >
                {categories.find((x) => x.id === c.id)?.label ?? c.label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
