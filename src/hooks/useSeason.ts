import { useCallback, useState } from 'react'
import type { TacticRow } from '../types'
import { MATCH_KINDS, SEASON_LENGTH, computeTarget, computeMatchReward, computeInterest } from '../lib/season'
import { grandRivalForJournee } from '../lib/grandRivals'

export type SeasonPhase = 'match' | 'mercato' | 'season-won' | 'season-lost'

interface SeasonState {
  journee: number
  matchIndex: number
  phase: SeasonPhase
  ballons: number
  seasonScore: number
  ownedTactics: TacticRow[]
  lastMercatoGain: { reward: number; interest: number } | null
}

function initSeasonState(): SeasonState {
  return {
    journee: 1,
    matchIndex: 0,
    phase: 'match',
    ballons: 10,
    seasonScore: 0,
    ownedTactics: [],
    lastMercatoGain: null,
  }
}

export function useSeason() {
  const [state, setState] = useState<SeasonState>(initSeasonState)

  const matchKind = MATCH_KINDS[state.matchIndex]
  const target = computeTarget(state.journee, matchKind)
  const grandRival = matchKind === 'grand-rival' ? grandRivalForJournee(state.journee) : undefined

  const addBallons = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, ballons: prev.ballons + amount }))
  }, [])

  const finishMatch = useCallback(
    (result: { won: boolean; score: number; handsLeft: number }) => {
      setState((prev) => {
        const seasonScore = prev.seasonScore + result.score
        if (!result.won) return { ...prev, seasonScore, phase: 'season-lost' }

        const hasSponsorMaillot = prev.ownedTactics.some((t) => t.nom === 'Sponsor Maillot')
        const hasMerchandising = prev.ownedTactics.some((t) => t.nom === 'Merchandising')
        const reward = computeMatchReward(matchKind, result.handsLeft, hasSponsorMaillot)
        const ballonsAfterReward = prev.ballons + reward
        const interest = computeInterest(ballonsAfterReward, hasMerchandising)

        const isSeasonComplete = prev.matchIndex === 2 && prev.journee === SEASON_LENGTH
        return {
          ...prev,
          seasonScore,
          ballons: ballonsAfterReward + interest,
          phase: isSeasonComplete ? 'season-won' : 'mercato',
          lastMercatoGain: { reward, interest },
        }
      })
    },
    [matchKind],
  )

  const buyTactic = useCallback((tactic: TacticRow) => {
    setState((prev) => {
      if (prev.ballons < tactic.prix || prev.ownedTactics.some((t) => t.id === tactic.id)) return prev
      return {
        ...prev,
        ballons: prev.ballons - tactic.prix,
        ownedTactics: [...prev.ownedTactics, tactic],
      }
    })
  }, [])

  const advanceToNextMatch = useCallback(() => {
    setState((prev) => {
      if (prev.matchIndex < 2) {
        return { ...prev, matchIndex: prev.matchIndex + 1, phase: 'match', lastMercatoGain: null }
      }
      return { ...prev, matchIndex: 0, journee: prev.journee + 1, phase: 'match', lastMercatoGain: null }
    })
  }, [])

  const startNewSeason = useCallback(() => {
    setState(initSeasonState())
  }, [])

  return {
    journee: state.journee,
    matchIndex: state.matchIndex,
    matchKind,
    target,
    grandRival,
    phase: state.phase,
    ballons: state.ballons,
    seasonScore: state.seasonScore,
    ownedTactics: state.ownedTactics,
    lastMercatoGain: state.lastMercatoGain,
    seasonLength: SEASON_LENGTH,
    addBallons,
    finishMatch,
    buyTactic,
    advanceToNextMatch,
    startNewSeason,
  }
}
