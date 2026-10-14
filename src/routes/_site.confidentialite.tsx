import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalMeta } from "@/components/site/LegalPage";
import { SITE } from "@/config/site";

export const Route = createFileRoute("/_site/confidentialite")({
  head: () => legalMeta(`Confidentialité — ${SITE.name}`, "Nous ne collectons que les données strictement nécessaires et n'utilisons aucun traceur publicitaire."),
  component: () => (
    <LegalPage eyebrow="Confidentialité" title="Confidentialité" sections={[
      { h: "Présentation", p: "Nous ne collectons que les données strictement nécessaires et n'utilisons aucun traceur publicitaire." },
      { h: "Informations de démonstration", p: "Ce contenu est fourni à titre d'exemple et sera remplacé par le texte définitif validé juridiquement." },
    ]} />
  ),
});
