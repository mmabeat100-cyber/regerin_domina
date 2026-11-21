// Generates public/sitemap.xml from the shared route list (see
// site-routes.mjs). Runs as a prebuild step so the sitemap ships with every
// deploy, regardless of the SPA's client-side rendering (crawlers don't need
// to execute JS to read it).

import { STATIC_PATHS, slugify, getPublicRoutes } from "./site-routes.mjs";

const SITE_URL = "https://wrestlersdomina.com";

const STATIC_META = {
  "/": { changefreq: "daily", priority: "1.0" },
  "/annuaire": { changefreq: "daily", priority: "0.8" },
  "/villes": { changefreq: "daily", priority: "0.8" },
  "/studios": { changefreq: "daily", priority: "0.8" },
};
const DEFAULT_STATIC_META = { changefreq: "yearly", priority: "0.3" };

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

  for (const path of STATIC_PATHS) {
    if (path === "/inscription") continue; // noindex page, excluded from the sitemap
    entries.push(urlEntry(path, STATIC_META[path] ?? DEFAULT_STATIC_META));
  }

  const { profiles, countries, studios, categories } = await getPublicRoutes();

  for (const p of profiles) {
    entries.push(
      urlEntry(`/profil/${p.slug}`, {
        lastmod: p.updatedAt?.slice(0, 10),
        changefreq: "weekly",
        priority: "0.9",
      }),
    );
  }

  for (const country of countries) {
    entries.push(urlEntry(`/pays/${country.slug}`, { changefreq: "weekly", priority: "0.6" }));
    for (const city of country.cities) {
      entries.push(
        urlEntry(`/ville/${country.slug}/${city.slug}`, { changefreq: "weekly", priority: "0.6" }),
      );
    }
  }

  for (const studio of studios) {
    entries.push(urlEntry(`/studios/${studio.slug}`, { changefreq: "monthly", priority: "0.5" }));
  }

  for (const c of categories) {
    entries.push(
      urlEntry(`/categorie/${slugify(c.label)}`, { changefreq: "weekly", priority: "0.6" }),
    );
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
