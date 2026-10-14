import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalMeta } from "@/components/site/LegalPage";
import { SITE } from "@/config/site";

export const Route = createFileRoute("/_site/a-propos")({
  head: () =>
    legalMeta(
      `À propos — ${SITE.name}`,
      `${SITE.name} est un guide discret et éditorialisé : seule notre équipe ajoute et vérifie les profils.`,
    ),
  component: () => (
    <LegalPage
      eyebrow="À propos"
      title="À propos"
      sections={[
        {
          h: "Présentation",
          p: `${SITE.name} est un guide discret et éditorialisé : seule notre équipe ajoute et vérifie les profils.`,
        },
        {
          h: "Informations de démonstration",
          p: "Ce contenu est fourni à titre d'exemple et sera remplacé par le texte définitif validé juridiquement.",
        },
      ]}
    />
  ),
});
