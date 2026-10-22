import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { applyPatch } from 'fast-json-patch'
import { DaemonSocket, websocketUrl, type ConnectionState } from '@/api/socket'
import { commandRequest, daemonRequest } from '@/api/commands'
import type {
  DaemonCommand,
  DaemonRequest,
  DaemonResponse,
  DaemonStatus,
  GoXLRCommand,
  MixerStatus,
} from '@/api/types'
import { useToasts } from './toasts'

const SERIAL_KEY = 'goxlr.serial'

function readStoredSerial(): string | null {
  try {
    return localStorage.getItem(SERIAL_KEY)
  } catch {
    return null
  }
}

export const useDaemon = defineStore('daemon', () => {
  const status = ref<DaemonStatus | null>(null)
  const connection = ref<ConnectionState>('connecting')
  const preferredSerial = ref<string | null>(readStoredSerial())
  const toasts = useToasts()

  const serials = computed(() => Object.keys(status.value?.mixers ?? {}).sort())
  const serial = computed(() => {
    const available = serials.value
    if (preferredSerial.value && available.includes(preferredSerial.value)) return preferredSerial.value
    return available[0] ?? null
  })
  const mixer = computed<MixerStatus | null>(() =>
    serial.value ? (status.value?.mixers[serial.value] ?? null) : null,
  )
  const isMini = computed(() => mixer.value?.hardware.device_type === 'Mini')

  const socket = new DaemonSocket(websocketUrl(), {
    onState: (state) => (connection.value = state),
    onOpen: () => void refresh(),
    onPatch: (patch) => {
      if (!status.value) return
      try {
        applyPatch(status.value, patch, false, true)
      } catch {
        // A patch that doesn't apply means we've drifted, so fetch a fresh copy.
        void refresh()
      }
    },
  })

  function connect() {
    socket.connect()
  }

  async function refresh() {
    const response = await request('GetStatus')
    if (response && typeof response === 'object' && 'Status' in response) {
      status.value = response.Status
    }
  }

  async function request(data: DaemonRequest): Promise<DaemonResponse | undefined> {
    try {
      return await socket.send(data)
    } catch (error) {
      toasts.push((error as Error).message)
      return undefined
    }
  }

  function selectDevice(next: string) {
    preferredSerial.value = next
    try {
      localStorage.setItem(SERIAL_KEY, next)
    } catch {
      // Storage may be unavailable (private mode); the selection still applies for this session.
    }
  }

  /** Sends a command to the selected mixer. State changes come back as patches. */
  async function command(cmd: GoXLRCommand) {
    if (!serial.value) return
    await request(commandRequest(serial.value, cmd))
  }

  async function daemonCommand(cmd: DaemonCommand) {
    await request(daemonRequest(cmd))
  }

  async function micLevel(): Promise<number | null> {
    if (!serial.value || connection.value !== 'open') return null
    try {
      const response = await socket.send({ GetMicLevel: serial.value })
      return typeof response === 'object' && 'MicLevel' in response ? response.MicLevel : null
    } catch {
      return null
    }
  }

  return {
    status,
    connection,
    serials,
    serial,
    mixer,
    isMini,
    connect,
    refresh,
    request,
    selectDevice,
    command,
    daemonCommand,
    micLevel,
  }
})
