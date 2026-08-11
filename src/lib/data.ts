import { supabase } from './supabase'
import type { PlayerCard, HandTypeRow, TacticRow, TrophyRow } from '../types'

export async function fetchDeck(): Promise<PlayerCard[]> {
  const { data, error } = await supabase
    .from('players')
    .select('id, championnat, club, note, symbole, nom, nationalite')
    .order('id')

  if (error) throw error
  return data
}

export async function fetchChampionshipDeck(championnat: string): Promise<PlayerCard[]> {
  const { data, error } = await supabase
    .from('championship_players')
    .select('id, championnat, club, note, symbole, nom, nationalite')
    .eq('championnat', championnat)
    .order('id')

  if (error) throw error
  return data
}

export async function fetchHandTypes(): Promise<HandTypeRow[]> {
  const { data, error } = await supabase
    .from('hand_types')
    .select('nom, condition, base_points, base_mult')

  if (error) throw error
  return data
}

export async function fetchTactics(): Promise<TacticRow[]> {
  const { data, error } = await supabase
    .from('tactics')
    .select('id, nom, famille, rarete, prix, effet')
    .order('id')

  if (error) throw error
  return data
}

export async function fetchTrophies(): Promise<TrophyRow[]> {
  const { data, error } = await supabase
    .from('trophies')
    .select('id, famille, ligne, palier, condition, pro_only')
    .order('id')

  if (error) throw error
  return data
}

export async function fetchIsPro(userId: string): Promise<boolean> {
  const { data, error } = await supabase.from('profiles').select('is_pro').eq('id', userId).maybeSingle()
  if (error) throw error
  return data?.is_pro ?? false
}

export interface DailyScoreEntry {
  pseudo: string | null
  score: number
}

export async function fetchDailyScore(date: string, userId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('daily_challenge_scores')
    .select('score')
    .eq('challenge_date', date)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data?.score ?? null
}

export async function submitDailyScore(date: string, userId: string, pseudo: string, score: number): Promise<void> {
  const { error } = await supabase
    .from('daily_challenge_scores')
    .insert({ challenge_date: date, user_id: userId, pseudo, score })
  if (error) throw error
}

export async function fetchDailyLeaderboard(date: string, limit = 20): Promise<DailyScoreEntry[]> {
  const { data, error } = await supabase
    .from('daily_challenge_scores')
    .select('pseudo, score')
    .eq('challenge_date', date)
    .order('score', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export interface DuelRow {
  id: string
  code: string
  seed: number
  creator_id: string
  creator_pseudo: string | null
  creator_score: number | null
  opponent_id: string | null
  opponent_pseudo: string | null
  opponent_score: number | null
}

const DUEL_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sans caracteres ambigus (0/O, 1/I/L)

function generateDuelCode(): string {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += DUEL_CODE_CHARS[Math.floor(Math.random() * DUEL_CODE_CHARS.length)]
  }
  return code
}

export async function createDuel(creatorId: string, creatorPseudo: string): Promise<DuelRow> {
  const code = generateDuelCode()
  const seed = Math.floor(Math.random() * 2 ** 31)
  const { data, error } = await supabase
    .from('duels')
    .insert({ code, seed, creator_id: creatorId, creator_pseudo: creatorPseudo })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchDuelByCode(code: string): Promise<DuelRow | null> {
  const { data, error } = await supabase.from('duels').select('*').eq('code', code.toUpperCase()).maybeSingle()
  if (error) throw error
  return data
}

export async function fetchDuelById(id: string): Promise<DuelRow | null> {
  const { data, error } = await supabase.from('duels').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function joinDuel(code: string, opponentId: string, opponentPseudo: string): Promise<DuelRow> {
  const duel = await fetchDuelByCode(code)
  if (!duel) throw new Error('notFound')
  if (duel.creator_id === opponentId) throw new Error('self')
  if (duel.opponent_id && duel.opponent_id !== opponentId) throw new Error('full')

  const { data, error } = await supabase
    .from('duels')
    .update({ opponent_id: opponentId, opponent_pseudo: opponentPseudo })
    .eq('id', duel.id)
    .is('opponent_id', null)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function submitDuelScore(duelId: string, userId: string, isCreator: boolean, score: number): Promise<void> {
  const { error } = await supabase
    .from('duels')
    .update(isCreator ? { creator_score: score } : { opponent_score: score })
    .eq('id', duelId)
    .eq(isCreator ? 'creator_id' : 'opponent_id', userId)
  if (error) throw error
}

export interface LeaderboardEntry {
  pseudo: string | null
  best_hand_score: number
  best_match_score: number
  best_season_score: number
  titres: number
  saisons_completees: number
}

export async function fetchLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('public_leaderboard')
    .select('pseudo, best_hand_score, best_match_score, best_season_score, titres, saisons_completees')
    .order('best_season_score', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}
