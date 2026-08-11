export interface PlayerCard {
  id: number
  championnat: string
  club: string
  note: number
  symbole: string
  nom: string
  nationalite: string
}

export type GameModeType = 'club' | 'championship' | 'daily' | 'duel'

export interface GameMode {
  type: GameModeType
  championnat?: string // requis si type === 'championship'
}

export interface HandTypeRow {
  nom: string
  condition: string
  base_points: number
  base_mult: number
}

export interface TacticRow {
  id: number
  nom: string
  famille: string
  rarete: 'Commune' | 'Rare' | 'Legendaire'
  prix: number
  effet: string
}

export interface ScoringContext {
  ownedTacticNames: string[]
  isFirstHandOfMatch: boolean
  isLastHandOfMatch: boolean
  seasonDeck: PlayerCard[]
  grandRival?: GrandRivalRule
  /** Axe utilise pour detecter Alignement/Enchainement+Alignement : Championnat (defaut) ou Club en Mode Championnat. */
  flushKey?: (card: PlayerCard) => string
}

export type GrandRivalId = 'busParque' | 'var'

export interface GrandRivalRule {
  id: GrandRivalId
}

export interface TrophyRow {
  id: number
  famille: 'Performance' | 'Collection' | 'Progression'
  ligne: string
  palier: 'Amateur' | 'Semi-pro' | 'Pro' | 'Legende'
  condition: string
  pro_only: boolean
}

export interface UserStatsRow {
  user_id: string
  cards_discovered: number[]
  nationalites_jouees: string[]
  tactiques_debloquees: string[]
  best_hand_score: number
  best_match_score: number
  best_season_score: number
  duo_count: number
  alignement_count: number
  carre_count: number
  selection_parfaite_count: number
  onze_legende_count: number
  saisons_completees: number
  titres: number
  grands_rivaux_battus: number
  ballons_total_gagnes: number
}

export interface HandResult {
  handType: string
  basePoints: number
  baseMult: number
  cardPoints: number
  bonusPoints: number
  nationalityBonus: number
  tacticMultAdd: number
  tacticMultMultiplier: number
  totalPoints: number
  totalMult: number
  totalScore: number
  scoringCards: PlayerCard[]
  appliedTactics: string[]
  ballonsFromTactics: number
}
