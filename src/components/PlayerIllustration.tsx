import type { PlayerCard } from '../types'
import { getPlayerTraits, SKIN_TONE_COLORS } from '../lib/playerArt'

interface PlayerIllustrationProps {
  card: PlayerCard
  jerseyColor: string
  className?: string
}

const HAIR_PATHS: Record<string, string> = {
  bald: '',
  short: 'M37 10c0-6 5-10 11-10s11 4 11 10c0 2-1 4-2 5H39c-1-1-2-3-2-5Z',
  wavy: 'M35 11c0-7 6-12 13-12s13 5 13 12c0 2 1 4 2 6-2-1-3-3-3-3s-1 3-3 4c0-2-1-3-1-3s-1 3-3 4c0-2-1-4-1-4s-2 3-4 4c0-2 0-4 0-4s-2 3-4 4c-1-2-1-4-1-4s-2 2-3 3c1-2 2-4 2-6Z',
  curly: 'M33 12c-2-6 3-13 10-14 2-4 8-5 12-2 5-1 10 3 10 8 3 1 4 5 2 8 1 3-1 6-4 6-1 2-3 3-5 3H39c-3 0-5-2-6-4-3 0-5-3-4-6-2-1-2-3 0-4Z',
  long: 'M35 11c0-7 6-12 13-12s13 5 13 12c0 4-1 8-1 14h-4c0-5 1-9 1-12-2 1-3 1-3 1s1-4-1-6c-1 2-3 3-3 3s0-3-2-4c-1 2-3 3-3 3s-1-3-3-3c-1 1-2 3-2 4-1 0-2-2-2-3-1 2-1 5 0 7l-4-1c0-1-1-2 1-3Z',
  headband: 'M35 8c0-6 6-11 13-11s13 5 13 11c0 1 0 3-1 4H36c-1-1-1-3-1-4Z',
}

const FACIAL_HAIR_PATHS: Record<string, string> = {
  none: '',
  mustache: 'M42 23c2-1 4-1 6 0 2-1 4-1 6 0-1 2-3 3-6 3s-5-1-6-3Z',
  beard: 'M40 20c0 5 3 10 8 10s8-5 8-10c-2 2-5 3-8 3s-6-1-8-3Z',
  goatee: 'M46 25c1 3 1 5 2 5s1-2 2-5c-1 1-3 1-4 0Z',
}

export function PlayerIllustration({ card, jerseyColor, className }: PlayerIllustrationProps) {
  const traits = getPlayerTraits(card)
  const skin = SKIN_TONE_COLORS[traits.skinTone]

  const armPose =
    traits.pose === 'shoot'
      ? { left: 'M40 55c-6 2-10 8-11 15l6 2c2-6 5-11 9-13Z', right: 'M56 55c6 1 11 6 13 13l-6 3c-2-6-5-11-10-13Z' }
      : traits.pose === 'run'
        ? { left: 'M38 55c-8 0-13 5-16 11l5 4c3-5 7-9 13-10Z', right: 'M58 55c7 1 12 4 15 10l-5 4c-3-5-6-8-12-10Z' }
        : { left: 'M39 55c-5 4-8 10-8 17l6 1c0-6 2-11 6-14Z', right: 'M57 55c5 3 8 9 9 16l-6 1c-1-6-3-11-7-14Z' }

  const legPose =
    traits.pose === 'run'
      ? { left: 'M42 78c-2 8-3 14-6 20l6 2c3-6 5-13 6-20Z', right: 'M54 78c4 6 8 11 14 15l-4 5c-6-4-11-9-15-15Z' }
      : { left: 'M42 78c-1 8-1 15-2 22h7c0-7 1-14 1-22Z', right: 'M54 78c1 8 1 15 2 22h7c-1-7-2-14-2-22Z' }

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="48" cy="97" rx="20" ry="3" fill="rgba(0,0,0,0.25)" />
      <path d={armPose.left} fill={skin} />
      <path d={armPose.right} fill={skin} />
      <path d={legPose.left} fill={skin} />
      <path d={legPose.right} fill={skin} />
      <path
        d="M46 78c0-3-1-6-1-6h10s-1 3-1 6c0 3 2 5 2 5H44s2-2 2-5Z"
        fill={jerseyColor}
        opacity="0.9"
      />
      <path d="M35 54c2-4 6-6 13-6s11 2 13 6c1 3 1 10-1 16-4 2-8 3-12 3s-8-1-12-3c-2-6-2-13-1-16Z" fill={jerseyColor} />
      <text x="48" y="66" textAnchor="middle" fontSize="11" fontWeight="900" fill="rgba(255,255,255,0.85)" fontFamily="Anton, sans-serif">
        {card.note}
      </text>
      <circle cx="48" cy="38" r="12" fill={skin} />
      {HAIR_PATHS[traits.hairStyle] && <path d={HAIR_PATHS[traits.hairStyle]} fill="#2a1c12" />}
      {traits.hairStyle === 'headband' && <rect x="35" y="30" width="26" height="4" rx="2" fill="#e8495e" />}
      {FACIAL_HAIR_PATHS[traits.facialHair] && <path d={FACIAL_HAIR_PATHS[traits.facialHair]} fill="#2a1c12" />}
    </svg>
  )
}
