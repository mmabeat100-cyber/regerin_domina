import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalMeta } from "@/components/site/LegalPage";
import { SITE } from "@/config/site";

export const Route = createFileRoute("/_site/mentions-legales")({
  head: () => legalMeta(`Mentions légales — ${SITE.name}`, "Éditeur du site, hébergement et responsabilité éditoriale de l'annuaire."),
  component: () => (
    <LegalPage eyebrow="Mentions légales" title="Mentions légales" sections={[
      { h: "Présentation", p: "Éditeur du site, hébergement et responsabilité éditoriale de l'annuaire." },
      { h: "Informations de démonstration", p: "Ce contenu est fourni à titre d'exemple et sera remplacé par le texte définitif validé juridiquement." },
    ]} />
  ),
});
