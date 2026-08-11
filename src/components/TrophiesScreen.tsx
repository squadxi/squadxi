import { useTranslation } from 'react-i18next'
import type { TrophyRow } from '../types'
import { PALIER_ORDER } from '../lib/trophyRules'
import './TrophiesScreen.css'

interface TrophiesScreenProps {
  trophies: TrophyRow[]
  unlockedIds: Set<number>
  onClose: () => void
}

const FAMILIES: TrophyRow['famille'][] = ['Performance', 'Collection', 'Progression']

export function TrophiesScreen({ trophies, unlockedIds, onClose }: TrophiesScreenProps) {
  const { t } = useTranslation()

  const lignesByFamille = (famille: TrophyRow['famille']) => {
    const lignes = [...new Set(trophies.filter((tr) => tr.famille === famille).map((tr) => tr.ligne))]
    return lignes.map((ligne) => ({
      ligne,
      cells: PALIER_ORDER.map((palier) => trophies.find((tr) => tr.ligne === ligne && tr.palier === palier)),
    }))
  }

  return (
    <div className="sqx-trophies-overlay">
      <div className="sqx-trophies">
        <div className="sqx-trophies__header">
          <h2>{t('trophies.title')}</h2>
          <button type="button" className="sqx-button" onClick={onClose}>
            {t('trophies.close')}
          </button>
        </div>

        {FAMILIES.map((famille) => (
          <div key={famille} className="sqx-trophies__family">
            <h3>{t(`trophies.families.${famille}`)}</h3>
            <table className="sqx-trophies__table">
              <thead>
                <tr>
                  <th></th>
                  {PALIER_ORDER.map((palier) => (
                    <th key={palier}>{t(`trophies.paliers.${palier}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lignesByFamille(famille).map(({ ligne, cells }) => (
                  <tr key={ligne}>
                    <td className="sqx-trophies__ligne">{ligne}</td>
                    {cells.map((trophy, i) => {
                      if (!trophy) return <td key={i} className="sqx-trophies__cell sqx-trophies__cell--empty" />
                      const unlocked = unlockedIds.has(trophy.id)
                      return (
                        <td
                          key={i}
                          className={`sqx-trophies__cell ${unlocked ? 'sqx-trophies__cell--unlocked' : 'sqx-trophies__cell--locked'}`}
                          title={trophy.condition}
                        >
                          {unlocked ? '🏆' : trophy.pro_only ? '🔒' : '·'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}
