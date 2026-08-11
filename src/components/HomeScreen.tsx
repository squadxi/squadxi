import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { GameMode, PlayerCard } from '../types'
import { CHAMPIONNAT_COLORS, CHAMPIONNAT_FLAGS } from '../lib/colors'
import { flagFor } from '../lib/flags'
import { PlayerIllustration } from './PlayerIllustration'
import './HomeScreen.css'

const STANDARD_CHAMPIONNATS = ['Premier League', 'Liga', 'Serie A', 'Bundesliga']
const CHAMPIONSHIP_LEAGUES = ['Premier League', 'Liga', 'Serie A', 'Bundesliga', 'Ligue 1']

interface HomeScreenProps {
  isPro: boolean
  deck: PlayerCard[] | null
  onSelect: (mode: GameMode) => void
  onOpenLeaderboard: () => void
}

export function HomeScreen({ isPro, deck, onSelect, onOpenLeaderboard }: HomeScreenProps) {
  const { t } = useTranslation()

  const featured = useMemo(() => {
    if (!deck) return []
    return deck.filter((c) => c.note === 14 || c.note === 13).sort((a, b) => b.note - a.note)
  }, [deck])

  return (
    <div className="sqx-home">
      <section className="sqx-hero">
        <div className="sqx-hero__crest">XI</div>
        <div className="sqx-eyebrow">{t('home.eyebrow')}</div>
        <h1 className="sqx-hero__title">SquadXI</h1>
        <p className="sqx-hero__tagline">{t('home.tagline')}</p>

        <div className="sqx-hero__cta-row">
          <button type="button" className="sqx-button sqx-button--primary sqx-button--lg" onClick={() => onSelect({ type: 'club' })}>
            {t('home.play')}
          </button>
          <button type="button" className="sqx-button" onClick={onOpenLeaderboard}>
            {t('home.leaderboard')}
          </button>
          <button type="button" className="sqx-button" disabled={!isPro} onClick={() => onSelect({ type: 'daily' })}>
            {t('modeSelect.dailyMode')}
          </button>
          <button type="button" className="sqx-button" disabled={!isPro} onClick={() => onSelect({ type: 'duel' })}>
            {t('modeSelect.duelMode')}
          </button>
        </div>
      </section>

      <section className="sqx-steps">
        <div className="sqx-step">
          <span className="sqx-step__num">1</span>
          <div>
            <strong>{t('home.step1Title')}</strong>
            <p>{t('home.step1Desc')}</p>
          </div>
        </div>
        <div className="sqx-step">
          <span className="sqx-step__num">2</span>
          <div>
            <strong>{t('home.step2Title')}</strong>
            <p>{t('home.step2Desc')}</p>
          </div>
        </div>
        <div className="sqx-step">
          <span className="sqx-step__num">3</span>
          <div>
            <strong>{t('home.step3Title')}</strong>
            <p>{t('home.step3Desc')}</p>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="sqx-featured">
          <h2>{t('home.featuredTitle')}</h2>
          <p className="sqx-eyebrow">{t('home.featuredSubtitle', { count: deck?.length ?? 52, leagues: 4 })}</p>
          <div className="sqx-pitch">
            {featured.map((card, index) => (
              <div
                key={card.id}
                className="sqx-pip"
                style={{ '--sqx-accent': CHAMPIONNAT_COLORS[card.championnat] ?? '#666', '--sqx-deal-delay': `${index * 60}ms` } as React.CSSProperties}
              >
                <PlayerIllustration card={card} jerseyColor={CHAMPIONNAT_COLORS[card.championnat] ?? '#666'} className="sqx-pip__illustration" />
                <span className="sqx-pip__nom">{card.nom}</span>
                <span className="sqx-pip__meta">
                  {flagFor(card.nationalite)} {card.championnat}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="sqx-editions">
        <h2>{t('home.editionsTitle')}</h2>
        <p className="sqx-eyebrow">{t('home.editionsSubtitle')}</p>
        <div className="sqx-editions-grid">
          {STANDARD_CHAMPIONNATS.map((champ) => (
            <div key={champ} className="sqx-edition-tile">
              <span className="sqx-edition-tile__flag">{CHAMPIONNAT_FLAGS[champ]}</span>
              <div className="sqx-edition-tile__info">
                <strong>{champ}</strong>
                <span>13 {t('leaderboardScreen.player').toLowerCase()}s</span>
              </div>
              <span className="sqx-edition-tile__check">✓</span>
            </div>
          ))}
        </div>

        <h3>
          {t('home.championshipTitle')} {!isPro && '🔒'}
        </h3>
        <div className="sqx-editions-grid">
          {CHAMPIONSHIP_LEAGUES.map((champ) => (
            <button
              key={champ}
              type="button"
              className={`sqx-edition-tile sqx-edition-tile--button${!isPro ? ' sqx-edition-tile--locked' : ''}`}
              disabled={!isPro}
              onClick={() => onSelect({ type: 'championship', championnat: champ })}
            >
              <span className="sqx-edition-tile__flag">{CHAMPIONNAT_FLAGS[champ]}</span>
              <div className="sqx-edition-tile__info">
                <strong>{champ}</strong>
                <span>4 clubs · 52 joueurs</span>
              </div>
              <span className="sqx-edition-tile__check">{isPro ? '✓' : '🔒'}</span>
            </button>
          ))}
        </div>
      </section>

      <footer className="sqx-home-footer">
        <p className="sqx-home-footer__tagline">{t('home.footerTagline')}</p>
        <p className="sqx-home-footer__disclaimer">{t('home.footerDisclaimer')}</p>
        <p className="sqx-home-footer__copyright">{t('home.footerCopyright', { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  )
}
