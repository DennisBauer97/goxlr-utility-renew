<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { goxlr } from '@/api/commands'
import { dB, duration, eqBand, frequency, ratio, signed } from '@/api/format'
import {
  CompressorAttackTimes,
  CompressorRatios,
  CompressorReleaseTimes,
  EqFrequencyList,
  GateTimeList,
  MicrophoneTypes,
  MiniEqFrequencyList,
  type DisplayModeComponents,
} from '@/api/types'
import { useDaemon } from '@/stores/daemon'
import { useLabels } from '@/composables/labels'
import { useMicLevel } from '@/composables/micLevel'
import EqCurve from '@/components/mic/EqCurve.vue'
import GPanel from '@/components/ui/GPanel.vue'
import GSlider from '@/components/ui/GSlider.vue'
import GSelect from '@/components/ui/GSelect.vue'
import GSegmented from '@/components/ui/GSegmented.vue'
import GToggle from '@/components/ui/GToggle.vue'
import GButton from '@/components/ui/GButton.vue'
import GVFader from '@/components/ui/GVFader.vue'
import GField from '@/components/ui/GField.vue'

const daemon = useDaemon()
const { t } = useI18n()
const { options } = useLabels()
const m = computed(() => daemon.mixer!)
const mic = computed(() => m.value.mic_status)
const display = computed(() => m.value.settings.display)

const { level, peak } = useMicLevel(ref(true))
const pos = (db: number) => `${((Math.max(-72, Math.min(0, db)) + 72) / 72) * 100}%`

/** Frequency limits per band, from the profile crate's validation. */
const FULL_RANGE: Record<string, [number, number]> = {
  Equalizer31Hz: [30, 300], Equalizer63Hz: [30, 300], Equalizer125Hz: [30, 300], Equalizer250Hz: [30, 300],
  Equalizer500Hz: [300, 2000], Equalizer1KHz: [300, 2000], Equalizer2KHz: [300, 2000],
  Equalizer4KHz: [2000, 18000], Equalizer8KHz: [2000, 18000], Equalizer16KHz: [2000, 18000],
}
const MINI_RANGE: Record<string, [number, number]> = {
  Equalizer90Hz: [30, 90], Equalizer250Hz: [100, 300], Equalizer500Hz: [310, 800],
  Equalizer1KHz: [800, 2500], Equalizer3KHz: [2600, 5000], Equalizer8KHz: [5100, 18000],
}

const eq = computed(() => {
  const mini = daemon.isMini
  const source = mini ? mic.value.equaliser_mini : mic.value.equaliser
  const list: readonly string[] = mini ? MiniEqFrequencyList : EqFrequencyList
  return list.map((band) => ({
    band,
    gain: (source.gain as Record<string, number>)[band] ?? 0,
    frequency: (source.frequency as Record<string, number>)[band] ?? 1000,
    range: (mini ? MINI_RANGE : FULL_RANGE)[band],
  }))
})

const fineTune = computed(() => display.value.equaliser_fine === 'Advanced')
const gateAdvanced = computed(() => display.value.gate === 'Advanced')
const compAdvanced = computed(() => display.value.compressor === 'Advanced')

function setDisplay(component: DisplayModeComponents, advanced: boolean) {
  void daemon.command(goxlr('SetElementDisplayMode', component, advanced ? 'Advanced' : 'Simple'))
}

function setGain(band: string, gain: number) {
  void daemon.command(goxlr(daemon.isMini ? 'SetEqMiniGain' : 'SetEqGain', band, gain))
}

function setFrequency(band: string, value: string) {
  const hz = Number(value)
  if (Number.isFinite(hz)) void daemon.command(goxlr(daemon.isMini ? 'SetEqMiniFreq' : 'SetEqFreq', band, hz))
}

function resetEq() {
  for (const { band, gain } of eq.value) if (gain !== 0) setGain(band, 0)
}
</script>

