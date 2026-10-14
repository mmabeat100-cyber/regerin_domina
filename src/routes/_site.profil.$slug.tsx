import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, Crown, Flag, Globe, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Gallery } from "@/components/site/Gallery";
import { StarRating } from "@/components/site/StarRating";
import { ReviewsSection } from "@/components/site/ReviewsSection";
import { ProfileGrid } from "@/components/site/ProfileCard";
import { Breadcrumbs, EmptyState } from "@/components/site/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useProfileBySlug, usePublishedProfiles } from "@/services/profiles";
import { useCountries, cityName } from "@/services/geo";
import { useCatalogLabel } from "@/services/catalogs";
import { useStudios } from "@/services/studios";
import { seedProfiles } from "@/data/profiles";
import { fr } from "@/i18n/fr";
import { SITE } from "@/config/site";
import type { Profile } from "@/types";

export const Route = createFileRoute("/_site/profil/$slug")({
  head: ({ params }) => {
    const p = seedProfiles.find((x) => x.slug === params.slug);
    const name = p?.displayName ?? "Profil";
    const desc = p ? `${p.displayName} — ${p.headline} Tarifs, disponibilités et contact direct.` : "Fiche profil";
    return {
      meta: [
        { title: `${name} — ${SITE.name}` },
        { name: "description", content: desc },
        { property: "og:title", content: `${name} — ${SITE.name}` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "profile" },
      ],
    };
  },
  component: ProfilePage,
});

const cur = (c: string) => (c === "EUR" ? "€" : "CHF");

function Tags({ title, items, variant = "tag" }: { title: string; items: string[]; variant?: "tag" | "taboo" }) {
  const label = useCatalogLabel();
  if (!items.length) return null;
  return (
    <div>
      <h3 className="eyebrow mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">{items.map((i) => <Badge key={i} variant={variant} className="px-3 py-1">{label(i)}</Badge>)}</div>
    </div>
  );
}

function ContactButtons({ p }: { p: Profile }) {
  const c = p.contact;
  const mail = `mailto:${c.email}?subject=${encodeURIComponent(fr.profile.mailSubject)}`;
  return (
    <div className="grid grid-cols-2 gap-2">
      {c.phone && <Button asChild variant="velvet"><a href={`tel:${c.phone.replace(/\s/g, "")}`}><Phone /> {fr.profile.call}</a></Button>}
      {c.whatsapp && <Button asChild variant="gold"><a href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle /> {fr.profile.whatsapp}</a></Button>}
      {c.email && <Button asChild variant="outline"><a href={mail}><Mail /> {fr.profile.email}</a></Button>}
      {c.website && <Button asChild variant="outline"><a href={c.website} target="_blank" rel="noreferrer"><Globe /> {fr.profile.website}</a></Button>}
      {c.instagram && <Button asChild variant="outline"><a href={`https://instagram.com/${c.instagram}`} target="_blank" rel="noreferrer"><Instagram /> {fr.profile.instagram}</a></Button>}
    </div>
  );
}

