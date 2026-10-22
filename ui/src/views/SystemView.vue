<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { daemon as daemonCmd, goxlr } from '@/api/commands'
import { version } from '@/api/format'
import { FirmwareSources, LogLevels, PathTypeList, VodModes, type UpdateState } from '@/api/types'
import { useDaemon } from '@/stores/daemon'
import { usePrompt } from '@/stores/prompt'
import { ACCENTS, useUi } from '@/stores/ui'
import { useLabels } from '@/composables/labels'
import GPanel from '@/components/ui/GPanel.vue'
import GSlider from '@/components/ui/GSlider.vue'
import GSelect from '@/components/ui/GSelect.vue'
import GToggle from '@/components/ui/GToggle.vue'
import GButton from '@/components/ui/GButton.vue'

const daemon = useDaemon()
const prompt = usePrompt()
const ui = useUi()
const { t } = useI18n()
const { label, options } = useLabels()

const send = (name: string, ...args: unknown[]) => daemon.command(goxlr(name, ...args))
const sendDaemon = (name: string, ...args: unknown[]) => daemon.daemonCommand(daemonCmd(name, ...args))

const config = computed(() => daemon.status!.config)
const m = computed(() => daemon.mixer!)
const hw = computed(() => m.value.hardware)
const settings = computed(() => m.value.settings)

const info = computed(() => [
  [t('system.serial'), hw.value.serial_number],
  [t('system.model'), label('DeviceType', hw.value.device_type)],
  [t('system.colourway'), label('ColourWay', hw.value.colour_way)],
  [t('system.firmware'), version(hw.value.versions.firmware)],
  [t('system.dice'), version(hw.value.versions.dice)],
  [t('system.fpga'), String(hw.value.versions.fpga_count)],
  [t('system.manufactured'), hw.value.manufactured_date],
  [t('system.usb'), `${hw.value.usb_device.bus_number}:${hw.value.usb_device.address}`],
  [t('system.daemon'), config.value.daemon_version],
  [t('system.driver'), [config.value.driver_interface.interface, config.value.driver_interface.version && version(config.value.driver_interface.version)].filter(Boolean).join(' ')],
  [t('system.platform'), config.value.platform],
])

const latest = computed(() => config.value.latest_firmware?.[hw.value.device_type] ?? null)
const updateAvailable = computed(() => {
  const next = latest.value?.version
  if (!next) return false
  const current = hw.value.versions.firmware
  for (let i = 0; i < 4; i++) {
    const a = next[i] ?? 0
    const b = current[i] ?? 0
    if (a !== b) return a > b
  }
  return false
})
const firmware = computed(() => daemon.status!.firmware[daemon.serial!] ?? null)
const stateName = (state: UpdateState) => (typeof state === 'string' ? state : 'Pause')
const busy = computed(() => firmware.value && !['Failed', 'Complete'].includes(stateName(firmware.value.state)))

async function updateFirmware() {
  const ok = await prompt.ask({
    title: t('system.updateTitle'),
    message: t('system.updateHint'),
    confirm: t('system.update'),
  })
  if (ok !== null) void daemon.request({ RunFirmwareUpdate: [daemon.serial!, null, false] })
}

const locales = computed(() => [
  { value: '', label: t('system.localeSystem', { locale: config.value.locale.system_locale }) },
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
])

async function stopDaemon() {
  const ok = await prompt.ask({ title: t('system.stopTitle'), message: t('system.stopHint'), confirm: t('system.stop'), danger: true })
  if (ok !== null) void sendDaemon('StopDaemon')
}
</script>

