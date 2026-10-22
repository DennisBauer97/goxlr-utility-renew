import { describe, expect, it, vi } from 'vitest'
import { DaemonSocket } from '../src/api/socket'

function connected() {
  const handlers = { onState: vi.fn(), onPatch: vi.fn(), onOpen: vi.fn() }
  const client = new DaemonSocket('ws://test', handlers)
  const sent: string[] = []
  // Stand-in for an open WebSocket.
  ;(client as unknown as { socket: unknown }).socket = { readyState: 1, send: (s: string) => sent.push(s) }
  return { client, handlers, sent }
}

describe('DaemonSocket', () => {
  it('matches responses to requests by id', async () => {
    const { client, sent } = connected()
    const first = client.send('Ping')
    const second = client.send('GetStatus')
    const [a, b] = sent.map((s) => JSON.parse(s))
    expect(a).toEqual({ id: 0, data: 'Ping' })
    client.receive(JSON.stringify({ id: b.id, data: { MicLevel: -20 } }))
    client.receive(JSON.stringify({ id: a.id, data: 'Ok' }))
    await expect(first).resolves.toBe('Ok')
    await expect(second).resolves.toEqual({ MicLevel: -20 })
  })

  it('rejects with the daemon error message', async () => {
    const { client } = connected()
    const pending = client.send('Ping')
    client.receive(JSON.stringify({ id: 0, data: { Error: 'Sample Not Found' } }))
    await expect(pending).rejects.toThrow('Sample Not Found')
  })

  it('forwards broadcast patches (id u64::MAX)', () => {
    const { client, handlers } = connected()
    const patch = [{ op: 'replace', path: '/mixers/S1/profile_name', value: 'X' }]
    client.receive(`{"id":18446744073709551615,"data":{"Patch":${JSON.stringify(patch)}}}`)
    expect(handlers.onPatch).toHaveBeenCalledWith(patch)
  })

  it('refuses to send while disconnected', async () => {
    const client = new DaemonSocket('ws://test', { onState: vi.fn(), onPatch: vi.fn(), onOpen: vi.fn() })
    await expect(client.send('Ping')).rejects.toThrow()
  })
})
