import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  to?: string;
  params?: Record<string, string>;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li><Link to="/" className="hover:text-foreground">Accueil</Link></li>
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3" aria-hidden />
            {c.to ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <Link to={c.to as any} params={c.params as any} className="hover:text-foreground">{c.label}</Link>
            ) : (
              <span aria-current="page" className="text-foreground">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="animate-fade-up space-y-3 py-10">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="text-4xl sm:text-5xl">{title}</h1>
      {children && <div className="max-w-2xl text-muted-foreground">{children}</div>}
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <h3 className="text-2xl">{title}</h3>
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
