import type { Profile } from "@/types";

export interface DirectoryFilters {
  q?: string;
  category?: string;
  country?: string; // country code
  city?: string; // city slug
  servesFor?: string[];
  languages?: string[];
  services?: string[];
  minPrice?: number;
  maxPrice?: number;
  verified?: boolean;
  mode?: "recoit" | "deplace";
  sort?: "relevance" | "priceAsc" | "priceDesc" | "newest" | "rating";
}

export const PRICE_MIN = 100;
export const PRICE_MAX = 600;

/** Filtrage pur et testable. `cityLabel` sert à la recherche texte sur le nom des villes. */
export function filterProfiles(profiles: Profile[], f: DirectoryFilters, cityLabel: (slug: string) => string = (s) => s) {
  const q = f.q?.trim().toLowerCase();
  const out = profiles.filter((p) => {
    if (f.category && p.category !== f.category) return false;
    if (f.country && !p.availability.some((a) => a.countryCode === f.country)) return false;
    if (f.city && !p.availability.some((a) => a.cities.includes(f.city!))) return false;
    if (f.servesFor?.length && !f.servesFor.some((s) => p.servesFor.includes(s as Profile["servesFor"][number]))) return false;
    if (f.languages?.length && !f.languages.every((l) => p.languages.includes(l))) return false;
    if (f.services?.length && !f.services.every((s) => p.services.includes(s))) return false;
    if (f.minPrice != null && p.price.perHour < f.minPrice) return false;
    if (f.maxPrice != null && p.price.perHour > f.maxPrice) return false;
    if (f.verified && !p.verified) return false;
    if (f.mode && p.mode !== f.mode && p.mode !== "both") return false;
    if (q) {
      const hay = [p.displayName, ...p.availability.flatMap((a) => a.cities.map(cityLabel))].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const sorted = [...out];
  switch (f.sort) {
    case "priceAsc":
      sorted.sort((a, b) => a.price.perHour - b.price.perHour);
      break;
    case "priceDesc":
      sorted.sort((a, b) => b.price.perHour - a.price.perHour);
      break;
    case "newest":
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "rating":
      sorted.sort((a, b) => b.rating.average - a.rating.average || b.rating.count - a.rating.count);
      break;
    default:
      sorted.sort((a, b) => Number(b.vip) - Number(a.vip) || Number(b.featured) - Number(a.featured) || Number(b.verified) - Number(a.verified));
  }
  return sorted;
}
