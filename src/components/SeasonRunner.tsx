import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { PlayerCard, HandTypeRow, TacticRow, TrophyRow } from '../types'
import { useSeason } from '../hooks/useSeason'
import { useTrophyTracking } from '../hooks/useTrophyTracking'
import { rollShopTactics } from '../lib/tactics'
import { MatchScreen } from './MatchScreen'
import { ShopScreen } from './ShopScreen'
import { TrophyToast } from './TrophyToast'
import { TrophiesScreen } from './TrophiesScreen'
import './SeasonRunner.css'

const SHOP_OFFER_COUNT = 3
const REROLL_COST = 2

interface SeasonRunnerProps {
  deck: PlayerCard[]
  fullDeck: PlayerCard[]
  handTypes: HandTypeRow[]
  tacticsPool: TacticRow[]
  trophiesPool: TrophyRow[]
  userId: string
  groupField?: 'championnat' | 'club'
  rngSeedBase?: number
  dailyMode?: boolean
  onSeasonEnd?: (score: number, won: boolean) => void
  onExitMode: () => void
}

export function SeasonRunner({
  deck,
  fullDeck,
  handTypes,
  tacticsPool,
  trophiesPool,
  userId,
  groupField,
  rngSeedBase,
  dailyMode,
  onSeasonEnd,
  onExitMode,
}: SeasonRunnerProps) {
  const { t } = useTranslation()
  const season = useSeason()
  const trophyTracking = useTrophyTracking(userId, fullDeck, trophiesPool)
  const [shopOffers, setShopOffers] = useState<TacticRow[]>([])
  const [trophiesOpen, setTrophiesOpen] = useState(false)
  const prevPhaseRef = useRef(season.phase)
  const seasonEndReportedRef = useRef(false)

  useEffect(() => {
    if (season.phase === 'mercato') {
      setShopOffers(rollShopTactics(tacticsPool, season.ownedTactics, SHOP_OFFER_COUNT))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season.phase, season.journee, season.matchIndex])

  useEffect(() => {
    const wasWon = season.phase === 'season-won' && prevPhaseRef.current !== 'season-won'
    const wasLost = season.phase === 'season-lost' && prevPhaseRef.current !== 'season-lost'
    if (wasWon || wasLost) {
      trophyTracking.recordSeasonEnd(season.seasonScore, wasWon)
      if (!seasonEndReportedRef.current) {
        seasonEndReportedRef.current = true
        onSeasonEnd?.(season.seasonScore, wasWon)
      }
    }
    prevPhaseRef.current = season.phase
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season.phase])

  useEffect(() => {
    if (season.lastMercatoGain) {
      trophyTracking.recordBallons(season.lastMercatoGain.reward + season.lastMercatoGain.interest)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season.lastMercatoGain])

  const handleReroll = () => {
    if (season.ballons < REROLL_COST) return
    season.addBallons(-REROLL_COST)
    setShopOffers(rollShopTactics(tacticsPool, season.ownedTactics, SHOP_OFFER_COUNT))
  }

  const handleBuy = (tactic: TacticRow) => {
    const canAfford = season.ballons >= tactic.prix && !season.ownedTactics.some((owned) => owned.id === tactic.id)
    season.buyTactic(tactic)
    if (canAfford) trophyTracking.recordTacticPurchase(tactic.nom)
  }

  const handleMatchFinished = (result: { won: boolean; score: number; handsLeft: number }) => {
    if (result.won) trophyTracking.recordMatchWon(season.matchKind, result.score)
    season.finishMatch(result)
  }

  const handleBallonsEarned = (amount: number) => {
    season.addBallons(amount)
    trophyTracking.recordBallons(amount)
  }

  const toast = <TrophyToast trophies={trophyTracking.recentlyUnlocked} onDismiss={trophyTracking.dismissUnlocked} />
  const trophiesButton = (
    <button type="button" className="sqx-trophies-button" onClick={() => setTrophiesOpen(true)}>
      {t('trophies.button', { unlocked: trophyTracking.unlockedIds.size, total: trophiesPool.length })}
    </button>
  )
  const trophiesOverlay = trophiesOpen && (
    <TrophiesScreen trophies={trophiesPool} unlockedIds={trophyTracking.unlockedIds} onClose={() => setTrophiesOpen(false)} />
  )
  const exitButton = (
    <button type="button" className="sqx-trophies-button" onClick={onExitMode}>
      {t('modeSelect.title')}
    </button>
  )

  if (season.phase === 'season-won') {
    return (
      <>
        {toast}
        {trophiesOverlay}
        <div className="sqx-season-end sqx-season-end--won">
          <h1>{t('season.won')}</h1>
          <p>
            {t('season.wonBody', {
              length: season.seasonLength,
              ballons: season.ballons,
              tactics: season.ownedTactics.length,
            })}
          </p>
          {!dailyMode && (
            <button type="button" className="sqx-button sqx-button--primary" onClick={season.startNewSeason}>
              {t('season.newSeason')}
            </button>
          )}
          {trophiesButton}
          {exitButton}
        </div>
      </>
    )
  }

  if (season.phase === 'season-lost') {
    return (
      <>
        {toast}
        {trophiesOverlay}
        <div className="sqx-season-end sqx-season-end--lost">
          <h1>{t('season.lost')}</h1>
          <p>
            {t('season.lostBody', {
              journee: season.journee,
              tactics: season.ownedTactics.length,
              ballons: season.ballons,
            })}
          </p>
          {!dailyMode && (
            <button type="button" className="sqx-button sqx-button--primary" onClick={season.startNewSeason}>
              {t('season.newSeason')}
            </button>
          )}
          {trophiesButton}
          {exitButton}
        </div>
      </>
    )
  }

  return (
    <div>
      {toast}
      {trophiesOverlay}
      <div className="sqx-season-header">
        {t('season.header', { journee: season.journee, length: season.seasonLength, ballons: season.ballons })}
        {trophiesButton}
        {exitButton}
      </div>

      {season.phase === 'match' && (
        <MatchScreen
          key={`${season.journee}-${season.matchIndex}`}
          deck={deck}
          seasonDeck={deck}
          handTypes={handTypes}
          target={season.target}
          matchKind={season.matchKind}
          grandRival={season.grandRival}
          groupField={groupField}
          rngSeed={rngSeedBase != null ? rngSeedBase + season.journee * 10 + season.matchIndex : undefined}
          ownedTactics={season.ownedTactics}
          onBallonsEarned={handleBallonsEarned}
          onHandPlayed={trophyTracking.recordHand}
          onFinished={handleMatchFinished}
        />
      )}

      {season.phase === 'mercato' && (
        <ShopScreen
          offers={shopOffers}
          ownedTactics={season.ownedTactics}
          ballons={season.ballons}
          rerollCost={REROLL_COST}
          lastGain={season.lastMercatoGain}
          onBuy={handleBuy}
          onReroll={handleReroll}
          onContinue={season.advanceToNextMatch}
        />
      )}
    </div>
  )
}
