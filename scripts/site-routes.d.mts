export const STATIC_PATHS: string[];
export function slugify(s: string): string;
export function getPublicRoutes(env?: Record<string, string | undefined>): Promise<{
  profiles: { slug: string; updatedAt?: string }[];
  countries: { slug: string; cities: { slug: string }[] }[];
  studios: { slug: string }[];
  categories: { label: string }[];
}>;
