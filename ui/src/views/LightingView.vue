<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { goxlr } from '@/api/commands'
import { toCss } from '@/api/format'
import {
  AnimationModes,
  ButtonColourOffStyles,
  Buttons,
  EncoderColourTargetList,
  FaderDisplayStyles,
  FaderNames,
  SamplerColourTargetList,
  SimpleColourTargetList,
  WaterfallDirections,
  type Button,
} from '@/api/types'
import { useDaemon } from '@/stores/daemon'
import { useLabels } from '@/composables/labels'
import Scribble from '@/components/Scribble.vue'
import GPanel from '@/components/ui/GPanel.vue'
import GSlider from '@/components/ui/GSlider.vue'
import GSelect from '@/components/ui/GSelect.vue'
import GColour from '@/components/ui/GColour.vue'
import GField from '@/components/ui/GField.vue'
import GToggle from '@/components/ui/GToggle.vue'
import GTabs from '@/components/ui/GTabs.vue'

const daemon = useDaemon()
const { t } = useI18n()
const { label, options } = useLabels()
const send = (name: string, ...args: unknown[]) => daemon.command(goxlr(name, ...args))

const lighting = computed(() => daemon.mixer!.lighting)
const animation = computed(() => lighting.value.animation)
const animationModes = computed(() => AnimationModes.filter((mode) => !(daemon.isMini && mode === 'Ripple')))
const global = ref('00FFFF')

const buttonGroups: { key: string; buttons: Button[] }[] = [
  { key: 'faderMute', buttons: ['Fader1Mute', 'Fader2Mute', 'Fader3Mute', 'Fader4Mute'] },
  { key: 'mic', buttons: ['Cough', 'Bleep'] },
  { key: 'effectSelect', buttons: ['EffectSelect1', 'EffectSelect2', 'EffectSelect3', 'EffectSelect4', 'EffectSelect5', 'EffectSelect6'] },
  { key: 'effectTypes', buttons: ['EffectFx', 'EffectMegaphone', 'EffectRobot', 'EffectHardTune'] },
  { key: 'sampler', buttons: ['SamplerTopLeft', 'SamplerTopRight', 'SamplerBottomLeft', 'SamplerBottomRight', 'SamplerClear'] },
]
const groups = computed(() =>
  buttonGroups
    .map((g) => ({ ...g, buttons: g.buttons.filter((b) => lighting.value.buttons[b]) }))
    .filter((g) => g.buttons.length),
)
// Buttons not covered by a group (e.g. sampler bank selectors on firmware that reports them).
const covered = new Set(buttonGroups.flatMap((g) => g.buttons))
const extraButtons = computed(() => Buttons.filter((b) => !covered.has(b) && lighting.value.buttons[b] && !b.startsWith('SamplerSelect')))

type Tab = 'faders' | 'buttons' | 'encoders' | 'other'
const tab = ref<Tab>('faders')
const tabs = computed(() =>
  (['faders', 'buttons', 'encoders', 'other'] as const)
    .filter((value) => value !== 'encoders' || !daemon.isMini)
    .map((value) => ({ value, label: t(`lighting.tabs.${value}`) })),
)

const icons = computed(() => [
  { value: '', label: t('lighting.noIcon') },
  ...(daemon.status?.files.icons ?? []).map((name) => ({ value: name, label: name })),
])
</script>

