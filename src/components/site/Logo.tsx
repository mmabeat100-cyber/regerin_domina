import { Link } from "@tanstack/react-router";
import logo from "@/assets/wd_logo.png";
import { SITE } from "@/config/site";

export function Logo({ to = "/" }: { to?: "/" }) {
  return (
    <Link to={to} className="group flex min-w-0 items-center gap-2" aria-label={`${SITE.name} — accueil`}>
      <span className="relative grid h-12 w-12 shrink-0 place-items-center">
        <span className="absolute inset-0 rounded-full bg-primary-foreground" aria-hidden />
        <img
          src={logo}
          alt=""
          width={48}
          height={48}
          className="relative h-12 w-12 transition-transform duration-700 group-hover:rotate-180"
        />
      </span>
      <span className="truncate font-serif text-2xl tracking-wide">{SITE.name}</span>
    </Link>
  );
}
