import { Link, useNavigate } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { LanguageSwitch } from "./LanguageSwitch";
import { useT } from "@/i18n";
import { useCountries } from "@/services/geo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

function CountrySwitch() {
  const t = useT();
  const countries = useCountries();
  const navigate = useNavigate();
  return (
    <Select onValueChange={(v) => navigate({ to: "/pays/$country", params: { country: v } })}>
      <SelectTrigger
        className="h-9 w-[150px] border-border bg-transparent"
        aria-label={t.nav.country}
      >
        <SelectValue placeholder={t.nav.country} />
      </SelectTrigger>
      <SelectContent>
        {countries.map((c) => (
          <SelectItem key={c.code} value={c.slug}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function Header() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/annuaire", label: t.nav.directory },
    { to: "/studios", label: t.nav.studios },
    { to: "/villes", label: t.nav.cities },
    { to: "/a-propos", label: t.nav.about },
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container-site grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:flex md:justify-between">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <CountrySwitch />
          <LanguageSwitch />
          <Button asChild variant="gold">
            <Link to="/inscription">{t.nav.signup}</Link>
          </Button>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="font-serif text-2xl">Menu</SheetTitle>
            <nav className="mt-8 flex flex-col gap-5" aria-label="Mobile navigation">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="font-serif text-2xl"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-8 space-y-4">
              <CountrySwitch />
              <LanguageSwitch className="w-full justify-between" />
              <Button asChild variant="gold" className="w-full">
                <Link to="/inscription" onClick={() => setOpen(false)}>
                  {t.nav.signup}
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
