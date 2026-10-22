<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost' | 'key' | 'danger'
    /** When set, the button is a toggle and reports `aria-pressed`. */
    pressed?: boolean
    disabled?: boolean
    small?: boolean
  }>(),
  { variant: 'ghost', pressed: undefined, disabled: false, small: false },
)
</script>

<template>
  <button
    type="button"
    class="btn hover-lift"
    :class="[variant, { on: pressed, small }]"
    :aria-pressed="pressed === undefined ? undefined : pressed"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  --chamfer: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid var(--line-strong);
  background: transparent;
  color: var(--text);
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
}
.small {
  min-height: 34px;
  padding: 0 12px;
  font-size: 13px;
}
.primary,
.danger {
  border: 0;
  background: var(--accent);
  color: var(--on-accent);
  font-style: italic;
  font-weight: 700;
  clip-path: polygon(var(--chamfer) 0, 100% 0, calc(100% - var(--chamfer)) 100%, 0 100%);
  padding: 0 20px;
}
.danger {
  background: transparent;
  border: 1px solid var(--accent);
  color: var(--accent);
  clip-path: none;
}
.key {
  background: var(--bar);
  clip-path: polygon(0 0, calc(100% - var(--chamfer)) 0, 100% var(--chamfer), 100% 100%, 0 100%);
}
.key.on {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
  box-shadow: 0 0 22px var(--accent);
}
</style>
