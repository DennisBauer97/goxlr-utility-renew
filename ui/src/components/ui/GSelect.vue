<script setup lang="ts" generic="T extends string">
import { useId } from 'vue'

withDefaults(
  defineProps<{
    label: string
    value: T
    options: readonly { value: T; label: string }[]
    hideLabel?: boolean
    disabled?: boolean
  }>(),
  { hideLabel: false, disabled: false },
)

const emit = defineEmits<{ update: [value: T] }>()
const id = useId()
</script>

<template>
  <div class="field" :class="{ bare: hideLabel }">
    <label :for="id" :class="{ 'sr-only': hideLabel }">{{ label }}</label>
    <select
      :id="id"
      :value="value"
      :disabled="disabled"
      @change="emit('update', ($event.target as HTMLSelectElement).value as T)"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
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
.field.bare {
  display: block;
  min-height: 0;
}
label {
  color: var(--soft);
}
select {
  justify-self: start;
  max-width: 100%;
  height: 38px;
  padding: 0 34px 0 12px;
  border: 1px solid var(--line-strong);
  border-radius: 0;
  background: var(--bar)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12'%3E%3Cpath d='M2 4l4 4 4-4' fill='none' stroke='%239a9aa6' stroke-width='1.8'/%3E%3C/svg%3E")
    no-repeat right 12px center;
  color: var(--text);
  font-family: var(--font-display);
  font-weight: 600;
  appearance: none;
  cursor: pointer;
}
.bare select {
  width: 100%;
}
select:hover {
  border-color: var(--muted);
}
option {
  background: var(--panel);
}
</style>