<template>
  <div>
    <div class="page-title">
      <h1 class="display">{{ t('nav.mic') }}</h1>
      <span class="rule" aria-hidden="true" />
      <GSegmented
        :label="t('mic.type')"
        :value="mic.mic_type"
        :options="options('MicrophoneType', MicrophoneTypes)"
        @update="daemon.command(goxlr('SetMicrophoneType', $event))"
      />
    </div>

    <div class="stack">
      <GPanel :title="t('mic.input')">
        <template #actions>
          <span class="readout display" :class="{ idle: level === null }">
            {{ level === null ? '–' : signed(Math.round(level)) }}<small> dB</small>
          </span>
        </template>
        <div
          class="meter"
          role="meter"
          :aria-label="t('mic.level')"
          aria-valuemin="-72"
          aria-valuemax="0"
          :aria-valuenow="level ?? -72"
        >
          <div class="ticks" aria-hidden="true" />
          <div class="bar" :style="{ width: pos(level ?? -72) }" />
          <div class="peak" :style="{ left: pos(peak) }" />
          <div v-if="mic.noise_gate.enabled" class="mark gate" :style="{ left: pos(mic.noise_gate.threshold) }" />
          <div class="mark comp" :style="{ left: pos(mic.compressor.threshold) }" />
        </div>
        <div class="scale" aria-hidden="true">
          <span style="left: 0">−72</span>
          <span style="left: 33.3%">−48</span>
          <span style="left: 66.7%">−24</span>
          <span style="right: 0">0</span>
          <span v-if="mic.noise_gate.enabled" class="gate" :style="{ left: pos(mic.noise_gate.threshold) }">
            ▲ {{ t('mic.gateShort') }} {{ signed(mic.noise_gate.threshold) }}
          </span>
          <span class="comp" :style="{ left: pos(mic.compressor.threshold) }">
            ▲ {{ t('mic.compShort') }} {{ signed(mic.compressor.threshold) }}
          </span>
        </div>
        <GSlider
          :label="t('mic.gain')"
          :value="mic.mic_gains[mic.mic_type]"
          :max="72"
          :format="(v) => `${v} dB`"
          color="#00c8ff"
          @update="daemon.command(goxlr('SetMicrophoneGain', mic.mic_type, $event))"
        />
      </GPanel>

      <GPanel :title="t('mic.equaliser', { bands: eq.length })" :delay="0.08">
        <template #actions>
          <GToggle
            class="auto"
            :label="t('mic.fineTune')"
            :value="fineTune"
            @update="setDisplay('EqFineTune', $event)"
          />
          <GButton small @click="resetEq">{{ t('common.reset') }}</GButton>
        </template>
        <EqCurve :bands="eq" :label="t('mic.curve')" />
        <div class="bands">
          <div v-for="b in eq" :key="b.band" class="band">
            <GVFader
              compact
              :segments="18"
              :label="t('mic.bandGain', { band: eqBand(b.band) })"
              :value="b.gain"
              :min="-9"
              :max="9"
              color="#00c8ff"
              :format="(v) => signed(v)"
              @update="setGain(b.band, $event)"
            />
            <span class="freq">{{ fineTune ? eqBand(b.band) : frequency(b.frequency) }}</span>
            <GField
              v-if="fineTune"
              class="hz"
              type="number"
              :label="t('mic.bandFrequency', { band: eqBand(b.band) })"
              hide-label
              :value="Math.round(b.frequency)"
              :min="b.range[0]"
              :max="b.range[1]"
              @update="setFrequency(b.band, $event)"
            />
          </div>
        </div>
      </GPanel>

      <div class="grid-auto" style="--min: 400px">
        <GPanel :title="t('mic.gate')" stripe="#ffb000" :delay="0.16">
          <template #actions>
            <GToggle class="auto" :label="t('common.enabled')" :value="mic.noise_gate.enabled" @update="daemon.command(goxlr('SetGateActive', $event))" />
          </template>
          <GSlider :label="t('mic.threshold')" :value="mic.noise_gate.threshold" :min="-59" :max="0" :format="dB" color="#ffb000" @update="daemon.command(goxlr('SetGateThreshold', $event))" />
          <template v-if="gateAdvanced">
            <GSlider :label="t('mic.attenuation')" :value="mic.noise_gate.attenuation" :format="(v) => `${v} %`" @update="daemon.command(goxlr('SetGateAttenuation', $event))" />
            <GSelect :label="t('mic.attack')" :value="mic.noise_gate.attack" :options="options('GateTimes', GateTimeList, duration)" @update="daemon.command(goxlr('SetGateAttack', $event))" />
            <GSelect :label="t('mic.release')" :value="mic.noise_gate.release" :options="options('GateTimes', GateTimeList, duration)" @update="daemon.command(goxlr('SetGateRelease', $event))" />
          </template>
          <GToggle :label="t('mic.advanced')" :value="gateAdvanced" @update="setDisplay('NoiseGate', $event)" />
        </GPanel>

        <GPanel :title="t('mic.compressor')" stripe="#ff2bd6" :delay="0.22">
          <GSlider :label="t('mic.threshold')" :value="mic.compressor.threshold" :min="-40" :max="0" :format="dB" color="#ff2bd6" @update="daemon.command(goxlr('SetCompressorThreshold', $event))" />
          <template v-if="compAdvanced">
            <GSelect :label="t('mic.ratio')" :value="mic.compressor.ratio" :options="options('CompressorRatio', CompressorRatios, ratio)" @update="daemon.command(goxlr('SetCompressorRatio', $event))" />
            <GSelect :label="t('mic.attack')" :value="mic.compressor.attack" :options="options('CompressorAttackTime', CompressorAttackTimes, duration)" @update="daemon.command(goxlr('SetCompressorAttack', $event))" />
            <GSelect :label="t('mic.release')" :value="mic.compressor.release" :options="options('CompressorReleaseTime', CompressorReleaseTimes, duration)" @update="daemon.command(goxlr('SetCompressorReleaseTime', $event))" />
            <GSlider :label="t('mic.makeup')" :value="mic.compressor.makeup_gain" :min="-6" :max="24" :format="dB" @update="daemon.command(goxlr('SetCompressorMakeupGain', $event))" />
          </template>
          <GToggle :label="t('mic.advanced')" :value="compAdvanced" @update="setDisplay('Compressor', $event)" />
        </GPanel>

        <GPanel :title="t('mic.deesser')" :delay="0.28">
          <GSlider :label="t('mic.amount')" :value="m.levels.deess" :format="(v) => `${v} %`" @update="daemon.command(goxlr('SetDeeser', $event))" />
          <div class="profile">
            <span class="muted">{{ t('mic.profile') }}</span>
            <strong class="display">{{ m.mic_profile_name }}</strong>
            <GButton small variant="primary" @click="daemon.command(goxlr('SaveMicProfile'))">{{ t('common.save') }}</GButton>
          </div>
        </GPanel>
      </div>
    </div>
  </div>
