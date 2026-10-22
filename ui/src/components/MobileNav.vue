<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useDaemon } from '@/stores/daemon'
import { navItems } from '@/navigation'

const daemon = useDaemon()
const route = useRoute()
const { t } = useI18n()
const open = ref(false)

const available = computed(() => navItems.filter((item) => !(item.fullOnly && daemon.isMini)))
const primary = computed(() => available.value.filter((item) => item.primary))
const more = computed(() => available.value.filter((item) => !item.primary))
const moreActive = computed(() => more.value.some((item) => item.name === route.name))
</script>

<template>
  <nav class="tabs" :aria-label="t('app.navigation')">
    <RouterLink v-for="item in primary" :key="item.name" :to="item.path" class="tab" @click="open = false">
      {{ t(item.label) }}
    </RouterLink>
    <button type="button" class="tab" :class="{ active: moreActive }" :aria-expanded="open" @click="open = !open">
      {{ t('nav.more') }}
    </button>
    <Transition name="sheet">
      <div v-if="open" class="sheet chamfer-top">
        <RouterLink v-for="item in more" :key="item.name" :to="item.path" class="item" @click="open = false">
          {{ t(item.label) }}
        </RouterLink>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
.tabs {
  display: none;
}
@media (max-width: 760px) {
  .tabs {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 30;
    display: grid;
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;
    padding: 0 4px env(safe-area-inset-bottom);
    background: rgba(14, 14, 18, 0.96);
    backdrop-filter: blur(8px);
    border-top: 1px solid var(--line);
  }
}
.tab {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 58px;
  border: 0;
  background: transparent;
  text-decoration: none;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}
.tab.router-link-exact-active,
.tab.active,
.tab[aria-expanded='true'] {
  color: var(--text);
}
.tab.router-link-exact-active::before,
.tab.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 14px;
  right: 14px;
  height: 3px;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
  transform: skewX(-30deg);
}
.sheet {
  position: absolute;
  right: 8px;
  bottom: calc(100% + 8px);
  display: flex;
  flex-direction: column;
  min-width: 200px;
  padding: 8px;
  background: var(--raised);
}
.item {
  padding: 12px 14px;
  text-decoration: none;
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.item.router-link-exact-active {
  color: var(--accent);
}
.sheet-enter-active,
.sheet-leave-active {
  transition: all 0.2s var(--ease-out);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
