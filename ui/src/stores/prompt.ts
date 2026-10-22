import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface PromptOptions {
  title: string
  message?: string
  /** When set, the dialog asks for text input with this label. */
  input?: string
  initial?: string
  confirm: string
  danger?: boolean
}

interface ActivePrompt extends PromptOptions {
  resolve: (value: string | null) => void
}

/** A single app-wide modal for confirmations and name prompts. */
export const usePrompt = defineStore('prompt', () => {
  const active = ref<ActivePrompt | null>(null)

  /** Resolves with the entered text (or `''` for confirmations), or `null` when cancelled. */
  function ask(options: PromptOptions): Promise<string | null> {
    active.value?.resolve(null)
    return new Promise((resolve) => {
      active.value = { ...options, resolve }
    })
  }

  function close(value: string | null) {
    active.value?.resolve(value)
    active.value = null
  }

  return { active, ask, close }
})
