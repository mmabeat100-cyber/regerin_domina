import { Link } from "@tanstack/react-router";
import { BadgeCheck, Crown, MapPin } from "lucide-react";
import type { Profile } from "@/types";
import { Media } from "./Media";
import { StarRating } from "./StarRating";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fr } from "@/i18n/fr";
import { useCatalogLabel } from "@/services/catalogs";
import { useCountries, cityName } from "@/services/geo";
import { useStudios } from "@/services/studios";

export const primaryCityOf = (p: Profile) => p.availability.find((a) => a.primaryCity)?.primaryCity ?? p.availability[0]?.cities[0];
export const allCitiesOf = (p: Profile) => p.availability.flatMap((a) => a.cities);

export function ProfileCard({ profile: p }: { profile: Profile }) {
  const label = useCatalogLabel();
  const countries = useCountries();
  const studios = useStudios();
  const studio = studios.find((s) => s.id === p.studioId);
  const cities = allCitiesOf(p);
  const main = primaryCityOf(p);
  return (
    <Link
      to="/profil/$slug"
      params={{ slug: p.slug }}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition-all duration-500 hover:border-gold/40 hover:shadow-elegant"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <Media src={p.avatar} alt={`Visuel de ${p.displayName}`} className="transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-fade" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {p.vip && (
            <Badge variant="vip" className="gap-1"><Crown className="h-3 w-3" aria-hidden />{fr.card.vip}</Badge>
          )}
          {p.verified && (
            <Badge variant="gold" className="gap-1 backdrop-blur"><BadgeCheck className="h-3 w-3" aria-hidden />{fr.card.verified}</Badge>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="eyebrow">{label(p.category)}</p>
          <h3 className="mt-1 truncate text-2xl">{p.displayName}</h3>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden />
            {main ? cityName(countries, main) : "—"}
            {cities.length > 1 && <span className="text-gold">· {fr.card.moreCities(cities.length - 1)}</span>}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-4 py-3 text-xs">
        <div className="min-w-0">
          <p className="truncate text-muted-foreground">{studio?.name ?? fr.card.independent}</p>
          {p.rating.count > 0 ? (
            <p className="mt-1 flex items-center gap-1"><StarRating value={p.rating.average} size={11} /> <span className="text-muted-foreground">({p.rating.count})</span></p>
          ) : (
            <p className="mt-1 text-muted-foreground/70">{fr.card.noReviews}</p>
          )}
        </div>
        <p className="shrink-0 text-right">
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">{fr.card.from}</span>
          <span className="font-serif text-lg text-gold">
            {p.price.perHour} {p.price.currency === "EUR" ? "€" : "CHF"}
          </span>
          <span className="text-muted-foreground">{fr.card.perHour}</span>
        </p>
      </div>
    </Link>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Skeleton className="aspect-[2/3] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function ProfileGrid({ profiles }: { profiles: Profile[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
      {profiles.map((p) => (
        <ProfileCard key={p.id} profile={p} />
      ))}
    </div>
  );
}
