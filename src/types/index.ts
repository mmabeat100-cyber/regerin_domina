export type ServesFor = "hommes" | "femmes" | "couples" | "divers";
export type Mode = "recoit" | "deplace" | "both";
export type Currency = "EUR" | "CHF";

export interface Availability {
  countryCode: string;
  cities: string[]; // city slugs
  primaryCity?: string;
}

export interface Profile {
  id: string;
  slug: string;
  displayName: string;
  category: string; // catalog id
  studioId?: string;
  status: "draft" | "published";
  verified: boolean;
  vip: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  age?: number;
  bodyType?: string;
  heightCm?: number;
  hairColor?: string;
  eyeColor?: string;
  smoker?: boolean;
  piercings?: boolean;
  tattoos?: boolean;
  languages: string[]; // catalog ids
  servesFor: ServesFor[];
  avatar: string;
  gallery: string[];
  availability: Availability[];
  mode: Mode;
  address?: { street?: string; zip?: string; city?: string; countryCode?: string };
  price: { perHour: number; currency: Currency };
  specialOffers: { label: string; duration: string; price: number }[];
  contact: { phone?: string; whatsapp?: string; email?: string; website?: string; instagram?: string };
  headline: string;
  descriptionFr: string;
  descriptionEn: string;
  services: string[];
  equipment: string[];
  taboos: string[];
  rating: { average: number; count: number };
}

export interface City {
  slug: string;
  name: string;
  countryCode: string;
  popular: boolean;
  seoText: string;
}

export interface Country {
  code: string;
  slug: string;
  name: string;
  currency: Currency;
  cities: City[];
}

export interface Studio {
  id: string;
  slug: string;
  name: string;
  cityId: string; // city slug
  countryCode: string;
  address: string;
  image: string;
  website?: string;
}

export interface Review {
  id: string;
  profileId: string;
  authorName: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export type CatalogType = "category" | "service" | "equipment" | "taboo" | "language";

export interface CatalogItem {
  id: string;
  type: CatalogType;
  label: string;
  order: number;
}
