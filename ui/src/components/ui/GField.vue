<script setup lang="ts">
import { ref, useId, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    value: string | number
    type?: 'text' | 'number'
    min?: number
    max?: number
    maxlength?: number
    hideLabel?: boolean
  }>(),
  { type: 'text', min: undefined, max: undefined, maxlength: undefined, hideLabel: false },
)
const emit = defineEmits<{ update: [value: string] }>()
const id = useId()
const local = ref(String(props.value))
watch(
  () => props.value,
  (value) => (local.value = String(value)),
)
function commit() {
  if (local.value !== String(props.value)) emit('update', local.value)
}
</script>

<template>
  <div class="field" :class="{ bare: hideLabel }">
    <label :for="id" :class="{ 'sr-only': hideLabel }">{{ label }}</label>
    <input
      :id="id"
      v-model="local"
      :type="type"
      :min="min"
      :max="max"
      :maxlength="maxlength"
      @change="commit"
      @keydown.enter="commit"
    />
  </div>
</template>

<style scoped>
.field {
  display: grid;
  grid-template-columns: minmax(84px, 120px) minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  min-height: 44px;
}
label {
  color: var(--soft);
}
.bare {
  display: block;
  min-height: 0;
}
.bare input {
  width: 100%;
}
input {
  height: 38px;
  min-width: 0;
  padding: 0 12px;
  border: 1px solid var(--line-strong);
  background: var(--bar);
  color: var(--text);
  font-family: var(--font-display);
  font-weight: 600;
}
input:hover {
  border-color: var(--muted);
}
</style>
