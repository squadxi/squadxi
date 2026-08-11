import type { PlayerCard, UserStatsRow } from '../types'

export const PALIER_ORDER = ['Amateur', 'Semi-pro', 'Pro', 'Legende'] as const

interface TrophyLineRule {
  ligne: string
  getValue: (stats: UserStatsRow, deck: PlayerCard[]) => number
  thresholds: number[]
}

function collectionByChampionnat(championnat: string): TrophyLineRule['getValue'] {
  return (stats, deck) =>
    stats.cards_discovered.filter((id) => deck.find((c) => c.id === id)?.championnat === championnat).length
}

/**
 * Correspondance entre les "lignes" de la table trophies (§13 du GDD) et les
 * compteurs de user_stats. Les lignes liees aux modes Pro (Defi quotidien,
 * Duel, Mode Championnat) et "Saison sans defaite" ne sont pas encore
 * suivies : ces modes/mecaniques n'existent pas encore dans le jeu.
 */
export const TROPHY_RULES: TrophyLineRule[] = [
  { ligne: 'Score en une main', getValue: (s) => s.best_hand_score, thresholds: [200, 1000, 5000, 20000] },
  { ligne: 'Score en un match', getValue: (s) => s.best_match_score, thresholds: [500, 3000, 15000, 60000] },
  { ligne: 'Score en une saison', getValue: (s) => s.best_season_score, thresholds: [5000, 25000, 100000, 500000] },
  { ligne: 'Duo joues', getValue: (s) => s.duo_count, thresholds: [10, 50, 200, 1000] },
  { ligne: 'Alignements joues', getValue: (s) => s.alignement_count, thresholds: [5, 25, 100, 500] },
  { ligne: 'Carres magiques', getValue: (s) => s.carre_count, thresholds: [1, 10, 50, 200] },
  { ligne: 'Selections parfaites', getValue: (s) => s.selection_parfaite_count, thresholds: [1, 5, 20, 100] },
  { ligne: 'Onze de legende', getValue: (s) => s.onze_legende_count, thresholds: [1, 3, 10, 50] },
  { ligne: 'Cartes decouvertes', getValue: (s) => s.cards_discovered.length, thresholds: [10, 30, 45, 52] },
  { ligne: 'Collection Premier League', getValue: collectionByChampionnat('Premier League'), thresholds: [5, 8, 11, 13] },
  { ligne: 'Collection Liga', getValue: collectionByChampionnat('Liga'), thresholds: [5, 8, 11, 13] },
  { ligne: 'Collection Serie A', getValue: collectionByChampionnat('Serie A'), thresholds: [5, 8, 11, 13] },
  { ligne: 'Collection Bundesliga', getValue: collectionByChampionnat('Bundesliga'), thresholds: [5, 8, 11, 13] },
  { ligne: 'Nationalites representees', getValue: (s) => s.nationalites_jouees.length, thresholds: [5, 10, 15, 20] },
  { ligne: 'Saisons completees', getValue: (s) => s.saisons_completees, thresholds: [1, 5, 20, 100] },
  { ligne: 'Titres remportes', getValue: (s) => s.titres, thresholds: [1, 5, 20, 50] },
  { ligne: 'Grands Rivaux battus', getValue: (s) => s.grands_rivaux_battus, thresholds: [3, 15, 50, 150] },
  { ligne: 'Tactiques debloquees', getValue: (s) => s.tactiques_debloquees.length, thresholds: [5, 15, 25, 30] },
  { ligne: 'Economie', getValue: (s) => s.ballons_total_gagnes, thresholds: [500, 5000, 25000, 100000] },
]