<template>
  <div>
    <div class="page-title">
      <h1 class="display">{{ t('nav.lighting') }}</h1>
      <span class="rule" aria-hidden="true" />
      <span class="label">{{ t('lighting.subtitle') }}</span>
    </div>

    <div class="stack">
      <div class="grid-auto" style="--min: 400px">
        <GPanel :title="t('lighting.global')">
          <p class="muted hint">{{ t('lighting.globalHint') }}</p>
          <GColour :label="t('lighting.globalColour')" :value="global" @update="(global = $event), send('SetGlobalColour', $event)" />
        </GPanel>

        <GPanel v-if="animation.supported" :title="t('lighting.animation')" :delay="0.06">
          <div class="aura preview" aria-hidden="true" />
          <GSelect :label="t('lighting.mode')" :value="animation.mode" :options="options('AnimationMode', animationModes)" @update="send('SetAnimationMode', $event)" />
          <template v-if="animation.mode !== 'None'">
            <GSlider :label="t('lighting.mod1')" :value="animation.mod1" @update="send('SetAnimationMod1', $event)" />
            <GSlider :label="t('lighting.mod2')" :value="animation.mod2" @update="send('SetAnimationMod2', $event)" />
            <GSelect :label="t('lighting.waterfall')" :value="animation.waterfall_direction" :options="options('WaterfallDirection', WaterfallDirections)" @update="send('SetAnimationWaterfall', $event)" />
          </template>
        </GPanel>
      </div>

      <GPanel :delay="0.12">
        <GTabs :label="t('lighting.areas')" :value="tab" :tabs="tabs" @update="tab = $event">
          <div v-if="tab === 'faders'" class="grid-auto" style="--min: 280px">
            <div v-for="fader in FaderNames" :key="fader" class="tile">
              <div
                class="fpreview"
                aria-hidden="true"
                :style="{
                  background: `linear-gradient(0deg, ${toCss(lighting.faders[fader]?.colours.colour_two)}, ${toCss(lighting.faders[fader]?.colours.colour_one)})`,
                }"
              />
              <div class="tbody">
                <h3 class="display">{{ t('mixer.fader', { name: fader }) }}</h3>
                <GSelect :label="t('lighting.style')" :value="lighting.faders[fader]?.style ?? 'TwoColour'" :options="options('FaderDisplayStyle', FaderDisplayStyles)" @update="send('SetFaderDisplayStyle', fader, $event)" />
                <GColour :label="t('lighting.top')" :value="lighting.faders[fader]?.colours.colour_one ?? '000000'" @update="send('SetFaderColours', fader, $event, lighting.faders[fader]?.colours.colour_two ?? '000000')" />
                <GColour :label="t('lighting.bottom')" :value="lighting.faders[fader]?.colours.colour_two ?? '000000'" @update="send('SetFaderColours', fader, lighting.faders[fader]?.colours.colour_one ?? '000000', $event)" />
              </div>
            </div>
          </div>

          <div v-else-if="tab === 'buttons'" class="stack">
            <section v-for="group in groups" :key="group.key">
              <h3 class="label sub">{{ t(`lighting.groups.${group.key}`) }}</h3>
              <div class="grid-auto" style="--min: 280px">
                <div v-for="button in group.buttons" :key="button" class="tile flat">
                  <span class="bpreview" aria-hidden="true" :style="{ background: toCss(lighting.buttons[button]!.colours.colour_one), boxShadow: `0 0 14px ${toCss(lighting.buttons[button]!.colours.colour_one)}` }" />
                  <div class="tbody">
                    <h4>{{ label('Button', button) }}</h4>
                    <GColour :label="t('lighting.active')" :value="lighting.buttons[button]!.colours.colour_one" @update="send('SetButtonColours', button, $event, lighting.buttons[button]!.colours.colour_two)" />
                    <GColour :label="t('lighting.inactive')" :value="lighting.buttons[button]!.colours.colour_two" @update="send('SetButtonColours', button, lighting.buttons[button]!.colours.colour_one, $event)" />
                    <GSelect :label="t('lighting.offStyle')" :value="lighting.buttons[button]!.off_style" :options="options('ButtonColourOffStyle', ButtonColourOffStyles)" @update="send('SetButtonOffStyle', button, $event)" />
                  </div>
                </div>
              </div>
            </section>
            <section v-if="extraButtons.length">
              <h3 class="label sub">{{ t('lighting.groups.other') }}</h3>
              <div class="grid-auto" style="--min: 280px">
                <div v-for="button in extraButtons" :key="button" class="tile flat">
                  <div class="tbody">
                    <h4>{{ label('Button', button) }}</h4>
                    <GColour :label="t('lighting.active')" :value="lighting.buttons[button]!.colours.colour_one" @update="send('SetButtonColours', button, $event, lighting.buttons[button]!.colours.colour_two)" />
                    <GColour :label="t('lighting.inactive')" :value="lighting.buttons[button]!.colours.colour_two" @update="send('SetButtonColours', button, lighting.buttons[button]!.colours.colour_one, $event)" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div v-else-if="tab === 'encoders'" class="stack">
            <div class="grid-auto" style="--min: 280px">
              <div v-for="encoder in EncoderColourTargetList.filter((e) => lighting.encoders[e])" :key="encoder" class="tile flat">
                <div class="tbody">
                  <h4>{{ label('EncoderColourTargets', encoder) }}</h4>
                  <GColour :label="t('lighting.colourN', { n: 1 })" :value="lighting.encoders[encoder]!.colour_one" @update="send('SetEncoderColour', encoder, $event, lighting.encoders[encoder]!.colour_two, lighting.encoders[encoder]!.colour_three)" />
                  <GColour :label="t('lighting.colourN', { n: 2 })" :value="lighting.encoders[encoder]!.colour_two" @update="send('SetEncoderColour', encoder, lighting.encoders[encoder]!.colour_one, $event, lighting.encoders[encoder]!.colour_three)" />
                  <GColour :label="t('lighting.colourN', { n: 3 })" :value="lighting.encoders[encoder]!.colour_three" @update="send('SetEncoderColour', encoder, lighting.encoders[encoder]!.colour_one, lighting.encoders[encoder]!.colour_two, $event)" />
                </div>
              </div>
            </div>
            <h3 class="label sub">{{ t('lighting.samplerBanks') }}</h3>
            <div class="grid-auto" style="--min: 280px">
              <div v-for="target in SamplerColourTargetList.filter((s) => lighting.sampler[s])" :key="target" class="tile flat">
                <div class="tbody">
                  <h4>{{ label('SamplerColourTargets', target) }}</h4>
                  <GColour :label="t('lighting.colourN', { n: 1 })" :value="lighting.sampler[target]!.colours.colour_one" @update="send('SetSampleColour', target, $event, lighting.sampler[target]!.colours.colour_two, lighting.sampler[target]!.colours.colour_three)" />
                  <GColour :label="t('lighting.colourN', { n: 2 })" :value="lighting.sampler[target]!.colours.colour_two" @update="send('SetSampleColour', target, lighting.sampler[target]!.colours.colour_one, $event, lighting.sampler[target]!.colours.colour_three)" />
                  <GColour :label="t('lighting.colourN', { n: 3 })" :value="lighting.sampler[target]!.colours.colour_three" @update="send('SetSampleColour', target, lighting.sampler[target]!.colours.colour_one, lighting.sampler[target]!.colours.colour_two, $event)" />
                  <GSelect :label="t('lighting.offStyle')" :value="lighting.sampler[target]!.off_style" :options="options('ButtonColourOffStyle', ButtonColourOffStyles)" @update="send('SetSampleOffStyle', target, $event)" />
                </div>
              </div>
            </div>
          </div>

          <div v-else class="grid-auto" style="--min: 280px">
            <div v-for="target in SimpleColourTargetList.filter((s) => s !== 'Global' && lighting.simple[s])" :key="target" class="tile flat">
              <div class="tbody">
                <h4>{{ label('SimpleColourTargets', target) }}</h4>
                <GColour :label="t('lighting.colour')" :value="lighting.simple[target]!.colour_one" @update="send('SetSimpleColour', target, $event)" />
              </div>
            </div>
          </div>
        </GTabs>
      </GPanel>

      <GPanel :title="t('lighting.scribbles')" :delay="0.18">
        <div class="grid-auto" style="--min: 280px">
          <div v-for="fader in FaderNames" :key="fader" class="tile flat">
            <div class="tbody">
              <h4>{{ t('mixer.fader', { name: fader }) }}</h4>
              <Scribble :serial="daemon.serial!" :fader="fader" :scribble="daemon.mixer!.fader_status[fader].scribble" :fallback="label('ChannelName', daemon.mixer!.fader_status[fader].channel)" />
              <GSelect :label="t('lighting.icon')" :value="daemon.mixer!.fader_status[fader].scribble?.file_name ?? ''" :options="icons" @update="send('SetScribbleIcon', fader, $event || null)" />
              <GField :label="t('lighting.text')" :maxlength="16" :value="daemon.mixer!.fader_status[fader].scribble?.bottom_text ?? ''" @update="send('SetScribbleText', fader, $event)" />
              <GField :label="t('lighting.number')" :maxlength="3" :value="daemon.mixer!.fader_status[fader].scribble?.left_text ?? ''" @update="send('SetScribbleNumber', fader, $event)" />
              <GToggle :label="t('lighting.invert')" :value="daemon.mixer!.fader_status[fader].scribble?.inverted ?? false" @update="send('SetScribbleInvert', fader, $event)" />
            </div>
          </div>
        </div>
      </GPanel>
    </div>
  </div>
</template>

<style scoped>
.hint {
  margin: 0 0 6px;
}
.preview {
  height: 4px;
  margin-bottom: 10px;
}
.tile {
  display: flex;
  gap: 14px;
  padding: 14px;
  background: var(--bar);
}
.tile.flat {
  display: block;
}
.tbody {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tile h3,
.tile h4 {
  margin: 0 0 4px;
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.fpreview {
  flex-shrink: 0;
  width: 14px;
  transform: skewX(-6deg);
}
.bpreview {
  display: block;
  width: 36px;
  height: 6px;
  margin-bottom: 10px;
  transform: skewX(-30deg);
}
.sub {
  margin: 0 0 10px;
}
.tile :deep(select) {
  width: 100%;
}
.tile :deep(.field),
.tile :deep(.slider) {
  grid-template-columns: minmax(70px, 96px) minmax(0, 1fr);
}
</style>
