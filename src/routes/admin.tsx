import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import {
  BookOpen,
  Building2,
  Compass,
  Eye,
  EyeOff,
  LayoutDashboard,
  LogOut,
  Map,
  MessageSquare,
  Settings,
  Users,
  ExternalLink,
} from "lucide-react";
import { useStoreHydrated } from "@/hooks/use-store-hydrated";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/config/site";
import { fr } from "@/i18n/fr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: `Back-office — ${SITE.name}` },
      { name: "description", content: "Espace d'administration de l'annuaire." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: `Back-office — ${SITE.name}` },
      { property: "og:description", content: "Espace d'administration." },
    ],
  }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: fr.admin.dashboard, icon: LayoutDashboard, exact: true },
  { to: "/admin/profils", label: fr.admin.profiles, icon: Users },
  { to: "/admin/studios", label: fr.admin.studios, icon: Building2 },
  { to: "/admin/pays", label: fr.admin.geo, icon: Map },
  { to: "/admin/catalogues", label: fr.admin.catalogs, icon: BookOpen },
  { to: "/admin/avis", label: fr.admin.reviews, icon: MessageSquare },
  { to: "/admin/parametres", label: fr.admin.settings, icon: Settings },
] as const;

/** Connexion Supabase Auth — identifiant unique mappé en interne vers un email technique. */
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (username.trim().toLowerCase() !== SITE.adminUsername) {
        toast.error("Identifiants incorrects");
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: SITE.adminEmail,
        password,
      });
      if (error) toast.error("Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-5 rounded-xl border border-border bg-card p-8 shadow-elegant"
      >
        <div className="text-center">
          <Compass className="mx-auto h-9 w-9 text-gold" />
          <h1 className="mt-3 text-3xl">Back-office</h1>
          <p className="text-sm text-muted-foreground">{SITE.name}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Identifiant</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" variant="velvet" className="w-full" disabled={loading}>
          Se connecter
        </Button>
      </form>
    </div>
  );
}

function AccessDenied({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-5 rounded-xl border border-border bg-card p-8 text-center shadow-elegant">
        <Compass className="mx-auto h-9 w-9 text-gold" />
        <h1 className="text-2xl">Accès refusé</h1>
        <p className="text-sm text-muted-foreground">
          Ce compte n'a pas les droits d'administration.
        </p>
        <Button variant="outline" className="w-full" onClick={onSignOut}>
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}

function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col">
      <Link to="/admin" className="flex items-center gap-2 px-2 py-4" onClick={onNavigate}>
        <Compass className="h-5 w-5 text-gold" />
        <span className="font-serif text-xl">{SITE.name}</span>
      </Link>
      <nav className="mt-4 flex-1 space-y-1" aria-label="Administration">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            activeOptions={{ exact: "exact" in n }}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            activeProps={{ className: "bg-sidebar-accent text-foreground" }}
          >
            <n.icon className="h-4 w-4" /> {n.label}
          </Link>
        ))}
      </nav>
      <div className="space-y-1 border-t border-sidebar-border pt-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" /> Voir le site
        </Link>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/admin" });
          }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> {fr.admin.logout}
        </button>
      </div>
    </div>
  );
}

function AdminLayout() {
  const hydrated = useStoreHydrated();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(null);
      return;
    }
    let cancelled = false;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .then(({ data, error }) => {
        if (!cancelled) setIsAdmin(!error && !!data?.some((r) => r.role === "admin"));
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!hydrated || session === undefined) return <div className="min-h-screen bg-background" />;
  if (!session) return <Login />;
  if (isAdmin === null) return <div className="min-h-screen bg-background" />;
  if (!isAdmin) return <AccessDenied onSignOut={() => supabase.auth.signOut()} />;
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-sidebar-border bg-sidebar px-3 pb-4 lg:block">
        <SideNav />
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-14 items-center border-b border-border px-4 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-3">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SideNav onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="ml-2 font-serif text-lg">Back-office</span>
        </header>
        <main className="p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
