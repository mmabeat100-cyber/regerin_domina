import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import type { Country } from "@/types";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { geoService, useCountries } from "@/services/geo";
import { useAllProfiles } from "@/services/profiles";
import { slugify } from "@/data/profiles";

export const Route = createFileRoute("/admin/pays")({ component: AdminGeo });

function AdminGeo() {
  const countries = useCountries();
  const profiles = useAllProfiles();
  const [newCountry, setNewCountry] = useState({ name: "", code: "" });
  const [newCity, setNewCity] = useState<Record<string, string>>({});
  const save = (next: Country[]) => geoService.saveCountries(next);
  const upd = (code: string, fn: (c: Country) => Country) => save(countries.map((c) => (c.code === code ? fn(c) : c)));
  const count = (slug: string) => profiles.filter((p) => p.availability.some((a) => a.cities.includes(slug))).length;

  return (
    <>
      <AdminHeader title="Pays & villes" />
      <div className="mb-6 flex flex-wrap gap-2 rounded-lg border border-border bg-card p-4">
        <Input placeholder="Nom du pays" value={newCountry.name} onChange={(e) => setNewCountry({ ...newCountry, name: e.target.value })} className="max-w-xs" aria-label="Nom du pays" />
        <Input placeholder="Code (ex. DE)" value={newCountry.code} maxLength={2} onChange={(e) => setNewCountry({ ...newCountry, code: e.target.value.toUpperCase() })} className="w-28" aria-label="Code pays" />
        <Button variant="velvet" onClick={() => {
          if (!newCountry.name || newCountry.code.length !== 2 || countries.some((c) => c.code === newCountry.code)) return toast.error("Nom et code à 2 lettres uniques requis");
          save([...countries, { code: newCountry.code, slug: slugify(newCountry.name), name: newCountry.name, currency: "EUR", cities: [] }]);
          setNewCountry({ name: "", code: "" });
          toast.success("Pays ajouté");
        }}><Plus /> Ajouter un pays</Button>
      </div>
      <div className="space-y-6">
        {countries.map((c) => (
          <section key={c.code} className="rounded-lg border border-border bg-card p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Input value={c.name} onChange={(e) => upd(c.code, (x) => ({ ...x, name: e.target.value }))} className="max-w-xs font-serif text-lg" aria-label="Nom du pays" />
              <span className="text-sm text-muted-foreground">{c.code}</span>
              <Select value={c.currency} onValueChange={(v) => upd(c.code, (x) => ({ ...x, currency: v as Country["currency"] }))}>
                <SelectTrigger className="w-28" aria-label="Devise par défaut"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="EUR">EUR</SelectItem><SelectItem value="CHF">CHF</SelectItem></SelectContent>
              </Select>
              <Button size="icon" variant="ghost" className="ml-auto" aria-label="Supprimer le pays" onClick={() => confirm(`Supprimer ${c.name} et ses villes ?`) && save(countries.filter((x) => x.code !== c.code))}><Trash2 /></Button>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {c.cities.map((ci) => (
                <li key={ci.slug} className="grid gap-2 py-3 md:grid-cols-[180px_1fr_auto_auto] md:items-start">
                  <div>
                    <Input value={ci.name} onChange={(e) => upd(c.code, (x) => ({ ...x, cities: x.cities.map((y) => (y.slug === ci.slug ? { ...y, name: e.target.value } : y)) }))} aria-label="Nom de la ville" className="h-8" />
                    <p className="mt-1 text-xs text-muted-foreground">/{ci.slug} · {count(ci.slug)} profils</p>
                  </div>
                  <Textarea rows={2} value={ci.seoText} onChange={(e) => upd(c.code, (x) => ({ ...x, cities: x.cities.map((y) => (y.slug === ci.slug ? { ...y, seoText: e.target.value } : y)) }))} aria-label="Texte SEO" className="text-xs" />
                  <label className="flex items-center gap-2 text-xs"><Switch checked={ci.popular} onCheckedChange={(v) => upd(c.code, (x) => ({ ...x, cities: x.cities.map((y) => (y.slug === ci.slug ? { ...y, popular: v } : y)) }))} />Populaire</label>
                  <Button size="icon" variant="ghost" aria-label="Supprimer la ville" onClick={() => upd(c.code, (x) => ({ ...x, cities: x.cities.filter((y) => y.slug !== ci.slug) }))}><Trash2 /></Button>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex max-w-sm gap-2">
              <Input placeholder="Nouvelle ville" value={newCity[c.code] ?? ""} onChange={(e) => setNewCity({ ...newCity, [c.code]: e.target.value })} className="h-8" aria-label="Nouvelle ville" />
              <Button size="sm" variant="outline" onClick={() => {
                const name = newCity[c.code]?.trim();
                if (!name) return;
                const slug = slugify(name);
                if (countries.some((x) => x.cities.some((y) => y.slug === slug))) return toast.error("Cette ville existe déjà");
                upd(c.code, (x) => ({ ...x, cities: [...x.cities, { slug, name, countryCode: c.code, popular: false, seoText: `Dominas et studios à ${name}.` }] }));
                setNewCity({ ...newCity, [c.code]: "" });
              }}><Plus /></Button>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
