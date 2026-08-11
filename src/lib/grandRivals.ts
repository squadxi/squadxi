import type { GrandRivalId, GrandRivalRule } from '../types'

const GRAND_RIVAL_IDS: GrandRivalId[] = ['busParque', 'var']

export function grandRivalForJournee(journee: number): GrandRivalRule {
  return { id: GRAND_RIVAL_IDS[(journee - 1) % GRAND_RIVAL_IDS.length] }
}
