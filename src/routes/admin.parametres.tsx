import { createFileRoute } from "@tanstack/react-router";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SITE } from "@/config/site";

export const Route = createFileRoute("/admin/parametres")({ component: Settings });

function Settings() {
  return (
    <>
      <AdminHeader title="Paramètres" />
      <div className="max-w-2xl space-y-6">
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-2xl">Site</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Nom : <span className="text-foreground">{SITE.name}</span> · Slogan :{" "}
            <span className="text-foreground">{SITE.slogan}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Modifiable dans la configuration du site.
          </p>
        </section>
      </div>
    </>
  );
}
