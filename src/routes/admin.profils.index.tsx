import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Media } from "@/components/site/Media";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { profileService, useAllProfiles } from "@/services/profiles";
import { useCatalog, useCatalogLabel } from "@/services/catalogs";
import { useCountries, cityName } from "@/services/geo";
import { fr } from "@/i18n/fr";

export const Route = createFileRoute("/admin/profils/")({
  component: ProfilesList,
});

const ALL = "__all";

function ProfilesList() {
  const profiles = useAllProfiles();
  const categories = useCatalog("category");
  const label = useCatalogLabel();
  const countries = useCountries();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(ALL);
  const [country, setCountry] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [selected, setSelected] = useState<string[]>([]);
  const [toDelete, setToDelete] = useState<string[] | null>(null);

  const list = useMemo(
    () =>
      profiles.filter(
        (p) =>
          (!q || p.displayName.toLowerCase().includes(q.toLowerCase())) &&
          (cat === ALL || p.category === cat) &&
          (country === ALL || p.availability.some((a) => a.countryCode === country)) &&
          (status === ALL || p.status === status),
      ),
    [profiles, q, cat, country, status],
  );
  const allChecked = list.length > 0 && list.every((p) => selected.includes(p.id));
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <>
      <AdminHeader
        title={fr.admin.profiles}
        subtitle={`${profiles.length} profils au total`}
        actions={<Button asChild variant="velvet"><Link to="/admin/profils/nouveau"><Plus /> {fr.admin.addProfile}</Link></Button>}
      />
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_160px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un nom…" className="pl-9" aria-label="Rechercher" />
        </div>
        <Select value={cat} onValueChange={setCat}><SelectTrigger aria-label="Catégorie"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>Toutes catégories</SelectItem>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent></Select>
        <Select value={country} onValueChange={setCountry}><SelectTrigger aria-label="Pays"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>Tous pays</SelectItem>{countries.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent></Select>
        <Select value={status} onValueChange={setStatus}><SelectTrigger aria-label="Statut"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>Tous statuts</SelectItem><SelectItem value="published">Publié</SelectItem><SelectItem value="draft">Brouillon</SelectItem></SelectContent></Select>
      </div>

      {selected.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md border border-gold/30 bg-gold/5 px-4 py-2 text-sm">
          <span className="mr-2">{selected.length} sélectionné(s)</span>
          <Button size="sm" variant="outline" onClick={() => { profileService.setStatus(selected, "published"); toast.success("Profils publiés"); setSelected([]); }}>Publier</Button>
          <Button size="sm" variant="outline" onClick={() => { profileService.setStatus(selected, "draft"); toast.success("Profils dépubliés"); setSelected([]); }}>Dépublier</Button>
          <Button size="sm" variant="destructive" onClick={() => setToDelete(selected)}>Supprimer</Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"><Checkbox checked={allChecked} onCheckedChange={() => setSelected(allChecked ? [] : list.map((p) => p.id))} aria-label="Tout sélectionner" /></TableHead>
              <TableHead>Profil</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Villes</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">Aucun profil</TableCell></TableRow>}
            {list.map((p) => (
              <TableRow key={p.id}>
                <TableCell><Checkbox checked={selected.includes(p.id)} onCheckedChange={() => toggle(p.id)} aria-label={`Sélectionner ${p.displayName}`} /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-8 shrink-0 overflow-hidden rounded"><Media src={p.avatar} alt="" /></div>
                    <div className="min-w-0">
                      <Link to="/admin/profils/$id" params={{ id: p.id }} className="font-medium hover:text-gold">{p.displayName}</Link>
                      <div className="mt-1 flex gap-1">
                        {p.verified && <Badge variant="gold" className="px-1.5 py-0 text-[10px]">Vérifiée</Badge>}
                        {p.vip && <Badge variant="vip" className="px-1.5 py-0 text-[10px]">VIP</Badge>}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{label(p.category)}</TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{p.availability.map((a) => `${a.countryCode}: ${a.cities.map((c) => cityName(countries, c)).join(", ")}`).join(" · ") || "—"}</TableCell>
                <TableCell className="text-sm">{p.price.perHour} {p.price.currency}</TableCell>
                <TableCell><Badge variant={p.status === "published" ? "secondary" : "outline"}>{p.status === "published" ? "Publié" : "Brouillon"}</Badge></TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button asChild size="icon" variant="ghost" aria-label="Modifier"><Link to="/admin/profils/$id" params={{ id: p.id }}><Pencil /></Link></Button>
                    <Button size="icon" variant="ghost" aria-label="Dupliquer" onClick={() => { profileService.duplicate(p.id); toast.success("Profil dupliqué (brouillon)"); }}><Copy /></Button>
                    <Button size="icon" variant="ghost" aria-label={p.status === "published" ? "Dépublier" : "Publier"} onClick={() => { profileService.setStatus([p.id], p.status === "published" ? "draft" : "published"); toast.success("Statut mis à jour"); }}>{p.status === "published" ? <EyeOff /> : <Eye />}</Button>
                    <Button size="icon" variant="ghost" aria-label="Supprimer" onClick={() => setToDelete([p.id])}><Trash2 /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {toDelete?.length === 1 ? "ce profil" : `${toDelete?.length} profils`} ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est définitive.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => { profileService.remove(toDelete ?? []); setSelected([]); setToDelete(null); toast.success("Supprimé"); }}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
