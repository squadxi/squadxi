import type { TacticRow } from '../types'

/**
 * Tactiques dont l'effet est reellement applique au scoring (voir scoring.ts).
 * Les autres (Ordre de carte, Utilitaire a declenchement, Meta-progression,
 * Transfert International) necessitent des systemes dedies pas encore
 * construits et sont vendues "en vitrine" pour l'instant : achetables mais
 * sans effet, avec une mention dans l'UI.
 */
export const IMPLEMENTED_TACTICS = new Set([
  'Diaspora',
  'Selectionneur National',
  'Coeur de Baviere',
  'Ultras',
  'Detection de Talents',
  "Ballon d'Or",
  'Pressing Haut',
  'Retraite Prestigieux',
  'Doyen du Vestiaire',
  'Bizuth Prometteur',
  'Effet Cruyff',
  'Sortie de Vestiaire',
  "Dernier Quart d'Heure",
  'Banc de Touche',
  'Sponsor Maillot',
  'Selection B',
  'Carton Rouge',
])

const RARITY_WEIGHT: Record<TacticRow['rarete'], number> = {
  Commune: 65,
  Rare: 28,
  Legendaire: 7,
}

function weightedPick<T>(items: T[], weight: (item: T) => number): T {
  const total = items.reduce((sum, item) => sum + weight(item), 0)
  let roll = Math.random() * total
  for (const item of items) {
    roll -= weight(item)
    if (roll <= 0) return item
  }
  return items[items.length - 1]
}

export function rollShopTactics(pool: TacticRow[], owned: TacticRow[], count: number): TacticRow[] {
  const ownedIds = new Set(owned.map((t) => t.id))
  const available = pool.filter((t) => !ownedIds.has(t.id))
  const picks: TacticRow[] = []
  const remaining = [...available]

  for (let i = 0; i < count && remaining.length > 0; i++) {
    const pick = weightedPick(remaining, (t) => RARITY_WEIGHT[t.rarete])
    picks.push(pick)
    remaining.splice(remaining.indexOf(pick), 1)
  }

  return picks
}
