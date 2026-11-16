import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryClient } from "@/lib/queryClient";
import type { CatalogItem, CatalogType } from "@/types";
import { useLocale } from "@/i18n";
import { translateCatalogLabel } from "@/i18n/catalogLabels";

const QUERY_KEY = ["catalogs"] as const;

async function fetchCatalogs(): Promise<CatalogItem[]> {
  const { data, error } = await supabase.from("catalogs").select("id, type, label, sort");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.type as CatalogType,
    label: row.label,
    order: row.sort,
  }));
}

export const useCatalogsQuery = () =>
  useQuery({ queryKey: QUERY_KEY, queryFn: fetchCatalogs, staleTime: 30_000 });

const useAllCatalogs = () => useCatalogsQuery().data ?? [];

export const useCatalog = (type: CatalogType) => {
  const all = useAllCatalogs();
  return useMemo(
    () => all.filter((c) => c.type === type).sort((a, b) => a.order - b.order),
    [all, type],
  );
};

export const useCatalogLabel = () => {
  const all = useAllCatalogs();
  return useMemo(() => {
    const map = new Map(all.map((c) => [c.id, c.label]));
    return (id: string) => map.get(id) ?? id;
  }, [all]);
};

/** Same as useCatalog, but labels are translated for the public site's current language. */
export const useCatalogT = (type: CatalogType) => {
  const items = useCatalog(type);
  const locale = useLocale();
  return useMemo(
    () => items.map((c) => ({ ...c, label: translateCatalogLabel(locale, c.id, c.label) })),
    [items, locale],
  );
};

/** Same as useCatalogLabel, but translated for the public site's current language. */
export const useCatalogLabelT = () => {
  const label = useCatalogLabel();
  const locale = useLocale();
  return useMemo(
    () => (id: string) => translateCatalogLabel(locale, id, label(id)),
    [label, locale],
  );
};

export const catalogService = {
  /** Replaces the whole catalog list: upserts everything in `items`, deletes ids no longer present. */
  async saveAll(items: CatalogItem[]) {
    const previous = queryClient.getQueryData<CatalogItem[]>(QUERY_KEY) ?? [];
    const nextIds = new Set(items.map((c) => c.id));
    const removedIds = previous.filter((c) => !nextIds.has(c.id)).map((c) => c.id);

    const rows = items.map((c) => ({ id: c.id, type: c.type, label: c.label, sort: c.order }));
    const { error: upsertError } = await supabase.from("catalogs").upsert(rows);
    if (upsertError) throw upsertError;

    if (removedIds.length) {
      const { error: deleteError } = await supabase.from("catalogs").delete().in("id", removedIds);
      if (deleteError) throw deleteError;
    }
    await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  },
};
