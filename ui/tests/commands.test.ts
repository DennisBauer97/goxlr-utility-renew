import { describe, expect, it } from 'vitest'
import { commandRequest, daemon, daemonRequest, goxlr } from '../src/api/commands'

// Expected shapes are serde's externally-tagged encoding of the Rust enums in ipc/src/lib.rs.
describe('command serialisation', () => {
  it('encodes multi-field tuple variants as arrays', () => {
    expect(goxlr('SetVolume', 'Mic', 200)).toEqual({ SetVolume: ['Mic', 200] })
    expect(goxlr('SetRouter', 'Microphone', 'Headphones', true)).toEqual({
      SetRouter: ['Microphone', 'Headphones', true],
    })
  })

  it('encodes single-field variants as the bare value', () => {
    expect(goxlr('SetFXEnabled', false)).toEqual({ SetFXEnabled: false })
    expect(goxlr('SetScribbleIcon', 'A', null)).toEqual({ SetScribbleIcon: ['A', null] })
  })

  it('encodes empty tuple variants as an empty array', () => {
    expect(goxlr('SaveProfile')).toEqual({ SaveProfile: [] })
  })

  it('encodes daemon unit variants as strings', () => {
    expect(daemon('StopDaemon')).toBe('StopDaemon')
    expect(daemon('SetLocale', null)).toEqual({ SetLocale: null })
    expect(daemonRequest(daemon('OpenPath', 'Profiles'))).toEqual({ Daemon: { OpenPath: 'Profiles' } })
  })

  it('wraps commands with the serial', () => {
    expect(commandRequest('S123', goxlr('SetGateActive', true))).toEqual({
      Command: ['S123', { SetGateActive: true }],
    })
  })
})
