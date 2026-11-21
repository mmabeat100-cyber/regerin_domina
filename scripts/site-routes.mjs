// Single source of truth for "what are all the real public routes" — used
// both by the sitemap generator and by vite.config.ts to prerender every
// route to real static HTML (instead of just the generic SPA shell).
// Querying Supabase directly (not the prerender crawler) because this app's
// lists are fetched client-side and would otherwise never be discovered.

export const STATIC_PATHS = [
  "/",
  "/annuaire",
  "/villes",
  "/studios",
  "/inscription",
  "/a-propos",
  "/contact",
  "/mentions-legales",
  "/confidentialite",
  "/protection-des-mineurs",
];

export const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function fetchTable(table, query, env) {
  const SUPABASE_URL = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn(`[site-routes] Missing Supabase credentials, skipping "${table}" rows.`);
    return [];
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) {
    console.warn(`[site-routes] Failed to fetch "${table}": ${res.status} ${res.statusText}`);
    return [];
  }
  return res.json();
}

/**
 * @param {Record<string, string | undefined>} env
 * @returns {Promise<{
 *   profiles: { slug: string; updatedAt?: string }[];
 *   countries: { slug: string; cities: { slug: string }[] }[];
 *   studios: { slug: string }[];
 *   categories: { label: string }[];
 * }>}
 */
export async function getPublicRoutes(env = process.env) {
  const profileRows = await fetchTable(
    "listings",
    "select=slug,updated_at&status=eq.published",
    env,
  );
  const profiles = profileRows.map((p) => ({ slug: p.slug, updatedAt: p.updated_at }));

  const countryRows = await fetchTable("countries", "select=data", env);
  const countries = countryRows
    .map((row) => row.data)
    .filter((c) => c?.slug)
    .map((c) => ({ slug: c.slug, cities: (c.cities ?? []).map((city) => ({ slug: city.slug })) }));

  const studioRows = await fetchTable("studios", "select=data", env);
  const studios = studioRows
    .map((row) => row.data)
    .filter((s) => s?.slug)
    .map((s) => ({ slug: s.slug }));

  const categoryRows = await fetchTable("catalogs", "select=label&type=eq.category", env);
  const categories = categoryRows.map((c) => ({ label: c.label }));

  return { profiles, countries, studios, categories };
}
