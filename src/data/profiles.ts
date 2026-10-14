import type { Availability, Currency, Mode, Profile, ServesFor } from "@/types";

/** Profils de démonstration fictifs — remplacés plus tard par une table "profiles". */
interface Seed {
  name: string;
  cat: string;
  studio?: string;
  avail: Availability[];
  price: number;
  cur?: Currency;
  vip?: boolean;
  verified?: boolean;
  featured?: boolean;
  mode: Mode;
  serves: ServesFor[];
  langs: string[];
  services: string[];
  equipment: string[];
  taboos: string[];
  age: number;
  rating: [number, number];
  img: string;
  daysAgo: number;
  draft?: boolean;
}

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const seeds: Seed[] = [
  { name: "Lady Séraphine", cat: "cat-1", studio: "st-1", avail: [{ countryCode: "FR", cities: ["paris", "lyon"], primaryCity: "paris" }], price: 300, vip: true, verified: true, featured: true, mode: "both", serves: ["hommes", "couples"], langs: ["lang-1", "lang-2"], services: ["srv-1", "srv-2", "srv-3", "srv-12"], equipment: ["eq-1", "eq-2"], taboos: ["tab-1", "tab-2"], age: 34, rating: [4.8, 12], img: "ph:1", daysAgo: 40 },
  { name: "Maîtresse Ombeline", cat: "cat-1", avail: [{ countryCode: "FR", cities: ["marseille"], primaryCity: "marseille" }], price: 250, verified: true, mode: "recoit", serves: ["hommes"], langs: ["lang-1"], services: ["srv-3", "srv-7", "srv-8"], equipment: ["eq-1"], taboos: ["tab-1", "tab-4"], age: 41, rating: [4.5, 6], img: "ph:3", daysAgo: 3 },
  { name: "Comtesse Vespera", cat: "cat-2", studio: "st-2", avail: [{ countryCode: "BE", cities: ["bruxelles", "liege"], primaryCity: "bruxelles" }, { countryCode: "LU", cities: ["luxembourg-ville"] }], price: 280, vip: true, verified: true, featured: true, mode: "both", serves: ["hommes", "femmes", "couples"], langs: ["lang-1", "lang-4", "lang-2"], services: ["srv-5", "srv-9", "srv-4", "srv-11"], equipment: ["eq-6", "eq-3"], taboos: ["tab-2"], age: 29, rating: [4.9, 21], img: "ph:2", daysAgo: 60 },
  { name: "Mistress Aurelia", cat: "cat-4", avail: [{ countryCode: "FR", cities: ["paris"] }], price: 150, mode: "deplace", serves: ["hommes", "divers"], langs: ["lang-2", "lang-1"], services: ["srv-10", "srv-8", "srv-12"], equipment: [], taboos: ["tab-3"], age: 31, rating: [0, 0], img: "grad:1", daysAgo: 1 },
  { name: "Docteure Blanche", cat: "cat-5", studio: "st-1", avail: [{ countryCode: "FR", cities: ["paris", "lille"], primaryCity: "paris" }], price: 350, verified: true, featured: true, mode: "recoit", serves: ["hommes", "couples"], langs: ["lang-1", "lang-2"], services: ["srv-4", "srv-11", "srv-12"], equipment: ["eq-5", "eq-7"], taboos: ["tab-1", "tab-4"], age: 38, rating: [4.6, 9], img: "grad:2", daysAgo: 15 },
  { name: "Lady Nocturne", cat: "cat-3", avail: [{ countryCode: "FR", cities: ["bordeaux"] }], price: 200, mode: "both", serves: ["hommes", "femmes"], langs: ["lang-1", "lang-6"], services: ["srv-1", "srv-4", "srv-6"], equipment: ["eq-3"], taboos: ["tab-2", "tab-3"], age: 27, rating: [4.2, 4], img: "ph:3", daysAgo: 8 },
  { name: "Gräfin Isolde", cat: "cat-1", studio: "st-3", avail: [{ countryCode: "CH", cities: ["geneve", "lausanne"], primaryCity: "geneve" }], price: 450, cur: "CHF", vip: true, verified: true, featured: true, mode: "recoit", serves: ["hommes", "couples"], langs: ["lang-3", "lang-1", "lang-2"], services: ["srv-1", "srv-2", "srv-3", "srv-7", "srv-12"], equipment: ["eq-1", "eq-4", "eq-2"], taboos: ["tab-1", "tab-4"], age: 44, rating: [4.9, 17], img: "ph:1", daysAgo: 90 },
  { name: "Madame Céleste", cat: "cat-2", avail: [{ countryCode: "CH", cities: ["lausanne"] }, { countryCode: "FR", cities: ["lyon"] }], price: 380, cur: "CHF", verified: true, mode: "both", serves: ["hommes"], langs: ["lang-1"], services: ["srv-5", "srv-6", "srv-9"], equipment: ["eq-6"], taboos: ["tab-2"], age: 36, rating: [4.4, 5], img: "grad:3", daysAgo: 5 },
  { name: "Lady Morgana", cat: "cat-1", avail: [{ countryCode: "BE", cities: ["liege"] }], price: 220, mode: "recoit", serves: ["hommes", "divers"], langs: ["lang-1", "lang-4"], services: ["srv-3", "srv-7", "srv-1"], equipment: ["eq-1"], taboos: ["tab-1"], age: 33, rating: [3.9, 3], img: "ph:3", daysAgo: 22 },
  { name: "Duchesse Lilith", cat: "cat-6", avail: [{ countryCode: "LU", cities: ["luxembourg-ville"] }, { countryCode: "BE", cities: ["bruxelles"] }], price: 500, vip: true, verified: true, mode: "deplace", serves: ["couples", "divers"], langs: ["lang-1", "lang-2", "lang-3"], services: ["srv-4", "srv-12", "srv-5"], equipment: [], taboos: ["tab-2", "tab-3"], age: 39, rating: [5, 7], img: "ph:2", daysAgo: 12 },
  { name: "Miss Garance", cat: "cat-3", avail: [{ countryCode: "FR", cities: ["lille"] }, { countryCode: "BE", cities: ["bruxelles"] }], price: 180, mode: "both", serves: ["hommes", "femmes"], langs: ["lang-1", "lang-4"], services: ["srv-6", "srv-4", "srv-9"], equipment: [], taboos: ["tab-3"], age: 26, rating: [4.1, 2], img: "grad:1", daysAgo: 2 },
  { name: "Lady Viviane", cat: "cat-1", avail: [{ countryCode: "FR", cities: ["lyon"] }], price: 270, verified: true, mode: "recoit", serves: ["hommes"], langs: ["lang-1", "lang-5"], services: ["srv-2", "srv-1", "srv-8"], equipment: ["eq-4", "eq-1"], taboos: ["tab-1"], age: 42, rating: [4.7, 8], img: "ph:1", daysAgo: 30 },
  { name: "Signora Amara", cat: "cat-2", studio: "st-3", avail: [{ countryCode: "CH", cities: ["geneve"] }], price: 400, cur: "CHF", mode: "recoit", serves: ["hommes", "couples"], langs: ["lang-5", "lang-1", "lang-2"], services: ["srv-5", "srv-6", "srv-3"], equipment: ["eq-6", "eq-7"], taboos: ["tab-2"], age: 35, rating: [0, 0], img: "grad:2", daysAgo: 0 },
  { name: "Maîtresse Iris", cat: "cat-4", avail: [{ countryCode: "FR", cities: ["marseille", "bordeaux"], primaryCity: "marseille" }], price: 160, mode: "deplace", serves: ["hommes", "femmes", "divers"], langs: ["lang-1"], services: ["srv-10", "srv-12"], equipment: [], taboos: ["tab-3"], age: 30, rating: [4.3, 3], img: "grad:3", daysAgo: 18, draft: true },
];

