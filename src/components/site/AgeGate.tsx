import { Compass } from "lucide-react";
import { useStore } from "@/store/useStore";
import { fr } from "@/i18n/fr";
import { SITE } from "@/config/site";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero.jpg";

/** Écran plein page de vérification d'âge (mémorisé dans localStorage via le store). */
export function AgeGate({ hydrated }: { hydrated: boolean }) {
  const verified = useStore((s) => s.ageVerified);
  if (!hydrated || verified) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="age-title" className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background p-6">
      <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
      <div className="absolute inset-0 bg-background/60" />
      <div className="relative max-w-lg animate-fade-up rounded-xl border border-border bg-card/80 p-8 text-center shadow-elegant backdrop-blur sm:p-12">
        <Compass className="mx-auto h-10 w-10 text-gold" aria-hidden />
        <p className="eyebrow mt-4">{SITE.name}</p>
        <h1 id="age-title" className="mt-3 text-4xl">{fr.age.title}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{fr.age.text}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="velvet" size="lg" autoFocus onClick={() => useStore.getState().set(() => ({ ageVerified: true }))}>
            {fr.age.enter}
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.location.assign(SITE.exitUrl)}>
            {fr.age.leave}
          </Button>
        </div>
      </div>
    </div>
  );
}
