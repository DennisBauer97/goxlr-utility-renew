import { useI18n } from 'vue-i18n'
import { words } from '@/api/format'

/**
 * Translated labels for daemon enum variants. Keys live under `enum.<Group>.<Variant>`;
 * a missing translation falls back to the variant name split into words.
 */
export function useLabels() {
  const { t, te } = useI18n()

  const label = (group: string, variant: string) => {
    const key = `enum.${group}.${variant}`
    return te(key) ? t(key) : words(variant)
  }

  const options = <T extends string>(group: string, variants: readonly T[], format?: (v: T) => string) =>
    variants.map((value) => ({ value, label: format ? format(value) : label(group, value) }))

  return { label, options }
}
