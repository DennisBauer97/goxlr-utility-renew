<script setup lang="ts" generic="T extends string">
import { ref, useId } from 'vue'

const props = defineProps<{ label: string; value: T; tabs: readonly { value: T; label: string }[] }>()
const emit = defineEmits<{ update: [value: T] }>()
const id = useId()
const buttons = ref<HTMLButtonElement[]>([])

function onKey(event: KeyboardEvent, index: number) {
  const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
  if (!step) return
  event.preventDefault()
  const next = (index + step + props.tabs.length) % props.tabs.length
  emit('update', props.tabs[next].value)
  buttons.value[next]?.focus()
}
</script>

<template>
  <div>
    <div class="tablist" role="tablist" :aria-label="label">
      <button
        v-for="(tab, index) in tabs"
        :id="`${id}-${tab.value}`"
        :key="tab.value"
        ref="buttons"
        type="button"
        role="tab"
        class="tab"
        :aria-selected="tab.value === value"
        :aria-controls="`${id}-panel`"
        :tabindex="tab.value === value ? 0 : -1"
        @click="emit('update', tab.value)"
        @keydown="onKey($event, index)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div :id="`${id}-panel`" role="tabpanel" :aria-labelledby="`${id}-${value}`" class="panel">
      <Transition name="fade" mode="out-in">
        <div :key="value"><slot /></div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.tablist {
  display: flex;
  overflow-x: auto;
  border-bottom: 1px solid var(--line);
  margin: -6px -22px 0;
  padding: 0 12px;
  scrollbar-width: none;
}
.tab {
  position: relative;
  min-height: 48px;
  padding: 0 16px;
  border: 0;
  background: transparent;
  white-space: nowrap;
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  transition: color 0.2s;
}
.tab:hover,
.tab[aria-selected='true'] {
  color: var(--text);
}
.tab::after {
  content: '';
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 0;
  height: 3px;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
  transform: skewX(-30deg) scaleX(0);
  transition: transform 0.25s var(--ease-out);
}
.tab[aria-selected='true']::after {
  transform: skewX(-30deg) scaleX(1);
}
.panel {
  padding-top: 18px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
