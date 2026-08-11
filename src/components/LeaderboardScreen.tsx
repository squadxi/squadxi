import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchLeaderboard } from '../lib/data'
import type { LeaderboardEntry } from '../lib/data'
import './LeaderboardScreen.css'

interface LeaderboardScreenProps {
  onBack: () => void
}

export function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const { t } = useTranslation()
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null)

  useEffect(() => {
    fetchLeaderboard().then(setEntries)
  }, [])

  return (
    <div className="sqx-leaderboard">
      <h1>{t('leaderboardScreen.title')}</h1>
      <p className="sqx-leaderboard__subtitle">{t('leaderboardScreen.subtitle')}</p>

      {entries && entries.length === 0 && <p className="sqx-leaderboard__empty">{t('leaderboardScreen.empty')}</p>}

      {entries && entries.length > 0 && (
        <div className="sqx-leaderboard__table-wrap">
          <table className="sqx-leaderboard__table">
            <thead>
              <tr>
                <th>{t('leaderboardScreen.rank')}</th>
                <th>{t('leaderboardScreen.player')}</th>
                <th>{t('leaderboardScreen.bestHand')}</th>
                <th>{t('leaderboardScreen.bestMatch')}</th>
                <th>{t('leaderboardScreen.bestSeason')}</th>
                <th>{t('leaderboardScreen.titles')}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{entry.pseudo ?? '?'}</td>
                  <td>{entry.best_hand_score}</td>
                  <td>{entry.best_match_score}</td>
                  <td>{entry.best_season_score}</td>
                  <td>{entry.titres}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button type="button" className="sqx-button" onClick={onBack}>
        {t('leaderboardScreen.back')}
      </button>
    </div>
  )
}
