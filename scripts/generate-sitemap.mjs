// Generates public/sitemap.xml by querying Supabase directly (REST API,
// anon key — same credentials already used for the client build). Runs as a
// prebuild step so the sitemap ships with every deploy, regardless of the
// SPA's client-side rendering (crawlers don't need to execute JS to read it).
//
// Deliberately NOT derived from the prerender crawler: that only discovers
// pages reachable via server-rendered <a href> links, and this app's lists
// (profiles, cities, ...) are fetched client-side, so the crawler never sees
// them. Querying Supabase directly sidesteps that limitation entirely.

const SITE_URL = "https://wrestlersdomina.com";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function fetchTable(table, query) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn(`[sitemap] Missing Supabase credentials, skipping "${table}" rows.`);
    return [];
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) {
    console.warn(`[sitemap] Failed to fetch "${table}": ${res.status} ${res.statusText}`);
    return [];
  }
  return res.json();
}

function urlEntry(path, { lastmod, changefreq = "weekly", priority = "0.5" } = {}) {
  const loc = `${SITE_URL}${path}`;
  return [
    "  <url>",
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

async function main() {
  const entries = [];

  entries.push(urlEntry("/", { changefreq: "daily", priority: "1.0" }));
  for (const path of ["/annuaire", "/villes", "/studios"]) {
    entries.push(urlEntry(path, { changefreq: "daily", priority: "0.8" }));
  }
  for (const path of ["/a-propos", "/contact", "/mentions-legales", "/confidentialite", "/protection-des-mineurs"]) {
    entries.push(urlEntry(path, { changefreq: "yearly", priority: "0.3" }));
  }

  const profiles = await fetchTable("listings", "select=slug,updated_at&status=eq.published");
  for (const p of profiles) {
    entries.push(urlEntry(`/profil/${p.slug}`, { lastmod: p.updated_at?.slice(0, 10), changefreq: "weekly", priority: "0.9" }));
  }

  const countries = await fetchTable("countries", "select=data");
  for (const row of countries) {
    const country = row.data;
    if (!country?.slug) continue;
    entries.push(urlEntry(`/pays/${country.slug}`, { changefreq: "weekly", priority: "0.6" }));
    for (const city of country.cities ?? []) {
      entries.push(urlEntry(`/ville/${country.slug}/${city.slug}`, { changefreq: "weekly", priority: "0.6" }));
    }
  }

  const studios = await fetchTable("studios", "select=data");
  for (const row of studios) {
    const studio = row.data;
    if (!studio?.slug) continue;
    entries.push(urlEntry(`/studios/${studio.slug}`, { changefreq: "monthly", priority: "0.5" }));
  }

  const categories = await fetchTable("catalogs", "select=label&type=eq.category");
  for (const c of categories) {
    entries.push(urlEntry(`/categorie/${slugify(c.label)}`, { changefreq: "weekly", priority: "0.6" }));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;

  const { writeFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const path = await import("node:path");
  const outPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/sitemap.xml");
  await writeFile(outPath, xml, "utf-8");
  console.log(`[sitemap] Wrote ${entries.length} URLs to ${outPath}`);
}

main().catch((err) => {
  console.error("[sitemap] Failed:", err);
  process.exitCode = 1;
});
