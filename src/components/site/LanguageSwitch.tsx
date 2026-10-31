import { Check, ChevronDown } from "lucide-react";
import { FlagFR, FlagGB, FlagDE } from "./Flags";
import { useLocaleStore, localeLabels, type Locale } from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGUAGES: { code: Locale; Flag: typeof FlagGB }[] = [
  { code: "en", Flag: FlagGB },
  { code: "fr", Flag: FlagFR },
  { code: "de", Flag: FlagDE },
];

export function LanguageSwitch({ className }: { className?: string }) {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Choose language"
          className={`flex h-9 items-center gap-2 rounded-md border border-border bg-transparent px-3 text-sm text-foreground transition-colors hover:bg-accent ${className ?? ""}`}
        >
          <current.Flag className="h-4 w-5 overflow-hidden rounded-[2px] object-cover" />
          <span className="uppercase">{current.code}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLocale(l.code)}
            className="flex items-center gap-2"
          >
            <l.Flag className="h-4 w-5 overflow-hidden rounded-[2px] object-cover" />
            <span className="flex-1">{localeLabels[l.code]}</span>
            {l.code === locale && <Check className="h-4 w-4 text-gold" aria-hidden />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
