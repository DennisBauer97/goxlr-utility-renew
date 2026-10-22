<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { daemon as daemonCmd, goxlr } from '@/api/commands'
import { useDaemon } from '@/stores/daemon'
import { usePrompt } from '@/stores/prompt'
import ProfileList from '@/components/profiles/ProfileList.vue'

const daemon = useDaemon()
const prompt = usePrompt()
const { t } = useI18n()
const send = (name: string, ...args: unknown[]) => daemon.command(goxlr(name, ...args))

const files = computed(() => daemon.status!.files)
const m = computed(() => daemon.mixer!)

type Kind = 'device' | 'mic'
const commands = {
  device: { load: 'LoadProfile', create: 'NewProfile', save: 'SaveProfile', saveAs: 'SaveProfileAs', remove: 'DeleteProfile', path: 'Profiles' },
  mic: { load: 'LoadMicProfile', create: 'NewMicProfile', save: 'SaveMicProfile', saveAs: 'SaveMicProfileAs', remove: 'DeleteMicProfile', path: 'MicProfiles' },
} as const

async function load(kind: Kind, name: string) {
  const ok = await prompt.ask({ title: t('profiles.loadTitle', { name }), message: t('profiles.loadHint'), confirm: t('profiles.load') })
  if (ok !== null) void send(commands[kind].load, name, true)
}

async function create(kind: Kind) {
  const name = await prompt.ask({ title: t('profiles.newTitle'), message: t('profiles.newHint'), input: t('common.name'), confirm: t('profiles.create') })
  if (name) void send(commands[kind].create, name)
}

async function saveAs(kind: Kind) {
  const name = await prompt.ask({ title: t('profiles.saveAsTitle'), input: t('common.name'), confirm: t('common.save') })
  if (name) void send(commands[kind].saveAs, name)
}

async function remove(kind: Kind, name: string) {
  const ok = await prompt.ask({ title: t('profiles.deleteTitle', { name }), message: t('profiles.deleteHint'), confirm: t('common.delete'), danger: true })
  if (ok !== null) void send(commands[kind].remove, name)
}

async function colours(name: string) {
  const ok = await prompt.ask({ title: t('profiles.coloursTitle', { name }), message: t('profiles.coloursHint'), confirm: t('profiles.apply') })
  if (ok !== null) void send('LoadProfileColours', name)
}
</script>

<template>
  <div>
    <div class="page-title">
      <h1 class="display">{{ t('nav.profiles') }}</h1>
      <span class="rule" aria-hidden="true" />
    </div>
    <div class="grid-auto" style="--min: 440px">
      <ProfileList
        :title="t('profiles.device')"
        :profiles="files.profiles"
        :active="m.profile_name"
        colours
        @load="load('device', $event)"
        @colours="colours"
        @remove="remove('device', $event)"
        @create="create('device')"
        @save="send(commands.device.save)"
        @save-as="saveAs('device')"
        @open="daemon.daemonCommand(daemonCmd('OpenPath', commands.device.path))"
      />
      <ProfileList
        :title="t('profiles.mic')"
        :profiles="files.mic_profiles"
        :active="m.mic_profile_name"
        :delay="0.08"
        @load="load('mic', $event)"
        @remove="remove('mic', $event)"
        @create="create('mic')"
        @save="send(commands.mic.save)"
        @save-as="saveAs('mic')"
        @open="daemon.daemonCommand(daemonCmd('OpenPath', commands.mic.path))"
      />
    </div>
  </div>
</template>
