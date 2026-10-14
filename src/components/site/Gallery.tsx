import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Media } from "./Media";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/** Galerie avec lightbox plein écran (clavier ← → et swipe). */
export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = images.length;
  const go = (d: number) => setActive((i) => (i + d + n) % n);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, n]);

  if (!n) return null;
  return (
    <div className="space-y-3">
      <button type="button" onClick={() => setOpen(true)} className="block aspect-[2/3] w-full overflow-hidden rounded-lg border border-border" aria-label="Agrandir la photo">
        <Media src={images[active]} alt={`${name} — photo ${active + 1}`} eager />
      </button>
      <div className="grid grid-cols-4 gap-2">
        {images.map((img, i) => (
          <button key={i} type="button" onClick={() => setActive(i)} aria-label={`Photo ${i + 1}`} className={cn("aspect-square overflow-hidden rounded-md border transition-opacity", i === active ? "border-gold" : "border-border opacity-60 hover:opacity-100")}>
            <Media src={img} alt="" />
          </button>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl border-0 bg-background/95 p-0 [&>button]:hidden">
          <DialogTitle className="sr-only">Galerie de {name}</DialogTitle>
          <div
            className="relative flex h-[85vh] items-center justify-center"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current == null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <div className="aspect-[2/3] h-full max-w-full"><Media src={images[active]} alt={`${name} — photo ${active + 1}`} className="object-contain" /></div>
            <button onClick={() => go(-1)} aria-label="Photo précédente" className="absolute left-2 rounded-full bg-card/80 p-2"><ChevronLeft /></button>
            <button onClick={() => go(1)} aria-label="Photo suivante" className="absolute right-2 rounded-full bg-card/80 p-2"><ChevronRight /></button>
            <button onClick={() => setOpen(false)} aria-label="Fermer" className="absolute right-2 top-2 rounded-full bg-card/80 p-2"><X /></button>
            <p className="absolute bottom-3 text-xs text-muted-foreground">{active + 1} / {n}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
