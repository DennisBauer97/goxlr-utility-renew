<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { goxlr } from '@/api/commands'
import { dB, signed } from '@/api/format'
import {
  EchoStyles,
  EffectBankPresetList,
  GenderStyles,
  HardTuneSources,
  HardTuneStyles,
  MegaphoneStyles,
  PitchStyles,
  ReverbStyles,
  RobotRanges,
  RobotStyles,
  type ActiveEffects,
} from '@/api/types'
import { useDaemon } from '@/stores/daemon'
import { usePrompt } from '@/stores/prompt'
import { useLabels } from '@/composables/labels'
import GPanel from '@/components/ui/GPanel.vue'
import GKnob from '@/components/ui/GKnob.vue'
import GSlider from '@/components/ui/GSlider.vue'
import GSelect from '@/components/ui/GSelect.vue'
import GSegmented from '@/components/ui/GSegmented.vue'
import GTabs from '@/components/ui/GTabs.vue'
import GButton from '@/components/ui/GButton.vue'

const daemon = useDaemon()
const prompt = usePrompt()
const { t } = useI18n()
const { label, options } = useLabels()

const fx = computed(() => daemon.mixer!.effects)
const cur = computed(() => fx.value!.current)
const hardTuneOn = computed(() => cur.value.hard_tune.is_enabled)

const send = (name: string, ...args: unknown[]) => daemon.command(goxlr(name, ...args))
const pct = (v: number) => `${v} %`
const ms = (v: number) => `${v} ms`

const toggles = computed(() => [
  { key: 'fx', label: t('effects.fx'), on: fx.value!.is_enabled, cmd: 'SetFXEnabled', color: 'var(--accent)' },
  { key: 'megaphone', label: t('effects.megaphone'), on: cur.value.megaphone.is_enabled, cmd: 'SetMegaphoneEnabled', color: '#ff8a00' },
  { key: 'robot', label: t('effects.robot'), on: cur.value.robot.is_enabled, cmd: 'SetRobotEnabled', color: '#2bff88' },
  { key: 'hardtune', label: t('effects.hardTune'), on: cur.value.hard_tune.is_enabled, cmd: 'SetHardTuneEnabled', color: '#ff2bd6' },
])

const pitchRange = computed(() => {
  if (hardTuneOn.value) return cur.value.pitch.style === 'Narrow' ? 1 : 2
  return 24
})
const genderRange = computed(() => ({ Narrow: 12, Medium: 25, Wide: 50 })[cur.value.gender.style])

const knobs = computed(() => [
  { key: 'reverb', label: t('effects.reverb'), color: '#00c8ff', value: cur.value.reverb.amount, min: 0, max: 100, cmd: 'SetReverbAmount', unit: t('effects.percent'), style: label('ReverbStyle', cur.value.reverb.style) },
  { key: 'echo', label: t('effects.echo'), color: '#ffb000', value: cur.value.echo.amount, min: 0, max: 100, cmd: 'SetEchoAmount', unit: t('effects.percent'), style: label('EchoStyle', cur.value.echo.style) },
  { key: 'pitch', label: t('effects.pitch'), color: '#2bff88', value: cur.value.pitch.amount, min: -pitchRange.value, max: pitchRange.value, cmd: 'SetPitchAmount', unit: hardTuneOn.value ? t('effects.octaves') : t('effects.semitones'), style: label('PitchStyle', cur.value.pitch.style) },
  { key: 'gender', label: t('effects.gender'), color: '#ff2bd6', value: cur.value.gender.amount, min: -genderRange.value, max: genderRange.value, cmd: 'SetGenderAmount', unit: t('effects.steps'), style: label('GenderStyle', cur.value.gender.style) },
])

type Tab = 'reverb' | 'echo' | 'pitch' | 'gender' | 'megaphone' | 'robot' | 'hardtune'
const tab = ref<Tab>('reverb')
const tabs = computed(() =>
  (['reverb', 'echo', 'pitch', 'gender', 'megaphone', 'robot', 'hardtune'] as const).map((value) => ({
    value,
    label: t(`effects.${value === 'hardtune' ? 'hardTune' : value}`),
  })),
)

interface Param {
  label: string
  value: number
  min: number
  max: number
  cmd: string
  args?: unknown[]
  format?: (v: number) => string
}

