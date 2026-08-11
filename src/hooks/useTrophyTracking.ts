import { useCallback, useEffect, useRef, useState } from 'react'
import type { PlayerCard, TrophyRow, UserStatsRow, HandResult } from '../types'
import type { MatchKind } from '../lib/season'
import { defaultUserStats, fetchUserStats, fetchUnlockedTrophyIds, persistUserStats, syncTrophies } from '../lib/trophies'

const HAND_TYPE_COUNTER: Record<string, keyof UserStatsRow | undefined> = {
  Duo: 'duo_count',
  Alignement: 'alignement_count',
  'Carre magique': 'carre_count',
  'Selection parfaite': 'selection_parfaite_count',
  'Onze de legende': 'onze_legende_count',
}

export function useTrophyTracking(userId: string | null, deck: PlayerCard[], trophiesPool: TrophyRow[]) {
  const [stats, setStats] = useState<UserStatsRow | null>(null)
  const [unlockedIds, setUnlockedIds] = useState<Set<number>>(new Set())
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<TrophyRow[]>([])
  const statsRef = useRef<UserStatsRow | null>(null)
  const unlockedRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    if (!userId) return
    Promise.all([fetchUserStats(userId), fetchUnlockedTrophyIds(userId)]).then(([loadedStats, loadedUnlocked]) => {
      statsRef.current = loadedStats
      unlockedRef.current = loadedUnlocked
      setStats(loadedStats)
      setUnlockedIds(loadedUnlocked)
    })
  }, [userId])

  const commit = useCallback(
    async (next: UserStatsRow) => {
      if (!userId || trophiesPool.length === 0) return
      statsRef.current = next
      setStats(next)
      persistUserStats(next).catch((err) => console.error('Erreur sauvegarde stats :', err))

      const unlocked = await syncTrophies(userId, next, deck, trophiesPool, unlockedRef.current)
      if (unlocked.length > 0) {
        const merged = new Set(unlockedRef.current)
        unlocked.forEach((t) => merged.add(t.id))
        unlockedRef.current = merged
        setUnlockedIds(merged)
        setRecentlyUnlocked((prev) => [...prev, ...unlocked])
      }
    },
    [userId, deck, trophiesPool],
  )

  const recordHand = useCallback(
    (result: HandResult, playedCards: PlayerCard[]) => {
      const current = statsRef.current
      if (!current) return

      const counterKey = HAND_TYPE_COUNTER[result.handType]
      const next: UserStatsRow = {
        ...current,
        best_hand_score: Math.max(current.best_hand_score, result.totalScore),
        cards_discovered: Array.from(new Set([...current.cards_discovered, ...playedCards.map((c) => c.id)])),
        nationalites_jouees: Array.from(
          new Set([...current.nationalites_jouees, ...playedCards.map((c) => c.nationalite)]),
        ),
      }
      if (counterKey && typeof next[counterKey] === 'number') {
        ;(next[counterKey] as number) = (current[counterKey] as number) + 1
      }
      commit(next)
    },
    [commit],
  )

  const recordMatchWon = useCallback(
    (matchKind: MatchKind, matchScore: number) => {
      const current = statsRef.current
      if (!current) return
      commit({
        ...current,
        best_match_score: Math.max(current.best_match_score, matchScore),
        grands_rivaux_battus: current.grands_rivaux_battus + (matchKind === 'grand-rival' ? 1 : 0),
      })
    },
    [commit],
  )

  const recordSeasonEnd = useCallback(
    (seasonScore: number, won: boolean) => {
      const current = statsRef.current
      if (!current) return
      commit({
        ...current,
        best_season_score: Math.max(current.best_season_score, seasonScore),
        saisons_completees: current.saisons_completees + (won ? 1 : 0),
        titres: current.titres + (won ? 1 : 0),
      })
    },
    [commit],
  )

  const recordTacticPurchase = useCallback(
    (name: string) => {
      const current = statsRef.current
      if (!current || current.tactiques_debloquees.includes(name)) return
      commit({ ...current, tactiques_debloquees: [...current.tactiques_debloquees, name] })
    },
    [commit],
  )

  const recordBallons = useCallback(
    (amount: number) => {
      const current = statsRef.current
      if (!current || amount <= 0) return
      commit({ ...current, ballons_total_gagnes: current.ballons_total_gagnes + amount })
    },
    [commit],
  )

  const dismissUnlocked = useCallback((trophyId: number) => {
    setRecentlyUnlocked((prev) => prev.filter((t) => t.id !== trophyId))
  }, [])

  return {
    stats: stats ?? (userId ? defaultUserStats(userId) : null),
    unlockedIds,
    recentlyUnlocked,
    recordHand,
    recordMatchWon,
    recordSeasonEnd,
    recordTacticPurchase,
    recordBallons,
    dismissUnlocked,
  }
}
