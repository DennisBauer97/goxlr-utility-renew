<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDaemon } from '@/stores/daemon'
import { useUi } from '@/stores/ui'
import { resolveLocale } from '@/i18n'
import AppHeader from '@/components/AppHeader.vue'
import MobileNav from '@/components/MobileNav.vue'
import ToastHost from '@/components/ToastHost.vue'
import PromptHost from '@/components/PromptHost.vue'

const daemon = useDaemon()
useUi()
const { t, locale } = useI18n()

onMounted(() => daemon.connect())

watch(
  () => daemon.status?.config.locale,
  (config) => {
    if (config) locale.value = resolveLocale(config.user_locale ?? config.system_locale)
  },
)
watch(locale, (value) => (document.documentElement.lang = value), { immediate: true })

const waiting = computed(() => !daemon.status)
const noDevice = computed(() => daemon.status && !daemon.mixer)
</script>

<template>
  <a class="skip" href="#main">{{ t('app.skip') }}</a>
  <div class="aura strip" aria-hidden="true" />
  <AppHeader />
  <main id="main" class="main" tabindex="-1">
    <div v-if="waiting" class="empty">
      <div class="loader" aria-hidden="true"><span /><span /><span /></div>
      <h1 class="display">{{ t('app.connecting') }}</h1>
      <p class="muted">{{ t('app.connectingHint') }}</p>
    </div>
    <div v-else-if="noDevice" class="empty">
      <h1 class="display">{{ t('app.noDevice') }}</h1>
      <p class="muted">{{ t('app.noDeviceHint') }}</p>
    </div>
    <RouterView v-else v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="daemon.serial ?? ''" />
      </Transition>
    </RouterView>
  </main>
  <MobileNav />
  <ToastHost />
  <PromptHost />
</template>

<style scoped>
.skip {
  position: absolute;
  left: 8px;
  top: -60px;
  z-index: 100;
  padding: 10px 14px;
  background: var(--accent);
  color: var(--on-accent);
  font-weight: 600;
}
.skip:focus {
  top: 8px;
}
.strip {
  position: sticky;
  top: 0;
  z-index: 21;
  height: 3px;
}
.main {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 28px 24px 48px;
  outline: none;
}
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 120px 16px;
  text-align: center;
}
.empty h1 {
  margin: 16px 0 0;
  font-size: 26px;
}
.loader {
  display: flex;
  gap: 6px;
}
.loader span {
  width: 14px;
  height: 36px;
  background: var(--accent);
  transform: skewX(-20deg);
  box-shadow: 0 0 14px var(--accent);
  animation: breathe 1s ease-in-out infinite;
}
.loader span:nth-child(2) {
  animation-delay: 0.15s;
}
.loader span:nth-child(3) {
  animation-delay: 0.3s;
}
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
}
@media (max-width: 760px) {
  .main {
    padding: 20px 14px 96px;
  }
}
</style>