const params = computed<Record<Tab, Param[]>>(() => {
  const c: ActiveEffects = cur.value
  return {
    reverb: [
      { label: t('effects.amount'), value: c.reverb.amount, min: 0, max: 100, cmd: 'SetReverbAmount', format: pct },
      { label: t('effects.decay'), value: c.reverb.decay, min: 10, max: 20000, cmd: 'SetReverbDecay', format: ms },
      { label: t('effects.preDelay'), value: c.reverb.pre_delay, min: 0, max: 100, cmd: 'SetReverbPreDelay', format: ms },
      { label: t('effects.earlyLevel'), value: c.reverb.early_level, min: -25, max: 0, cmd: 'SetReverbEarlyLevel', format: dB },
      { label: t('effects.tailLevel'), value: c.reverb.tail_level, min: -25, max: 0, cmd: 'SetReverbTailLevel', format: dB },
      { label: t('effects.lowColour'), value: c.reverb.lo_colour, min: -50, max: 50, cmd: 'SetReverbLowColour', format: signed },
      { label: t('effects.highColour'), value: c.reverb.hi_colour, min: -50, max: 50, cmd: 'SetReverbHighColour', format: signed },
      { label: t('effects.highFactor'), value: c.reverb.hi_factor, min: -25, max: 25, cmd: 'SetReverbHighFactor', format: signed },
      { label: t('effects.diffuse'), value: c.reverb.diffuse, min: -50, max: 50, cmd: 'SetReverbDiffuse', format: signed },
      { label: t('effects.modSpeed'), value: c.reverb.mod_speed, min: -25, max: 25, cmd: 'SetReverbModSpeed', format: signed },
      { label: t('effects.modDepth'), value: c.reverb.mod_depth, min: -25, max: 25, cmd: 'SetReverbModDepth', format: signed },
    ],
    echo: [
      { label: t('effects.amount'), value: c.echo.amount, min: 0, max: 100, cmd: 'SetEchoAmount', format: pct },
      { label: t('effects.feedback'), value: c.echo.feedback, min: 0, max: 100, cmd: 'SetEchoFeedback', format: pct },
      { label: t('effects.tempo'), value: c.echo.tempo, min: 45, max: 300, cmd: 'SetEchoTempo', format: (v) => `${v} BPM` },
      { label: t('effects.delayLeft'), value: c.echo.delay_left, min: 0, max: 2500, cmd: 'SetEchoDelayLeft', format: ms },
      { label: t('effects.delayRight'), value: c.echo.delay_right, min: 0, max: 2500, cmd: 'SetEchoDelayRight', format: ms },
      { label: t('effects.feedbackLeft'), value: c.echo.feedback_left, min: 0, max: 100, cmd: 'SetEchoFeedbackLeft', format: pct },
      { label: t('effects.feedbackRight'), value: c.echo.feedback_right, min: 0, max: 100, cmd: 'SetEchoFeedbackRight', format: pct },
      { label: t('effects.crossLR'), value: c.echo.feedback_xfb_l_to_r, min: 0, max: 100, cmd: 'SetEchoFeedbackXFBLtoR', format: pct },
      { label: t('effects.crossRL'), value: c.echo.feedback_xfb_r_to_l, min: 0, max: 100, cmd: 'SetEchoFeedbackXFBRtoL', format: pct },
    ],
    pitch: [
      { label: t('effects.amount'), value: c.pitch.amount, min: -pitchRange.value, max: pitchRange.value, cmd: 'SetPitchAmount', format: signed },
      { label: t('effects.character'), value: c.pitch.character, min: 0, max: 100, cmd: 'SetPitchCharacter', format: pct },
    ],
    gender: [
      { label: t('effects.amount'), value: c.gender.amount, min: -genderRange.value, max: genderRange.value, cmd: 'SetGenderAmount', format: signed },
    ],
    megaphone: [
      { label: t('effects.amount'), value: c.megaphone.amount, min: 0, max: 100, cmd: 'SetMegaphoneAmount', format: pct },
      { label: t('effects.postGain'), value: c.megaphone.post_gain, min: -20, max: 20, cmd: 'SetMegaphonePostGain', format: dB },
    ],
    robot: [
      ...RobotRanges.flatMap((range) => {
        const key = range === 'Low' ? 'low' : range === 'Medium' ? 'mid' : 'high'
        const freq: [number, number] = range === 'Low' ? [0, 88] : range === 'Medium' ? [86, 184] : [182, 240]
        const name = label('RobotRange', range)
        return [
          { label: t('effects.robotGain', { range: name }), value: c.robot[`${key}_gain`], min: -12, max: 12, cmd: 'SetRobotGain', args: [range], format: dB },
          { label: t('effects.robotFreq', { range: name }), value: c.robot[`${key}_freq`], min: freq[0], max: freq[1], cmd: 'SetRobotFreq', args: [range] },
          { label: t('effects.robotWidth', { range: name }), value: c.robot[`${key}_width`], min: 0, max: 32, cmd: 'SetRobotWidth', args: [range] },
        ] as Param[]
      }),
      { label: t('effects.waveform'), value: c.robot.waveform, min: 0, max: 2, cmd: 'SetRobotWaveform' },
      { label: t('effects.pulseWidth'), value: c.robot.pulse_width, min: 0, max: 100, cmd: 'SetRobotPulseWidth', format: pct },
      { label: t('effects.threshold'), value: c.robot.threshold, min: -36, max: 0, cmd: 'SetRobotThreshold', format: dB },
      { label: t('effects.dryMix'), value: c.robot.dry_mix, min: -36, max: 0, cmd: 'SetRobotDryMix', format: dB },
    ],
    hardtune: [
      { label: t('effects.amount'), value: c.hard_tune.amount, min: 0, max: 100, cmd: 'SetHardTuneAmount', format: pct },
      { label: t('effects.rate'), value: c.hard_tune.rate, min: 0, max: 100, cmd: 'SetHardTuneRate', format: pct },
      { label: t('effects.window'), value: c.hard_tune.window, min: 0, max: 600, cmd: 'SetHardTuneWindow', format: ms },
    ],
  }
})

