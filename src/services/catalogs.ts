import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import type { CatalogItem, CatalogType } from "@/types";

/** Catalogues. TODO(Supabase) : table "catalogs". */
export const useCatalog = (type: CatalogType) => {
  const all = useStore((s) => s.catalogs);
  return useMemo(() => all.filter((c) => c.type === type).sort((a, b) => a.order - b.order), [all, type]);
};

export const useCatalogLabel = () => {
  const all = useStore((s) => s.catalogs);
  return useMemo(() => {
    const map = new Map(all.map((c) => [c.id, c.label]));
    return (id: string) => map.get(id) ?? id;
  }, [all]);
};

export const catalogService = {
  saveAll(items: CatalogItem[]) {
    useStore.getState().set(() => ({ catalogs: items }));
  },
};
