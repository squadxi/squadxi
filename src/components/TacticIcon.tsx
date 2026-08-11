interface TacticIconProps {
  famille: string
  className?: string
}

const ICONS: Record<string, string> = {
  Nationalite:
    'M6 3v18M6 4h11l-2.5 3L17 10H6',
  Championnat:
    'M12 2l7 3v6c0 5-3 8.5-7 11-4-2.5-7-6-7-11V5l7-3ZM9.5 12l1.8 1.8L14.5 10',
  Note: 'M12 2l2.9 6 6.6.6-5 4.4 1.5 6.5L12 16l-5.9 3.5L7.5 13l-5-4.4 6.6-.6L12 2Z',
  'Type de main':
    'M4 6h10v13H4zM8 4h10v13M12 2h10v13',
  Timing: 'M12 22a8 8 0 100-16 8 8 0 000 16ZM12 10v5l3 2M9 2h6M12 2v2',
  Ordre: 'M4 21h4v-7H4v7ZM10 21h4v-11h-4v11ZM16 21h4v-4h-4v4ZM11 5l1.5-2 1.5 2M12.5 3v3',
  Economie: 'M12 3a9 9 0 100 18 9 9 0 000-18ZM12 3v18M8 8s1.5-1.5 4-1.5S16 8 16 9s-4 1-4 1',
  Risque: 'M6 3h9l3 5-3 5H6V3ZM6 8H2M6 13v8',
  Utilitaire:
    'M12 2l1.5 3.5L17 7l-3.5 1.5L12 12l-1.5-3.5L7 7l3.5-1.5L12 2ZM19 13l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2ZM5 15l.8 1.7L7.5 17.5l-1.7.8L5 20l-.8-1.7-1.7-.8 1.7-.8L5 15Z',
  Meta: 'M4 8l3 3 5-6 5 6 3-3-2 11H6L4 8ZM6 21h12',
}

export function TacticIcon({ famille, className }: TacticIconProps) {
  const path = ICONS[famille] ?? ICONS.Utilitaire
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}
