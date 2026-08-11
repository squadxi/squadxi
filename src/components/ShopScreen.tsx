import { useTranslation } from 'react-i18next'
import type { TacticRow } from '../types'
import { IMPLEMENTED_TACTICS } from '../lib/tactics'
import { TacticIcon } from './TacticIcon'
import './ShopScreen.css'

interface ShopScreenProps {
  offers: TacticRow[]
  ownedTactics: TacticRow[]
  ballons: number
  rerollCost: number
  lastGain: { reward: number; interest: number } | null
  onBuy: (tactic: TacticRow) => void
  onReroll: () => void
  onContinue: () => void
}

export function ShopScreen({ offers, ownedTactics, ballons, rerollCost, lastGain, onBuy, onReroll, onContinue }: ShopScreenProps) {
  const { t } = useTranslation()

  return (
    <div className="sqx-shop">
      <h2 className="sqx-shop__title">{t('shop.title')}</h2>

      {lastGain && <p className="sqx-shop__gain">{t('shop.gain', { reward: lastGain.reward, interest: lastGain.interest })}</p>}

      <p className="sqx-shop__balance">
        <span className="sqx-shop__ball">⚽</span> {t('shop.balance', { amount: ballons })}
      </p>

      <div className="sqx-shop__offers">
        {offers.map((tactic, index) => {
          const owned = ownedTactics.some((tac) => tac.id === tactic.id)
          const affordable = ballons >= tactic.prix
          return (
            <div
              key={tactic.id}
              className={`sqx-tactic sqx-tactic--${tactic.rarete.toLowerCase()}`}
              style={{ '--sqx-reveal-delay': `${index * 90}ms` } as React.CSSProperties}
            >
              <div className="sqx-tactic__icon-wrap">
                <TacticIcon famille={tactic.famille} className="sqx-tactic__icon" />
              </div>
              <div className="sqx-tactic__header">
                <span className="sqx-tactic__nom">{tactic.nom}</span>
                <span className="sqx-tactic__rarete">{tactic.rarete}</span>
              </div>
              <p className="sqx-tactic__effet">{tactic.effet}</p>
              {!IMPLEMENTED_TACTICS.has(tactic.nom) && <p className="sqx-tactic__soon">{t('shop.notActiveYet')}</p>}
              <button
                type="button"
                className="sqx-button sqx-button--primary"
                disabled={owned || !affordable}
                onClick={() => onBuy(tactic)}
              >
                {owned ? t('shop.owned') : t('shop.buy', { prix: tactic.prix })}
              </button>
            </div>
          )
        })}
      </div>

      <div className="sqx-shop__actions">
        <button type="button" className="sqx-button" disabled={ballons < rerollCost} onClick={onReroll}>
          {t('shop.reroll', { cost: rerollCost })}
        </button>
        <button type="button" className="sqx-button sqx-button--primary" onClick={onContinue}>
          {t('shop.nextMatch')}
        </button>
      </div>

      {ownedTactics.length > 0 && (
        <div className="sqx-shop__owned">
          <h3>{t('shop.yourTactics', { count: ownedTactics.length })}</h3>
          <div className="sqx-shop__owned-grid">
            {ownedTactics.map((tac) => (
              <div key={tac.id} className={`sqx-owned-chip sqx-owned-chip--${tac.rarete.toLowerCase()}`} title={tac.effet}>
                <TacticIcon famille={tac.famille} className="sqx-owned-chip__icon" />
                <span>{tac.nom}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
