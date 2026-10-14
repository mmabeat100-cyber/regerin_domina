import type { CatalogItem, CatalogType } from "@/types";

const make = (type: CatalogType, prefix: string, labels: string[]): CatalogItem[] =>
  labels.map((label, i) => ({ id: `${prefix}-${i + 1}`, type, label, order: i }));

export const seedCatalogs: CatalogItem[] = [
  ...make("category", "cat", ["Domina", "Bizarrlady", "Switch", "Domina en ligne", "Clinique", "Événement"]),
  ...make("service", "srv", [
    "Bondage",
    "Shibari",
    "Discipline",
    "Jeux de rôle",
    "Latex / cuir",
    "Fétichisme des pieds",
    "Dressage",
    "Humiliation verbale",
    "Travestissement",
    "Contrôle à distance",
    "Sensations",
    "Protocole",
  ]),
  ...make("equipment", "eq", ["Croix de Saint-André", "Cage", "Chaise de bondage", "Suspension", "Cabinet clinique", "Garde-robe latex", "Douche"]),
  ...make("taboo", "tab", ["Marques permanentes", "Contenu filmé", "Rencontre sans réservation", "Substances", "Négociation des limites"]),
  ...make("language", "lang", ["Français", "Anglais", "Allemand", "Néerlandais", "Italien", "Espagnol"]),
];
