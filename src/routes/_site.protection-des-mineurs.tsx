import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalMeta } from "@/components/site/LegalPage";
import { SITE } from "@/config/site";

export const Route = createFileRoute("/_site/protection-des-mineurs")({
  head: () => legalMeta(`Protection des mineurs — ${SITE.name}`, "Site réservé aux adultes. Conformément au Jugendschutz, nous recommandons l'usage de filtres parentaux."),
  component: () => (
    <LegalPage eyebrow="Protection des mineurs" title="Protection des mineurs" sections={[
      { h: "Présentation", p: "Site réservé aux adultes. Conformément au Jugendschutz, nous recommandons l'usage de filtres parentaux." },
      { h: "Informations de démonstration", p: "Ce contenu est fourni à titre d'exemple et sera remplacé par le texte définitif validé juridiquement." },
    ]} />
  ),
});
