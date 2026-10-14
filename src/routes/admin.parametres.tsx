import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { SITE } from "@/config/site";

export const Route = createFileRoute("/admin/parametres")({ component: Settings });

function Settings() {
  return (
    <>
      <AdminHeader title="Paramètres" />
      <div className="max-w-2xl space-y-6">
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-2xl">Site</h2>
          <p className="mt-2 text-sm text-muted-foreground">Nom : <span className="text-foreground">{SITE.name}</span> · Slogan : <span className="text-foreground">{SITE.slogan}</span></p>
          <p className="mt-1 text-xs text-muted-foreground">Modifiable dans la configuration du site.</p>
        </section>
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-2xl">Données de démonstration</h2>
          <p className="mt-2 text-sm text-muted-foreground">Les données sont stockées dans ce navigateur. Réinitialiser restaure les 14 profils, studios, avis et catalogues d'origine.</p>
          <Button variant="destructive" className="mt-4" onClick={() => { if (confirm("Réinitialiser toutes les données ?")) { useStore.getState().resetDemo(); toast.success("Données réinitialisées"); } }}>Réinitialiser la démo</Button>
        </section>
      </div>
    </>
  );
}
