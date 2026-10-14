import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Layers, Phone } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { HeroSearch } from "@/components/site/HeroSearch";
import { ProfileCard, ProfileGrid } from "@/components/site/ProfileCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { usePublishedProfiles } from "@/services/profiles";
import { useCountries } from "@/services/geo";
import { fr } from "@/i18n/fr";
import { SITE } from "@/config/site";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: `${SITE.name} — Annuaire premium de dominas & studios` },
      { name: "description", content: "Annuaire discret de dominas, bizarrladies et studios en France, Belgique, Suisse et Luxembourg." },
      { property: "og:title", content: `${SITE.name} — ${SITE.slogan}` },
      { property: "og:description", content: "Annuaire discret de dominas, bizarrladies et studios en Europe francophone." },
    ],
  }),
  component: Home,
});

function Home() {
  const profiles = usePublishedProfiles();
  const countries = useCountries();
  const featured = profiles.filter((p) => p.featured || p.vip);
  const latest = [...profiles].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
  const count = (pred: (cc: string, city: string) => boolean) => profiles.filter((p) => p.availability.some((a) => a.cities.some((c) => pred(a.countryCode, c)))).length;
  const popularCities = countries.flatMap((c) => c.cities.filter((x) => x.popular).map((x) => ({ ...x, country: c })));

  return (
    <>
      <section className="relative overflow-hidden">
        <img src={hero} alt="" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-fade" />
        <div className="container-site relative flex min-h-[78vh] flex-col justify-end pb-16 pt-32">
          <div className="max-w-3xl animate-fade-up">
            <p className="eyebrow">{fr.home.eyebrow} · {SITE.slogan}</p>
            <h1 className="mt-4 text-5xl leading-[1.05] sm:text-7xl">{fr.home.title}</h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">{fr.home.subtitle}</p>
          </div>
          <div className="mt-10 max-w-4xl"><HeroSearch /></div>
        </div>
      </section>

      <section className="container-site mt-20">
        <h2 className="text-3xl">{fr.home.popularCountries}</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {countries.map((c) => (
            <Link key={c.code} to="/pays/$country" params={{ country: c.slug }} className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-gold/40">
              <p className="eyebrow">{c.code}</p>
              <p className="mt-2 font-serif text-2xl">{c.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{count((cc) => cc === c.code)} profils</p>
            </Link>
          ))}
        </div>
        <h2 className="mt-14 text-3xl">{fr.home.popularCities}</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {popularCities.map((c) => (
            <Link key={c.slug} to="/ville/$country/$city" params={{ country: c.country.slug, city: c.slug }} className="rounded-full border border-border px-5 py-2 text-sm transition-colors hover:border-gold hover:text-gold">
              {c.name} <span className="text-muted-foreground">· {count((_, ci) => ci === c.slug)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-site mt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Sélection</p>
            <h2 className="mt-2 text-4xl">{fr.home.featured}</h2>
          </div>
        </div>
        <Carousel opts={{ align: "start" }} className="mt-8">
          <CarouselContent>
            {featured.map((p) => (
              <CarouselItem key={p.id} className="basis-1/2 md:basis-1/3 xl:basis-1/4">
                <ProfileCard profile={p} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-3 hidden md:flex" />
          <CarouselNext className="-right-3 hidden md:flex" />
        </Carousel>
      </section>

      <section className="container-site mt-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-4xl">{fr.home.latest}</h2>
          <Link to="/annuaire" search={{ sort: "newest" }} className="flex shrink-0 items-center gap-1 text-sm text-gold hover:underline">
            Tout voir <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8"><ProfileGrid profiles={latest} /></div>
      </section>

      <section className="container-site mt-24 grid gap-12 md:grid-cols-2">
        <div>
          <p className="eyebrow">Éditorial</p>
          <h2 className="mt-2 text-4xl">{fr.home.seoTitle}</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">{fr.home.seo}</p>
        </div>
        <div>
          <h2 className="text-4xl">{fr.home.howTitle}</h2>
          <ol className="mt-6 space-y-5">
            {fr.home.steps.map((s, i) => {
              const Icon = [Compass, Layers, Phone][i];
              return (
                <li key={s.t} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/40 text-gold"><Icon className="h-5 w-5" aria-hidden /></span>
                  <div>
                    <p className="font-serif text-2xl">{i + 1}. {s.t}</p>
                    <p className="text-sm text-muted-foreground">{s.d}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </>
  );
}
