<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { throttle } from '@/composables/throttle'

const props = withDefaults(
  defineProps<{
    label: string
    value: number
    min: number
    max: number
    step?: number
    color: string
    format?: (value: number) => string
  }>(),
  { step: 1, format: undefined },
)

const emit = defineEmits<{ update: [value: number] }>()

const C = 84
const local = ref(props.value)
const drag = ref<{ y: number; start: number } | null>(null)

watch(
  () => props.value,
  (value) => {
    if (!drag.value) local.value = value
  },
)

const send = throttle((value: number) => emit('update', value), 60)

const point = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return `${(C + r * Math.cos(a)).toFixed(1)} ${(C + r * Math.sin(a)).toFixed(1)}`
}
const arc = (r: number, from: number, to: number) =>
  `M${point(r, from)} A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${point(r, to)}`

const angle = computed(() => 135 + 270 * ((local.value - props.min) / (props.max - props.min)))
const track = arc(66, 135, 405)
const valueArc = computed(() => (angle.value - 135 < 0.5 ? '' : arc(66, 135, angle.value)))
const pointer = computed(() => `M${point(30, angle.value)} L${point(44, angle.value)}`)
const octagon = Array.from({ length: 8 }, (_, i) => point(46, i * 45 + 22.5).replace(' ', ',')).join(' ')
const display = computed(() => (props.format ? props.format(local.value) : String(local.value)))

function set(value: number, final = false) {
  const clamped = Math.min(props.max, Math.max(props.min, Math.round(value / props.step) * props.step))
  local.value = clamped
  if (final) emit('update', clamped)
  else send(clamped)
}

function onDown(event: PointerEvent) {
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  drag.value = { y: event.clientY, start: local.value }
}
function onMove(event: PointerEvent) {
  if (!drag.value) return
  const delta = ((drag.value.y - event.clientY) / 200) * (props.max - props.min)
  set(drag.value.start + delta)
}
function onUp() {
  if (!drag.value) return
  drag.value = null
  emit('update', local.value)
}
function onKey(event: KeyboardEvent) {
  const small = Math.max(props.step, (props.max - props.min) / 100)
  const big = (props.max - props.min) / 10
  const moves: Record<string, number> = { ArrowUp: small, ArrowRight: small, ArrowDown: -small, ArrowLeft: -small, PageUp: big, PageDown: -big }
  if (event.key in moves) set(local.value + moves[event.key], true)
  else if (event.key === 'Home') set(props.min, true)
  else if (event.key === 'End') set(props.max, true)
  else return
  event.preventDefault()
}
function onWheel(event: WheelEvent) {
  event.preventDefault()
  set(local.value + (event.deltaY < 0 ? 1 : -1) * Math.max(props.step, (props.max - props.min) / 50), true)
}
</script>

<template>
  <div
    class="knob"
    role="slider"
    tabindex="0"
    :aria-label="label"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuenow="local"
    :aria-valuetext="display"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
    @keydown="onKey"
    @wheel="onWheel"
  >
    <svg width="168" height="168" viewBox="0 0 168 168" aria-hidden="true">
      <circle class="orbit" cx="84" cy="84" r="80" fill="none" stroke="#24242d" stroke-width="1" stroke-dasharray="2 8" />
      <path :d="track" fill="none" stroke="#1f1f27" stroke-width="7" />
      <path :d="valueArc" fill="none" :stroke="color" stroke-width="7" :style="{ filter: `drop-shadow(0 0 6px ${color})` }" />
      <polygon :points="octagon" fill="#1a1a21" stroke="#2c2c37" />
      <path :d="pointer" :stroke="color" stroke-width="3" />
      <text x="84" y="92" text-anchor="middle" fill="#f0f0f3" class="value">{{ display }}</text>
    </svg>
  </div>
</template>

<style scoped>
.knob {
  display: inline-flex;
  border-radius: 50%;
  touch-action: none;
  cursor: ns-resize;
  user-select: none;
}
.orbit {
  transform-origin: 84px 84px;
  animation: spin 14s linear infinite;
}
.value {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 700;
  font-size: 22px;
}
</style>
