<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import { fromCss, toCss } from '@/api/format'
import { throttle } from '@/composables/throttle'

const props = defineProps<{ label: string; value: string; hideLabel?: boolean }>()
const emit = defineEmits<{ update: [value: string] }>()

const id = useId()
const local = ref(toCss(props.value))
watch(
  () => props.value,
  (value) => (local.value = toCss(value)),
)
const send = throttle((value: string) => emit('update', fromCss(value)), 120)
</script>

<template>
  <div class="colour">
    <label :for="id" :class="{ 'sr-only': hideLabel }">{{ label }}</label>
    <span class="swatch" :style="{ background: local, boxShadow: `0 0 14px ${local}66` }">
      <input
        :id="id"
        type="color"
        :value="local"
        @input="send((local = ($event.target as HTMLInputElement).value))"
        @change="emit('update', fromCss(local))"
      />
    </span>
    <span class="num hex">{{ local.toUpperCase() }}</span>
  </div>
</template>

<style scoped>
.colour {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
}
label {
  color: var(--soft);
  min-width: 0;
  flex: 1;
}
.swatch {
  position: relative;
  width: 44px;
  height: 30px;
  clip-path: polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%);
}
input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
.swatch:has(input:focus-visible) {
  outline: 2px solid var(--text);
}
.hex {
  width: 72px;
  font-size: 13px;
  color: var(--muted);
}
</style>
