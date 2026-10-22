<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { goxlr } from '@/api/commands'
import { toCss, volumeText } from '@/api/format'
import { ChannelNames, MuteFunctions, type FaderName, type MuteState } from '@/api/types'
import { useDaemon } from '@/stores/daemon'
import { useLabels } from '@/composables/labels'
import Scribble from '@/components/Scribble.vue'
import GVFader from '@/components/ui/GVFader.vue'
import GSelect from '@/components/ui/GSelect.vue'

const props = defineProps<{ fader: FaderName; index: number; micLevel: number | null }>()

const daemon = useDaemon()
const { t } = useI18n()
const { label, options } = useLabels()

const status = computed(() => daemon.mixer!.fader_status[props.fader])
const volume = computed(() => daemon.mixer!.levels.volumes[status.value.channel])
const muted = computed(() => status.value.mute_state !== 'Unmuted')
const led = computed(() => {
  const colour = daemon.mixer!.lighting.faders[props.fader]?.colours.colour_one
  return !colour || colour === '000000' ? 'var(--accent)' : toCss(colour)
})
const channelName = computed(() => label('ChannelName', status.value.channel))
const showMeter = computed(() => status.value.channel === 'Mic' && props.micLevel !== null)
const meter = computed(() => `${Math.max(0, ((props.micLevel ?? -72) + 72) / 72) * 100}%`)

function toggleMute() {
  const next: MuteState = muted.value
    ? 'Unmuted'
    : status.value.mute_type === 'All'
      ? 'MutedToAll'
      : 'MutedToX'
  void daemon.command(goxlr('SetFaderMuteState', props.fader, next))
}
</script>

<template>
  <article class="strip chamfer rise" :style="{ animationDelay: `${index * 0.07}s`, '--led': led }">
    <div class="glow breathe" :class="{ off: muted }" aria-hidden="true" />
    <span class="stripe" aria-hidden="true" />

    <Scribble :serial="daemon.serial!" :fader="fader" :scribble="status.scribble" :fallback="channelName" />

    <div class="head">
      <span class="tag">{{ t('mixer.fader', { name: fader }) }}</span>
      <GSelect
        class="channel"
        :label="t('mixer.channelFor', { name: fader })"
        hide-label
        :value="status.channel"
        :options="options('ChannelName', ChannelNames)"
        @update="daemon.command(goxlr('SetFader', fader, $event))"
      />
    </div>

    <div class="faders">
      <GVFader
        :label="t('mixer.volumeOf', { channel: channelName })"
        :value="volume"
        :color="led"
        :dimmed="muted"
        :format="volumeText"
        @update="daemon.command(goxlr('SetVolume', status.channel, $event))"
      />
      <div v-if="showMeter" class="meter" aria-hidden="true">
        <span :style="{ height: meter }" />
      </div>
    </div>

    <button
      type="button"
      class="mute hover-lift"
      :class="{ on: muted }"
      :aria-pressed="muted"
      :aria-label="t('mixer.muteChannel', { channel: channelName })"
      @click="toggleMute"
    >
      <span class="display">{{ muted ? t('mixer.muted') : t('mixer.mute') }}</span>
    </button>
    <GSelect
      :label="t('mixer.muteFunction')"
      hide-label
      class="fn"
      :value="status.mute_type"
      :options="options('MuteFunction', MuteFunctions)"
      @update="daemon.command(goxlr('SetFaderMuteFunction', fader, $event))"
    />
  </article>
</template>

<style scoped>
.strip {
  --chamfer: 18px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  min-width: 0;
  padding: 16px 14px 18px;
  background: var(--panel);
  transition: transform 0.25s ease;
}
.strip:hover {
  transform: translateY(-3px);
}
.glow {
  position: absolute;
  left: -40%;
  right: -40%;
  bottom: -20%;
  height: 60%;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--led) 34%, transparent), transparent);
  pointer-events: none;
  transition: opacity 0.4s;
}
.glow.off {
  opacity: 0 !important;
  animation: none;
}
.stripe {
  position: absolute;
  top: 0;
  left: 0;
  width: 46%;
  height: 3px;
  background: var(--led);
  box-shadow: 0 0 10px var(--led);
  transform: skewX(-30deg) translateX(-6px);
}
.head {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}
.tag {
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--led);
}
.channel :deep(select) {
  width: 100%;
  font-style: italic;
  font-weight: 700;
  font-size: 16px;
  text-transform: uppercase;
}
.faders {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 2px;
}
.meter {
  width: 5px;
  height: 290px;
  background: var(--well);
  display: flex;
  align-items: flex-end;
}
.meter span {
  width: 100%;
  background: var(--led);
  box-shadow: 0 0 8px var(--led);
  transition: height 0.08s linear;
}
.mute {
  --chamfer: 12px;
  position: relative;
  width: 100%;
  height: 50px;
  border: 1px solid var(--line-strong);
  background: var(--bar);
  color: var(--text);
  clip-path: polygon(0 0, calc(100% - var(--chamfer)) 0, 100% var(--chamfer), 100% 100%, var(--chamfer) 100%, 0 calc(100% - var(--chamfer)));
  font-size: 15px;
  letter-spacing: 0.14em;
}
.mute.on {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--on-accent);
  box-shadow: 0 0 22px var(--accent);
}
.fn {
  position: relative;
  width: 100%;
  margin-top: -6px;
}
.fn :deep(select) {
  width: 100%;
  height: 32px;
  font-size: 12px;
  color: var(--muted);
}
</style>
