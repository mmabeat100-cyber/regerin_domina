
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isGitHubPages =
  process.env.GITHUB_PAGES === "true";

const basePath = isGitHubPages ? "/regerin_domina" : "";

export default defineConfig({
  nitro: false,
  tanstackStart: {
    server: { entry: "server" },
    spa: { enabled: true },
    router: { basepath: basePath || "/" },
  },
  vite: {
    base: `${basePath}/`,
  },
});
