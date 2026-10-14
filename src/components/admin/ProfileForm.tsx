import { useBlocker, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowDown, ArrowUp, Eye, ImagePlus, Plus, Star, Trash2, Upload } from "lucide-react";
import type { Profile, ServesFor } from "@/types";
import { AdminHeader } from "./AdminHeader";
import { Media } from "@/components/site/Media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { profileService, uniqueSlug } from "@/services/profiles";
import { useCatalog } from "@/services/catalogs";
import { geoService, useCountries } from "@/services/geo";
import { useStudios } from "@/services/studios";
import { slugify } from "@/data/profiles";
import { ACCEPTED, MAX_IMAGE_MB, processImage } from "@/lib/image";
import { fr } from "@/i18n/fr";
import type { CatalogType } from "@/types";

const NONE = "__none";
const SERVES: ServesFor[] = ["hommes", "femmes", "couples", "divers"];

const schema = z.object({
  displayName: z.string().trim().min(2, "Nom d'affichage requis (2 caractères min.)").max(80),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug invalide (minuscules, chiffres, tirets)"),
  price: z.object({ perHour: z.number().positive("Prix horaire requis") }),
  contact: z.object({
    email: z.string().email("E-mail invalide").optional().or(z.literal("")),
    website: z.string().url("URL du site invalide").optional().or(z.literal("")),
  }),
  headline: z.string().max(140, "Accroche : 140 caractères max."),
  descriptionFr: z.string().max(4000),
  descriptionEn: z.string().max(4000),
});

