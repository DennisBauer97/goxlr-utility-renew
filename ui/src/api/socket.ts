import type { DaemonRequest, DaemonResponse, JsonPatchOperation, WebsocketResponse } from './types'

/** The daemon tags broadcast patches with `u64::MAX`, which JSON.parse rounds to this. */
const BROADCAST_ID = Number.MAX_SAFE_INTEGER

export type ConnectionState = 'connecting' | 'open' | 'closed'

interface Pending {
  resolve: (response: DaemonResponse) => void
  reject: (error: Error) => void
}

export interface SocketHandlers {
  onState: (state: ConnectionState) => void
  onPatch: (patch: JsonPatchOperation[]) => void
  onOpen: () => void
}

/**
 * WebSocket client for `/api/websocket`. Requests are matched to responses by id,
 * patches are forwarded, and the connection is re-established with exponential backoff.
 */
export class DaemonSocket {
  private socket: WebSocket | null = null
  private nextId = 0
  private pending = new Map<number, Pending>()
  private retry = 0
  private stopped = false
  private timer: ReturnType<typeof setTimeout> | undefined

  constructor(
    private readonly url: string,
    private readonly handlers: SocketHandlers,
  ) {}

  connect() {
    this.stopped = false
    this.handlers.onState('connecting')
    const socket = new WebSocket(this.url)
    this.socket = socket

    socket.onopen = () => {
      this.retry = 0
      this.handlers.onState('open')
      this.handlers.onOpen()
    }
    socket.onmessage = (event) => this.receive(String(event.data))
    socket.onclose = () => {
      this.socket = null
      this.failPending('Connection to the GoXLR Utility was lost')
      this.handlers.onState('closed')
      if (!this.stopped) {
        const delay = Math.min(10_000, 500 * 2 ** this.retry++)
        this.timer = setTimeout(() => this.connect(), delay)
      }
    }
  }

  close() {
    this.stopped = true
    clearTimeout(this.timer)
    this.socket?.close()
  }

  send(data: DaemonRequest): Promise<DaemonResponse> {
    const socket = this.socket
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('Not connected to the GoXLR Utility'))
    }
    const id = this.nextId++
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      socket.send(JSON.stringify({ id, data }))
    })
  }

  /** Exposed for tests. */
  receive(raw: string) {
    let message: WebsocketResponse
    try {
      message = JSON.parse(raw)
    } catch {
      return
    }
    const data = message.data
    if (message.id >= BROADCAST_ID) {
      if (typeof data === 'object' && 'Patch' in data) this.handlers.onPatch(data.Patch)
      return
    }
    const pending = this.pending.get(message.id)
    if (!pending) return
    this.pending.delete(message.id)
    if (typeof data === 'object' && 'Error' in data) pending.reject(new Error(data.Error))
    else pending.resolve(data)
  }

  private failPending(reason: string) {
    for (const { reject } of this.pending.values()) reject(new Error(reason))
    this.pending.clear()
  }
}

export function websocketUrl(location: Location = window.location): string {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${location.host}/api/websocket`
}
