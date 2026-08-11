interface PlayerSilhouetteProps {
  className?: string
}

/** Icone plate generique (pictogramme footballeur qui shoote), style Balatro : silhouette flat, pas de photo. */
export function PlayerSilhouette({ className }: PlayerSilhouetteProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="46" cy="16" r="9" />
      <rect x="39" y="26" width="15" height="30" rx="7.5" transform="rotate(-6 46 41)" />
      <rect x="45" y="27" width="8" height="24" rx="4" transform="rotate(48 49 30)" />
      <rect x="30" y="29" width="8" height="22" rx="4" transform="rotate(-35 34 32)" />
      <rect x="36" y="50" width="9" height="30" rx="4.5" transform="rotate(8 40 55)" />
      <rect x="46" y="48" width="10" height="26" rx="5" transform="rotate(-52 50 51)" />
      <circle cx="78" cy="66" r="9" />
    </svg>
  )
}
