import type { PlayerCard, HandTypeRow, HandResult, ScoringContext } from '../types'

function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>()
  for (const item of items) {
    const k = key(item)
    const group = map.get(k)
    if (group) group.push(item)
    else map.set(k, [item])
  }
  return map
}

const HAND_RANK = [
  'Solo',
  'Duo',
  'Double Duo',
  'Trio offensif',
  'Enchainement',
  'Alignement',
  'Full',
  'Carre magique',
  'Cinq identique',
  'Selection parfaite',
  'Onze de legende',
]

/**
 * Detects the hand type and the subset of cards that actually score,
 * following the Balatro-derived hierarchy from the GDD (§3): kickers
 * outside a matched group (Duo/Trio/Carre) don't contribute points,
 * while straight/flush-style hands require exactly 5 cards and score
 * all of them.
 */
export function evaluateHand(
  cards: PlayerCard[],
  options?: { disableFlush?: boolean; flushKey?: (card: PlayerCard) => string },
): { handType: string; scoringCards: PlayerCard[] } {
  if (cards.length === 0) {
    return { handType: 'Solo', scoringCards: [] }
  }

  const flushKey = options?.flushKey ?? ((c: PlayerCard) => c.championnat)
  const byNote = groupBy(cards, (c) => c.note)
  const byFlushGroup = groupBy(cards, flushKey)
  const noteGroups = [...byNote.values()].sort((a, b) => b.length - a.length)
  const uniqueNotes = [...byNote.keys()].sort((a, b) => a - b)

  const isFlush = !options?.disableFlush && cards.length === 5 && byFlushGroup.size === 1
  const isStraight = cards.length === 5 && uniqueNotes.length === 5 && uniqueNotes[4] - uniqueNotes[0] === 4
  const isTopStraight = isStraight && uniqueNotes[0] === 10 // 10-Valet-Dame-Roi-As

  if (isStraight && isFlush && isTopStraight) return { handType: 'Onze de legende', scoringCards: cards }
  if (isStraight && isFlush) return { handType: 'Selection parfaite', scoringCards: cards }
  if (noteGroups[0].length === 5) return { handType: 'Cinq identique', scoringCards: cards }
  if (noteGroups[0].length === 4) return { handType: 'Carre magique', scoringCards: noteGroups[0] }
  if (cards.length === 5 && noteGroups[0].length === 3 && noteGroups[1]?.length === 2) {
    return { handType: 'Full', scoringCards: cards }
  }
  if (isFlush) return { handType: 'Alignement', scoringCards: cards }
  if (isStraight) return { handType: 'Enchainement', scoringCards: cards }
  if (noteGroups[0].length === 3) return { handType: 'Trio offensif', scoringCards: noteGroups[0] }
  if (noteGroups[0].length === 2 && noteGroups[1]?.length === 2) {
    return { handType: 'Double Duo', scoringCards: [...noteGroups[0], ...noteGroups[1]] }
  }
  if (noteGroups[0].length === 2) return { handType: 'Duo', scoringCards: noteGroups[0] }

  const highest = cards.reduce((a, b) => (b.note > a.note ? b : a))
  return { handType: 'Solo', scoringCards: [highest] }
}

/**
 * Bonus Nationalite (GDD §3, couche 3): chaque paire de cartes jouees
 * partageant la meme nationalite ajoute +0.5 mult, double (+1) si la
 * paire partage aussi le Championnat (le "combo magnifique").
 */
export function nationalityBonus(playedCards: PlayerCard[], flushKey: (card: PlayerCard) => string): number {
  let bonus = 0
  for (let i = 0; i < playedCards.length; i++) {
    for (let j = i + 1; j < playedCards.length; j++) {
      if (playedCards[i].nationalite === playedCards[j].nationalite) {
        const sameGroup = flushKey(playedCards[i]) === flushKey(playedCards[j])
        bonus += sameGroup ? 1 : 0.5
      }
    }
  }
  return bonus
}

function mostCommonGroupCount(cards: PlayerCard[], key: (card: PlayerCard) => string): number {
  const byGroup = groupBy(cards, key)
  return Math.max(...[...byGroup.values()].map((g) => g.length))
}

