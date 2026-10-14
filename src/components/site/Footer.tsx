import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { Logo } from "./Logo";
import { fr } from "@/i18n/fr";
import { SITE } from "@/config/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card/40">
      <div className="container-site grid gap-10 py-14 md:grid-cols-3">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">{SITE.slogan}</p>
        </div>
        <nav aria-label="Liens légaux" className="grid grid-cols-2 gap-3 text-sm">
          <Link to="/mentions-legales" className="text-muted-foreground hover:text-foreground">
            {fr.footer.legal}
          </Link>
          <Link to="/confidentialite" className="text-muted-foreground hover:text-foreground">
            {fr.footer.privacy}
          </Link>
          <Link
            to="/protection-des-mineurs"
            className="text-muted-foreground hover:text-foreground"
          >
            {fr.footer.minors}
          </Link>
          <Link to="/contact" className="text-muted-foreground hover:text-foreground">
            {fr.footer.contact}
          </Link>
          <Link to="/annuaire" className="text-muted-foreground hover:text-foreground">
            {fr.nav.directory}
          </Link>
          <Link to="/villes" className="text-muted-foreground hover:text-foreground">
            {fr.nav.cities}
          </Link>
        </nav>
        <div className="space-y-3 text-xs text-muted-foreground">
          <p className="flex items-center gap-2 font-medium text-gold">
            <ShieldAlert className="h-4 w-4" aria-hidden /> {fr.footer.adults}
          </p>
          <p>{fr.footer.jugendschutz}</p>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © 2026{" "}
        <Link to="/admin" className="hover:text-foreground">
          {SITE.name}
        </Link>
        . {fr.footer.rights}
      </div>
    </footer>
  );
}
