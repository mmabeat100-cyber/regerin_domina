import ph1 from "@/assets/ph-1.jpg";
import ph2 from "@/assets/ph-2.jpg";
import ph3 from "@/assets/ph-3.jpg";

/** Résout une référence média : "ph:n" (placeholder), "grad:n" (dégradé), sinon URL/base64. */
const PH: Record<string, string> = { "ph:1": ph1, "ph:2": ph2, "ph:3": ph3 };

export const GRADIENTS: Record<string, string> = {
  "grad:1": "radial-gradient(120% 80% at 30% 20%, oklch(0.42 0.14 5 / 0.85), transparent 60%), radial-gradient(90% 60% at 80% 90%, oklch(0.75 0.08 82 / 0.35), transparent 60%), oklch(0.13 0.004 285)",
  "grad:2": "radial-gradient(100% 70% at 70% 30%, oklch(0.75 0.08 82 / 0.45), transparent 55%), radial-gradient(80% 60% at 20% 80%, oklch(0.42 0.14 5 / 0.7), transparent 60%), oklch(0.12 0.004 285)",
  "grad:3": "conic-gradient(from 210deg at 50% 60%, oklch(0.12 0.004 285), oklch(0.42 0.14 5 / 0.8), oklch(0.2 0.01 285), oklch(0.75 0.08 82 / 0.3), oklch(0.12 0.004 285))",
};

export const resolveMedia = (ref: string): { src?: string; background?: string } => {
  if (PH[ref]) return { src: PH[ref] };
  if (GRADIENTS[ref]) return { background: GRADIENTS[ref] };
  return { src: ref };
};
