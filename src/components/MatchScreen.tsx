import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { PlayerCard, HandTypeRow, TacticRow, GrandRivalRule, HandResult } from '../types'
import { useMatch, MAX_SELECTED } from '../hooks/useMatch'
import { scoreHand } from '../lib/scoring'
import { HAND_TYPE_I18N_KEY } from '../lib/handTypeKeys'
import type { MatchKind } from '../lib/season'
import { Card } from './Card'
import './MatchScreen.css'

interface MatchScreenProps {
  deck: PlayerCard[]
  seasonDeck: PlayerCard[]
  handTypes: HandTypeRow[]
  target: number
  matchKind: MatchKind
  grandRival?: GrandRivalRule
  groupField?: 'championnat' | 'club'
  rngSeed?: number
  ownedTactics: TacticRow[]
  onBallonsEarned: (amount: number, reason: string) => void
  onHandPlayed?: (result: HandResult, playedCards: PlayerCard[]) => void
  onFinished: (result: { won: boolean; score: number; handsLeft: number }) => void
}

export function MatchScreen({
  deck,
  seasonDeck,
  handTypes,
  target,
  matchKind,
  grandRival,
  groupField = 'championnat',
  rngSeed,
  ownedTactics,
  onBallonsEarned,
  onHandPlayed,
  onFinished,
}: MatchScreenProps) {
  const { t } = useTranslation()
  const ownedTacticNames = useMemo(() => ownedTactics.map((tac) => tac.nom), [ownedTactics])
  const handTypeLabel = (handType: string) => t(`handTypes.${HAND_TYPE_I18N_KEY[handType] ?? 'solo'}`)
  const flushKey = useMemo(() => (c: PlayerCard) => c[groupField], [groupField])
  const [groupFilter, setGroupFilter] = useState<string | null>(null)
  const [noteFilter, setNoteFilter] = useState<number | null>(null)

  const match = useMatch(deck, handTypes, target, {
    ownedTacticNames,
    seasonDeck,
    grandRival,
    flushKey,
    rngSeed,
    onBallonsEarned,
    onHandPlayed,
  })

  const preview = useMemo(() => {
    if (match.selectedCards.length === 0) return null
    return scoreHand(match.selectedCards, handTypes, {
      ownedTacticNames,
      seasonDeck,
      grandRival,
      flushKey,
      isFirstHandOfMatch: match.handsLeft === 5,
      isLastHandOfMatch: match.handsLeft === 1,
    })
  }, [match.selectedCards, handTypes, ownedTacticNames, seasonDeck, grandRival, flushKey, match.handsLeft])

  const groupOptions = useMemo(
    () => [...new Set(match.hand.map((c) => c[groupField]))].sort(),
    [match.hand, groupField],
  )
  const noteOptions = useMemo(() => [...new Set(match.hand.map((c) => c.note))].sort((a, b) => b - a), [match.hand])
  const matchesFilter = (card: PlayerCard) =>
    (groupFilter == null || card[groupField] === groupFilter) && (noteFilter == null || card.note === noteFilter)

  // Regroupe les cartes qui correspondent au filtre en tete de main (au lieu de les griser),
  // avec une animation FLIP pour qu'elles se deplacent visiblement a l'ecran.
  const displayedHand = useMemo(() => {
    if (groupFilter == null && noteFilter == null) return match.hand
    const matching: PlayerCard[] = []
    const rest: PlayerCard[] = []
    for (const card of match.hand) {
      ;(matchesFilter(card) ? matching : rest).push(card)
    }
    return [...matching, ...rest]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.hand, groupFilter, noteFilter, groupField])

  const cardNodes = useRef(new Map<number, HTMLDivElement>())
  const cardRects = useRef(new Map<number, DOMRect>())

  useLayoutEffect(() => {
    const nextRects = new Map<number, DOMRect>()
    for (const [id, node] of cardNodes.current) {
      nextRects.set(id, node.getBoundingClientRect())
    }

    for (const [id, node] of cardNodes.current) {
      const prev = cardRects.current.get(id)
      const next = nextRects.get(id)
      if (!prev || !next) continue
      const dx = prev.left - next.left
      const dy = prev.top - next.top
      if (dx === 0 && dy === 0) continue
      node.style.transition = 'none'
      node.style.transform = `translate(${dx}px, ${dy}px)`
      requestAnimationFrame(() => {
        node.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.3, 1)'
        node.style.transform = ''
      })
    }

    cardRects.current = nextRects
  }, [displayedHand])

  return (
    <div className="sqx-match">
      <div className="sqx-match__title">
        {t(`matchKind.${matchKind}`)}
        {grandRival && <span className="sqx-match__rival"> — {t(`grandRivals.${grandRival.id}.nom`)}</span>}
      </div>
      {grandRival && <div className="sqx-match__rival-desc">{t(`grandRivals.${grandRival.id}.description`)}</div>}

      <div className="sqx-match__header">
        <div className="sqx-stat">
          <span className="sqx-stat__label">{t('match.score')}</span>
          <span className="sqx-stat__value">
            <span key={match.score} className="sqx-stat__value--score">
              {match.score}
            </span>{' '}
            <span className="sqx-stat__target">/ {match.target}</span>
          </span>
        </div>
        <div className="sqx-stat">
          <span className="sqx-stat__label">{t('match.handsLeft')}</span>
          <span className="sqx-stat__value">{match.handsLeft}</span>
        </div>
        <div className="sqx-stat">
          <span className="sqx-stat__label">{t('match.discardsLeft')}</span>
          <span className="sqx-stat__value">{match.discardsLeft}</span>
        </div>
      </div>

      {match.status !== 'playing' && (
        <div className={`sqx-banner sqx-banner--${match.status}`}>
          {match.status === 'won' ? t('match.won') : t('match.lost')}
          <button
            type="button"
            className="sqx-button"
            onClick={() => onFinished({ won: match.status === 'won', score: match.score, handsLeft: match.handsLeft })}
          >
            {t('match.continueButton')}
          </button>
        </div>
      )}

      <div className="sqx-preview">
        {preview ? (
          <>
            <strong>{handTypeLabel(preview.handType)}</strong>
            <span>
              {preview.totalPoints} pts x {preview.totalMult.toFixed(1)} mult = {preview.totalScore}
            </span>
            {preview.nationalityBonus > 0 && (
              <span className="sqx-preview__bonus">
                {t('match.nationalityBonus', { amount: preview.nationalityBonus.toFixed(1) })}
              </span>
            )}
            {preview.appliedTactics.length > 0 && (
              <span className="sqx-preview__bonus">
                {t('match.tacticsApplied', { list: preview.appliedTactics.join(', ') })}
              </span>
            )}
          </>
        ) : (
          <span className="sqx-preview__hint">{t('match.selectHint', { max: MAX_SELECTED })}</span>
        )}
      </div>

      <div className="sqx-filters">
        <div className="sqx-filters__row">
          <span className="sqx-filters__label">{t(`match.filterByGroup${groupField === 'club' ? 'Club' : 'Championnat'}`)}</span>
          <button
            type="button"
            className={`sqx-chip${groupFilter === null ? ' sqx-chip--active' : ''}`}
            onClick={() => setGroupFilter(null)}
          >
            {t('match.filterAll')}
          </button>
          {groupOptions.map((g) => (
            <button
              key={g}
              type="button"
              className={`sqx-chip${groupFilter === g ? ' sqx-chip--active' : ''}`}
              onClick={() => setGroupFilter(groupFilter === g ? null : g)}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="sqx-filters__row">
          <span className="sqx-filters__label">{t('match.filterByNote')}</span>
          <button
            type="button"
            className={`sqx-chip${noteFilter === null ? ' sqx-chip--active' : ''}`}
            onClick={() => setNoteFilter(null)}
          >
            {t('match.filterAll')}
          </button>
          {noteOptions.map((n) => (
            <button
              key={n}
              type="button"
              className={`sqx-chip${noteFilter === n ? ' sqx-chip--active' : ''}`}
              onClick={() => setNoteFilter(noteFilter === n ? null : n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="sqx-hand">
        {displayedHand.map((card, index) => {
          const filterActive = groupFilter != null || noteFilter != null
          return (
            <div
              key={card.id}
              className="sqx-hand__slot"
              ref={(node) => {
                if (node) cardNodes.current.set(card.id, node)
                else cardNodes.current.delete(card.id)
              }}
            >
              <Card
                card={card}
                groupField={groupField}
                selected={match.selectedIds.includes(card.id)}
                highlighted={filterActive && matchesFilter(card)}
                dealDelay={index * 45}
                onClick={() => match.toggleSelect(card.id)}
              />
            </div>
          )
        })}
      </div>

      <div className="sqx-actions">
        <button
          type="button"
          className="sqx-button sqx-button--primary"
          disabled={match.status !== 'playing' || match.selectedCards.length === 0}
          onClick={match.playHand}
        >
          {t('match.playHand')}
        </button>
        <button
          type="button"
          className="sqx-button"
          disabled={match.status !== 'playing' || match.selectedCards.length === 0 || match.discardsLeft === 0}
          onClick={match.discard}
        >
          {t('match.discard')}
        </button>
      </div>

      {match.lastResult && (
        <div className="sqx-last-result">
          {t('match.lastResult', { handType: handTypeLabel(match.lastResult.handType), score: match.lastResult.totalScore })}
        </div>
      )}
    </div>
  )
}
