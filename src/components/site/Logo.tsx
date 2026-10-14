import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { SITE } from "@/config/site";

export function Logo({ to = "/" }: { to?: "/" }) {
  return (
    <Link to={to} className="group flex min-w-0 items-center gap-2" aria-label={`${SITE.name} — accueil`}>
      <Compass className="h-6 w-6 shrink-0 text-gold transition-transform duration-700 group-hover:rotate-180" aria-hidden />
      <span className="truncate font-serif text-2xl tracking-wide">{SITE.name}</span>
    </Link>
  );
}
