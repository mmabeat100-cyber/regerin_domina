import { SITE } from "@/config/site";

export const DEFAULT_OG_IMAGE = `${SITE.url}/og-default.jpg`;

export function absoluteUrl(path: string): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

interface PageHeadInput {
  title: string;
  description: string;
  /** Path only (e.g. "/profil/lady-x"), used to build the canonical + og:url. */
  path: string;
  image?: string;
  type?: "website" | "article" | "profile";
  noindex?: boolean;
}

/**
 * Shared per-route <head> builder: title, description, canonical, Open Graph,
 * Twitter Card. Keeping this in one place means every public route gets the
 * same consistent SEO tags instead of hand-rolling them per file.
 */
export function pageHead({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noindex = false,
}: PageHeadInput) {
  const url = absoluteUrl(path);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      ...(noindex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

/** Spread onto a <script> element in JSX: <script {...jsonLdProps(data)} /> */
export function jsonLdProps(data: Record<string, unknown>) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  } as const;
}
