import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`Note ${value.toFixed(1)} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} style={{ width: size, height: size }} className={i <= Math.round(value) ? "fill-gold text-gold" : "text-muted-foreground/40"} aria-hidden />
      ))}
    </span>
  );
}

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Note">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" role="radio" aria-checked={value === i} aria-label={`${i} étoile${i > 1 ? "s" : ""}`} onClick={() => onChange(i)} className="rounded p-0.5">
          <Star className={cn("h-7 w-7", i <= value ? "fill-gold text-gold" : "text-muted-foreground/40")} />
        </button>
      ))}
    </div>
  );
}
