import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/services/catalogs";
import { useCountries } from "@/services/geo";
import { fr } from "@/i18n/fr";

const ALL = "__all";

export function HeroSearch() {
  const navigate = useNavigate();
  const categories = useCatalog("category");
  const countries = useCountries();
  const [category, setCategory] = useState(ALL);
  const [country, setCountry] = useState(ALL);
  const [city, setCity] = useState(ALL);
  const cities = countries.find((c) => c.code === country)?.cities ?? countries.flatMap((c) => c.cities);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/annuaire",
      search: {
        category: category === ALL ? undefined : category,
        country: country === ALL ? undefined : country,
        city: city === ALL ? undefined : city,
      },
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-2 rounded-xl border border-border bg-card/70 p-2 backdrop-blur-md sm:grid-cols-[1fr_1fr_1fr_auto]" role="search">
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger aria-label={fr.filters.category} className="h-12 border-0 bg-secondary/60"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Toutes catégories</SelectItem>
          {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={country} onValueChange={(v) => { setCountry(v); setCity(ALL); }}>
        <SelectTrigger aria-label={fr.filters.country} className="h-12 border-0 bg-secondary/60"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{fr.nav.allCountries}</SelectItem>
          {countries.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={city} onValueChange={setCity}>
        <SelectTrigger aria-label={fr.filters.city} className="h-12 border-0 bg-secondary/60"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Toutes villes</SelectItem>
          {cities.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Button type="submit" variant="velvet" size="lg" className="h-12">
        <Search aria-hidden /> {fr.home.search}
      </Button>
    </form>
  );
}
