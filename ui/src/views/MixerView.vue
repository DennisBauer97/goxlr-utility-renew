<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { goxlr } from '@/api/commands'
import { dB, volumeText } from '@/api/format'
import {
  ChannelNames,
  FaderNames,
  MuteFunctions,
  OutputDevices,
  SubMixChannelNames,
  type ChannelName,
  type SubMixChannelName,
} from '@/api/types'
import { useDaemon } from '@/stores/daemon'
import { useLabels } from '@/composables/labels'
import { useMicLevel } from '@/composables/micLevel'
import FaderStrip from '@/components/mixer/FaderStrip.vue'
import GPanel from '@/components/ui/GPanel.vue'
import GSlider from '@/components/ui/GSlider.vue'
import GSelect from '@/components/ui/GSelect.vue'
import GSegmented from '@/components/ui/GSegmented.vue'
import GToggle from '@/components/ui/GToggle.vue'
import GButton from '@/components/ui/GButton.vue'

const daemon = useDaemon()
const { t } = useI18n()
const { label, options } = useLabels()
const m = computed(() => daemon.mixer!)

const onFaders = computed(() => new Set(FaderNames.map((f) => m.value.fader_status[f].channel)))
const others = computed(() => ChannelNames.filter((c) => !onFaders.value.has(c)))
const micOnFader = computed(() => onFaders.value.has('Mic'))
const { level } = useMicLevel(micOnFader)

const cough = computed(() => m.value.cough_button)
const coughMuted = computed(() => cough.value.state !== 'Unmuted')
const submix = computed(() => m.value.levels.submix)

function toggleCough() {
  const next = coughMuted.value ? 'Unmuted' : cough.value.mute_type === 'All' ? 'MutedToAll' : 'MutedToX'
  void daemon.command(goxlr('SetCoughMuteState', next))
}

const mixOptions = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
] as const

const isSubmixChannel = (c: ChannelName): c is SubMixChannelName =>
  (SubMixChannelNames as readonly string[]).includes(c)
</script>

<template>
  <div>
    <div class="page-title">
      <h1 class="display">{{ t('nav.mixer') }}</h1>
      <span class="rule" aria-hidden="true" />
      <span class="label">{{ t('mixer.subtitle', { serial: daemon.serial }) }}</span>
    </div>

    <div class="layout">
      <section class="faders" :aria-label="t('mixer.faders')">
        <FaderStrip
          v-for="(fader, index) in FaderNames"
          :key="fader"
          :fader="fader"
          :index="index"
          :mic-level="m.fader_status[fader].channel === 'Mic' ? level : null"
        />
      </section>

      <aside class="stack">
        <GPanel :title="t('mixer.keys')" :delay="0.25">
          <div class="keys">
            <GButton
              variant="key"
              class="key"
              :pressed="cough.is_toggle ? coughMuted : undefined"
              :disabled="!cough.is_toggle"
              :title="cough.is_toggle ? undefined : t('mixer.coughHoldHint')"
              @click="toggleCough"
            >
              {{ t('mixer.cough') }}
            </GButton>
            <GSegmented
              small
              :label="t('mixer.coughMode')"
              :value="cough.is_toggle ? 'toggle' : 'hold'"
              :options="[
                { value: 'hold', label: t('mixer.hold') },
                { value: 'toggle', label: t('mixer.toggle') },
              ]"
              @update="daemon.command(goxlr('SetCoughIsHold', $event === 'hold'))"
            />
          </div>
          <GSelect
            :label="t('mixer.coughMutes')"
            :value="cough.mute_type"
            :options="options('MuteFunction', MuteFunctions)"
            @update="daemon.command(goxlr('SetCoughMuteFunction', $event))"
          />
          <GSlider
            :label="t('mixer.bleep')"
            :value="m.levels.bleep"
            :min="-36"
            :max="0"
            :format="dB"
            @update="daemon.command(goxlr('SetSwearButtonVolume', $event))"
          />
        </GPanel>

        <GPanel :title="t('mixer.otherChannels')" :delay="0.35">
          <GSlider
            v-for="channel in others"
            :key="channel"
            :label="label('ChannelName', channel)"
            :value="m.levels.volumes[channel]"
            :max="255"
            :format="volumeText"
            @update="daemon.command(goxlr('SetVolume', channel, $event))"
          />
        </GPanel>
      </aside>
    </div>

    <div v-if="m.levels.submix_supported" class="submix grid-auto" style="--min: 420px">
      <GPanel :title="t('mixer.submix')" :delay="0.45">
        <template #actions>
          <GToggle
            class="inline-toggle"
            :label="t('common.enabled')"
            :value="!!submix"
            @update="daemon.command(goxlr('SetSubMixEnabled', $event))"
          />
        </template>
        <p v-if="!submix" class="muted">{{ t('mixer.submixHint') }}</p>
        <template v-else>
          <div v-for="output in OutputDevices" :key="output" class="row">
            <span>{{ label('OutputDevice', output) }}</span>
            <GSegmented
              small
              :label="t('mixer.mixFor', { output: label('OutputDevice', output) })"
              :value="submix.outputs[output]"
              :options="mixOptions"
              @update="daemon.command(goxlr('SetSubMixOutputMix', output, $event))"
            />
          </div>
          <GSelect
            :label="t('mixer.monitor')"
            :value="m.levels.output_monitor"
            :options="options('OutputDevice', OutputDevices)"
            @update="daemon.command(goxlr('SetMonitorMix', $event))"
          />
        </template>
      </GPanel>

      <GPanel v-if="submix" :title="t('mixer.mixB')" :delay="0.5">
        <div v-for="channel in ChannelNames.filter(isSubmixChannel)" :key="channel" class="mixb">
          <GSlider
            :label="label('ChannelName', channel)"
            :value="submix.inputs[channel].volume"
            :max="255"
            :format="volumeText"
            @update="daemon.command(goxlr('SetSubMixVolume', channel, $event))"
          />
          <GButton
            small
            :pressed="submix.inputs[channel].linked"
            :aria-label="t('mixer.link', { channel: label('ChannelName', channel) })"
            @click="daemon.command(goxlr('SetSubMixLinked', channel, !submix.inputs[channel].linked))"
          >
            {{ submix.inputs[channel].linked ? t('mixer.linked') : t('mixer.unlinked') }}
          </GButton>
        </div>
      </GPanel>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: flex-start;
}
.faders {
  flex: 3 1 620px;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
aside {
  flex: 1 1 330px;
  min-width: 0;
}
.keys {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.key {
  flex: 1 1 120px;
  min-height: 48px;
}
.submix {
  margin-top: 18px;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
}
.mixb {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
}
.inline-toggle {
  width: auto;
}
@media (max-width: 760px) {
  .faders {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
