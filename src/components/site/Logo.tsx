import { Link } from "@tanstack/react-router";
import logo from "@/assets/wd_logo.png";
import { SITE } from "@/config/site";

export function Logo({ to = "/" }: { to?: "/" }) {
  return (
    <Link to={to} className="group flex min-w-0 items-center gap-2" aria-label={`${SITE.name} — accueil`}>
      <img
        src={logo}
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 transition-transform duration-700 group-hover:rotate-180"
      />
      <span className="truncate font-serif text-2xl tracking-wide">{SITE.name}</span>
    </Link>
  );
}
