import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import type { CatalogItem, CatalogType } from "@/types";
import { useLocale } from "@/i18n";
import { translateCatalogLabel } from "@/i18n/catalogLabels";

/** Catalogues. TODO(Supabase) : table "catalogs". */
export const useCatalog = (type: CatalogType) => {
  const all = useStore((s) => s.catalogs);
  return useMemo(
    () => all.filter((c) => c.type === type).sort((a, b) => a.order - b.order),
    [all, type],
  );
};

export const useCatalogLabel = () => {
  const all = useStore((s) => s.catalogs);
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
  saveAll(items: CatalogItem[]) {
    useStore.getState().set(() => ({ catalogs: items }));
  },
};
