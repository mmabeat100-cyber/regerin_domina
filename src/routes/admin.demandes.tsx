import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Pencil, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Media } from "@/components/site/Media";
import { EmptyState } from "@/components/site/Breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { profileService, useAllProfiles } from "@/services/profiles";
import { useCatalogLabel } from "@/services/catalogs";
import { useCountries, cityName } from "@/services/geo";
import { fr } from "@/i18n/fr";

export const Route = createFileRoute("/admin/demandes")({
  component: RequestsList,
});

function onErr(e: unknown) {
  toast.error(e instanceof Error ? e.message : "Une erreur est survenue");
}

function RequestsList() {
  const profiles = useAllProfiles();
  const label = useCatalogLabel();
  const countries = useCountries();
  const [toReject, setToReject] = useState<string | null>(null);

  const requests = useMemo(() => profiles.filter((p) => p.status === "pending"), [profiles]);

  return (
    <>
      <AdminHeader
        title={fr.admin.requests}
        subtitle={`${requests.length} demande${requests.length > 1 ? "s" : ""} en attente`}
      />

      {requests.length === 0 ? (
        <EmptyState
          title="Aucune demande en attente"
          text="Les nouvelles inscriptions soumises depuis /inscription apparaîtront ici."
        />
      ) : (
        <div className="space-y-4">
          {requests.map((p) => {
            const city = p.availability[0]?.cities[0];
            return (
              <div
                key={p.id}
                className="flex flex-col gap-4 rounded-lg border border-gold/30 bg-gold/5 p-4 sm:flex-row sm:items-center"
              >
                <div className="h-24 w-16 shrink-0 overflow-hidden rounded">
                  <Media src={p.avatar} alt="" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-medium">{p.displayName || "(sans nom)"}</p>
                  <p className="text-sm text-muted-foreground">
                    {label(p.category)}
                    {city && ` · ${cityName(countries, city)}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.contact.email}
                    {p.contact.phone ? ` · ${p.contact.phone}` : ""}
                  </p>
                  {p.headline && (
                    <p className="text-xs italic text-muted-foreground">« {p.headline} »</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/admin/profils/$id" params={{ id: p.id }}>
                      <Pencil /> Modifier
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="velvet"
                    onClick={() =>
                      profileService
                        .setStatus([p.id], "published")
                        .then(() => toast.success("Profil validé et publié"))
                        .catch(onErr)
                    }
                  >
                    <Check /> Valider
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setToReject(p.id)}>
                    <Trash2 /> Rejeter
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!toReject} onOpenChange={(o) => !o && setToReject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeter cette demande ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive, la demande sera supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                profileService
                  .remove([toReject!])
                  .then(() => {
                    setToReject(null);
                    toast.success("Demande rejetée");
                  })
                  .catch(onErr)
              }
            >
              Rejeter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