const styles = computed(() => {
  const c = cur.value
  return {
    reverb: { value: c.reverb.style, cmd: 'SetReverbStyle', options: options('ReverbStyle', ReverbStyles) },
    echo: { value: c.echo.style, cmd: 'SetEchoStyle', options: options('EchoStyle', EchoStyles) },
    pitch: { value: c.pitch.style, cmd: 'SetPitchStyle', options: options('PitchStyle', PitchStyles) },
    gender: { value: c.gender.style, cmd: 'SetGenderStyle', options: options('GenderStyle', GenderStyles) },
    megaphone: { value: c.megaphone.style, cmd: 'SetMegaphoneStyle', options: options('MegaphoneStyle', MegaphoneStyles) },
    robot: { value: c.robot.style, cmd: 'SetRobotStyle', options: options('RobotStyle', RobotStyles) },
    hardtune: { value: c.hard_tune.style, cmd: 'SetHardTuneStyle', options: options('HardTuneStyle', HardTuneStyles) },
  }[tab.value] as { value: string; cmd: string; options: { value: string; label: string }[] }
})

const presets = computed(() =>
  EffectBankPresetList.map((preset, index) => ({
    preset,
    index: index + 1,
    name: fx.value!.preset_names[preset] ?? t('effects.preset', { n: index + 1 }),
    active: fx.value!.active_preset === preset,
  })),
)

const library = computed(() => daemon.status?.files.presets ?? [])

async function rename() {
  const current = fx.value!.preset_names[fx.value!.active_preset] ?? ''
  const name = await prompt.ask({ title: t('effects.renameTitle'), input: t('common.name'), initial: current, confirm: t('common.rename') })
  if (name) void send('RenameActivePreset', name)
}
</script>

