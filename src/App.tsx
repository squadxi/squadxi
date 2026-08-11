import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useTranslation } from 'react-i18next'
import { supabase } from './lib/supabase'
import { fetchDeck, fetchChampionshipDeck, fetchHandTypes, fetchTactics, fetchTrophies, fetchIsPro } from './lib/data'
import type { PlayerCard, HandTypeRow, TacticRow, TrophyRow, GameMode } from './types'
import { SeasonRunner } from './components/SeasonRunner'
import { Auth } from './components/Auth'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { HomeScreen } from './components/HomeScreen'
import { LeaderboardScreen } from './components/LeaderboardScreen'
import { DailyChallengeFlow } from './components/DailyChallengeFlow'
import { DuelFlow } from './components/DuelFlow'

type Screen = 'home' | 'leaderboard'

export default function App() {
  const { t } = useTranslation()
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [deck, setDeck] = useState<PlayerCard[] | null>(null)
  const [handTypes, setHandTypes] = useState<HandTypeRow[] | null>(null)
  const [tactics, setTactics] = useState<TacticRow[] | null>(null)
  const [trophies, setTrophies] = useState<TrophyRow[] | null>(null)
  const [isPro, setIsPro] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<GameMode | null>(null)
  const [pendingMode, setPendingMode] = useState<GameMode | null>(null)
  const [championshipDeck, setChampionshipDeck] = useState<PlayerCard[] | null>(null)
  const [screen, setScreen] = useState<Screen>('home')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => subscription.subscription.unsubscribe()
  }, [])

  // Le deck standard est en lecture publique : on le charge des l'arrivee, meme sans compte,
  // pour pouvoir montrer la vitrine de legendes sur l'accueil.
  useEffect(() => {
    fetchDeck()
      .then(setDeck)
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    if (!session) return
    const pseudo = (session.user.user_metadata?.pseudo as string | undefined) || session.user.email!.split('@')[0]
    supabase
      .from('profiles')
      .upsert({ id: session.user.id, pseudo }, { onConflict: 'id', ignoreDuplicates: true })
      .then(({ error: profileError }) => {
        if (profileError) console.error('Erreur creation profil :', profileError.message)
      })
  }, [session])

  useEffect(() => {
    if (!session) return
    Promise.all([fetchHandTypes(), fetchTactics(), fetchTrophies(), fetchIsPro(session.user.id)])
      .then(([handTypesData, tacticsData, trophiesData, isProData]) => {
        setHandTypes(handTypesData)
        setTactics(tacticsData)
        setTrophies(trophiesData)
        setIsPro(isProData)
      })
      .catch((err) => setError(err.message))
  }, [session])

  useEffect(() => {
    if (mode?.type === 'championship' && mode.championnat) {
      setChampionshipDeck(null)
      fetchChampionshipDeck(mode.championnat)
        .then(setChampionshipDeck)
        .catch((err) => setError(err.message))
    }
  }, [mode])

  // Une fois connecte, on reprend automatiquement le mode que l'invite voulait lancer.
  useEffect(() => {
    if (session && pendingMode) {
      setMode(pendingMode)
      setPendingMode(null)
    }
  }, [session, pendingMode])

  const handleSelectMode = (selected: GameMode) => {
    if (!session) {
      setPendingMode(selected)
      return
    }
    setMode(selected)
  }

  if (authLoading) {
    return <p style={{ padding: 40 }}>{t('app.loading')}</p>
  }

  if (screen === 'leaderboard') {
    return <LeaderboardScreen onBack={() => setScreen('home')} />
  }

  if (!session) {
    if (pendingMode) {
      return (
        <div>
          <div style={{ maxWidth: 380, margin: '16px auto 0', padding: '0 16px' }}>
            <button
              type="button"
              onClick={() => setPendingMode(null)}
              style={{ fontSize: 12, background: 'none', border: 'none', color: 'var(--sqx-muted)', cursor: 'pointer' }}
            >
              ← {t('auth.backToMenu')}
            </button>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--sqx-muted)', fontSize: 13, maxWidth: 380, margin: '4px auto 0' }}>
            {t('auth.requiredForPlay')}
          </p>
          <Auth />
        </div>
      )
    }

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px' }}>
          <LanguageSwitcher />
        </div>
        <HomeScreen isPro={false} deck={deck} onSelect={handleSelectMode} onOpenLeaderboard={() => setScreen('leaderboard')} />
      </div>
    )
  }

  if (error) {
    return <p style={{ padding: 40, color: 'crimson' }}>{t('app.loadError', { message: error })}</p>
  }

  if (!deck || !handTypes || !tactics || !trophies) {
    return <p style={{ padding: 40 }}>{t('app.loadingDeck')}</p>
  }

  const pseudo = (session.user.user_metadata?.pseudo as string | undefined) || session.user.email!.split('@')[0]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, padding: '8px 16px' }}>
        <LanguageSwitcher />
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          style={{ fontSize: 12, background: 'none', border: 'none', color: 'var(--sqx-muted)', cursor: 'pointer' }}
        >
          {t('app.logout', { email: session.user.email })}
        </button>
      </div>

      {!mode ? (
        <HomeScreen isPro={isPro} deck={deck} onSelect={handleSelectMode} onOpenLeaderboard={() => setScreen('leaderboard')} />
      ) : mode.type === 'daily' ? (
        <DailyChallengeFlow
          userId={session.user.id}
          pseudo={pseudo}
          deck={deck}
          handTypes={handTypes}
          tacticsPool={tactics}
          trophiesPool={trophies}
          onExitMode={() => setMode(null)}
        />
      ) : mode.type === 'duel' ? (
        <DuelFlow
          userId={session.user.id}
          pseudo={pseudo}
          deck={deck}
          handTypes={handTypes}
          tacticsPool={tactics}
          trophiesPool={trophies}
          onExitMode={() => setMode(null)}
        />
      ) : mode.type === 'championship' ? (
        !championshipDeck ? (
          <p style={{ padding: 40 }}>{t('app.loadingDeck')}</p>
        ) : (
          <SeasonRunner
            key={mode.championnat}
            deck={championshipDeck}
            fullDeck={deck}
            handTypes={handTypes}
            tacticsPool={tactics}
            trophiesPool={trophies}
            userId={session.user.id}
            groupField="club"
            onExitMode={() => setMode(null)}
          />
        )
      ) : (
        <SeasonRunner
          key="club"
          deck={deck}
          fullDeck={deck}
          handTypes={handTypes}
          tacticsPool={tactics}
          trophiesPool={trophies}
          userId={session.user.id}
          groupField="championnat"
          onExitMode={() => setMode(null)}
        />
      )}
    </div>
  )
}
