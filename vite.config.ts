import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { STATIC_PATHS, slugify, getPublicRoutes } from "./scripts/site-routes.mjs";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const basePath = isGitHubPages ? "/regerin_domina" : "";

async function buildPrerenderPages() {
  const pages = STATIC_PATHS.map((path) => ({ path }));

  const { profiles, countries, studios, categories } = await getPublicRoutes();

  for (const p of profiles) pages.push({ path: `/profil/${p.slug}` });
  for (const country of countries) {
    pages.push({ path: `/pays/${country.slug}` });
    for (const city of country.cities) {
      pages.push({ path: `/ville/${country.slug}/${city.slug}` });
    }
  }
  for (const studio of studios) pages.push({ path: `/studios/${studio.slug}` });
  for (const c of categories) pages.push({ path: `/categorie/${slugify(c.label)}` });

  return pages;
}

const prerenderPages = await buildPrerenderPages();

export default defineConfig({
  nitro: false,
  tanstackStart: {
    server: { entry: "server" },
    spa: { enabled: true, maskPath: "/shell" },
    pages: prerenderPages,
    prerender: {
      enabled: true,
      autoStaticPathsDiscovery: false,
      crawlLinks: false,
    },
    router: { basepath: basePath || "/" },
  },
  vite: {
    base: `${basePath}/`,
  },
});