<template>
  <div v-if="fx">
    <div class="page-title">
      <h1 class="display">{{ t('nav.effects') }}</h1>
      <span class="rule" aria-hidden="true" />
      <div class="toggles" role="group" :aria-label="t('effects.switches')">
        <button
          v-for="toggle in toggles"
          :key="toggle.key"
          type="button"
          class="fxkey hover-lift"
          :aria-pressed="toggle.on"
          :style="{ '--c': toggle.color }"
          @click="send(toggle.cmd, !toggle.on)"
        >
          <span class="led" aria-hidden="true" />
          {{ toggle.label }}
        </button>
      </div>
    </div>

    <div class="stack">
      <div class="presets" role="radiogroup" :aria-label="t('effects.presets')">
        <button
          v-for="p in presets"
          :key="p.preset"
          type="button"
          role="radio"
          class="preset hover-lift rise"
          :style="{ animationDelay: `${p.index * 0.04}s` }"
          :aria-checked="p.active"
          @click="send('SetActiveEffectPreset', p.preset)"
        >
          <span class="n">0{{ p.index }}</span>
          <span class="pname">{{ p.name }}</span>
        </button>
      </div>
      <div class="preset-tools">
        <GSelect
          v-if="library.length"
          class="lib"
          :label="t('effects.loadFromLibrary')"
          hide-label
          value=""
          :options="[{ value: '', label: t('effects.choosePreset') }, ...library.map((n) => ({ value: n, label: n }))]"
          @update="$event && send('LoadEffectPreset', $event)"
        />
        <GButton small @click="rename">{{ t('common.rename') }}</GButton>
        <GButton small variant="primary" @click="send('SaveActivePreset')">{{ t('effects.savePreset') }}</GButton>
      </div>

      <section class="knobs" :aria-label="t('effects.encoders')">
        <div
          v-for="(k, i) in knobs"
          :key="k.key"
          class="knobcard chamfer rise"
          :style="{ '--c': k.color, animationDelay: `${0.1 + i * 0.07}s` }"
        >
          <div class="kglow breathe" aria-hidden="true" />
          <span class="kstripe" aria-hidden="true" />
          <div class="khead">
            <h2 class="display">{{ k.label }}</h2>
            <span>{{ k.style }}</span>
          </div>
          <GKnob
            :label="k.label"
            :value="k.value"
            :min="k.min"
            :max="k.max"
            :color="k.color"
            :format="k.min < 0 ? signed : String"
            @update="send(k.cmd, $event)"
          />
          <span class="unit">{{ k.unit }}</span>
        </div>
      </section>

      <GPanel :delay="0.35">
        <GTabs :label="t('effects.details')" :value="tab" :tabs="tabs" @update="tab = $event">
          <GSegmented small :label="t('effects.style')" :value="styles.value" :options="styles.options" @update="send(styles.cmd, $event)" />
          <GSelect
            v-if="tab === 'hardtune'"
            class="source"
            :label="t('effects.source')"
            :value="cur.hard_tune.source"
            :options="options('HardTuneSource', HardTuneSources)"
            @update="send('SetHardTuneSource', $event)"
          />
          <div class="params">
            <GSlider
              v-for="p in params[tab]"
              :key="p.label"
              :label="p.label"
              :value="p.value"
              :min="p.min"
              :max="p.max"
              :format="p.format"
              @update="send(p.cmd, ...(p.args ?? []), $event)"
            />
          </div>
        </GTabs>
      </GPanel>
    </div>
  </div>
  <p v-else class="muted">{{ t('effects.unsupported') }}</p>
</template>

<style scoped>
.toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.fxkey {
  --chamfer: 10px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 0 16px 0 14px;
  border: 1px solid var(--line-strong);
  background: var(--panel);
  color: var(--muted);
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  clip-path: polygon(0 0, calc(100% - var(--chamfer)) 0, 100% var(--chamfer), 100% 100%, 0 100%);
}
.led {
  width: 8px;
  height: 8px;
  background: var(--off);
  transform: rotate(45deg);
  transition: all 0.2s;
}
.fxkey[aria-pressed='true'] {
  border-color: var(--c);
  color: var(--text);
  box-shadow: 0 0 16px -4px var(--c);
}
.fxkey[aria-pressed='true'] .led {
  background: var(--c);
  box-shadow: 0 0 10px var(--c);
}
.presets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 8px;
}
.preset {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 64px;
  padding: 0 20px;
  border: 0;
  background: var(--panel);
  color: var(--soft);
  text-align: left;
  clip-path: polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%);
}
.preset[aria-checked='true'] {
  background: var(--accent);
  color: var(--on-accent);
  box-shadow: 0 0 24px -4px var(--accent);
}
.n {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 700;
  font-size: 24px;
  opacity: 0.55;
}
.pname {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.preset-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}
.lib {
  margin-right: auto;
  min-width: 220px;
}
.knobs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 12px;
}
.knobcard {
  --chamfer: 20px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 18px;
  background: var(--panel);
  transition: transform 0.25s ease;
}
.knobcard:hover {
  transform: translateY(-4px);
}
.kglow {
  position: absolute;
  left: -10%;
  right: -10%;
  top: 14%;
  height: 70%;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--c) 20%, transparent), transparent);
  pointer-events: none;
}
.kstripe {
  position: absolute;
  top: 0;
  left: 0;
  width: 40%;
  height: 3px;
  background: var(--c);
  box-shadow: 0 0 10px var(--c);
  transform: skewX(-30deg) translateX(-6px);
}
.khead {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.khead h2 {
  margin: 0;
  font-size: 18px;
}
.khead span {
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c);
}
.unit {
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.source {
  margin-top: 10px;
}
.params {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr));
  column-gap: 48px;
  margin-top: 12px;
}
</style>
