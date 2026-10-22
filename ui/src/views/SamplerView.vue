<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { goxlr } from '@/api/commands'
import { toCss } from '@/api/format'
import {
  SampleBanks,
  SampleButtonList,
  SamplePlaybackModes,
  SamplePlayOrders,
  type SampleButtons,
} from '@/api/types'
import { useDaemon } from '@/stores/daemon'
import { useLabels } from '@/composables/labels'
import GPanel from '@/components/ui/GPanel.vue'
import GSlider from '@/components/ui/GSlider.vue'
import GSelect from '@/components/ui/GSelect.vue'
import GSegmented from '@/components/ui/GSegmented.vue'
import GToggle from '@/components/ui/GToggle.vue'
import GButton from '@/components/ui/GButton.vue'

const daemon = useDaemon()
const { t } = useI18n()
const { label, options } = useLabels()
const send = (name: string, ...args: unknown[]) => daemon.command(goxlr(name, ...args))

const sampler = computed(() => daemon.mixer!.sampler)
const bank = computed(() => sampler.value!.active_bank)
const selected = ref<SampleButtons>('TopLeft')
const pad = computed(() => sampler.value!.banks[bank.value]?.[selected.value])
const bankColour = computed(() => {
  const colour = daemon.mixer!.lighting.sampler[`SamplerSelect${bank.value}`]?.colours.colour_one
  return !colour || colour === '000000' ? 'var(--accent)' : toCss(colour)
})
const library = computed(() => Object.keys(daemon.status?.files.samples ?? {}))
const settings = computed(() => daemon.mixer!.settings)

const pads = computed(() =>
  SampleButtonList.map((button) => {
    const state = sampler.value!.banks[bank.value]?.[button]
    return {
      button,
      name: label('SampleButtons', button),
      count: state?.samples.length ?? 0,
      playing: state?.is_playing ?? false,
      recording: state?.is_recording ?? false,
    }
  }),
)

const seconds = (ms: number) => `${(ms / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} s`
</script>

<template>
  <div v-if="sampler">
    <div class="page-title">
      <h1 class="display">{{ t('nav.sampler') }}</h1>
      <span class="rule" aria-hidden="true" />
      <GSegmented
        :label="t('sampler.bank')"
        :value="bank"
        :options="SampleBanks.map((b) => ({ value: b, label: t('sampler.bankName', { bank: b }) }))"
        @update="send('SetActiveSamplerBank', $event)"
      />
    </div>

    <div v-if="sampler.processing_state.progress !== null" class="progress chamfer-top" role="progressbar" :aria-valuenow="sampler.processing_state.progress" aria-valuemin="0" aria-valuemax="100" :aria-label="t('sampler.processing')">
      <span :style="{ width: `${sampler.processing_state.progress}%` }" />
      <em>{{ t('sampler.processing') }} {{ sampler.processing_state.progress }} %</em>
    </div>
    <div v-if="sampler.processing_state.last_error" class="error chamfer-top" role="alert">
      <span>{{ sampler.processing_state.last_error }}</span>
      <GButton small @click="send('ClearSampleProcessError')">{{ t('common.dismiss') }}</GButton>
    </div>

    <div class="layout">
      <section class="pads" :style="{ '--c': bankColour }" :aria-label="t('sampler.pads')">
        <div v-for="(p, i) in pads" :key="p.button" class="pad chamfer rise" :class="{ sel: p.button === selected, playing: p.playing, rec: p.recording }" :style="{ animationDelay: `${i * 0.06}s` }">
          <button type="button" class="select" :aria-pressed="p.button === selected" @click="selected = p.button">
            <span class="pname display">{{ p.name }}</span>
            <span class="count">{{ t('sampler.count', p.count) }}</span>
            <span v-if="p.recording" class="badge blink">REC</span>
            <span v-else-if="p.playing" class="eq" aria-hidden="true"><i /><i /><i /><i /></span>
          </button>
          <div class="transport">
            <GButton small :disabled="!p.count" :aria-label="t('sampler.playOn', { pad: p.name })" @click="send('PlayNextSample', bank, p.button)">▶</GButton>
            <GButton small :disabled="!p.playing" :aria-label="t('sampler.stopOn', { pad: p.name })" @click="send('StopSamplePlayback', bank, p.button)">■</GButton>
          </div>
        </div>
      </section>

      <GPanel v-if="pad" :title="t('sampler.padTitle', { pad: label('SampleButtons', selected), bank })" :stripe="bankColour" class="editor">
        <GSelect :label="t('sampler.mode')" :value="pad.function" :options="options('SamplePlaybackMode', SamplePlaybackModes)" @update="send('SetSamplerFunction', bank, selected, $event)" />
        <GSelect :label="t('sampler.order')" :value="pad.order" :options="options('SamplePlayOrder', SamplePlayOrders)" @update="send('SetSamplerOrder', bank, selected, $event)" />

        <h3 class="label sub">{{ t('sampler.samples') }}</h3>
        <p v-if="!pad.samples.length" class="muted">{{ t('sampler.empty') }}</p>
        <ul class="samples">
          <li v-for="(sample, index) in pad.samples" :key="`${sample.name}-${index}`" class="sample">
            <div class="srow">
              <span class="sname">{{ sample.name }}</span>
              <GButton small :aria-label="t('sampler.play', { name: sample.name })" @click="send('PlaySampleByIndex', bank, selected, index)">▶</GButton>
              <GButton small variant="danger" :aria-label="t('sampler.remove', { name: sample.name })" @click="send('RemoveSampleByIndex', bank, selected, index)">✕</GButton>
            </div>
            <GSlider :label="t('sampler.start')" :value="sample.start_pct" :step="0.5" :format="(v) => `${v.toFixed(1)} %`" @update="send('SetSampleStartPercent', bank, selected, index, $event)" />
            <GSlider :label="t('sampler.stop')" :value="sample.stop_pct" :step="0.5" :format="(v) => `${v.toFixed(1)} %`" @update="send('SetSampleStopPercent', bank, selected, index, $event)" />
          </li>
        </ul>
        <GSelect
          v-if="library.length"
          :label="t('sampler.add')"
          value=""
          :options="[{ value: '', label: t('sampler.chooseSample') }, ...library.map((n) => ({ value: n, label: n }))]"
          @update="$event && send('AddSample', bank, selected, $event)"
        />
        <p v-else class="muted">{{ t('sampler.noLibrary') }}</p>
      </GPanel>
    </div>

    <GPanel :title="t('sampler.settings')" class="settings" :delay="0.3">
      <div class="grid-auto" style="--min: 440px">
        <GSlider :label="t('sampler.preBuffer')" :value="sampler.record_buffer" :max="29000" :step="500" :format="seconds" @update="send('SetSamplerPreBufferDuration', $event)" />
        <GSlider :label="t('sampler.fade')" :value="settings.fade_duration" :max="20000" :step="100" :format="seconds" @update="send('SetSamplerFadeDuration', $event)" />
        <GToggle :label="t('sampler.resetOnClear')" :value="settings.reset_sampler_on_clear" @update="send('SetSamplerResetOnClear', $event)" />
      </div>
    </GPanel>
  </div>
  <p v-else class="muted">{{ t('sampler.unsupported') }}</p>
