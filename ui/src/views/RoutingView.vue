<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { goxlr } from '@/api/commands'
import { InputDevices, OutputDevices, type InputDevice, type OutputDevice } from '@/api/types'
import { useDaemon } from '@/stores/daemon'
import { useLabels } from '@/composables/labels'
import GPanel from '@/components/ui/GPanel.vue'

const daemon = useDaemon()
const { t } = useI18n()
const { label } = useLabels()
const router = computed(() => daemon.mixer!.router)

function toggle(input: InputDevice, output: OutputDevice) {
  void daemon.command(goxlr('SetRouter', input, output, !router.value[input][output]))
}
</script>

<template>
  <div>
    <div class="page-title">
      <h1 class="display">{{ t('nav.routing') }}</h1>
      <span class="rule" aria-hidden="true" />
      <span class="label">{{ t('routing.subtitle') }}</span>
    </div>

    <GPanel>
      <div class="scroll">
        <table>
          <caption class="sr-only">{{ t('routing.caption') }}</caption>
          <thead>
            <tr>
              <td />
              <th v-for="output in OutputDevices" :key="output" scope="col">
                <span>{{ label('OutputDevice', output) }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(input, row) in InputDevices" :key="input" class="rise" :style="{ animationDelay: `${row * 0.04}s` }">
              <th scope="row">{{ label('InputDevice', input) }}</th>
              <td v-for="output in OutputDevices" :key="output">
                <button
                  type="button"
                  role="switch"
                  class="cell"
                  :aria-checked="router[input][output]"
                  :aria-label="t('routing.route', { input: label('InputDevice', input), output: label('OutputDevice', output) })"
                  @click="toggle(input, output)"
                >
                  <span aria-hidden="true" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </GPanel>
  </div>
</template>

<style scoped>
.scroll {
  overflow-x: auto;
}
table {
  width: 100%;
  min-width: 720px;
  border-collapse: separate;
  border-spacing: 4px;
}
thead th {
  padding: 0 4px 10px;
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  text-align: center;
  vertical-align: bottom;
}
tbody th {
  padding-right: 16px;
  text-align: left;
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
}
td {
  text-align: center;
}
.cell {
  width: 100%;
  min-width: 64px;
  height: 46px;
  border: 0;
  padding: 0;
  background: var(--bar);
  clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
  transition: background-color 0.15s;
}
.cell span {
  display: block;
  width: 14px;
  height: 14px;
  margin: auto;
  background: var(--off);
  transform: rotate(45deg);
  transition: all 0.2s var(--ease-out);
}
.cell:hover {
  background: var(--raised);
}
.cell[aria-checked='true'] {
  background: color-mix(in srgb, var(--accent) 18%, var(--bar));
}
.cell[aria-checked='true'] span {
  background: var(--accent);
  box-shadow: 0 0 12px var(--accent);
  transform: rotate(45deg) scale(1.15);
}
</style>
