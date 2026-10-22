<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { goxlr } from '@/api/commands'
import { useDaemon } from '@/stores/daemon'
import { navItems } from '@/navigation'
import GButton from './ui/GButton.vue'

const daemon = useDaemon()
const { t } = useI18n()

const items = computed(() => navItems.filter((item) => !(item.fullOnly && daemon.isMini)))
const online = computed(() => daemon.connection === 'open')
</script>

<template>
  <header class="bar">
    <div class="scan" aria-hidden="true" />
    <RouterLink to="/" class="brand" :aria-label="t('app.home')">
      <span class="mark" aria-hidden="true" />
      <span class="name">GOXLR</span>
      <span class="sub">UTILITY</span>
    </RouterLink>

    <nav class="nav" :aria-label="t('app.navigation')">
      <RouterLink v-for="item in items" :key="item.name" :to="item.path" class="tab">
        {{ t(item.label) }}
      </RouterLink>
    </nav>

    <div class="tools">
      <span class="state" :class="{ online }">
        <span class="dot blink" aria-hidden="true" />
        {{ online ? t('app.online') : t('app.offline') }}
      </span>
      <label v-if="daemon.serials.length > 1" class="device">
        <span class="sr-only">{{ t('app.device') }}</span>
        <select :value="daemon.serial" @change="daemon.selectDevice(($event.target as HTMLSelectElement).value)">
          <option v-for="serial in daemon.serials" :key="serial" :value="serial">{{ serial }}</option>
        </select>
      </label>
      <span v-if="daemon.mixer" class="profile" :title="t('app.activeProfile')">{{ daemon.mixer.profile_name }}</span>
      <GButton v-if="daemon.mixer" variant="primary" @click="daemon.command(goxlr('SaveProfile'))">
        {{ t('common.save') }}
      </GButton>
    </div>
  </header>
</template>

<style scoped>
.bar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 24px;
  padding: 0 24px;
  min-height: 64px;
  background: rgba(14, 14, 18, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--line);
  overflow: hidden;
}
.scan {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 22%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent);
  animation: scan 6s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  pointer-events: none;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}
.mark {
  width: 32px;
  height: 24px;
  background: var(--accent);
  clip-path: polygon(22% 0, 100% 0, 78% 100%, 0 100%);
  box-shadow: 0 0 18px var(--accent);
}
.name {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 0.04em;
}
.sub {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 13px;
  letter-spacing: 0.2em;
  color: var(--muted);
}
.nav {
  display: flex;
  flex: 1 1 480px;
  align-self: stretch;
  overflow-x: auto;
  scrollbar-width: none;
}
.tab {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 14px;
  min-height: 64px;
  text-decoration: none;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--muted);
  transition: color 0.2s;
}
.tab:hover,
.tab.router-link-exact-active {
  color: var(--text);
}
.tab::after {
  content: '';
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 0;
  height: 3px;
  background: var(--accent);
  box-shadow: 0 0 12px var(--accent);
  transform: skewX(-30deg) scaleX(0);
  transition: transform 0.25s var(--ease-out);
}
.tab.router-link-exact-active::after {
  transform: skewX(-30deg) scaleX(1);
}
.tools {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}
.state {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.dot {
  width: 7px;
  height: 7px;
  background: var(--accent);
}
.online .dot {
  background: var(--ok);
  box-shadow: 0 0 8px var(--ok);
}
.profile {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-display);
  font-weight: 600;
  text-transform: uppercase;
  color: var(--soft);
}
.device select {
  height: 36px;
  border: 1px solid var(--line-strong);
  background: var(--bar);
  font-family: var(--font-display);
}
@media (max-width: 760px) {
  .bar {
    padding: 0 16px;
    min-height: 56px;
  }
  .nav,
  .sub,
  .state {
    display: none;
  }
}
</style>
