export const MATCH_KINDS = ['aller', 'retour', 'grand-rival'] as const
export type MatchKind = (typeof MATCH_KINDS)[number]

const KIND_TARGET_MULTIPLIER: Record<MatchKind, number> = {
  aller: 1,
  retour: 1.2,
  'grand-rival': 1.6,
}

const KIND_BASE_REWARD: Record<MatchKind, number> = {
  aller: 3,
  retour: 4,
  'grand-rival': 6,
}

const BASE_TARGET = 300
const JOURNEE_GROWTH = 1.55
export const SEASON_LENGTH = 3 // nombre de journees pour une saison complete (MVP)
const BASE_INTEREST_CAP = 5
const INTEREST_STEP = 5 // +1 Ballon d'interet par tranche de 5 Ballons non depenses

export function computeTarget(journee: number, kind: MatchKind): number {
  return Math.round(BASE_TARGET * JOURNEE_GROWTH ** (journee - 1) * KIND_TARGET_MULTIPLIER[kind])
}

export function computeMatchReward(kind: MatchKind, handsLeft: number, hasSponsorMaillot: boolean): number {
  return KIND_BASE_REWARD[kind] + handsLeft + (hasSponsorMaillot ? 5 : 0)
}

export function computeInterest(ballons: number, hasMerchandising: boolean): number {
  const cap = BASE_INTEREST_CAP + (hasMerchandising ? 2 : 0)
  return Math.min(Math.floor(ballons / INTEREST_STEP), cap)
}
