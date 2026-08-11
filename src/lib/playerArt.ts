import type { PlayerCard } from '../types'

export type SkinTone = 'light' | 'medium' | 'tan' | 'dark'
export type HairStyle = 'bald' | 'short' | 'wavy' | 'curly' | 'long' | 'headband'
export type FacialHair = 'none' | 'mustache' | 'beard' | 'goatee'
export type Pose = 'shoot' | 'run' | 'juggle'

export interface PlayerTraits {
  skinTone: SkinTone
  hairStyle: HairStyle
  facialHair: FacialHair
  pose: Pose
}

const SKIN_TONES: SkinTone[] = ['light', 'medium', 'tan', 'dark']
const HAIR_STYLES: HairStyle[] = ['bald', 'short', 'wavy', 'curly', 'long', 'headband']
const FACIAL_HAIR: FacialHair[] = ['none', 'none', 'mustache', 'beard', 'goatee']
const POSES: Pose[] = ['shoot', 'run', 'juggle']

// Traits choisies a la main pour coller a l'allure connue des plus grandes legendes du deck.
const LEGEND_TRAITS: Record<string, PlayerTraits> = {
  'Franz Beckenbauer': { skinTone: 'light', hairStyle: 'wavy', facialHair: 'none', pose: 'run' },
  'Lionel Messi': { skinTone: 'tan', hairStyle: 'short', facialHair: 'beard', pose: 'shoot' },
  'Thierry Henry': { skinTone: 'dark', hairStyle: 'bald', facialHair: 'none', pose: 'run' },
  'Diego Maradona': { skinTone: 'tan', hairStyle: 'curly', facialHair: 'mustache', pose: 'juggle' },
  'Gerd Muller': { skinTone: 'light', hairStyle: 'short', facialHair: 'none', pose: 'shoot' },
  'Alfredo Di Stefano': { skinTone: 'medium', hairStyle: 'short', facialHair: 'none', pose: 'run' },
  'Cristiano Ronaldo': { skinTone: 'tan', hairStyle: 'short', facialHair: 'none', pose: 'shoot' },
  'Paolo Maldini': { skinTone: 'tan', hairStyle: 'wavy', facialHair: 'none', pose: 'run' },
  'Robert Lewandowski': { skinTone: 'light', hairStyle: 'short', facialHair: 'mustache', pose: 'shoot' },
  'Andres Iniesta': { skinTone: 'medium', hairStyle: 'bald', facialHair: 'none', pose: 'juggle' },
  'Steven Gerrard': { skinTone: 'light', hairStyle: 'short', facialHair: 'none', pose: 'shoot' },
  'Andrea Pirlo': { skinTone: 'tan', hairStyle: 'long', facialHair: 'beard', pose: 'juggle' },
}

function hashString(input: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

function pick<T>(list: T[], seed: number, salt: number): T {
  return list[(seed + salt) % list.length]
}

export function getPlayerTraits(card: PlayerCard): PlayerTraits {
  const legend = LEGEND_TRAITS[card.nom]
  if (legend) return legend

  const seed = hashString(card.nom)
  return {
    skinTone: pick(SKIN_TONES, seed, 1),
    hairStyle: pick(HAIR_STYLES, seed, 7),
    facialHair: pick(FACIAL_HAIR, seed, 13),
    pose: pick(POSES, seed, 19),
  }
}

export const SKIN_TONE_COLORS: Record<SkinTone, string> = {
  light: '#f0c8a0',
  medium: '#d9a066',
  tan: '#b97a4b',
  dark: '#7a4a2b',
}
