<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { throttle } from '@/composables/throttle'

const props = withDefaults(
  defineProps<{
    label: string
    value: number
    min?: number
    max?: number
    step?: number
    format?: (value: number) => string
    color?: string
    hideLabel?: boolean
    disabled?: boolean
  }>(),
  { min: 0, max: 100, step: 1, format: undefined, color: undefined, hideLabel: false, disabled: false },
)

const emit = defineEmits<{ update: [value: number] }>()

const id = useId()
const local = ref(props.value)
const dragging = ref(false)

watch(
  () => props.value,
  (value) => {
    if (!dragging.value) local.value = value
  },
)

const send = throttle((value: number) => emit('update', value), 60)

function onInput(event: Event) {
  dragging.value = true
  local.value = Number((event.target as HTMLInputElement).value)
  send(local.value)
}

function onChange() {
  dragging.value = false
  emit('update', local.value)
}

const fill = computed(() => `${((local.value - props.min) / (props.max - props.min)) * 100}%`)
const display = computed(() => (props.format ? props.format(local.value) : String(local.value)))
</script>

<template>
  <div class="slider" :class="{ bare: hideLabel }">
    <label :for="id" :class="{ 'sr-only': hideLabel }">{{ label }}</label>
    <input
      :id="id"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="local"
      :disabled="disabled"
      :aria-valuetext="display"
      :style="{ color, '--fill': fill }"
      @input="onInput"
      @change="onChange"
    />
    <output :for="id" class="num">{{ display }}</output>
  </div>
</template>

<style scoped>
.slider {
  display: grid;
  grid-template-columns: minmax(84px, 120px) minmax(0, 1fr) 76px;
  align-items: center;
  gap: 14px;
  min-height: 44px;
}
.slider.bare {
  grid-template-columns: minmax(0, 1fr) 52px;
}
label {
  color: var(--soft);
}
output {
  text-align: right;
}
</style>
