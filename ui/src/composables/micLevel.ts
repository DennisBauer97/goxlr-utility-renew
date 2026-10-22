import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { useDaemon } from '@/stores/daemon'

/** Polls the microphone level (dB, −72…0) while `active` is true. */
export function useMicLevel(active: Ref<boolean>, interval = 80) {
  const daemon = useDaemon()
  const level = ref<number | null>(null)
  const peak = ref(-72)
  let timer: ReturnType<typeof setTimeout> | undefined
  let running = false

  async function tick() {
    if (!running) return
    const value = await daemon.micLevel()
    if (value !== null) {
      level.value = value
      peak.value = value > peak.value ? value : Math.max(value, peak.value - 0.8)
    }
    timer = setTimeout(tick, interval)
  }

  watch(
    active,
    (on) => {
      running = on
      clearTimeout(timer)
      if (on) void tick()
      else level.value = null
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    running = false
    clearTimeout(timer)
  })

  return { level, peak }
}