const DAY = 86400000;
const BASE = Date.parse("2026-10-01T10:00:00Z");

const bodies = ["Mince", "Athlétique", "Pulpeuse", "Élancée"];
const hairs = ["Noirs", "Bruns", "Roux", "Blonds", "Châtains"];
const eyes = ["Verts", "Bruns", "Bleus", "Noisette"];

export const seedProfiles: Profile[] = seeds.map((s, i) => {
  const slug = slugify(s.name);
  const date = new Date(BASE - s.daysAgo * DAY).toISOString();
  const imgs = ["ph:1", "ph:2", "ph:3", "grad:1", "grad:2", "grad:3"];
  return {
    id: `p-${i + 1}`,
    slug,
    displayName: s.name,
    category: s.cat,
    studioId: s.studio,
    status: s.draft ? "draft" : "published",
    verified: !!s.verified,
    vip: !!s.vip,
    featured: !!s.featured,
    createdAt: date,
    updatedAt: date,
    age: s.age,
    bodyType: bodies[i % bodies.length],
    heightCm: 162 + ((i * 3) % 18),
    hairColor: hairs[i % hairs.length],
    eyeColor: eyes[i % eyes.length],
    smoker: i % 4 === 0,
    piercings: i % 3 === 0,
    tattoos: i % 2 === 0,
    languages: s.langs,
    servesFor: s.serves,
    avatar: s.img,
    gallery: [s.img, ...imgs.filter((x) => x !== s.img).slice(i % 3, (i % 3) + 3)],
    availability: s.avail,
    mode: s.mode,
    address: s.mode !== "deplace" && i % 3 === 0 ? { street: "Adresse communiquée sur rendez-vous", city: s.avail[0].cities[0], countryCode: s.avail[0].countryCode } : undefined,
    price: { perHour: s.price, currency: s.cur ?? "EUR" },
    specialOffers:
      i % 2 === 0
        ? [
            { label: "Séance découverte", duration: "45 min", price: Math.round(s.price * 0.8) },
            { label: "Demi-journée", duration: "4 h", price: s.price * 3 },
          ]
        : [],
    contact: {
      phone: "+33 6 00 00 00 " + String(10 + i).padStart(2, "0"),
      whatsapp: i % 2 === 0 ? "+33600000" + String(100 + i) : undefined,
      email: `${slug}@example.com`,
      website: i % 3 === 0 ? "https://example.com" : undefined,
      instagram: i % 4 === 1 ? slug.replace(/-/g, "_") : undefined,
    },
    headline: "Une approche exigeante, bienveillante et parfaitement discrète.",
    descriptionFr:
      `${s.name} vous accueille dans un cadre élégant et soigné, où chaque rencontre se prépare avec attention. Le respect des limites, la communication préalable et la confidentialité sont au cœur de sa pratique.\n\nAprès un premier échange, elle définit avec vous un déroulé sur mesure, adapté à votre expérience. Les débutants comme les initiés sont les bienvenus. Tenue correcte et ponctualité appréciées.\n\nLes demandes se font uniquement par les moyens de contact indiqués, au minimum 24 h à l'avance.`,
    descriptionEn:
      `${s.name} welcomes you in an elegant and refined setting where every meeting is carefully prepared. Respect for limits, prior communication and confidentiality are at the heart of her practice.\n\nAfter a first exchange, she designs a tailored session suited to your experience. Beginners and experienced guests alike are welcome.`,
    services: s.services,
    equipment: s.equipment,
    taboos: s.taboos,
    rating: { average: s.rating[0], count: s.rating[1] },
  };
});

export { slugify };
