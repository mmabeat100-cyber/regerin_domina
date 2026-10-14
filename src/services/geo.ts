import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import type { City, Country } from "@/types";

/** Pays & villes. TODO(Supabase) : tables "countries" et "cities". */
export const useCountries = () => useStore((s) => s.countries);

export const useAllCities = () => {
  const countries = useCountries();
  return useMemo(() => countries.flatMap((c) => c.cities), [countries]);
};

export const findCountry = (countries: Country[], codeOrSlug?: string) =>
  countries.find((c) => c.code === codeOrSlug || c.slug === codeOrSlug);

export const findCity = (countries: Country[], slug?: string): City | undefined =>
  countries.flatMap((c) => c.cities).find((c) => c.slug === slug);

export const cityName = (countries: Country[], slug: string) => findCity(countries, slug)?.name ?? slug;

export const geoService = {
  saveCountries(countries: Country[]) {
    useStore.getState().set(() => ({ countries }));
  },
};
