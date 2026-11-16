import { createFileRoute, useBlocker } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import type { Country } from "@/types";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { geoService, useCountriesQuery } from "@/services/geo";
import { useAllProfiles } from "@/services/profiles";
import { slugify } from "@/data/profiles";

export const Route = createFileRoute("/admin/pays")({ component: AdminGeo });

function CityRow({
  city,
  profileCount,
  onChange,
  onRemove,
}: {
  city: Country["cities"][number];
  profileCount: number;
  onChange: (fn: (c: Country["cities"][number]) => Country["cities"][number]) => void;
  onRemove: () => void;
}) {
  const [seoOpen, setSeoOpen] = useState(false);
  return (
    <li className="space-y-2 rounded-md border border-border p-3">
      <div className="flex items-center gap-2">
        <Input
          value={city.name}
          onChange={(e) => onChange((c) => ({ ...c, name: e.target.value }))}
          aria-label="Nom de la ville"
          className="h-9"
        />
        <Button size="icon" variant="ghost" aria-label="Supprimer la ville" onClick={onRemove}>
          <Trash2 />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        /{city.slug} · {profileCount} profil{profileCount > 1 ? "s" : ""}
      </p>
      <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={city.popular}
              onCheckedChange={(v) => onChange((c) => ({ ...c, popular: v }))}
            />
            Populaire
          </label>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto px-0 text-muted-foreground"
            >
              Texte SEO{" "}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${seoOpen ? "rotate-180" : ""}`}
              />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="pt-2">
          <Textarea
            rows={3}
            value={city.seoText}
            onChange={(e) => onChange((c) => ({ ...c, seoText: e.target.value }))}
            aria-label="Texte SEO"
            className="text-xs"
          />
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

function AdminGeo() {
  const { data, isLoading } = useCountriesQuery();
  const profiles = useAllProfiles();
  const [draft, setDraft] = useState<Country[] | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const initialized = useRef(false);
  const savedRef = useRef(false);
  const [newCountry, setNewCountry] = useState({ name: "", code: "" });
  const [newCity, setNewCity] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data && !initialized.current) {
      setDraft(data);
      initialized.current = true;
    }
  }, [data]);

  useBlocker({
    shouldBlockFn: () =>
      dirty &&
      !savedRef.current &&
      !window.confirm("Des modifications ne sont pas enregistrées. Quitter quand même ?"),
    enableBeforeUnload: () => dirty && !savedRef.current,
  });

  const countries = draft ?? [];
  const set = (next: Country[]) => {
    setDraft(next);
    setDirty(true);
  };
  const upd = (code: string, fn: (c: Country) => Country) =>
    set(countries.map((c) => (c.code === code ? fn(c) : c)));
  const count = (slug: string) =>
    profiles.filter((p) => p.availability.some((a) => a.cities.includes(slug))).length;

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await geoService.saveCountries(draft);
      savedRef.current = true;
      setDirty(false);
      toast.success("Modifications enregistrées");
      setTimeout(() => (savedRef.current = false), 0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || draft === null) return <div className="min-h-[40vh]" />;

  return (
    <div className="pb-24">
      <AdminHeader
        title="Pays & villes"
        subtitle={dirty ? "Modifications non enregistrées" : undefined}
      />

      <div className="mb-6 space-y-2 rounded-lg border border-border bg-card p-4">
        <Label htmlFor="new-country-name">Ajouter un pays</Label>
        <div className="grid grid-cols-[1fr_90px] gap-2 sm:flex sm:max-w-md">
          <Input
            id="new-country-name"
            placeholder="Nom du pays"
            value={newCountry.name}
            onChange={(e) => setNewCountry({ ...newCountry, name: e.target.value })}
            className="sm:max-w-xs"
          />
          <Input
            placeholder="Code"
            value={newCountry.code}
            maxLength={2}
            onChange={(e) => setNewCountry({ ...newCountry, code: e.target.value.toUpperCase() })}
            aria-label="Code pays"
          />
        </div>
        <Button
          variant="velvet"
          className="w-full sm:w-auto"
          onClick={() => {
            if (
              !newCountry.name ||
              newCountry.code.length !== 2 ||
              countries.some((c) => c.code === newCountry.code)
            )
              return toast.error("Nom et code à 2 lettres uniques requis");
            const country: Country = {
              code: newCountry.code,
              slug: slugify(newCountry.name),
              name: newCountry.name,
              currency: "EUR",
              cities: [],
            };
            set([country, ...countries]);
            setOpenItems((o) => [...o, country.code]);
            setNewCountry({ name: "", code: "" });
          }}
        >
          <Plus /> Ajouter
        </Button>
      </div>

      {countries.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
          Aucun pays. Ajoutez-en un ci-dessus.
        </p>
      ) : (
        <Accordion
          type="multiple"
          value={openItems}
          onValueChange={setOpenItems}
          className="space-y-3"
        >
          {countries.map((c) => (
            <AccordionItem
              key={c.code}
              value={c.code}
              className="rounded-lg border border-border bg-card px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <span className="flex flex-1 flex-wrap items-center gap-2 text-left">
                  <span className="font-serif text-lg">{c.name || "(sans nom)"}</span>
                  <span className="text-xs text-muted-foreground">
                    {c.code} · {c.currency}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {c.cities.length} ville{c.cities.length > 1 ? "s" : ""}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                  <div className="space-y-1.5">
                    <Label htmlFor={`name-${c.code}`}>Nom du pays</Label>
                    <Input
                      id={`name-${c.code}`}
                      value={c.name}
                      onChange={(e) => upd(c.code, (x) => ({ ...x, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Devise</Label>
                    <Select
                      value={c.currency}
                      onValueChange={(v) =>
                        upd(c.code, (x) => ({ ...x, currency: v as Country["currency"] }))
                      }
                    >
                      <SelectTrigger aria-label="Devise par défaut">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="CHF">CHF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Villes</Label>
                  <ul className="space-y-2">
                    {c.cities.map((ci) => (
                      <CityRow
                        key={ci.slug}
                        city={ci}
                        profileCount={count(ci.slug)}
                        onChange={(fn) =>
                          upd(c.code, (x) => ({
                            ...x,
                            cities: x.cities.map((y) => (y.slug === ci.slug ? fn(y) : y)),
                          }))
                        }
                        onRemove={() =>
                          upd(c.code, (x) => ({
                            ...x,
                            cities: x.cities.filter((y) => y.slug !== ci.slug),
                          }))
                        }
                      />
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nouvelle ville"
                      value={newCity[c.code] ?? ""}
                      onChange={(e) => setNewCity({ ...newCity, [c.code]: e.target.value })}
                      className="h-9"
                      aria-label="Nouvelle ville"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const name = newCity[c.code]?.trim();
                        if (!name) return;
                        const slug = slugify(name);
                        if (countries.some((x) => x.cities.some((y) => y.slug === slug)))
                          return toast.error("Cette ville existe déjà");
                        upd(c.code, (x) => ({
                          ...x,
                          cities: [
                            {
                              slug,
                              name,
                              countryCode: c.code,
                              popular: false,
                              seoText: `Dominas et studios à ${name}.`,
                            },
                            ...x.cities,
                          ],
                        }));
                        setNewCity({ ...newCity, [c.code]: "" });
                      }}
                    >
                      <Plus /> Ajouter
                    </Button>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() =>
                    confirm(`Supprimer ${c.name} et ses villes ?`) &&
                    set(countries.filter((x) => x.code !== c.code))
                  }
                >
                  <Trash2 /> Supprimer ce pays
                </Button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur lg:left-60">
        <div className="flex flex-wrap items-center justify-end gap-2 px-4 py-3 sm:px-8">
          {dirty && (
            <span className="mr-auto text-xs text-gold">Modifications non enregistrées</span>
          )}
          <Button variant="velvet" onClick={handleSave} disabled={saving || !dirty}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
