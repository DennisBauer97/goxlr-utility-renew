<script setup lang="ts" generic="T extends string">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    value: T
    options: readonly { value: T; label: string }[]
    small?: boolean
  }>(),
  { small: false },
)

const emit = defineEmits<{ update: [value: T] }>()
const buttons = ref<HTMLButtonElement[]>([])

// Radio-group keyboard pattern: arrows move and select, Tab leaves the group.
function onKey(event: KeyboardEvent, index: number) {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
  if (!step) return
  event.preventDefault()
  const next = (index + step + props.options.length) % props.options.length
  emit('update', props.options[next].value)
  buttons.value[next]?.focus()
}
</script>

<template>
  <div class="seg" :class="{ small }" role="radiogroup" :aria-label="label">
    <button
      v-for="(option, index) in options"
      :key="option.value"
      ref="buttons"
      type="button"
      role="radio"
      class="hover-lift"
      :aria-checked="option.value === value"
      :tabindex="option.value === value ? 0 : -1"
      @click="emit('update', option.value)"
      @keydown="onKey($event, index)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.seg {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
}
button {
  --chamfer: 10px;
  min-height: 38px;
  padding: 0 18px;
  border: 0;
  background: var(--raised);
  color: var(--muted);
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  clip-path: polygon(var(--chamfer) 0, 100% 0, calc(100% - var(--chamfer)) 100%, 0 100%);
}
.small button {
  --chamfer: 7px;
  min-height: 32px;
  padding: 0 13px;
  font-size: 13px;
}
button[aria-checked='true'] {
  background: var(--accent);
  color: var(--on-accent);
  box-shadow: 0 0 18px var(--accent);
}
button:hover {
  color: var(--text);
}
button[aria-checked='true']:hover {
  color: var(--on-accent);
}
</style>
