import type { VersionNumber } from './types'

/** Channel volumes are 0–255 on the wire. */
export const toPercent = (volume: number) => Math.round((volume / 255) * 100)
export const fromPercent = (percent: number) => Math.round((percent / 100) * 255)

export function signed(value: number, digits = 0): string {
  const text = Math.abs(value).toFixed(digits)
  if (value > 0) return `+${text}`
  if (value < 0) return `−${text}`
  return text
}

export const dB = (value: number) => `${signed(value)} dB`

/** `Gate250ms` / `Comp15ms` → `250 ms`, `Gate1500ms` → `1.5 s` */
export function duration(variant: string): string {
  const ms = Number(variant.replace(/\D/g, ''))
  return ms >= 1000 ? `${(ms / 1000).toLocaleString()} s` : `${ms} ms`
}

/** `Ratio3_2` → `3.2 : 1` */
export const ratio = (variant: string) => `${variant.slice(5).replace('_', '.')} : 1`

/** `Equalizer1KHz` → `1 kHz` */
export const eqBand = (variant: string) =>
  variant.replace('Equalizer', '').replace('KHz', ' kHz').replace(/(\d)Hz/, '$1 Hz')

export function frequency(hz: number): string {
  return hz >= 1000 ? `${(hz / 1000).toFixed(hz >= 10000 ? 1 : 2).replace(/\.?0+$/, '')} kHz` : `${Math.round(hz)} Hz`
}

export function version(v: VersionNumber | null | undefined): string {
  if (!v) return '–'
  return v.filter((part) => part !== null).join('.')
}

/** The daemon uses `RRGGBB`, colour inputs use `#rrggbb`. */
export const toCss = (colour: string | undefined) => `#${(colour ?? '000000').toLowerCase()}`
export const fromCss = (colour: string) => colour.replace('#', '').toUpperCase()

/** Splits PascalCase variant names for display when no translation exists. */
export const words = (variant: string) => variant.replace(/([a-z0-9])([A-Z])/g, '$1 $2')

export const volumeText = (volume: number) => String(toPercent(volume))
