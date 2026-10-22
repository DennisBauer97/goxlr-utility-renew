import { createI18n } from 'vue-i18n'
import en from './en'
import de from './de'

/** Maps a daemon locale such as `de-DE` or `en_GB` to one of the bundled languages. */
export function resolveLocale(locale: string | null | undefined): 'de' | 'en' {
  return locale?.toLowerCase().startsWith('de') ? 'de' : 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: resolveLocale(navigator.language),
  fallbackLocale: 'en',
  messages: { en, de },
})
