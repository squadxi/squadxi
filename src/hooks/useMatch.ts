import { useCallback, useMemo, useState } from 'react'
import type { PlayerCard, HandTypeRow, HandResult, GrandRivalRule } from '../types'
import { scoreHand } from '../lib/scoring'
import { mulberry32 } from '../lib/rng'

export const HAND_SIZE = 8
export const MAX_HANDS = 5
export const MAX_DISCARDS = 3
export const MAX_SELECTED = 5

function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export type MatchStatus = 'playing' | 'won' | 'lost'

interface MatchState {
  drawPile: PlayerCard[]
  hand: PlayerCard[]
  selectedIds: number[]
  handsLeft: number
  discardsLeft: number
  score: number
  status: MatchStatus
  lastResult: HandResult | null
}

function draw(state: Pick<MatchState, 'drawPile' | 'hand'>, count: number) {
  const drawn = state.drawPile.slice(0, count)
  return {
    hand: [...state.hand, ...drawn],
    drawPile: state.drawPile.slice(count),
  }
}

function initState(deck: PlayerCard[], rngSeed?: number): MatchState {
  const shuffled = shuffle(deck, rngSeed != null ? mulberry32(rngSeed) : Math.random)
  const hand = shuffled.slice(0, HAND_SIZE)
  const drawPile = shuffled.slice(HAND_SIZE)
  return {
    drawPile,
    hand,
    selectedIds: [],
    handsLeft: MAX_HANDS,
    discardsLeft: MAX_DISCARDS,
    score: 0,
    status: 'playing',
    lastResult: null,
  }
}

export interface UseMatchOptions {
  ownedTacticNames: string[]
  seasonDeck: PlayerCard[]
  grandRival?: GrandRivalRule
  flushKey?: (card: PlayerCard) => string
  rngSeed?: number
  onBallonsEarned?: (amount: number, reason: string) => void
  onHandPlayed?: (result: HandResult, playedCards: PlayerCard[]) => void
}

export function useMatch(deck: PlayerCard[], handTypes: HandTypeRow[], target: number, options: UseMatchOptions) {
  const [state, setState] = useState<MatchState>(() => initState(deck, options.rngSeed))
  const { ownedTacticNames, seasonDeck, grandRival, flushKey, onBallonsEarned, onHandPlayed } = options

  const selectedCards = useMemo(
    () => state.hand.filter((c) => state.selectedIds.includes(c.id)),
    [state.hand, state.selectedIds],
  )

  const toggleSelect = useCallback((cardId: number) => {
    setState((prev) => {
      if (prev.status !== 'playing') return prev
      const isSelected = prev.selectedIds.includes(cardId)
      if (!isSelected && prev.selectedIds.length >= MAX_SELECTED) return prev
      return {
        ...prev,
        selectedIds: isSelected
          ? prev.selectedIds.filter((id) => id !== cardId)
          : [...prev.selectedIds, cardId],
      }
    })
  }, [])

  const playHand = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'playing' || prev.selectedIds.length === 0) return prev
      const played = prev.hand.filter((c) => prev.selectedIds.includes(c.id))
      const result = scoreHand(played, handTypes, {
        ownedTacticNames,
        seasonDeck,
        grandRival,
        flushKey,
        isFirstHandOfMatch: prev.handsLeft === MAX_HANDS,
        isLastHandOfMatch: prev.handsLeft === 1,
      })
      if (result.ballonsFromTactics > 0) onBallonsEarned?.(result.ballonsFromTactics, 'Tactique')
      onHandPlayed?.(result, played)

      const remainingHand = prev.hand.filter((c) => !prev.selectedIds.includes(c.id))
      const { hand, drawPile } = draw({ hand: remainingHand, drawPile: prev.drawPile }, played.length)
      const score = prev.score + result.totalScore
      const handsLeft = prev.handsLeft - 1
      const status: MatchStatus = score >= target ? 'won' : handsLeft <= 0 ? 'lost' : 'playing'

      return {
        ...prev,
        hand,
        drawPile,
        selectedIds: [],
        handsLeft,
        score,
        status,
        lastResult: result,
      }
    })
  }, [handTypes, target, ownedTacticNames, seasonDeck, grandRival, flushKey, onBallonsEarned, onHandPlayed])

  const discard = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'playing' || prev.selectedIds.length === 0 || prev.discardsLeft <= 0) return prev
      const discarded = prev.hand.filter((c) => prev.selectedIds.includes(c.id))
      const remainingHand = prev.hand.filter((c) => !prev.selectedIds.includes(c.id))
      const { hand, drawPile } = draw({ hand: remainingHand, drawPile: prev.drawPile }, discarded.length)

      if (ownedTacticNames.includes('Banc de Touche')) {
        onBallonsEarned?.(discarded.length, 'Banc de Touche')
      }

      return {
        ...prev,
        hand,
        drawPile,
        selectedIds: [],
        discardsLeft: prev.discardsLeft - 1,
      }
    })
  }, [ownedTacticNames, onBallonsEarned])

  const resetMatch = useCallback(() => {
    setState(initState(deck))
  }, [deck])

  return {
    hand: state.hand,
    selectedIds: state.selectedIds,
    selectedCards,
    handsLeft: state.handsLeft,
    discardsLeft: state.discardsLeft,
    score: state.score,
    status: state.status,
    lastResult: state.lastResult,
    target,
    toggleSelect,
    playHand,
    discard,
    resetMatch,
  }
}
