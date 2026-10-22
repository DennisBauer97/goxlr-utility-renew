<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { throttle } from '@/composables/throttle'

const props = withDefaults(
  defineProps<{
    label: string
    value: number
    min?: number
    max?: number
    step?: number
    color: string
    /** Dims the LEDs, e.g. while the channel is muted. */
    dimmed?: boolean
    segments?: number
    format?: (value: number) => string
    compact?: boolean
  }>(),
  { min: 0, max: 255, step: 1, dimmed: false, segments: 24, format: undefined, compact: false },
)

const emit = defineEmits<{ update: [value: number] }>()

const local = ref(props.value)
const dragging = ref(false)
const ladder = ref<HTMLElement | null>(null)

watch(
  () => props.value,
  (value) => {
    if (!dragging.value) local.value = value
  },
)

const send = throttle((value: number) => emit('update', value), 60)
const ratio = computed(() => (local.value - props.min) / (props.max - props.min))
const lit = computed(() => Math.round(ratio.value * props.segments))
const display = computed(() => (props.format ? props.format(local.value) : String(local.value)))

function set(value: number, final = false) {
  const clamped = Math.min(props.max, Math.max(props.min, Math.round(value / props.step) * props.step))
  if (clamped === local.value && !final) return
  local.value = clamped
  if (final) emit('update', clamped)
  else send(clamped)
}

function fromPointer(event: PointerEvent) {
  const rect = ladder.value!.getBoundingClientRect()
  const r = 1 - (event.clientY - rect.top) / rect.height
  set(props.min + Math.min(1, Math.max(0, r)) * (props.max - props.min))
}

function onDown(event: PointerEvent) {
  dragging.value = true
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  fromPointer(event)
}

function onMove(event: PointerEvent) {
  if (dragging.value) fromPointer(event)
}

function onUp() {
  if (!dragging.value) return
  dragging.value = false
  emit('update', local.value)
}

function onKey(event: KeyboardEvent) {
  const range = props.max - props.min
  const small = Math.max(props.step, range / 100)
  const big = range / 10
  const moves: Record<string, number> = {
    ArrowUp: small,
    ArrowRight: small,
    ArrowDown: -small,
    ArrowLeft: -small,
    PageUp: big,
    PageDown: -big,
  }
  if (event.key in moves) set(local.value + moves[event.key], true)
  else if (event.key === 'Home') set(props.min, true)
  else if (event.key === 'End') set(props.max, true)
  else return
  event.preventDefault()
}

function onWheel(event: WheelEvent) {
  event.preventDefault()
  set(local.value + (event.deltaY < 0 ? 1 : -1) * Math.max(props.step, (props.max - props.min) / 100), true)
}
</script>

<template>
  <div class="fader" :class="{ compact }">
    <div
      ref="ladder"
      class="ladder"
      role="slider"
      tabindex="0"
      :aria-label="label"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="local"
      :aria-valuetext="display"
      aria-orientation="vertical"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @keydown="onKey"
      @wheel="onWheel"
    >
      <span
        v-for="i in segments"
        :key="i"
        class="seg"
        :style="
          i <= lit
            ? { background: dimmed ? 'var(--off)' : color, boxShadow: dimmed ? 'none' : `0 0 6px ${color}` }
            : undefined
        "
      />
      <span class="cap num" :style="{ bottom: `calc(${ratio * 100}% - ${compact ? 11 : 15}px)` }">{{ display }}</span>
    </div>
  </div>
</template>

<style scoped>
.fader {
  --h: 290px;
  --w: 46px;
  display: flex;
  justify-content: center;
  padding: 0 14px;
}
.compact {
  --h: 140px;
  --w: 30px;
  padding: 0 10px;
}
.ladder {
  position: relative;
  display: flex;
  flex-direction: column-reverse;
  gap: 3px;
  width: var(--w);
  height: var(--h);
  padding: 6px;
  background: var(--well);
  border: 1px solid #1c1c24;
  touch-action: none;
  cursor: ns-resize;
  user-select: none;
}
.seg {
  flex: 1;
  min-height: 2px;
  background: #16161c;
  transform: skewX(-20deg);
  transition: background-color 0.12s, box-shadow 0.12s;
}
.cap {
  position: absolute;
  left: -12px;
  right: -12px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--text);
  color: var(--bg);
  font-weight: 700;
  font-size: 15px;
  clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.6);
  pointer-events: none;
}
.compact .cap {
  height: 22px;
  left: -10px;
  right: -10px;
  font-size: 12px;
}
.ladder:focus-visible .cap {
  background: var(--accent);
}
</style>
