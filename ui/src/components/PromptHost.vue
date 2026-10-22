<script setup lang="ts">
import { nextTick, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePrompt } from '@/stores/prompt'
import GButton from './ui/GButton.vue'

const prompt = usePrompt()
const { t } = useI18n()
const dialog = ref<HTMLDialogElement | null>(null)
const text = ref('')
const titleId = useId()
const inputId = useId()

watch(
  () => prompt.active,
  async (active) => {
    if (!active) {
      dialog.value?.close()
      return
    }
    text.value = active.initial ?? ''
    await nextTick()
    dialog.value?.showModal()
  },
)

function submit() {
  if (prompt.active?.input && !text.value.trim()) return
  prompt.close(prompt.active?.input ? text.value.trim() : '')
}
</script>

<template>
  <dialog ref="dialog" class="dialog chamfer" :aria-labelledby="titleId" @cancel.prevent="prompt.close(null)">
    <form v-if="prompt.active" method="dialog" @submit.prevent="submit">
      <h2 :id="titleId" class="display">{{ prompt.active.title }}</h2>
      <p v-if="prompt.active.message" class="muted">{{ prompt.active.message }}</p>
      <div v-if="prompt.active.input" class="input">
        <label :for="inputId">{{ prompt.active.input }}</label>
        <input :id="inputId" v-model="text" autofocus autocomplete="off" />
      </div>
      <div class="actions">
        <GButton @click="prompt.close(null)">{{ t('common.cancel') }}</GButton>
        <GButton :variant="prompt.active.danger ? 'danger' : 'primary'" @click="submit">
          {{ prompt.active.confirm }}
        </GButton>
      </div>
    </form>
  </dialog>
</template>

<style scoped>
.dialog {
  --chamfer: 22px;
  width: min(460px, calc(100vw - 32px));
  padding: 24px;
  border: 0;
  background: var(--panel);
  color: var(--text);
}
.dialog::backdrop {
  background: rgba(5, 5, 8, 0.75);
  backdrop-filter: blur(3px);
}
h2 {
  margin: 0 0 8px;
  font-size: 22px;
}
.input {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 16px 0 4px;
}
.input label {
  color: var(--soft);
}
.input input {
  height: 42px;
  padding: 0 12px;
  border: 1px solid var(--line-strong);
  background: var(--bar);
  font-family: var(--font-display);
  font-weight: 600;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
