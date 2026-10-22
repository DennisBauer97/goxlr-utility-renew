<script setup lang="ts">
defineProps<{ label: string; value: boolean; disabled?: boolean; description?: string }>()
const emit = defineEmits<{ update: [value: boolean] }>()
</script>

<template>
  <button
    type="button"
    role="switch"
    class="toggle"
    :aria-checked="value"
    :disabled="disabled"
    @click="emit('update', !value)"
  >
    <span class="text">
      <span>{{ label }}</span>
      <span v-if="description" class="desc">{{ description }}</span>
    </span>
    <span class="track" aria-hidden="true"><span class="knob" /></span>
  </button>
</template>

<style scoped>
.toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  min-height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--soft);
  text-align: left;
}
.text {
  display: flex;
  flex-direction: column;
}
.desc {
  font-size: 13px;
  color: var(--muted);
}
.track {
  position: relative;
  flex-shrink: 0;
  width: 46px;
  height: 22px;
  background: var(--raised);
  clip-path: polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%);
  transition: background-color 0.2s;
}
.knob {
  position: absolute;
  top: 4px;
  left: 6px;
  width: 14px;
  height: 14px;
  background: var(--muted);
  transform: skewX(-20deg);
  transition: transform 0.2s var(--ease-out), background-color 0.2s;
}
[aria-checked='true'] .track {
  background: var(--accent);
  box-shadow: 0 0 14px var(--accent);
}
[aria-checked='true'] .knob {
  background: var(--on-accent);
  transform: translateX(20px) skewX(-20deg);
}
</style>
