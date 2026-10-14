import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCatalog } from "@/services/catalogs";
import { useCountries } from "@/services/geo";
import { fr } from "@/i18n/fr";
import { PRICE_MAX, PRICE_MIN, type DirectoryFilters } from "@/lib/filter";

const ALL = "__all";
const SERVES = ["hommes", "femmes", "couples", "divers"] as const;

interface Props {
  value: DirectoryFilters;
  onChange: (patch: Partial<DirectoryFilters>) => void;
}

const toggle = (arr: string[] | undefined, v: string) => {
  const s = new Set(arr ?? []);
  if (s.has(v)) s.delete(v);
  else s.add(v);
  return s.size ? [...s] : undefined;
};

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3 border-b border-border pb-5">
      <legend className="eyebrow mb-3">{title}</legend>
      {children}
    </fieldset>
  );
}

export function DirectoryFiltersPanel({ value: f, onChange }: Props) {
  const categories = useCatalog("category");
  const languages = useCatalog("language");
  const services = useCatalog("service");
  const countries = useCountries();
  const [srvQuery, setSrvQuery] = useState("");
  const cities = f.country ? countries.find((c) => c.code === f.country)?.cities ?? [] : countries.flatMap((c) => c.cities);
  const [price, setPrice] = useState<[number, number]>([f.minPrice ?? PRICE_MIN, f.maxPrice ?? PRICE_MAX]);

  return (
    <div className="space-y-5">
      <Group title={fr.filters.category}>
        <Select value={f.category ?? ALL} onValueChange={(v) => onChange({ category: v === ALL ? undefined : v })}>
          <SelectTrigger aria-label={fr.filters.category}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{fr.filters.all}</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </Group>
      <Group title={`${fr.filters.country} & ${fr.filters.city}`}>
        <Select value={f.country ?? ALL} onValueChange={(v) => onChange({ country: v === ALL ? undefined : v, city: undefined })}>
          <SelectTrigger aria-label={fr.filters.country}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{fr.nav.allCountries}</SelectItem>
            {countries.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={f.city ?? ALL} onValueChange={(v) => onChange({ city: v === ALL ? undefined : v })}>
          <SelectTrigger aria-label={fr.filters.city}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Toutes villes</SelectItem>
            {cities.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </Group>
      <Group title={fr.filters.servesFor}>
        <div className="grid grid-cols-2 gap-2">
          {SERVES.map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm">
              <Checkbox checked={f.servesFor?.includes(s) ?? false} onCheckedChange={() => onChange({ servesFor: toggle(f.servesFor, s) })} />
              {fr.servesFor[s]}
            </label>
          ))}
        </div>
      </Group>
      <Group title={fr.filters.languages}>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((l) => (
            <label key={l.id} className="flex items-center gap-2 text-sm">
              <Checkbox checked={f.languages?.includes(l.id) ?? false} onCheckedChange={() => onChange({ languages: toggle(f.languages, l.id) })} />
              {l.label}
            </label>
          ))}
        </div>
      </Group>
      <Group title={fr.filters.price}>
        <Slider
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={10}
          value={price}
          aria-label="Prix"
          onValueChange={(v) => setPrice([v[0], v[1]])}
          onValueCommit={(v) => onChange({ minPrice: v[0] > PRICE_MIN ? v[0] : undefined, maxPrice: v[1] < PRICE_MAX ? v[1] : undefined })}
        />
        <p className="flex justify-between text-xs text-muted-foreground"><span>{price[0]} €</span><span>{price[1]}{price[1] === PRICE_MAX ? "+" : ""} €</span></p>
      </Group>
      <Group title={fr.filters.services}>
        <Input value={srvQuery} onChange={(e) => setSrvQuery(e.target.value)} placeholder={fr.filters.searchServices} aria-label={fr.filters.searchServices} className="h-8" />
        <div className="max-h-48 space-y-2 overflow-auto pr-1">
          {services.filter((s) => s.label.toLowerCase().includes(srvQuery.toLowerCase())).map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm">
              <Checkbox checked={f.services?.includes(s.id) ?? false} onCheckedChange={() => onChange({ services: toggle(f.services, s.id) })} />
              {s.label}
            </label>
          ))}
        </div>
      </Group>
      <Group title={fr.filters.mode}>
        <Select value={f.mode ?? ALL} onValueChange={(v) => onChange({ mode: v === ALL ? undefined : (v as DirectoryFilters["mode"]) })}>
          <SelectTrigger aria-label={fr.filters.mode}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{fr.filters.all}</SelectItem>
            <SelectItem value="recoit">{fr.mode.recoit}</SelectItem>
            <SelectItem value="deplace">{fr.mode.deplace}</SelectItem>
          </SelectContent>
        </Select>
      </Group>
      <div className="flex items-center justify-between">
        <Label htmlFor="verified-only">{fr.filters.verifiedOnly}</Label>
        <Switch id="verified-only" checked={!!f.verified} onCheckedChange={(v) => onChange({ verified: v || undefined })} />
      </div>
    </div>
  );
}
