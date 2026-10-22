<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToasts } from '@/stores/toasts'

const toasts = useToasts()
const { t } = useI18n()
</script>

<template>
  <div class="toasts" role="status" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="toast in toasts.toasts" :key="toast.id" class="toast chamfer-top" :class="toast.kind">
        <span>{{ toast.message }}</span>
        <button type="button" :aria-label="t('common.dismiss')" @click="toasts.dismiss(toast.id)">×</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(380px, calc(100vw - 32px));
}
.toast {
  --chamfer: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: var(--raised);
  border-left: 3px solid var(--accent);
}
.toast.info {
  border-left-color: var(--ok);
}
.toast span {
  flex: 1;
}
.toast button {
  width: 28px;
  height: 28px;
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: 20px;
  line-height: 1;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s var(--ease-out);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
@media (max-width: 760px) {
  .toasts {
    bottom: 84px;
  }
}
</style>
