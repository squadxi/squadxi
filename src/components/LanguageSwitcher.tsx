import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../i18n'

const LANGUAGE_LABELS: Record<string, string> = {
  fr: 'Francais',
  en: 'English',
  es: 'Espanol',
  pt: 'Portugues',
  it: 'Italiano',
  de: 'Deutsch',
}

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  return (
    <label style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ color: '#888' }}>{t('language.label')}</span>
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        style={{ fontSize: 12, padding: '2px 4px' }}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {LANGUAGE_LABELS[lang]}
          </option>
        ))}
      </select>
    </label>
  )
}
