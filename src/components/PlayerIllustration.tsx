import type { PlayerCard } from '../types'
import { getPlayerTraits, SKIN_TONE_COLORS } from '../lib/playerArt'

interface PlayerIllustrationProps {
  card: PlayerCard
  jerseyColor: string
  className?: string
}

function shadeColor(hex: string, amount: number): string {
  const clean = hex.replace('#', '')
  const num = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount))
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

export function PlayerIllustration({ card, jerseyColor, className }: PlayerIllustrationProps) {
  const traits = getPlayerTraits(card)
  const skin = SKIN_TONE_COLORS[traits.skinTone]
  const jerseyDark = shadeColor(jerseyColor, -35)
  const hairColor = '#2a1c12'

  const armSwing =
    traits.pose === 'shoot' ? { l: -14, r: 20 } : traits.pose === 'run' ? { l: -22, r: 18 } : { l: -10, r: 10 }
  const legSwing = traits.pose === 'run' ? { l: 8, r: -10 } : traits.pose === 'shoot' ? { l: -4, r: 6 } : { l: 0, r: 0 }

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="50" cy="94" rx="22" ry="3.5" fill="rgba(0,0,0,0.28)" />

      {/* Bras */}
      <g stroke={skin} strokeWidth="7" strokeLinecap="round" fill="none">
        <path d={`M35 46 q${armSwing.l} 14 ${armSwing.l - 4} 26`} />
        <path d={`M65 46 q${armSwing.r} 14 ${armSwing.r + 4} 26`} />
      </g>

      {/* Jambes + chaussettes + chaussures */}
      <g strokeLinecap="round" fill="none">
        <path d={`M43 70 q${legSwing.l} 12 ${legSwing.l - 2} 22`} stroke={skin} strokeWidth="8" />
        <path d={`M57 70 q${legSwing.r} 12 ${legSwing.r + 2} 22`} stroke={skin} strokeWidth="8" />
        <path d={`M43 82 q${legSwing.l} 6 ${legSwing.l - 2} 12`} stroke="#f2f2f2" strokeWidth="8.5" />
        <path d={`M57 82 q${legSwing.r} 6 ${legSwing.r + 2} 12`} stroke="#f2f2f2" strokeWidth="8.5" />
      </g>
      <ellipse cx={43 + legSwing.l - 2} cy="94" rx="6" ry="3" fill="#1a1a1a" />
      <ellipse cx={57 + legSwing.r + 2} cy="94" rx="6" ry="3" fill="#1a1a1a" />

      {/* Short */}
      <rect x="36" y="66" width="28" height="12" rx="5" fill={jerseyDark} />

      {/* Manches */}
      <circle cx="35" cy="46" r="7" fill={jerseyColor} />
      <circle cx="65" cy="46" r="7" fill={jerseyColor} />

      {/* Maillot */}
      <path d="M33 42c2-5 7-8 17-8s15 3 17 8c2 6 2 18-1 26-5 2-10 3-16 3s-11-1-16-3c-3-8-3-20-1-26Z" fill={jerseyColor} />
      <path d="M42 34c2 3 4 5 8 5s6-2 8-5c3 1 5 3 6 5-3 3-8 5-14 5s-11-2-14-5c1-2 3-4 6-5Z" fill={jerseyDark} />

      {/* Numero */}
      <text x="50" y="60" textAnchor="middle" fontSize="13" fontWeight="900" fill="rgba(255,255,255,0.92)" fontFamily="Anton, sans-serif">
        {card.note}
      </text>

      {/* Cou + tete */}
      <rect x="45" y="26" width="10" height="9" fill={skin} />
      <circle cx="50" cy="19" r="11" fill={skin} />

      {/* Yeux */}
      <circle cx="46" cy="19" r="1.1" fill="#241a04" />
      <circle cx="54" cy="19" r="1.1" fill="#241a04" />

      {/* Cheveux */}
      {traits.hairStyle === 'short' && <path d="M39 14c0-7 5-11 11-11s11 4 11 11c-3-2-7-3-11-3s-8 1-11 3Z" fill={hairColor} />}
      {traits.hairStyle === 'wavy' && (
        <path d="M38 15c-1-8 5-13 12-13s13 5 12 13c-1-2-2-3-2-3s0 3-2 4c0-2-1-3-1-3s-1 3-3 3c0-2 0-3 0-3s-2 3-4 3c-1-2-1-3-1-3s-2 3-4 3c-1-1-1-3-1-3s-2 2-3 3c-1-1-2-2-2-3Z" fill={hairColor} />
      )}
      {traits.hairStyle === 'curly' && (
        <>
          <circle cx="40" cy="12" r="4.2" fill={hairColor} />
          <circle cx="46" cy="9" r="4.6" fill={hairColor} />
          <circle cx="54" cy="9" r="4.6" fill={hairColor} />
          <circle cx="60" cy="12" r="4.2" fill={hairColor} />
          <circle cx="50" cy="8" r="4.8" fill={hairColor} />
        </>
      )}
      {traits.hairStyle === 'long' && (
        <path d="M38 14c-1-8 5-13 12-13s13 5 12 13c0 6-1 11-2 16l-4-1c1-4 1-8 1-11-2 1-3 1-3 1s1-3-1-5c-1 2-2 3-2 3s-1-3-2-3c-1 2-2 3-2 3s-2-3-3-3c0 3 0 7 1 11l-4 1c-1-5-2-10-2-16Z" fill={hairColor} />
      )}
      {traits.hairStyle === 'headband' && (
        <>
          <path d="M39 12c0-6 5-10 11-10s11 4 11 10c0 1 0 2-1 3H40c-1-1-1-2-1-3Z" fill={hairColor} />
          <rect x="37" y="13" width="26" height="4" rx="2" fill="#e8495e" />
        </>
      )}

      {traits.facialHair === 'mustache' && <path d="M45 23c2-1 3-1 5 0 2-1 3-1 5 0-1 2-3 2-5 2s-4 0-5-2Z" fill={hairColor} />}
      {traits.facialHair === 'beard' && <path d="M42 21c0 4 3 8 8 8s8-4 8-8c-2 2-5 3-8 3s-6-1-8-3Z" fill={hairColor} />}
      {traits.facialHair === 'goatee' && <path d="M48 26c1 2 1 4 2 4s1-2 2-4c-1 1-3 1-4 0Z" fill={hairColor} />}
    </svg>
  )
}
