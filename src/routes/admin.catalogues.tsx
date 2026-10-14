import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { CatalogType } from "@/types";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/store/useStore";
import { catalogService } from "@/services/catalogs";
import { newId } from "@/services/profiles";

export const Route = createFileRoute("/admin/catalogues")({ component: AdminCatalogs });

const TYPES: [CatalogType, string][] = [["category", "Catégories"], ["service", "Services"], ["equipment", "Équipement"], ["taboo", "Tabous"], ["language", "Langues"]];

function CatalogEditor({ type }: { type: CatalogType }) {
  const all = useStore((s) => s.catalogs);
  const items = all.filter((c) => c.type === type).sort((a, b) => a.order - b.order);
  const [label, setLabel] = useState("");
  const commit = (next: typeof items) => catalogService.saveAll([...all.filter((c) => c.type !== type), ...next.map((x, i) => ({ ...x, order: i }))]);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const n = [...items];
    [n[i], n[j]] = [n[j], n[i]];
    commit(n);
  };
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-5">
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={it.id} className="flex items-center gap-2">
            <Input value={it.label} onChange={(e) => commit(items.map((x) => (x.id === it.id ? { ...x, label: e.target.value } : x)))} aria-label="Libellé" className="h-9" />
            <Button size="icon" variant="ghost" aria-label="Monter" onClick={() => move(i, -1)}><ArrowUp /></Button>
            <Button size="icon" variant="ghost" aria-label="Descendre" onClick={() => move(i, 1)}><ArrowDown /></Button>
            <Button size="icon" variant="ghost" aria-label="Supprimer" onClick={() => confirm(`Supprimer « ${it.label} » ?`) && commit(items.filter((x) => x.id !== it.id))}><Trash2 /></Button>
          </li>
        ))}
      </ul>
      <form className="flex max-w-md gap-2 pt-2" onSubmit={(e) => { e.preventDefault(); if (!label.trim()) return; commit([...items, { id: newId(type), type, label: label.trim(), order: items.length }]); setLabel(""); }}>
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Nouvelle entrée" aria-label="Nouvelle entrée" />
        <Button type="submit" variant="velvet"><Plus /> Ajouter</Button>
      </form>
    </div>
  );
}

function AdminCatalogs() {
  return (
    <>
      <AdminHeader title="Catalogues" subtitle="Listes utilisées dans les fiches et les filtres." />
      <Tabs defaultValue="category">
        <TabsList className="mb-4 flex h-auto flex-wrap justify-start">{TYPES.map(([t, l]) => <TabsTrigger key={t} value={t}>{l}</TabsTrigger>)}</TabsList>
        {TYPES.map(([t]) => <TabsContent key={t} value={t}><CatalogEditor type={t} /></TabsContent>)}
      </Tabs>
    </>
  );
}
