import type { PlayerCard } from '../types'
import { flagFor } from '../lib/flags'
import { CHAMPIONNAT_COLORS } from '../lib/colors'
import { PlayerIllustration } from './PlayerIllustration'
import './Card.css'

interface CardProps {
  card: PlayerCard
  groupField?: 'championnat' | 'club'
  selected?: boolean
  highlighted?: boolean
  dimmed?: boolean
  dealDelay?: number
  onClick?: () => void
}

export function Card({ card, groupField = 'championnat', selected, highlighted, dimmed, dealDelay, onClick }: CardProps) {
  const color = CHAMPIONNAT_COLORS[card.championnat] ?? '#666'

  return (
    <button
      type="button"
      className={`sqx-card${selected ? ' sqx-card--selected' : ''}${highlighted ? ' sqx-card--highlighted' : ''}${dimmed ? ' sqx-card--dimmed' : ''}`}
      style={{ '--sqx-accent': color, '--sqx-deal-delay': dealDelay != null ? `${dealDelay}ms` : '0ms' } as React.CSSProperties}
      onClick={onClick}
    >
      <span className="sqx-card__corner sqx-card__corner--tl">{card.note}</span>
      <span className="sqx-card__corner sqx-card__corner--br">{card.note}</span>

      <PlayerIllustration card={card} jerseyColor={color} className="sqx-card__illustration" />

      <div className="sqx-card__footer">
        <span className="sqx-card__nom">{card.nom}</span>
        <span className="sqx-card__meta">
          {flagFor(card.nationalite)} {card[groupField]}
        </span>
      </div>
    </button>
  )
}
