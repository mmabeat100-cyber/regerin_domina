type FlagProps = { className?: string };

/** Compact inline SVG flags — avoids an emoji dependency (flag emoji don't render on Windows). */

export function FlagFR({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 3 2" className={className} role="img" aria-label="Français">
      <rect width="1" height="2" x="0" fill="#0055A4" />
      <rect width="1" height="2" x="1" fill="#FFFFFF" />
      <rect width="1" height="2" x="2" fill="#EF4135" />
    </svg>
  );
}

export function FlagGB({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 60 30" className={className} role="img" aria-label="English">
      <clipPath id="flag-gb-s">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="flag-gb-t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#flag-gb-s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#00247D" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFF" strokeWidth="6" />
        <path
          d="M0,0 L60,30 M60,0 L0,30"
          clipPath="url(#flag-gb-t)"
          stroke="#CF142B"
          strokeWidth="4"
        />
        <path d="M30,0 v30 M0,15 h60" stroke="#FFF" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#CF142B" strokeWidth="6" />
      </g>
    </svg>
  );
}

export function FlagDE({ className }: FlagProps) {
  return (
    <svg viewBox="0 0 5 3" className={className} role="img" aria-label="Deutsch">
      <rect width="5" height="1" y="0" fill="#000000" />
      <rect width="5" height="1" y="1" fill="#DD0000" />
      <rect width="5" height="1" y="2" fill="#FFCE00" />
    </svg>
  );
}