</template>

<style scoped>
.layout {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: flex-start;
}
.pads {
  flex: 1 1 420px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.editor {
  flex: 1 1 420px;
}
.pad {
  --chamfer: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  background: var(--panel);
  overflow: hidden;
}
.pad::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--c) 26%, transparent), transparent);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}
.pad.sel::before,
.pad.playing::before {
  opacity: 1;
}
.pad.playing::before {
  animation: breathe 1s ease-in-out infinite;
}
.pad.sel {
  outline: 1px solid var(--c);
  outline-offset: -1px;
}
.select {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 4px;
  padding: 18px;
  border: 0;
  background: transparent;
  text-align: left;
}
.pname {
  font-size: 20px;
}
.count {
  color: var(--muted);
  font-size: 14px;
}
.badge {
  position: absolute;
  top: 16px;
  right: 18px;
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--accent);
}
.eq {
  position: absolute;
  top: 18px;
  right: 18px;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 22px;
}
.eq i {
  width: 4px;
  height: 100%;
  background: var(--c);
  box-shadow: 0 0 6px var(--c);
  transform-origin: bottom;
  animation: bounce 0.9s ease-in-out infinite;
}
.eq i:nth-child(2) {
  animation-delay: 0.2s;
}
.eq i:nth-child(3) {
  animation-delay: 0.4s;
}
.eq i:nth-child(4) {
  animation-delay: 0.1s;
}
@keyframes bounce {
  0%,
  100% {
    transform: scaleY(0.3);
  }
  50% {
    transform: scaleY(1);
  }
}
.transport {
  position: relative;
  display: flex;
  gap: 6px;
  padding: 0 18px 18px;
}
.sub {
  margin: 18px 0 8px;
}
.samples {
  list-style: none;
  margin: 0 0 12px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sample {
  padding: 10px 12px;
  background: var(--bar);
}
.srow {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sname {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
}
.settings {
  margin-top: 18px;
}
.progress {
  --chamfer: 10px;
  position: relative;
  height: 34px;
  margin-bottom: 14px;
  background: var(--panel);
  overflow: hidden;
}
.progress span {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--accent);
  box-shadow: 0 0 18px var(--accent);
  transition: width 0.2s;
}
.progress em {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 14px;
  font-family: var(--font-display);
  font-style: normal;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  mix-blend-mode: difference;
}
.error {
  --chamfer: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding: 10px 14px;
  background: color-mix(in srgb, var(--accent) 16%, var(--panel));
  border-left: 3px solid var(--accent);
}
</style>
