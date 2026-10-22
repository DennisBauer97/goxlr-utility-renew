import { describe, expect, it } from 'vitest'
import { duration, eqBand, fromCss, fromPercent, ratio, signed, toCss, toPercent, version } from '../src/api/format'

describe('format', () => {
  it('converts volumes between 0–255 and percent', () => {
    expect(toPercent(255)).toBe(100)
    expect(toPercent(0)).toBe(0)
    expect(fromPercent(50)).toBe(128)
  })

  it('formats enum variants', () => {
    expect(duration('Gate250ms')).toBe('250 ms')
    expect(duration('Comp0ms')).toBe('0 ms')
    expect(ratio('Ratio3_2')).toBe('3.2 : 1')
    expect(eqBand('Equalizer1KHz')).toBe('1 kHz')
    expect(eqBand('Equalizer31Hz')).toBe('31 Hz')
  })

  it('formats signed values with a real minus sign', () => {
    expect(signed(-3)).toBe('−3')
    expect(signed(4)).toBe('+4')
    expect(signed(0)).toBe('0')
  })

  it('converts colours', () => {
    expect(toCss('00FFAA')).toBe('#00ffaa')
    expect(fromCss('#00ffaa')).toBe('00FFAA')
  })

  it('formats version numbers', () => {
    expect(version([1, 5, 4, null])).toBe('1.5.4')
    expect(version([1, 2, 3, 4])).toBe('1.2.3.4')
  })
})
