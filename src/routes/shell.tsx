import { createFileRoute } from "@tanstack/react-router";

/**
 * Dedicated, content-less route used only as the SPA "mask" target during
 * prerendering (see vite.config.ts spa.maskPath). It must be a real,
 * always-matching route — an arbitrary non-existent path makes the internal
 * prerender request fail with a non-2xx status and aborts the whole build.
 */
export const Route = createFileRoute("/shell")({
  component: () => null,
});
