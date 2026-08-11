import { useTranslation } from 'react-i18next'
import type { TacticRow } from '../types'
import { IMPLEMENTED_TACTICS } from '../lib/tactics'
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

      <p className="sqx-shop__balance">{t('shop.balance', { amount: ballons })}</p>

      <div className="sqx-shop__offers">
        {offers.map((tactic) => {
          const owned = ownedTactics.some((tac) => tac.id === tactic.id)
          const affordable = ballons >= tactic.prix
          return (
            <div key={tactic.id} className={`sqx-tactic sqx-tactic--${tactic.rarete.toLowerCase()}`}>
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
          <ul>
            {ownedTactics.map((tac) => (
              <li key={tac.id}>{tac.nom}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
