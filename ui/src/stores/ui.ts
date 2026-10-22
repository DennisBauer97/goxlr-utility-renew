import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const KEY = 'goxlr.ui'

export const ACCENTS = ['#ff1f4b', '#00c8ff', '#a259ff', '#2bff88', '#ffb000'] as const

interface Stored {
  accent?: string
  calm?: boolean
}

function load(): Stored {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Stored
  } catch {
    return {}
  }
}

/** Per-browser UI preferences. These never reach the daemon. */
export const useUi = defineStore('ui', () => {
  const stored = load()
  const accent = ref(stored.accent ?? ACCENTS[0])
  const calm = ref(stored.calm ?? false)

  watch(
    [accent, calm],
    () => {
      document.documentElement.style.setProperty('--accent', accent.value)
      document.documentElement.classList.toggle('calm', calm.value)
      try {
        localStorage.setItem(KEY, JSON.stringify({ accent: accent.value, calm: calm.value }))
      } catch {
        // Not persisted, but still applied for this session.
      }
    },
    { immediate: true },
  )

  return { accent, calm }
})
