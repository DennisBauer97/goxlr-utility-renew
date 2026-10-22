<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ bands: { frequency: number; gain: number }[]; label: string }>()

const W = 1000
const H = 240
const x = (f: number) => (Math.log10(f / 20) / 3) * W
const y = (g: number) => H / 2 - (g / 12) * (H / 2 - 20)

// Approximation of the summed bell filters on a log-frequency axis; good enough to show shape.
const gainAt = (f: number) =>
  props.bands.reduce((sum, b) => sum + b.gain * Math.exp(-(Math.log2(f / b.frequency) ** 2) / 0.9), 0)

const curve = computed(() => {
  const points: string[] = []
  for (let i = 0; i <= 200; i++) {
    const f = 20 * 1000 ** (i / 200)
    points.push(`${x(f).toFixed(1)} ${y(gainAt(f)).toFixed(1)}`)
  }
  return `M${points.join(' L')}`
})
const fill = computed(() => `${curve.value} L${W} ${H / 2} L0 ${H / 2} Z`)
const handles = computed(() =>
  props.bands.map((b) => ({ cx: x(b.frequency), cy: y(gainAt(b.frequency)) })),
)
const grid =
  [50, 100, 200, 500, 1000, 2000, 5000, 10000].map((f) => `M${x(f).toFixed(1)} 0V${H}`).join(' ') +
  ` M0 ${y(6)}H${W} M0 ${y(-6)}H${W}`
</script>

<template>
  <div class="curve">
    <div class="sweep" aria-hidden="true" />
    <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" role="img" :aria-label="label">
      <path :d="grid" stroke="#17171e" fill="none" vector-effect="non-scaling-stroke" />
      <path :d="`M0 ${H / 2}H${W}`" stroke="#2c2c37" fill="none" vector-effect="non-scaling-stroke" />
      <path :d="fill" fill="rgba(0,200,255,0.10)" />
      <path class="line" :d="curve" stroke="#00c8ff" stroke-width="3" fill="none" />
      <rect
        v-for="(h, i) in handles"
        :key="i"
        :x="h.cx - 5"
        :y="h.cy - 5"
        width="10"
        height="10"
        fill="#f0f0f3"
        :transform="`rotate(45 ${h.cx} ${h.cy})`"
      />
    </svg>
  </div>
</template>

<style scoped>
.curve {
  position: relative;
  overflow: hidden;
  background: var(--well);
  border: 1px solid #1c1c24;
}
svg {
  display: block;
  width: 100%;
  height: 220px;
}
.line {
  filter: drop-shadow(0 0 6px rgba(0, 200, 255, 0.9));
  transition: d 0.2s ease;
}
rect {
  transition:
    x 0.2s ease,
    y 0.2s ease;
}
.sweep {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 10%;
  background: linear-gradient(90deg, transparent, rgba(0, 200, 255, 0.08), transparent);
  animation: scan 5s linear infinite;
  pointer-events: none;
}
</style>
