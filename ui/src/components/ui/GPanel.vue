<script setup lang="ts">
import { useId } from 'vue'

withDefaults(
  defineProps<{
    title?: string
    /** Colour of the slanted stripe on the top edge; omit for none. */
    stripe?: string
    delay?: number
  }>(),
  { title: undefined, stripe: undefined, delay: 0 },
)

const headingId = useId()
</script>

<template>
  <section
    class="panel chamfer-top rise"
    :style="{ animationDelay: `${delay}s` }"
    :aria-labelledby="title ? headingId : undefined"
  >
    <span v-if="stripe" class="stripe" :style="{ background: stripe, boxShadow: `0 0 10px ${stripe}` }" aria-hidden="true" />
    <header v-if="title || $slots.actions" class="head">
      <h2 v-if="title" :id="headingId" class="label">{{ title }}</h2>
      <div v-if="$slots.actions" class="actions"><slot name="actions" /></div>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.panel {
  position: relative;
  background: var(--panel);
  padding: 18px 22px 20px;
  min-width: 0;
}
.stripe {
  position: absolute;
  top: 0;
  left: 0;
  width: 40%;
  height: 3px;
  transform: skewX(-30deg) translateX(-6px);
}
.head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  min-height: 36px;
  margin-bottom: 8px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
</style>
