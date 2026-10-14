import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalMeta } from "@/components/site/LegalPage";
import { SITE } from "@/config/site";

export const Route = createFileRoute("/_site/contact")({
  head: () =>
    legalMeta(
      `Contact — ${SITE.name}`,
      `Pour toute question, écrivez à l'équipe éditoriale : ${SITE.contactEmail}.`,
    ),
  component: () => (
    <LegalPage
      eyebrow="Contact"
      title="Contact"
      sections={[
        {
          h: "Présentation",
          p: `Pour toute question, écrivez à l'équipe éditoriale : ${SITE.contactEmail}.`,
        },
        {
          h: "Informations de démonstration",
          p: "Ce contenu est fourni à titre d'exemple et sera remplacé par le texte définitif validé juridiquement.",
        },
      ]}
    />
  ),
});
