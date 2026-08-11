import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { LanguageSwitcher } from './LanguageSwitcher'
import './Auth.css'

type Mode = 'login' | 'signup'

export function Auth() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { pseudo: pseudo || email.split('@')[0] } },
        })
        if (signUpError) throw signUpError

        // Si la confirmation email est requise, il n'y a pas encore de session : la
        // ligne profiles sera creee au premier login confirme (voir App.tsx ensureProfile).
        if (data.session && data.user) {
          await supabase.from('profiles').upsert({ id: data.user.id, pseudo: pseudo || email.split('@')[0] })
        }

        if (!data.session) {
          setInfo(t('auth.signupInfo'))
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="sqx-auth">
      <div className="sqx-auth__lang">
        <LanguageSwitcher />
      </div>
      <h1 className="sqx-auth__title">{t('auth.title')}</h1>
      <form className="sqx-auth__form" onSubmit={handleSubmit}>
        <label>
          {t('auth.email')}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        {mode === 'signup' && (
          <label>
            {t('auth.pseudo')}
            <input
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder={t('auth.pseudoOptional')}
            />
          </label>
        )}
        <label>
          {t('auth.password')}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>

        {error && <p className="sqx-auth__error">{error}</p>}
        {info && <p className="sqx-auth__info">{info}</p>}

        <button type="submit" className="sqx-button sqx-button--primary" disabled={loading}>
          {mode === 'signup' ? t('auth.signup') : t('auth.login')}
        </button>
      </form>

      <div className="sqx-auth__oauth">
        <button type="button" className="sqx-button" disabled title={t('auth.oauthDisabledTitle', { provider: 'Google' })}>
          {t('auth.googleOAuth')}
        </button>
        <button type="button" className="sqx-button" disabled title={t('auth.oauthDisabledTitle', { provider: 'Apple' })}>
          {t('auth.appleOAuth')}
        </button>
      </div>

      <button type="button" className="sqx-auth__switch" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
        {mode === 'login' ? t('auth.switchToSignup') : t('auth.switchToLogin')}
      </button>
    </div>
  )
}
