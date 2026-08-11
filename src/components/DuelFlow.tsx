import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { PlayerCard, HandTypeRow, TacticRow, TrophyRow } from '../types'
import { createDuel, joinDuel, fetchDuelById, submitDuelScore } from '../lib/data'
import type { DuelRow } from '../lib/data'
import { SeasonRunner } from './SeasonRunner'
import './DuelFlow.css'

interface DuelFlowProps {
  userId: string
  pseudo: string
  deck: PlayerCard[]
  handTypes: HandTypeRow[]
  tacticsPool: TacticRow[]
  trophiesPool: TrophyRow[]
  onExitMode: () => void
}

export function DuelFlow({ userId, pseudo, deck, handTypes, tacticsPool, trophiesPool, onExitMode }: DuelFlowProps) {
  const { t } = useTranslation()
  const [duel, setDuel] = useState<DuelRow | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)

  const isCreator = duel?.creator_id === userId
  const ownScore = duel ? (isCreator ? duel.creator_score : duel.opponent_score) : null
  const opponentScore = duel ? (isCreator ? duel.opponent_score : duel.creator_score) : null
  const opponentJoined = duel ? (isCreator ? !!duel.opponent_id : true) : false

  const handleCreate = async () => {
    setError(null)
    const created = await createDuel(userId, pseudo)
    setDuel(created)
  }

  const handleJoin = async () => {
    setError(null)
    try {
      const joined = await joinDuel(joinCode.trim(), userId, pseudo)
      setDuel(joined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'notFound')
    }
  }

  const handleRefresh = async () => {
    if (!duel) return
    const fresh = await fetchDuelById(duel.id)
    if (fresh) setDuel(fresh)
  }

  const handleSeasonEnd = async (score: number) => {
    if (!duel) return
    await submitDuelScore(duel.id, userId, isCreator, score)
    setPlaying(false)
    handleRefresh()
  }

  if (playing && duel) {
    return (
      <SeasonRunner
        deck={deck}
        fullDeck={deck}
        handTypes={handTypes}
        tacticsPool={tacticsPool}
        trophiesPool={trophiesPool}
        userId={userId}
        rngSeedBase={duel.seed}
        dailyMode
        onSeasonEnd={handleSeasonEnd}
        onExitMode={onExitMode}
      />
    )
  }

  if (!duel) {
    return (
      <div className="sqx-duel">
        <h1>{t('duel.title')}</h1>

        <div className="sqx-duel__section">
          <h2>{t('duel.createTitle')}</h2>
          <button type="button" className="sqx-button sqx-button--primary" onClick={handleCreate}>
            {t('duel.create')}
          </button>
        </div>

        <div className="sqx-duel__section">
          <h2>{t('duel.joinTitle')}</h2>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder={t('duel.codeLabel')}
            maxLength={6}
            className="sqx-duel__input"
          />
          <button type="button" className="sqx-button" onClick={handleJoin} disabled={joinCode.length !== 6}>
            {t('duel.join')}
          </button>
        </div>

        {error && <p className="sqx-duel__error">{t(`duel.error.${error}`, { defaultValue: error })}</p>}

        <button type="button" className="sqx-button" onClick={onExitMode}>
          {t('duel.back')}
        </button>
      </div>
    )
  }

  return (
    <div className="sqx-duel">
      <h1>{t('duel.title')}</h1>

      {!opponentJoined ? (
        <>
          <p className="sqx-duel__code">{t('duel.yourCode', { code: duel.code })}</p>
          <p>{t('duel.shareHint')}</p>
          <button type="button" className="sqx-button" onClick={handleRefresh}>
            {t('duel.waiting')}
          </button>
        </>
      ) : ownScore == null ? (
        <button type="button" className="sqx-button sqx-button--primary" onClick={() => setPlaying(true)}>
          {t('duel.play')}
        </button>
      ) : (
        <div className="sqx-duel__result">
          <p>{t('duel.yourScore', { score: ownScore })}</p>
          {opponentScore != null ? (
            <>
              <p>{t('duel.opponentScore', { score: opponentScore })}</p>
              <strong>{ownScore > opponentScore ? t('duel.won') : ownScore < opponentScore ? t('duel.lost') : t('duel.pending')}</strong>
            </>
          ) : (
            <>
              <p>{t('duel.opponentPending')}</p>
              <button type="button" className="sqx-button" onClick={handleRefresh}>
                {t('duel.pending')}
              </button>
            </>
          )}
        </div>
      )}

      <button type="button" className="sqx-button" onClick={onExitMode}>
        {t('duel.back')}
      </button>
    </div>
  )
}
