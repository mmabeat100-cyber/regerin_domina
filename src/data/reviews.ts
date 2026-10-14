import type { Review } from "@/types";

const comments = [
  "Accueil impeccable, très professionnelle et à l'écoute. Je recommande.",
  "Cadre magnifique et grande discrétion. Échange préalable très rassurant.",
  "Ponctuelle, attentive aux limites, une vraie expérience.",
  "Très bonne communication avant la rencontre. Lieu soigné.",
  "Une personnalité marquante, élégante et respectueuse.",
];
const authors = ["Julien M.", "Anonyme", "Thomas", "C. & L.", "Marc-Antoine", "Pierre"];

export const seedReviews: Review[] = ["p-1", "p-1", "p-3", "p-3", "p-5", "p-7", "p-7", "p-10", "p-12", "p-2"].map((pid, i) => ({
  id: `r-${i + 1}`,
  profileId: pid,
  authorName: authors[i % authors.length],
  rating: [5, 4, 5, 5, 4, 5, 5, 5, 4, 4][i],
  comment: comments[i % comments.length],
  status: i === 9 ? "pending" : "approved",
  createdAt: new Date(Date.parse("2026-09-01") + i * 86400000 * 2).toISOString(),
}));
