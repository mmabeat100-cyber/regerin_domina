import { resolveMedia } from "@/lib/media";
import { cn } from "@/lib/utils";

/** Affiche une image ou un placeholder dégradé (aucune photo réelle en démo). */
export function Media({ src, alt, className, eager }: { src: string; alt: string; className?: string; eager?: boolean }) {
  const m = resolveMedia(src);
  if (m.background) {
    return <div role="img" aria-label={alt} className={cn("h-full w-full", className)} style={{ background: m.background }} />;
  }
  return <img src={m.src} alt={alt} loading={eager ? "eager" : "lazy"} className={cn("h-full w-full object-cover", className)} />;
}
