import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProfileCardSkeleton, ProfileGrid } from "@/components/site/ProfileCard";
import { DirectoryFiltersPanel } from "@/components/site/DirectoryFilters";
import { EmptyState, PageHeader } from "@/components/site/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { filterProfiles, type DirectoryFilters } from "@/lib/filter";
import { usePublishedProfiles } from "@/services/profiles";
import { useCountries, cityName } from "@/services/geo";
import { useCatalogLabel } from "@/services/catalogs";
import { fr } from "@/i18n/fr";
import { SITE } from "@/config/site";

const arr = (v: unknown) => (Array.isArray(v) ? v.map(String) : typeof v === "string" && v ? v.split(",") : undefined);
const num = (v: unknown) => (v == null || v === "" || isNaN(Number(v)) ? undefined : Number(v));
const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

export const Route = createFileRoute("/_site/annuaire")({
  validateSearch: (s: Record<string, unknown>): DirectoryFilters => ({
    q: str(s.q),
    category: str(s.category),
    country: str(s.country),
    city: str(s.city),
    servesFor: arr(s.servesFor),
    languages: arr(s.languages),
    services: arr(s.services),
    minPrice: num(s.minPrice),
    maxPrice: num(s.maxPrice),
    verified: s.verified === true || s.verified === "true" ? true : undefined,
    mode: s.mode === "recoit" || s.mode === "deplace" ? s.mode : undefined,
    sort: (["relevance", "priceAsc", "priceDesc", "newest", "rating"] as const).find((x) => x === s.sort),
  }),
  head: () => ({
    meta: [
      { title: `Annuaire des dominas & bizarrladies — ${SITE.name}` },
      { name: "description", content: "Filtrez par ville, catégorie, langues, prix et pratiques pour trouver le profil qui vous correspond." },
      { property: "og:title", content: `Annuaire — ${SITE.name}` },
      { property: "og:description", content: "Tous les profils vérifiés, filtrables par ville, prix et pratiques." },
    ],
  }),
  component: Directory,
});

const PAGE = 12;

function Directory() {
  const f = Route.useSearch();
  const navigate = useNavigate({ from: "/annuaire" });
  const profiles = usePublishedProfiles();
  const countries = useCountries();
  const label = useCatalogLabel();
  const [visible, setVisible] = useState(PAGE);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(f.q ?? "");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350); // simulation de chargement réseau
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      if ((q || undefined) !== f.q) update({ q: q || undefined });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const update = (patch: Partial<DirectoryFilters>) => {
    setVisible(PAGE);
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });
  };

  const results = useMemo(() => filterProfiles(profiles, f, (s) => cityName(countries, s)), [profiles, f, countries]);

  const chips: { label: string; clear: Partial<DirectoryFilters> }[] = [];
  if (f.q) chips.push({ label: `“${f.q}”`, clear: { q: undefined } });
  if (f.category) chips.push({ label: label(f.category), clear: { category: undefined } });
  if (f.country) chips.push({ label: countries.find((c) => c.code === f.country)?.name ?? f.country, clear: { country: undefined, city: undefined } });
  if (f.city) chips.push({ label: cityName(countries, f.city), clear: { city: undefined } });
  f.servesFor?.forEach((s) => chips.push({ label: fr.servesFor[s as keyof typeof fr.servesFor], clear: { servesFor: f.servesFor!.filter((x) => x !== s) } }));
  f.languages?.forEach((s) => chips.push({ label: label(s), clear: { languages: f.languages!.filter((x) => x !== s) } }));
  f.services?.forEach((s) => chips.push({ label: label(s), clear: { services: f.services!.filter((x) => x !== s) } }));
  if (f.minPrice || f.maxPrice) chips.push({ label: `${f.minPrice ?? "…"} – ${f.maxPrice ?? "…"} €`, clear: { minPrice: undefined, maxPrice: undefined } });
  if (f.verified) chips.push({ label: fr.filters.verifiedOnly, clear: { verified: undefined } });
  if (f.mode) chips.push({ label: fr.mode[f.mode], clear: { mode: undefined } });

  const reset = () => {
    setQ("");
    navigate({ search: {}, replace: true });
  };
  const panel = <DirectoryFiltersPanel key={JSON.stringify(f)} value={f} onChange={update} />;

  return (
    <div className="container-site">
      <PageHeader eyebrow={fr.nav.directory} title="Trouver votre guide" />
      <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden lg:block" aria-label={fr.filters.title}>
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-auto pr-2">{panel}</div>
        </aside>
        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={fr.filters.searchPlaceholder} aria-label={fr.filters.searchPlaceholder} className="h-11 pl-9" />
            </div>
            <div className="flex gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-11 lg:hidden"><SlidersHorizontal /> {fr.filters.title}</Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[88vw] max-w-sm overflow-auto">
                  <SheetTitle className="mb-6 font-serif text-2xl">{fr.filters.title}</SheetTitle>
                  {panel}
                </SheetContent>
              </Sheet>
              <Select value={f.sort ?? "relevance"} onValueChange={(v) => update({ sort: v === "relevance" ? undefined : (v as DirectoryFilters["sort"]) })}>
                <SelectTrigger className="h-11 w-[180px]" aria-label={fr.filters.sort}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(fr.sort) as (keyof typeof fr.sort)[]).map((k) => <SelectItem key={k} value={k}>{fr.sort[k]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <p className="mr-2 text-sm text-muted-foreground" aria-live="polite">{fr.filters.results(results.length)}</p>
            {chips.map((c, i) => (
              <Badge key={i} variant="gold" className="gap-1 py-1">
                {c.label}
                <button type="button" onClick={() => update(c.clear)} aria-label={`Retirer ${c.label}`}><X className="h-3 w-3" /></button>
              </Badge>
            ))}
            {chips.length > 0 && <Button variant="link" size="sm" onClick={reset}>{fr.filters.reset}</Button>}
          </div>
          <div className="mt-6">
            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <ProfileCardSkeleton key={i} />)}</div>
            ) : results.length === 0 ? (
              <EmptyState title={fr.filters.emptyTitle} text={fr.filters.emptyText} action={<Button variant="gold" onClick={reset}>{fr.filters.reset}</Button>} />
            ) : (
              <>
                <ProfileGrid profiles={results.slice(0, visible)} />
                {visible < results.length && (
                  <div className="mt-10 text-center"><Button variant="gold" onClick={() => setVisible((v) => v + PAGE)}>{fr.filters.loadMore}</Button></div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
