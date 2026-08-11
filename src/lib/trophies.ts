import { supabase } from './supabase'
import type { PlayerCard, TrophyRow, UserStatsRow } from '../types'
import { TROPHY_RULES, PALIER_ORDER } from './trophyRules'

export function defaultUserStats(userId: string): UserStatsRow {
  return {
    user_id: userId,
    cards_discovered: [],
    nationalites_jouees: [],
    tactiques_debloquees: [],
    best_hand_score: 0,
    best_match_score: 0,
    best_season_score: 0,
    duo_count: 0,
    alignement_count: 0,
    carre_count: 0,
    selection_parfaite_count: 0,
    onze_legende_count: 0,
    saisons_completees: 0,
    titres: 0,
    grands_rivaux_battus: 0,
    ballons_total_gagnes: 0,
  }
}

export async function fetchUserStats(userId: string): Promise<UserStatsRow> {
  const { data, error } = await supabase.from('user_stats').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw error
  if (!data) return defaultUserStats(userId)
  return {
    user_id: data.user_id,
    cards_discovered: data.cards_discovered ?? [],
    nationalites_jouees: data.nationalites_jouees ?? [],
    tactiques_debloquees: data.tactiques_debloquees ?? [],
    best_hand_score: data.best_hand_score,
    best_match_score: data.best_match_score,
    best_season_score: data.best_season_score,
    duo_count: data.duo_count,
    alignement_count: data.alignement_count,
    carre_count: data.carre_count,
    selection_parfaite_count: data.selection_parfaite_count,
    onze_legende_count: data.onze_legende_count,
    saisons_completees: data.saisons_completees,
    titres: data.titres,
    grands_rivaux_battus: data.grands_rivaux_battus,
    ballons_total_gagnes: data.ballons_total_gagnes,
  }
}

export async function persistUserStats(stats: UserStatsRow): Promise<void> {
  const { error } = await supabase.from('user_stats').upsert({ ...stats, updated_at: new Date().toISOString() })
  if (error) throw error
}

export async function fetchUnlockedTrophyIds(userId: string): Promise<Set<number>> {
  const { data, error } = await supabase.from('user_trophies').select('trophy_id').eq('user_id', userId)
  if (error) throw error
  return new Set(data.map((row) => row.trophy_id))
}

export async function syncTrophies(
  userId: string,
  stats: UserStatsRow,
  deck: PlayerCard[],
  trophiesPool: TrophyRow[],
  unlockedIds: Set<number>,
): Promise<TrophyRow[]> {
  const newlyUnlocked: TrophyRow[] = []

  for (const rule of TROPHY_RULES) {
    const value = rule.getValue(stats, deck)
    const relevant = trophiesPool.filter((t) => t.ligne === rule.ligne)
    for (const trophy of relevant) {
      if (unlockedIds.has(trophy.id)) continue
      const tierIndex = PALIER_ORDER.indexOf(trophy.palier)
      const threshold = rule.thresholds[tierIndex]
      if (threshold != null && value >= threshold) newlyUnlocked.push(trophy)
    }
  }

  if (newlyUnlocked.length > 0) {
    const { error } = await supabase
      .from('user_trophies')
      .upsert(newlyUnlocked.map((t) => ({ user_id: userId, trophy_id: t.id })))
    if (error) throw error
  }

  return newlyUnlocked
}
