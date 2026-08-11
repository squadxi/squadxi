import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { PlayerCard, HandTypeRow, TacticRow, TrophyRow } from '../types'
import { fetchDailyScore, fetchDailyLeaderboard, submitDailyScore } from '../lib/data'
import type { DailyScoreEntry } from '../lib/data'
import { hashSeed, todayIso } from '../lib/rng'
import { SeasonRunner } from './SeasonRunner'
import './DailyChallengeFlow.css'

interface DailyChallengeFlowProps {
  userId: string
  pseudo: string
  deck: PlayerCard[]
  handTypes: HandTypeRow[]
  tacticsPool: TacticRow[]
  trophiesPool: TrophyRow[]
  onExitMode: () => void
}

export function DailyChallengeFlow({ userId, pseudo, deck, handTypes, tacticsPool, trophiesPool, onExitMode }: DailyChallengeFlowProps) {
  const { t } = useTranslation()
  const date = todayIso()
  const [existingScore, setExistingScore] = useState<number | null | undefined>(undefined)
  const [leaderboard, setLeaderboard] = useState<DailyScoreEntry[]>([])
  const [playing, setPlaying] = useState(false)
  const [justFinishedScore, setJustFinishedScore] = useState<number | null>(null)

  const refresh = () => {
    fetchDailyScore(date, userId).then(setExistingScore)
    fetchDailyLeaderboard(date).then(setLeaderboard)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSeasonEnd = async (score: number) => {
    await submitDailyScore(date, userId, pseudo, score)
    setJustFinishedScore(score)
    setPlaying(false)
    refresh()
  }

  if (playing) {
    return (
      <SeasonRunner
        deck={deck}
        fullDeck={deck}
        handTypes={handTypes}
        tacticsPool={tacticsPool}
        trophiesPool={trophiesPool}
        userId={userId}
        rngSeedBase={hashSeed(date)}
        dailyMode
        onSeasonEnd={handleSeasonEnd}
        onExitMode={onExitMode}
      />
    )
  }

  const hasPlayed = existingScore != null
  const displayScore = justFinishedScore ?? existingScore

  return (
    <div className="sqx-daily">
      <h1>{t('daily.title')}</h1>
      <p className="sqx-daily__subtitle">{t('daily.subtitle')}</p>

      {justFinishedScore != null && (
        <div className="sqx-daily__finished">
          <strong>{t('daily.finished')}</strong>
          <p>{t('daily.finishedBody', { score: justFinishedScore })}</p>
        </div>
      )}

      {hasPlayed ? (
        <p className="sqx-daily__played">
          {t('daily.alreadyPlayed')} {t('daily.yourScore', { score: displayScore })}
        </p>
      ) : (
        <button type="button" className="sqx-button sqx-button--primary" onClick={() => setPlaying(true)}>
          {t('daily.play')}
        </button>
      )}

      <h2>{t('daily.leaderboard')}</h2>
      <table className="sqx-daily__table">
        <thead>
          <tr>
            <th>{t('daily.rank')}</th>
            <th>{t('daily.player')}</th>
            <th>{t('daily.score')}</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{entry.pseudo ?? '?'}</td>
              <td>{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button type="button" className="sqx-button" onClick={onExitMode}>
        {t('daily.back')}
      </button>
    </div>
  )
}