function ProfilePage() {
  const { slug } = Route.useParams();
  const p = useProfileBySlug(slug);
  const all = usePublishedProfiles();
  const countries = useCountries();
  const studios = useStudios();
  const label = useCatalogLabel();
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [expanded, setExpanded] = useState(false);
  const [report, setReport] = useState("");
  const [reportOpen, setReportOpen] = useState(false);

  if (!p) {
    return (
      <div className="container-site py-20">
        <EmptyState title="Profil introuvable" text="Ce profil n'existe pas ou n'est plus en ligne." action={<Button asChild variant="gold"><Link to="/annuaire">Voir l'annuaire</Link></Button>} />
      </div>
    );
  }
  const studio = studios.find((s) => s.id === p.studioId);
  const cities = p.availability.flatMap((a) => a.cities);
  const similar = all.filter((x) => x.id !== p.id && (x.category === p.category || x.availability.some((a) => a.cities.some((c) => cities.includes(c))))).slice(0, 4);
  const text = lang === "fr" ? p.descriptionFr : p.descriptionEn || p.descriptionFr;
  const yn = (b?: boolean) => (b == null ? "—" : b ? fr.profile.yes : fr.profile.no);
  const info: [string, string][] = [
    [fr.profile.age, p.age ? `${p.age} ans` : "—"],
    [fr.profile.body, p.bodyType ?? "—"],
    [fr.profile.height, p.heightCm ? `${p.heightCm} cm` : "—"],
    [fr.profile.hair, p.hairColor ?? "—"],
    [fr.profile.eyes, p.eyeColor ?? "—"],
    [fr.profile.smoker, yn(p.smoker)],
    [fr.profile.piercings, yn(p.piercings)],
    [fr.profile.tattoos, yn(p.tattoos)],
    [fr.profile.languages, p.languages.map(label).join(", ") || "—"],
    [fr.profile.servesFor, p.servesFor.map((s) => fr.servesFor[s]).join(", ") || "—"],
  ];
  const firstCountry = countries.find((c) => c.code === p.availability[0]?.countryCode);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: p.displayName,
    description: p.headline,
    priceRange: `${p.price.perHour} ${p.price.currency}`,
    areaServed: cities.map((c) => cityName(countries, c)),
    ...(p.rating.count ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating.average, reviewCount: p.rating.count } } : {}),
  };

  return (
    <div className="container-site pb-28 pt-8 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs
        items={[
          { label: fr.nav.directory, to: "/annuaire" },
          ...(firstCountry ? [{ label: firstCountry.name, to: "/pays/$country", params: { country: firstCountry.slug } }] : []),
          { label: p.displayName },
        ]}
      />
      {p.status === "draft" && <p className="mt-4 rounded-md border border-gold/40 bg-gold/10 px-4 py-2 text-sm text-gold">Aperçu — ce profil est un brouillon non publié.</p>}
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div><Gallery images={p.gallery.length ? p.gallery : [p.avatar]} name={p.displayName} /></div>
        <div className="min-w-0 space-y-8">
          <header className="animate-fade-up space-y-3">
            <p className="eyebrow">{label(p.category)}</p>
            <h1 className="text-5xl sm:text-6xl">{p.displayName}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" aria-hidden />{cities.map((c) => cityName(countries, c)).join(" · ")}</span>
              <span>·</span>
              {studio ? <Link to="/studios/$slug" params={{ slug: studio.slug }} className="text-gold hover:underline">{studio.name}</Link> : <span>{fr.card.independent}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {p.rating.count > 0 ? <><StarRating value={p.rating.average} /><span className="text-sm text-muted-foreground">{p.rating.average.toFixed(1)} ({p.rating.count})</span></> : <span className="text-sm text-muted-foreground">{fr.card.noReviews}</span>}
              {p.vip && <Badge variant="vip" className="gap-1"><Crown className="h-3 w-3" />{fr.card.vip}</Badge>}
              {p.verified && <Badge variant="gold" className="gap-1"><BadgeCheck className="h-3 w-3" />{fr.card.verified}</Badge>}
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="eyebrow mb-3">{fr.profile.rates}</h2>
              <p><span className="font-serif text-4xl text-gold">{p.price.perHour} {cur(p.price.currency)}</span><span className="text-muted-foreground"> / heure</span></p>
              {p.specialOffers.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                  {p.specialOffers.map((o, i) => (
                    <li key={i} className="flex justify-between gap-2"><span>{o.label} <span className="text-muted-foreground">· {o.duration}</span></span><span className="text-gold">{o.price} {cur(p.price.currency)}</span></li>
                  ))}
                </ul>
              )}
            </div>
            <div className="hidden rounded-lg border border-border bg-card p-5 lg:block">
              <h2 className="eyebrow mb-3">{fr.profile.contact}</h2>
              <ContactButtons p={p} />
              {p.address?.street && <p className="mt-3 text-xs text-muted-foreground">{fr.profile.address} : {p.address.street}{p.address.city ? `, ${cityName(countries, p.address.city)}` : ""}</p>}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="eyebrow mb-4">{fr.profile.availability} · <span className="text-foreground">{fr.mode[p.mode]}</span></h2>
            <ul className="space-y-2 text-sm">
              {p.availability.map((a) => {
                const country = countries.find((c) => c.code === a.countryCode);
                return (
                  <li key={a.countryCode} className="flex flex-wrap gap-2">
                    <span className="w-24 shrink-0 font-medium">{country?.name}</span>
                    {a.cities.map((c) => (
                      <Link key={c} to="/ville/$country/$city" params={{ country: country?.slug ?? "", city: c }} className="text-muted-foreground hover:text-gold">
                        {cityName(countries, c)}{a.primaryCity === c && " ★"}
                      </Link>
                    ))}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="eyebrow mb-4">{fr.profile.quickInfo}</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              {info.map(([k, v]) => <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-3xl italic">« {p.headline} »</h2>
              <div className="flex shrink-0 rounded-md border border-border p-0.5 text-xs" role="group" aria-label="Langue de la description">
                {(["fr", "en"] as const).map((l) => (
                  <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={`rounded px-2.5 py-1 uppercase ${lang === l ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div className={`whitespace-pre-line leading-relaxed text-muted-foreground ${expanded ? "" : "line-clamp-4"}`}>{text}</div>
            <Button variant="link" className="px-0 text-gold" onClick={() => setExpanded((e) => !e)}>{expanded ? fr.profile.readLess : fr.profile.readMore}</Button>
          </section>

          <section className="space-y-6">
            <Tags title={fr.profile.services} items={p.services} />
            <Tags title={fr.profile.equipment} items={p.equipment} />
            <Tags title={fr.profile.taboos} items={p.taboos} variant="taboo" />
          </section>

          <ReviewsSection profile={p} />

          <Dialog open={reportOpen} onOpenChange={setReportOpen}>
            <DialogTrigger asChild><Button variant="ghost" size="sm" className="text-muted-foreground"><Flag /> {fr.profile.report}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif text-2xl">{fr.profile.report}</DialogTitle></DialogHeader>
              <Textarea rows={4} placeholder="Décrivez le problème…" value={report} onChange={(e) => setReport(e.target.value)} aria-label="Motif du signalement" />
              <DialogFooter>
                <Button variant="velvet" onClick={() => { setReport(""); setReportOpen(false); toast.success("Merci, votre signalement a été transmis à l'équipe."); }}>Envoyer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 text-4xl">{fr.profile.similar}</h2>
          <ProfileGrid profiles={similar} />
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
        <ContactButtons p={p} />
      </div>
    </div>
  );
}
