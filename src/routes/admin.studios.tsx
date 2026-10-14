import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Studio } from "@/types";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Media } from "@/components/site/Media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { studioService, useStudios } from "@/services/studios";
import { useAllProfiles, newId } from "@/services/profiles";
import { useCountries, cityName } from "@/services/geo";
import { slugify } from "@/data/profiles";
import { processImage } from "@/lib/image";

export const Route = createFileRoute("/admin/studios")({ component: AdminStudios });

function AdminStudios() {
  const studios = useStudios();
  const profiles = useAllProfiles();
  const countries = useCountries();
  const [edit, setEdit] = useState<Studio | null>(null);
  const cities = countries.flatMap((c) => c.cities);

  const save = () => {
    if (!edit) return;
    if (edit.name.trim().length < 2) return toast.error("Nom requis");
    studioService.save({ ...edit, slug: slugify(edit.name), countryCode: cities.find((c) => c.slug === edit.cityId)?.countryCode ?? edit.countryCode });
    setEdit(null);
    toast.success("Studio enregistré");
  };

  return (
    <>
      <AdminHeader title="Studios" actions={<Button variant="velvet" onClick={() => setEdit({ id: newId("st"), slug: "", name: "", cityId: cities[0]?.slug ?? "", countryCode: "FR", address: "", image: "grad:2" })}><Plus /> Ajouter</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {studios.map((s) => (
          <div key={s.id} className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="aspect-[16/9]"><Media src={s.image} alt={s.name} /></div>
            <div className="flex items-start justify-between gap-2 p-4">
              <div className="min-w-0">
                <p className="font-serif text-xl">{s.name}</p>
                <p className="text-xs text-muted-foreground">{cityName(countries, s.cityId)} · {profiles.filter((p) => p.studioId === s.id).length} profils</p>
              </div>
              <div className="flex shrink-0">
                <Button size="icon" variant="ghost" aria-label="Modifier" onClick={() => setEdit(s)}><Pencil /></Button>
                <Button size="icon" variant="ghost" aria-label="Supprimer" onClick={() => { if (confirm(`Supprimer ${s.name} ?`)) { studioService.remove(s.id); toast.success("Studio supprimé"); } }}><Trash2 /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif text-2xl">Studio</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-4">
              <div className="space-y-2"><Label htmlFor="s-name">Nom</Label><Input id="s-name" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Ville</Label>
                <Select value={edit.cityId} onValueChange={(v) => setEdit({ ...edit, cityId: v })}><SelectTrigger aria-label="Ville"><SelectValue /></SelectTrigger><SelectContent>{cities.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-2"><Label htmlFor="s-addr">Adresse</Label><Input id="s-addr" value={edit.address} onChange={(e) => setEdit({ ...edit, address: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="s-web">Site web</Label><Input id="s-web" value={edit.website ?? ""} onChange={(e) => setEdit({ ...edit, website: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="s-img">Photo</Label>
                <Input id="s-img" type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { const img = await processImage(f, false); setEdit((s) => s && { ...s, image: img }); } catch (err) { toast.error((err as Error).message); } }} />
              </div>
            </div>
          )}
          <DialogFooter><Button variant="velvet" onClick={save}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
