import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './locales/fr'
import en from './locales/en'
import es from './locales/es'
import pt from './locales/pt'
import it from './locales/it'
import de from './locales/de'

export const SUPPORTED_LANGUAGES = ['fr', 'en', 'es', 'pt', 'it', 'de'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

const STORAGE_KEY = 'squadxi-lang'

function detectLanguage(): SupportedLanguage {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)) return stored as SupportedLanguage

  const browserLang = navigator.language.slice(0, 2)
  if ((SUPPORTED_LANGUAGES as readonly string[]).includes(browserLang)) return browserLang as SupportedLanguage

  return 'fr'
}

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
    es: { translation: es },
    pt: { translation: pt },
    it: { translation: it },
    de: { translation: de },
  },
  lng: detectLanguage(),
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng)
})

export default i18n
