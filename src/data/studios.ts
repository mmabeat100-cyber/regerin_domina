import type { Studio } from "@/types";

export const seedStudios: Studio[] = [
  { id: "st-1", slug: "maison-ecarlate", name: "Maison Écarlate", cityId: "paris", countryCode: "FR", address: "Paris 9e (adresse communiquée sur rendez-vous)", image: "ph:2", website: "https://example.com" },
  { id: "st-2", slug: "atelier-noir", name: "Atelier Noir", cityId: "bruxelles", countryCode: "BE", address: "Bruxelles – Ixelles", image: "grad:2" },
  { id: "st-3", slug: "studio-lac-leman", name: "Studio Lac Léman", cityId: "geneve", countryCode: "CH", address: "Genève – Eaux-Vives", image: "grad:3", website: "https://example.com" },
];
