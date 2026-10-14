// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GitHub Pages serves static files only (no Node/Workers runtime), so this build
// runs TanStack Start in SPA mode: the app prerenders a static shell and runs
// entirely client-side from there (nothing here relies on live server functions).
// Served from a project subpath (https://<user>.github.io/regerin_domina/), so
// both the asset base (vite) and the router's own basepath must match it.
const basePath = process.env.NODE_ENV === "production" ? "/regerin_domina" : "";

export default defineConfig({
  nitro: false,
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    spa: { enabled: true },
    router: { basepath: basePath || "/" },
  },
  vite: {
    base: `${basePath}/`,
  },
});
