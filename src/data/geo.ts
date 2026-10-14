import type { Country } from "@/types";

const seo = (city: string) =>
  `Découvrez une sélection discrète de dominas et bizarrladies à ${city}. Chaque fiche est vérifiée par notre équipe éditoriale et présente tarifs, disponibilités et moyens de contact direct.`;

const c = (countryCode: string, slug: string, name: string, popular = false) => ({
  slug,
  name,
  countryCode,
  popular,
  seoText: seo(name),
});

export const seedCountries: Country[] = [
  {
    code: "FR",
    slug: "france",
    name: "France",
    currency: "EUR",
    cities: [
      c("FR", "paris", "Paris", true),
      c("FR", "lyon", "Lyon", true),
      c("FR", "marseille", "Marseille", true),
      c("FR", "bordeaux", "Bordeaux"),
      c("FR", "lille", "Lille"),
    ],
  },
  {
    code: "BE",
    slug: "belgique",
    name: "Belgique",
    currency: "EUR",
    cities: [c("BE", "bruxelles", "Bruxelles", true), c("BE", "liege", "Liège")],
  },
  {
    code: "CH",
    slug: "suisse",
    name: "Suisse",
    currency: "CHF",
    cities: [c("CH", "geneve", "Genève", true), c("CH", "lausanne", "Lausanne")],
  },
  {
    code: "LU",
    slug: "luxembourg",
    name: "Luxembourg",
    currency: "EUR",
    cities: [c("LU", "luxembourg-ville", "Luxembourg-Ville", true)],
  },
];