export function scoreHand(playedCards: PlayerCard[], handTypes: HandTypeRow[], context?: ScoringContext): HandResult {
  const busParque = context?.grandRival?.id === 'busParque'
  const flushKey = context?.flushKey ?? ((c: PlayerCard) => c.championnat)
  const { handType, scoringCards: baseScoringCards } = evaluateHand(playedCards, { disableFlush: busParque, flushKey })
  const row = handTypes.find((h) => h.nom === handType)
  if (!row) throw new Error(`Type de main inconnu : ${handType}`)

  const has = (name: string) => context?.ownedTacticNames.includes(name) ?? false
  const appliedTactics: string[] = []
  let scoringCards = baseScoringCards
  let bonusPoints = 0
  let multAdd = 0
  let multMultiplier = 1
  let ballonsFromTactics = 0

  // Grand Rival : VAR - la carte la plus forte de la main est ignoree, sans compensation
  if (context?.grandRival?.id === 'var' && scoringCards.length > 1) {
    const highest = scoringCards.reduce((a, b) => (b.note > a.note ? b : a))
    scoringCards = scoringCards.filter((c) => c.id !== highest.id)
  }

  // Risque : Carton Rouge - retire la carte de plus haute Note du calcul des points, mult x2 en compensation
  if (has('Carton Rouge') && scoringCards.length > 1) {
    const highest = scoringCards.reduce((a, b) => (b.note > a.note ? b : a))
    scoringCards = scoringCards.filter((c) => c.id !== highest.id)
    multMultiplier *= 2
    appliedTactics.push('Carton Rouge')
  }

  const cardPoints = scoringCards.reduce((sum, c) => sum + c.note, 0)
  const bonus = nationalityBonus(playedCards, flushKey)

  // Famille Note
  if (has('Detection de Talents')) {
    const count = playedCards.filter((c) => c.note <= 5).length
    if (count > 0) {
      bonusPoints += count * 20
      appliedTactics.push('Detection de Talents')
    }
  }
  if (has('Retraite Prestigieux')) {
    const count = playedCards.filter((c) => c.note >= 12).length
    if (count > 0) {
      bonusPoints += count * 10
      appliedTactics.push('Retraite Prestigieux')
    }
  }
  if (has('Ballon d\'Or') && playedCards.some((c) => c.note === 14)) {
    multAdd += 3
    appliedTactics.push('Ballon d\'Or')
  }
  if (has('Bizuth Prometteur')) {
    const count = playedCards.filter((c) => c.note <= 6).length
    if (count > 0) {
      multAdd += count * 1
      appliedTactics.push('Bizuth Prometteur')
    }
  }
  if (has('Doyen du Vestiaire') && context?.seasonDeck) {
    const count = context.seasonDeck.filter((c) => c.note <= 4).length
    if (count > 0) {
      multAdd += count * 0.5
      appliedTactics.push('Doyen du Vestiaire')
    }
  }
  if (has('Pressing Haut') && handType === 'Duo' && scoringCards.length > 0) {
    bonusPoints += scoringCards[0].note
    appliedTactics.push('Pressing Haut')
  }

  // Famille Championnat (desactivee ce match si Grand Rival "Le Bus Parque")
  if (!busParque && has('Coeur de Baviere') && playedCards.length === 5 && mostCommonGroupCount(playedCards, flushKey) === 5) {
    multMultiplier *= 2
    appliedTactics.push('Coeur de Baviere')
  }
  if (!busParque && has('Ultras')) {
    const mostCommon = mostCommonGroupCount(playedCards, flushKey)
    if (mostCommon > 1) {
      bonusPoints += mostCommon * 15
      appliedTactics.push('Ultras')
    }
  }

  // Famille Nationalite
  const distinctNationalites = new Set(playedCards.map((c) => c.nationalite)).size
  if (has('Diaspora') && distinctNationalites > 1) {
    multAdd += distinctNationalites
    appliedTactics.push('Diaspora')
  }
  if (has('Selectionneur National') && playedCards.length === 5 && distinctNationalites === 1) {
    multMultiplier *= 1.5
    appliedTactics.push('Selectionneur National')
  }

  // Famille Type de main
  if (has('Effet Cruyff') && HAND_RANK.indexOf(handType) >= HAND_RANK.indexOf('Carre magique')) {
    multMultiplier *= 2
    appliedTactics.push('Effet Cruyff')
  }

  // Famille Timing
  if (has('Sortie de Vestiaire') && context?.isFirstHandOfMatch) {
    multAdd += 2
    appliedTactics.push('Sortie de Vestiaire')
  }
  if (has('Dernier Quart d\'Heure') && context?.isLastHandOfMatch) {
    multAdd += 3
    appliedTactics.push('Dernier Quart d\'Heure')
  }

  // Famille Economie
  if (has('Selection B') && HAND_RANK.indexOf(handType) >= HAND_RANK.indexOf('Trio offensif')) {
    ballonsFromTactics += playedCards.length
    appliedTactics.push('Selection B')
  }

  const totalPoints = row.base_points + cardPoints + bonusPoints
  const totalMult = (row.base_mult + bonus + multAdd) * multMultiplier

  return {
    handType,
    basePoints: row.base_points,
    baseMult: row.base_mult,
    cardPoints,
    bonusPoints,
    nationalityBonus: bonus,
    tacticMultAdd: multAdd,
    tacticMultMultiplier: multMultiplier,
    totalPoints,
    totalMult,
    totalScore: Math.round(totalPoints * totalMult),
    scoringCards,
    appliedTactics,
    ballonsFromTactics,
  }
}