<template>
  <div>
    <div class="page-title">
      <h1 class="display">{{ t('nav.system') }}</h1>
      <span class="rule" aria-hidden="true" />
    </div>

    <div class="grid-auto" style="--min: 420px">
      <GPanel :title="t('system.device')">
        <dl class="info">
          <template v-for="[key, value] in info" :key="key">
            <dt>{{ key }}</dt>
            <dd class="num">{{ value }}</dd>
          </template>
        </dl>
      </GPanel>

      <GPanel :title="t('system.firmwareTitle')" :delay="0.05">
        <p class="fw">
          <span class="muted">{{ t('system.installed') }}</span>
          <strong class="num">{{ version(hw.versions.firmware) }}</strong>
          <span class="muted">{{ t('system.latest') }}</span>
          <strong class="num">{{ version(latest?.version) }}</strong>
        </p>
        <div v-if="firmware" class="progress" role="progressbar" :aria-valuenow="firmware.progress" aria-valuemin="0" aria-valuemax="100" :aria-label="label('UpdateState', stateName(firmware.state))">
          <span :style="{ width: `${firmware.progress}%` }" />
          <em>{{ label('UpdateState', stateName(firmware.state)) }} · {{ firmware.progress }} %</em>
        </div>
        <p v-if="firmware?.error" class="err">{{ firmware.error }}</p>
        <div class="row">
          <GButton v-if="!firmware" :variant="updateAvailable ? 'primary' : 'ghost'" @click="updateFirmware">
            {{ updateAvailable ? t('system.update') : t('system.reinstall') }}
          </GButton>
          <GButton v-if="firmware && stateName(firmware.state) === 'Pause'" variant="primary" @click="daemon.request({ ContinueFirmwareUpdate: daemon.serial! })">
            {{ t('system.continue') }}
          </GButton>
          <GButton v-if="firmware && !busy" @click="daemon.request({ ClearFirmwareState: daemon.serial! })">{{ t('common.dismiss') }}</GButton>
        </div>
        <GSelect :label="t('system.firmwareSource')" :value="config.firmware_source" :options="options('FirmwareSource', FirmwareSources)" @update="sendDaemon('SetFirmwareSource', $event)" />
      </GPanel>

      <GPanel :title="t('system.behaviour')" :delay="0.1">
        <GSlider :label="t('system.muteHold')" :value="settings.mute_hold_duration" :max="2000" :step="50" :format="(v) => `${v} ms`" @update="send('SetMuteHoldDuration', $event)" />
        <GToggle :label="t('system.vcMute')" :description="t('system.vcMuteHint')" :value="settings.vc_mute_also_mute_cm" @update="send('SetVCMuteAlsoMuteCM', $event)" />
        <GToggle :label="t('system.monitorFx')" :value="settings.enable_monitor_with_fx" @update="send('SetMonitorWithFx', $event)" />
        <GToggle :label="t('system.lockFaders')" :description="t('system.lockFadersHint')" :value="settings.lock_faders" @update="send('SetLockFaders', $event)" />
        <GSelect v-if="!daemon.isMini" :label="t('system.vod')" :value="settings.vod_mode" :options="options('VodMode', VodModes)" @update="send('SetVodMode', $event)" />
      </GPanel>

      <GPanel :title="t('system.utility')" :delay="0.15">
        <GToggle :label="t('system.autostart')" :value="config.autostart_enabled" @update="sendDaemon('SetAutoStartEnabled', $event)" />
        <GToggle :label="t('system.tray')" :value="config.show_tray_icon" @update="sendDaemon('SetShowTrayIcon', $event)" />
        <GToggle :label="t('system.openUi')" :value="config.open_ui_on_launch" @update="sendDaemon('SetUiLaunchOnLoad', $event)" />
        <GToggle :label="t('system.network')" :description="t('system.networkHint')" :value="config.allow_network_access" @update="sendDaemon('SetAllowNetworkAccess', $event)" />
        <GToggle v-if="config.tts_enabled !== null" :label="t('system.tts')" :value="config.tts_enabled" @update="sendDaemon('SetTTSEnabled', $event)" />
        <GToggle v-if="config.platform === 'macos'" :label="t('system.aggregates')" :value="config.handle_macos_aggregates" @update="sendDaemon('HandleMacOSAggregates', $event)" />
        <GSelect :label="t('system.language')" :value="config.locale.user_locale ?? ''" :options="locales" @update="sendDaemon('SetLocale', $event || null)" />
        <GSelect :label="t('system.logLevel')" :value="config.log_level" :options="options('LogLevel', LogLevels)" @update="sendDaemon('SetLogLevel', $event)" />
      </GPanel>

      <GPanel :title="t('system.interface')" :delay="0.2">
        <div class="accents" role="radiogroup" :aria-label="t('system.accent')">
          <span class="muted">{{ t('system.accent') }}</span>
          <button
            v-for="accent in ACCENTS"
            :key="accent"
            type="button"
            role="radio"
            class="swatch hover-lift"
            :aria-checked="ui.accent === accent"
            :aria-label="accent"
            :style="{ background: accent, '--accent': accent }"
            @click="ui.accent = accent"
          />
        </div>
        <GToggle :label="t('system.calm')" :description="t('system.calmHint')" :value="ui.calm" @update="ui.calm = $event" />
      </GPanel>

      <GPanel :title="t('system.folders')" :delay="0.25">
        <div class="folders">
          <GButton v-for="path in PathTypeList" :key="path" small @click="sendDaemon('OpenPath', path)">{{ label('PathTypes', path) }}</GButton>
        </div>
        <div class="danger">
          <GButton variant="danger" @click="stopDaemon">{{ t('system.stop') }}</GButton>
        </div>
      </GPanel>
    </div>
  </div>
</template>

<style scoped>
.info {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 8px 20px;
  margin: 0;
}
dt {
  color: var(--muted);
}
dd {
  margin: 0;
  overflow-wrap: anywhere;
}
.fw {
  display: grid;
  grid-template-columns: max-content max-content;
  gap: 6px 16px;
  margin: 0 0 14px;
}
.fw strong {
  font-size: 18px;
}
.progress {
  position: relative;
  height: 32px;
  margin-bottom: 10px;
  background: var(--well);
  overflow: hidden;
}
.progress span {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--accent);
  box-shadow: 0 0 16px var(--accent);
  transition: width 0.3s;
}
.progress em {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 12px;
  font-style: normal;
  font-family: var(--font-display);
  font-weight: 600;
  mix-blend-mode: difference;
}
.err {
  color: var(--accent);
}
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}
.accents {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  min-height: 44px;
}
.accents .muted {
  margin-right: auto;
}
.swatch {
  width: 40px;
  height: 28px;
  border: 0;
  clip-path: polygon(7px 0, 100% 0, calc(100% - 7px) 100%, 0 100%);
}
.swatch[aria-checked='true'] {
  outline: 2px solid var(--text);
  outline-offset: 2px;
  clip-path: none;
}
.folders {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.danger {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}
</style>