function Field({ label, children, hint, id }: { label: string; children: React.ReactNode; hint?: string; id?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5 rounded-lg border border-border bg-card p-6">
      <h2 className="text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function CatalogChecklist({ type, value, onChange }: { type: CatalogType; value: string[]; onChange: (v: string[]) => void }) {
  const items = useCatalog(type);
  const [q, setQ] = useState("");
  return (
    <div className="space-y-3">
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className="h-8 max-w-xs" aria-label="Rechercher" />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.filter((i) => i.label.toLowerCase().includes(q.toLowerCase())).map((i) => (
          <label key={i.id} className="flex items-center gap-2 text-sm">
            <Checkbox checked={value.includes(i.id)} onCheckedChange={(c) => onChange(c ? [...value, i.id] : value.filter((x) => x !== i.id))} />
            {i.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export function ProfileForm({ initial, isNew }: { initial: Profile; isNew?: boolean }) {
  const navigate = useNavigate();
  const [p, setP] = useState<Profile>(initial);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [errors, setErrors] = useState<string[]>([]);
  const savedRef = useRef(false);
  const categories = useCatalog("category");
  const languages = useCatalog("language");
  const countries = useCountries();
  const studios = useStudios();

  const set = (patch: Partial<Profile>) => {
    setP((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  useBlocker({
    shouldBlockFn: () => dirty && !savedRef.current && !window.confirm("Des modifications ne sont pas enregistrées. Quitter quand même ?"),
    enableBeforeUnload: () => dirty && !savedRef.current,
  });

  useEffect(() => {
    if (!slugTouched) setP((prev) => ({ ...prev, slug: slugify(prev.displayName) }));
  }, [p.displayName, slugTouched]);

  const save = (status: Profile["status"], thenPreview = false) => {
    const res = schema.safeParse(p);
    const errs = res.success ? [] : res.error.issues.map((i) => i.message);
    if (status === "published" && !p.availability.some((a) => a.cities.length)) errs.push("Ajoutez au moins une ville pour publier.");
    if (status === "published" && !p.contact.phone && !p.contact.email && !p.contact.whatsapp) errs.push("Renseignez au moins un moyen de contact pour publier.");
    if (errs.length) {
      setErrors(errs);
      toast.error(errs[0]);
      return;
    }
    setErrors([]);
    const final: Profile = { ...p, status, slug: uniqueSlug(p.slug || p.displayName, p.id) };
    try {
      profileService.save(final);
    } catch {
      toast.error("Stockage local plein : réduisez le nombre ou le poids des photos.");
      return;
    }
    savedRef.current = true;
    setDirty(false);
    toast.success(status === "published" ? "Profil publié" : "Brouillon enregistré");
    if (thenPreview) window.open(`/profil/${final.slug}`, "_blank");
    else if (isNew) navigate({ to: "/admin/profils/$id", params: { id: final.id } });
    setTimeout(() => (savedRef.current = false), 0);
    setP(final);
  };

  /* ---------- Photos ---------- */
  const avatarInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const addGallery = async (files: FileList | File[]) => {
    const out: string[] = [];
    for (const f of Array.from(files)) {
      try {
        out.push(await processImage(f, true));
      } catch (e) {
        toast.error(`${f.name} : ${(e as Error).message}`);
      }
    }
    if (out.length) {
      setP((prev) => ({ ...prev, gallery: [...prev.gallery, ...out], avatar: prev.gallery.length || prev.avatar.startsWith("data:") ? prev.avatar : out[0] }));
      setDirty(true);
    }
  };
  const moveImg = (from: number, to: number) => {
    if (to < 0 || to >= p.gallery.length) return;
    const g = [...p.gallery];
    const [x] = g.splice(from, 1);
    g.splice(to, 0, x);
    set({ gallery: g });
  };

  /* ---------- Disponibilités ---------- */
  const [newCity, setNewCity] = useState<Record<string, string>>({});
  const toggleCountry = (code: string, on: boolean) =>
    set({ availability: on ? [...p.availability, { countryCode: code, cities: [] }] : p.availability.filter((a) => a.countryCode !== code) });
  const updateAvail = (code: string, fn: (a: Profile["availability"][number]) => Profile["availability"][number]) =>
    set({ availability: p.availability.map((a) => (a.countryCode === code ? fn(a) : a)) });
  const quickAddCity = (code: string) => {
    const name = newCity[code]?.trim();
    if (!name) return;
    const slug = slugify(name);
    const exists = countries.some((c) => c.cities.some((x) => x.slug === slug));
    if (!exists) {
      geoService.saveCountries(
        countries.map((c) => (c.code === code ? { ...c, cities: [...c.cities, { slug, name, countryCode: code, popular: false, seoText: `Dominas et studios à ${name}.` }] } : c)),
      );
    }
    updateAvail(code, (a) => ({ ...a, cities: a.cities.includes(slug) ? a.cities : [...a.cities, slug] }));
    setNewCity((s) => ({ ...s, [code]: "" }));
    toast.success(`Ville « ${name} » ajoutée`);
  };

  const cur = p.price.currency === "EUR" ? "€" : "CHF";
  const allCities = useMemo(() => p.availability.flatMap((a) => a.cities), [p.availability]);

  return (
    <div className="pb-24">
      <AdminHeader
        title={isNew ? "Nouveau profil" : p.displayName || "Profil"}
        subtitle={isNew ? "Inscrire une nouvelle annonceuse dans l'annuaire" : `Statut : ${p.status === "published" ? "Publié" : "Brouillon"}${dirty ? " · modifications non enregistrées" : ""}`}
      />
      {errors.length > 0 && (
        <ul role="alert" className="mb-6 space-y-1 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {errors.map((e) => <li key={e}>• {e}</li>)}
        </ul>
      )}

      <Tabs defaultValue="identity">
        <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          {[
            ["identity", "1. Identité"], ["photos", "2. Photos"], ["perso", "3. Infos"], ["avail", "4. Disponibilités"],
            ["rates", "5. Tarifs"], ["contact", "6. Contact"], ["desc", "7. Description"], ["lists", "8. Services"],
          ].map(([v, l]) => (
            <TabsTrigger key={v} value={v} className="rounded-full border border-border data-[state=active]:border-gold data-[state=active]:bg-gold/10 data-[state=active]:text-gold">{l}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="identity">
          <Section title="Identité">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nom d'affichage *" id="f-name"><Input id="f-name" value={p.displayName} onChange={(e) => set({ displayName: e.target.value })} maxLength={80} /></Field>
              <Field label="Slug (URL)" id="f-slug" hint={`/profil/${p.slug || "…"}`}>
                <Input id="f-slug" value={p.slug} onChange={(e) => { setSlugTouched(true); set({ slug: slugify(e.target.value) }); }} />
              </Field>
              <Field label="Catégorie">
                <Select value={p.category} onValueChange={(v) => set({ category: v })}>
                  <SelectTrigger aria-label="Catégorie"><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Studio">
                <Select value={p.studioId ?? NONE} onValueChange={(v) => set({ studioId: v === NONE ? undefined : v })}>
                  <SelectTrigger aria-label="Studio"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value={NONE}>Indépendante</SelectItem>{studios.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
            <div className="flex flex-wrap gap-8 border-t border-border pt-5">
              {([["verified", "Vérifiée"], ["vip", "VIP"], ["featured", "Mise en avant"]] as const).map(([k, l]) => (
                <label key={k} className="flex items-center gap-3 text-sm"><Switch checked={p[k]} onCheckedChange={(v) => set({ [k]: v } as Partial<Profile>)} />{l}</label>
              ))}
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="photos">
          <Section title="Photos">
            <div className="grid gap-8 md:grid-cols-[180px_1fr]">
              <div className="space-y-3">
                <p className="text-sm font-medium">Photo de profil</p>
                <div className="aspect-[2/3] overflow-hidden rounded-md border border-border"><Media src={p.avatar} alt="Photo de profil" /></div>
                <input ref={avatarInput} type="file" accept={ACCEPTED.join(",")} className="hidden" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try { set({ avatar: await processImage(f, true) }); } catch (err) { toast.error((err as Error).message); }
                  e.target.value = "";
                }} />
                <Button variant="outline" size="sm" className="w-full" onClick={() => avatarInput.current?.click()}><Upload /> Changer</Button>
                <p className="text-xs text-muted-foreground">Recadrage auto 2:3 · JPG/PNG/WebP · {MAX_IMAGE_MB} Mo max.</p>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium">Galerie ({p.gallery.length})</p>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) addGallery(e.dataTransfer.files); }}
                  onClick={() => galleryInput.current?.click()}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && galleryInput.current?.click()}
                  role="button"
                  tabIndex={0}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-8 text-center text-sm transition-colors ${dragOver ? "border-gold bg-gold/5" : "border-border"}`}
                >
                  <ImagePlus className="mb-2 h-6 w-6 text-gold" />
                  Glissez-déposez des images ici ou cliquez pour choisir
                  <span className="mt-1 text-xs text-muted-foreground">Plusieurs fichiers acceptés · {MAX_IMAGE_MB} Mo max. chacun</span>
                </div>
                <input ref={galleryInput} type="file" multiple accept={ACCEPTED.join(",")} className="hidden" onChange={(e) => { if (e.target.files) addGallery(e.target.files); e.target.value = ""; }} />
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                  {p.gallery.map((g, i) => (
                    <div
                      key={i + g.slice(-20)}
                      draggable
                      onDragStart={() => setDragIdx(i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.stopPropagation(); if (dragIdx != null) moveImg(dragIdx, i); setDragIdx(null); }}
                      className={`group relative aspect-[2/3] overflow-hidden rounded-md border ${p.avatar === g ? "border-gold" : "border-border"}`}
                    >
                      <Media src={g} alt={`Photo ${i + 1}`} />
                      {p.avatar === g && <Badge variant="vip" className="absolute left-1 top-1 px-1.5 py-0 text-[10px]">Couverture</Badge>}
                      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-0.5 bg-background/85 p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                        <button type="button" aria-label="Définir comme couverture" onClick={() => set({ avatar: g })} className="rounded p-1 hover:text-gold"><Star className="h-3.5 w-3.5" /></button>
                        <button type="button" aria-label="Monter" onClick={() => moveImg(i, i - 1)} className="rounded p-1 hover:text-gold"><ArrowUp className="h-3.5 w-3.5 -rotate-90" /></button>
                        <button type="button" aria-label="Descendre" onClick={() => moveImg(i, i + 1)} className="rounded p-1 hover:text-gold"><ArrowDown className="h-3.5 w-3.5 -rotate-90" /></button>
                        <button type="button" aria-label="Supprimer" onClick={() => set({ gallery: p.gallery.filter((_, j) => j !== i) })} className="rounded p-1 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="perso">
          <Section title="Infos personnelles">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Âge" id="f-age"><Input id="f-age" type="number" min={18} max={99} value={p.age ?? ""} onChange={(e) => set({ age: e.target.value ? Number(e.target.value) : undefined })} /></Field>
              <Field label="Figure" id="f-body"><Input id="f-body" value={p.bodyType ?? ""} onChange={(e) => set({ bodyType: e.target.value })} /></Field>
              <Field label="Taille (cm)" id="f-h"><Input id="f-h" type="number" value={p.heightCm ?? ""} onChange={(e) => set({ heightCm: e.target.value ? Number(e.target.value) : undefined })} /></Field>
              <Field label="Cheveux" id="f-hair"><Input id="f-hair" value={p.hairColor ?? ""} onChange={(e) => set({ hairColor: e.target.value })} /></Field>
              <Field label="Yeux" id="f-eyes"><Input id="f-eyes" value={p.eyeColor ?? ""} onChange={(e) => set({ eyeColor: e.target.value })} /></Field>
            </div>
            <div className="flex flex-wrap gap-8">
              {([["smoker", "Fumeuse"], ["piercings", "Piercings"], ["tattoos", "Tattoos"]] as const).map(([k, l]) => (
                <label key={k} className="flex items-center gap-3 text-sm"><Switch checked={!!p[k]} onCheckedChange={(v) => set({ [k]: v } as Partial<Profile>)} />{l}</label>
              ))}
            </div>
            <Field label="Langues">
              <div className="flex flex-wrap gap-4">
                {languages.map((l) => (
                  <label key={l.id} className="flex items-center gap-2 text-sm"><Checkbox checked={p.languages.includes(l.id)} onCheckedChange={(c) => set({ languages: c ? [...p.languages, l.id] : p.languages.filter((x) => x !== l.id) })} />{l.label}</label>
                ))}
              </div>
            </Field>
            <Field label="Service pour">
              <div className="flex flex-wrap gap-4">
                {SERVES.map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm"><Checkbox checked={p.servesFor.includes(s)} onCheckedChange={(c) => set({ servesFor: c ? [...p.servesFor, s] : p.servesFor.filter((x) => x !== s) })} />{fr.servesFor[s]}</label>
                ))}
              </div>
            </Field>
          </Section>
        </TabsContent>

        <TabsContent value="avail">
          <Section title="Disponibilités">
            <Field label="Pays">
              <div className="flex flex-wrap gap-4">
                {countries.map((c) => (
                  <label key={c.code} className="flex items-center gap-2 text-sm"><Checkbox checked={p.availability.some((a) => a.countryCode === c.code)} onCheckedChange={(v) => toggleCountry(c.code, !!v)} />{c.name}</label>
                ))}
              </div>
            </Field>
            {p.availability.map((a) => {
              const c = countries.find((x) => x.code === a.countryCode);
              if (!c) return null;
              return (
                <div key={a.countryCode} className="space-y-3 rounded-md border border-border p-4">
                  <p className="font-serif text-xl">{c.name}</p>
                  <div className="flex flex-wrap gap-4">
                    {c.cities.map((ci) => (
                      <label key={ci.slug} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={a.cities.includes(ci.slug)} onCheckedChange={(v) => updateAvail(a.countryCode, (x) => ({ ...x, cities: v ? [...x.cities, ci.slug] : x.cities.filter((s) => s !== ci.slug), primaryCity: !v && x.primaryCity === ci.slug ? undefined : x.primaryCity }))} />
                        {ci.name}
                        {a.cities.includes(ci.slug) && (
                          <button type="button" onClick={() => set({ availability: p.availability.map((y) => ({ ...y, primaryCity: y.countryCode === a.countryCode ? ci.slug : undefined })) })} aria-label={`Ville principale : ${ci.name}`} className={a.primaryCity === ci.slug ? "text-gold" : "text-muted-foreground hover:text-gold"}>
                            <Star className={`h-3.5 w-3.5 ${a.primaryCity === ci.slug ? "fill-gold" : ""}`} />
                          </button>
                        )}
                      </label>
                    ))}
                  </div>
                  <div className="flex max-w-sm gap-2">
                    <Input value={newCity[a.countryCode] ?? ""} onChange={(e) => setNewCity((s) => ({ ...s, [a.countryCode]: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), quickAddCity(a.countryCode))} placeholder="Ajouter une ville…" className="h-8" aria-label="Nouvelle ville" />
                    <Button type="button" size="sm" variant="outline" onClick={() => quickAddCity(a.countryCode)}><Plus /></Button>
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground">★ = ville principale affichée sur la carte de profil.</p>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Mode">
                <Select value={p.mode} onValueChange={(v) => set({ mode: v as Profile["mode"] })}>
                  <SelectTrigger aria-label="Mode"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="recoit">{fr.mode.recoit}</SelectItem><SelectItem value="deplace">{fr.mode.deplace}</SelectItem><SelectItem value="both">Les deux</SelectItem></SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <Field label="Adresse (optionnelle)" id="f-street"><Input id="f-street" value={p.address?.street ?? ""} onChange={(e) => set({ address: { ...p.address, street: e.target.value } })} /></Field>
              <Field label="Code postal" id="f-zip"><Input id="f-zip" value={p.address?.zip ?? ""} onChange={(e) => set({ address: { ...p.address, zip: e.target.value } })} /></Field>
              <Field label="Ville">
                <Select value={p.address?.city ?? NONE} onValueChange={(v) => set({ address: { ...p.address, city: v === NONE ? undefined : v } })}>
                  <SelectTrigger aria-label="Ville de l'adresse"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value={NONE}>—</SelectItem>{allCities.map((c) => <SelectItem key={c} value={c}>{countries.flatMap((x) => x.cities).find((x) => x.slug === c)?.name ?? c}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="rates">
          <Section title="Tarifs">
            <div className="grid max-w-md grid-cols-2 gap-4">
              <Field label="Prix / heure *" id="f-price"><Input id="f-price" type="number" min={0} value={p.price.perHour} onChange={(e) => set({ price: { ...p.price, perHour: Number(e.target.value) } })} /></Field>
              <Field label="Devise">
                <Select value={p.price.currency} onValueChange={(v) => set({ price: { ...p.price, currency: v as "EUR" | "CHF" } })}>
                  <SelectTrigger aria-label="Devise"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="EUR">EUR (€)</SelectItem><SelectItem value="CHF">CHF</SelectItem></SelectContent>
                </Select>
              </Field>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium">Offres spéciales</p>
              {p.specialOffers.map((o, i) => (
                <div key={i} className="grid grid-cols-[1fr_110px_110px_auto] gap-2">
                  <Input value={o.label} placeholder="Libellé" aria-label="Libellé" onChange={(e) => set({ specialOffers: p.specialOffers.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
                  <Input value={o.duration} placeholder="Durée" aria-label="Durée" onChange={(e) => set({ specialOffers: p.specialOffers.map((x, j) => (j === i ? { ...x, duration: e.target.value } : x)) })} />
                  <Input type="number" value={o.price} aria-label={`Prix (${cur})`} onChange={(e) => set({ specialOffers: p.specialOffers.map((x, j) => (j === i ? { ...x, price: Number(e.target.value) } : x)) })} />
                  <Button type="button" size="icon" variant="ghost" aria-label="Supprimer l'offre" onClick={() => set({ specialOffers: p.specialOffers.filter((_, j) => j !== i) })}><Trash2 /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => set({ specialOffers: [...p.specialOffers, { label: "", duration: "", price: 0 }] })}><Plus /> Ajouter une offre</Button>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="contact">
          <Section title="Contact">
            <div className="grid gap-5 md:grid-cols-2">
              {([["phone", "Téléphone", "+33 6 …"], ["whatsapp", "WhatsApp", "+33600000000"], ["email", "E-mail", "nom@exemple.com"], ["website", "Site web", "https://…"], ["instagram", "Instagram", "pseudo (sans @)"]] as const).map(([k, l, ph]) => (
                <Field key={k} label={l} id={`f-${k}`}><Input id={`f-${k}`} value={p.contact[k] ?? ""} placeholder={ph} onChange={(e) => set({ contact: { ...p.contact, [k]: e.target.value } })} /></Field>
              ))}
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="desc">
          <Section title="Description">
            <Field label="Titre d'accroche" id="f-head" hint={`${p.headline.length}/140`}><Input id="f-head" value={p.headline} maxLength={140} onChange={(e) => set({ headline: e.target.value })} /></Field>
            <Field label="Texte FR" id="f-fr" hint={`${p.descriptionFr.length}/4000`}><Textarea id="f-fr" rows={8} maxLength={4000} value={p.descriptionFr} onChange={(e) => set({ descriptionFr: e.target.value })} /></Field>
            <Field label="Texte EN" id="f-en" hint={`${p.descriptionEn.length}/4000`}><Textarea id="f-en" rows={6} maxLength={4000} value={p.descriptionEn} onChange={(e) => set({ descriptionEn: e.target.value })} /></Field>
          </Section>
        </TabsContent>

        <TabsContent value="lists" className="space-y-6">
          <Section title="Services"><CatalogChecklist type="service" value={p.services} onChange={(v) => set({ services: v })} /></Section>
          <Section title="Équipement"><CatalogChecklist type="equipment" value={p.equipment} onChange={(v) => set({ equipment: v })} /></Section>
          <Section title="Tabous"><CatalogChecklist type="taboo" value={p.taboos} onChange={(v) => set({ taboos: v })} /></Section>
        </TabsContent>
      </Tabs>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur lg:left-60">
        <div className="flex flex-wrap items-center justify-end gap-2 px-4 py-3 sm:px-8">
          {dirty && <span className="mr-auto text-xs text-gold">Modifications non enregistrées</span>}
          <Button variant="ghost" onClick={() => navigate({ to: "/admin/profils" })}>Annuler</Button>
          <Button variant="outline" onClick={() => save(p.status, true)}><Eye /> Aperçu</Button>
          <Button variant="gold" onClick={() => save("draft")}>Enregistrer le brouillon</Button>
          <Button variant="velvet" onClick={() => save("published")}>Publier</Button>
        </div>
      </div>
    </div>
  );
}
