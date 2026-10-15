import { Link, useNavigate } from "@tanstack/react-router";
import { Mail, Menu } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { fr } from "@/i18n/fr";
import { SITE } from "@/config/site";
import { useCountries } from "@/services/geo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/annuaire", label: fr.nav.directory },
  { to: "/studios", label: fr.nav.studios },
  { to: "/villes", label: fr.nav.cities },
  { to: "/a-propos", label: fr.nav.about },
] as const;

function SignupDialog({ triggerClassName }: { triggerClassName?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="gold" className={triggerClassName}>
          {fr.nav.signup}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-xl border-gold/20 bg-card p-8 text-center shadow-elegant">
        <DialogHeader className="items-center space-y-3 text-center sm:text-center">
          <Mail className="h-8 w-8 text-gold" aria-hidden />
          <DialogTitle className="font-serif text-2xl font-normal">{fr.signup.title}</DialogTitle>
          <DialogDescription className="text-balance">{fr.signup.text}</DialogDescription>
        </DialogHeader>
        <a
          href={`mailto:${SITE.adminEmail}`}
          className="mx-auto mt-2 inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-sm text-gold transition-colors hover:bg-gold hover:text-gold-foreground"
        >
          <Mail className="h-4 w-4" aria-hidden />
          {SITE.adminEmail}
        </a>
      </DialogContent>
    </Dialog>
  );
}

function CountrySwitch() {
  const countries = useCountries();
  const navigate = useNavigate();
  return (
    <Select onValueChange={(v) => navigate({ to: "/pays/$country", params: { country: v } })}>
      <SelectTrigger
        className="h-9 w-[150px] border-border bg-transparent"
        aria-label={fr.nav.country}
      >
        <SelectValue placeholder={fr.nav.country} />
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
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container-site grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:flex md:justify-between">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Navigation principale">
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
          <SignupDialog />
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Ouvrir le menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="font-serif text-2xl">Menu</SheetTitle>
            <nav className="mt-8 flex flex-col gap-5" aria-label="Navigation mobile">
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
              <SignupDialog triggerClassName="w-full" />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
