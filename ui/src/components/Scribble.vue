<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FaderName, Scribble } from '@/api/types'

const props = defineProps<{ serial: string; fader: FaderName; scribble: Scribble | null; fallback: string }>()

// The daemon renders the scribble strip to a PNG; the query string busts the cache on change.
const src = computed(() => {
  const s = props.scribble
  if (!s) return null
  const key = encodeURIComponent([s.file_name, s.bottom_text, s.left_text, s.inverted].join('|'))
  return `/files/scribble/${props.serial}/${props.fader}.png?v=${key}`
})
const failed = ref(false)
watch(src, () => (failed.value = false))
</script>

<template>
  <div class="lcd" aria-hidden="true">
    <img v-if="src && !failed" :src="src" alt="" @error="failed = true" />
    <span v-else>{{ fallback }}</span>
  </div>
</template>

<style scoped>
.lcd {
  width: 100%;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #040405;
  border: 1px solid var(--line);
  overflow: hidden;
}
img {
  height: 100%;
  image-rendering: pixelated;
}
span {
  font-family: var(--font-lcd);
  font-size: 16px;
  color: #f4f4f4;
  text-transform: uppercase;
}
</style>
