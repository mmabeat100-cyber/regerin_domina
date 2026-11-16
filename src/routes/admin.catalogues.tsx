import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { CatalogItem, CatalogType } from "@/types";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { catalogService, useCatalogsQuery } from "@/services/catalogs";
import { newId } from "@/services/profiles";

export const Route = createFileRoute("/admin/catalogues")({ component: AdminCatalogs });

const TYPES: [CatalogType, string][] = [
  ["category", "Catégories"],
  ["service", "Services"],
  ["equipment", "Équipement"],
  ["taboo", "Tabous"],
  ["language", "Langues"],
];

function CatalogEditor({ type, all }: { type: CatalogType; all: CatalogItem[] }) {
  const [draft, setDraft] = useState<CatalogItem[]>(() =>
    all.filter((c) => c.type === type).sort((a, b) => a.order - b.order),
  );
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState("");

  const set = (next: CatalogItem[]) => {
    setDraft(next);
    setDirty(true);
  };
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= draft.length) return;
    const n = [...draft];
    [n[i], n[j]] = [n[j], n[i]];
    set(n);
  };

  const save = async () => {
    setSaving(true);
    try {
      const others = all.filter((c) => c.type !== type);
      await catalogService.saveAll([...others, ...draft.map((x, i) => ({ ...x, order: i }))]);
      setDirty(false);
      toast.success("Modifications enregistrées");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-5">
      <ul className="space-y-2">
        {draft.map((it, i) => (
          <li key={it.id} className="flex items-center gap-2">
            <Input
              value={it.label}
              onChange={(e) =>
                set(draft.map((x) => (x.id === it.id ? { ...x, label: e.target.value } : x)))
              }
              aria-label="Libellé"
              className="h-9"
            />
            <Button size="icon" variant="ghost" aria-label="Monter" onClick={() => move(i, -1)}>
              <ArrowUp />
            </Button>
            <Button size="icon" variant="ghost" aria-label="Descendre" onClick={() => move(i, 1)}>
              <ArrowDown />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Supprimer"
              onClick={() =>
                confirm(`Supprimer « ${it.label} » ?`) && set(draft.filter((x) => x.id !== it.id))
              }
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>
      <form
        className="flex max-w-md gap-2 pt-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!label.trim()) return;
          set([...draft, { id: newId(type), type, label: label.trim(), order: draft.length }]);
          setLabel("");
        }}
      >
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Nouvelle entrée"
          aria-label="Nouvelle entrée"
        />
        <Button type="submit" variant="outline">
          <Plus /> Ajouter
        </Button>
      </form>
      <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
        {dirty && <span className="mr-auto text-xs text-gold">Modifications non enregistrées</span>}
        <Button variant="velvet" onClick={save} disabled={saving || !dirty}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}

function AdminCatalogs() {
  const { data, isLoading } = useCatalogsQuery();
  const [ready, setReady] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (data && !initialized.current) {
      initialized.current = true;
      setReady(true);
    }
  }, [data]);

  if (isLoading || !ready || !data) return <div className="min-h-[40vh]" />;

  return (
    <>
      <AdminHeader title="Catalogues" subtitle="Listes utilisées dans les fiches et les filtres." />
      <Tabs defaultValue="category">
        <TabsList className="mb-4 flex h-auto flex-wrap justify-start">
          {TYPES.map(([t, l]) => (
            <TabsTrigger key={t} value={t}>
              {l}
            </TabsTrigger>
          ))}
        </TabsList>
        {TYPES.map(([t]) => (
          <TabsContent key={t} value={t}>
            <CatalogEditor key={t} type={t} all={data} />
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
