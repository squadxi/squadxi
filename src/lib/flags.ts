const NATIONALITY_FLAGS: Record<string, string> = {
  France: '🇫🇷',
  Portugal: '🇵🇹',
  Angleterre: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  "Cote d'Ivoire": '🇨🇮',
  Argentine: '🇦🇷',
  'Pays de Galles': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  Irlande: '🇮🇪',
  Danemark: '🇩🇰',
  Espagne: '🇪🇸',
  Bresil: '🇧🇷',
  Uruguay: '🇺🇾',
  Italie: '🇮🇹',
  Ukraine: '🇺🇦',
  Cameroun: '🇨🇲',
  Allemagne: '🇩🇪',
  Pologne: '🇵🇱',
  'Pays-Bas': '🇳🇱',
  Suede: '🇸🇪',
  Liberia: '🇱🇷',
}

export function flagFor(nationalite: string): string {
  return NATIONALITY_FLAGS[nationalite] ?? '⚽'
}
