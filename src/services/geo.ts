import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { queryClient } from "@/lib/queryClient";
import type { City, Country } from "@/types";

const QUERY_KEY = ["countries"] as const;

async function fetchCountries(): Promise<Country[]> {
  const { data, error } = await supabase.from("countries").select("data").order("sort");
  if (error) throw error;
  return (data ?? []).map((row) => row.data as unknown as Country);
}

export const useCountriesQuery = () =>
  useQuery({ queryKey: QUERY_KEY, queryFn: fetchCountries, staleTime: 30_000 });

export const useCountries = () => useCountriesQuery().data ?? [];

export const useAllCities = () => {
  const countries = useCountries();
  return useMemo(() => countries.flatMap((c) => c.cities), [countries]);
};

export const findCountry = (countries: Country[], codeOrSlug?: string) =>
  countries.find((c) => c.code === codeOrSlug || c.slug === codeOrSlug);

export const findCity = (countries: Country[], slug?: string): City | undefined =>
  countries.flatMap((c) => c.cities).find((c) => c.slug === slug);

export const cityName = (countries: Country[], slug: string) =>
  findCity(countries, slug)?.name ?? slug;

export const geoService = {
  /** Replaces the whole country list: upserts everything in `next`, deletes codes no longer present. */
  async saveCountries(next: Country[]) {
    const previous = queryClient.getQueryData<Country[]>(QUERY_KEY) ?? [];
    const nextCodes = new Set(next.map((c) => c.code));
    const removedCodes = previous.filter((c) => !nextCodes.has(c.code)).map((c) => c.code);

    const rows = next.map((c, i) => ({ code: c.code, sort: i, data: c as unknown as Json }));
    const { error: upsertError } = await supabase.from("countries").upsert(rows);
    if (upsertError) throw upsertError;

    if (removedCodes.length) {
      const { error: deleteError } = await supabase
        .from("countries")
        .delete()
        .in("code", removedCodes);
      if (deleteError) throw deleteError;
    }
    await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  },
};