</template>

<style scoped>
.readout {
  font-size: 30px;
  color: #00c8ff;
  text-shadow: 0 0 18px rgba(0, 200, 255, 0.6);
  font-variant-numeric: tabular-nums;
}
.readout small {
  font-size: 14px;
  text-transform: none;
  color: var(--muted);
  text-shadow: none;
}
.readout.idle {
  color: var(--muted);
  text-shadow: none;
}
.meter {
  position: relative;
  height: 54px;
  background: var(--well);
  border: 1px solid #1c1c24;
  overflow: hidden;
}
.ticks {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: repeating-linear-gradient(90deg, transparent 0 9px, var(--well) 9px 12px);
}
.bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: linear-gradient(90deg, #003a4a, #00c8ff 70%, #7af0ff);
  box-shadow: 0 0 26px rgba(0, 200, 255, 0.5);
  transition: width 0.08s linear;
}
.peak {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 3;
  width: 3px;
  background: var(--text);
  transition: left 0.08s linear;
}
.mark {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 3;
  width: 2px;
}
.gate {
  color: #ffb000;
}
.mark.gate {
  background: #ffb000;
  box-shadow: 0 0 8px #ffb000;
}
.comp {
  color: #ff2bd6;
}
.mark.comp {
  background: #ff2bd6;
  box-shadow: 0 0 8px #ff2bd6;
}
.scale {
  position: relative;
  height: 34px;
  margin-bottom: 4px;
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--muted);
}
.scale span {
  position: absolute;
  top: 2px;
}
.scale .gate,
.scale .comp {
  top: 17px;
  transform: translateX(-50%);
  font-weight: 700;
  white-space: nowrap;
}
.bands {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
  gap: 6px;
  margin-top: 14px;
}
.band {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 4px 10px;
  background: var(--bar);
}
.freq {
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--muted);
}
.hz {
  width: 100%;
}
.hz :deep(input) {
  height: 32px;
  padding: 0 6px;
  font-size: 13px;
  text-align: center;
}
.auto {
  width: auto;
}
.profile {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}
.profile strong {
  margin-right: auto;
}
</style>
