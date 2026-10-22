import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: number
  kind: 'error' | 'info'
  message: string
}

export const useToasts = defineStore('toasts', () => {
  const toasts = ref<Toast[]>([])
  let nextId = 0

  function push(message: string, kind: Toast['kind'] = 'error') {
    const id = nextId++
    toasts.value.push({ id, kind, message })
    setTimeout(() => dismiss(id), kind === 'error' ? 6000 : 3000)
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  return { toasts, push, dismiss }
})
