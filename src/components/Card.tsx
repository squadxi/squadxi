import type { PlayerCard } from '../types'
import { flagFor } from '../lib/flags'
import { CHAMPIONNAT_COLORS } from '../lib/colors'
import { PlayerSilhouette } from './PlayerSilhouette'
import './Card.css'

const RANK_ABBREVIATION: Record<string, string> = {
  As: 'A',
  Roi: 'R',
  Dame: 'D',
  Valet: 'V',
}

interface CardProps {
  card: PlayerCard
  groupField?: 'championnat' | 'club'
  selected?: boolean
  highlighted?: boolean
  dimmed?: boolean
  onClick?: () => void
}

export function Card({ card, groupField = 'championnat', selected, highlighted, dimmed, onClick }: CardProps) {
  const color = CHAMPIONNAT_COLORS[card.championnat] ?? '#666'
  const rank = RANK_ABBREVIATION[card.symbole] ?? card.symbole

  return (
    <button
      type="button"
      className={`sqx-card${selected ? ' sqx-card--selected' : ''}${highlighted ? ' sqx-card--highlighted' : ''}${dimmed ? ' sqx-card--dimmed' : ''}`}
      style={{ '--sqx-accent': color } as React.CSSProperties}
      onClick={onClick}
    >
      <span className="sqx-card__corner sqx-card__corner--tl">{rank}</span>
      <span className="sqx-card__corner sqx-card__corner--br">{rank}</span>

      <PlayerSilhouette className="sqx-card__silhouette" />

      <div className="sqx-card__footer">
        <span className="sqx-card__nom">{card.nom}</span>
        <span className="sqx-card__meta">
          {flagFor(card.nationalite)} {card[groupField]}
        </span>
      </div>
    </button>
  )
}
