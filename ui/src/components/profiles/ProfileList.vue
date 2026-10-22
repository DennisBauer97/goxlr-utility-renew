<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import GPanel from '@/components/ui/GPanel.vue'
import GButton from '@/components/ui/GButton.vue'

defineProps<{
  title: string
  profiles: string[]
  active: string
  colours?: boolean
  delay?: number
}>()

const emit = defineEmits<{
  load: [name: string]
  colours: [name: string]
  remove: [name: string]
  create: []
  save: []
  saveAs: []
  open: []
}>()

const { t } = useI18n()
</script>

<template>
  <GPanel :title="title" :delay="delay">
    <template #actions>
      <GButton small @click="emit('open')">{{ t('profiles.openFolder') }}</GButton>
      <GButton small @click="emit('create')">{{ t('profiles.new') }}</GButton>
      <GButton small @click="emit('saveAs')">{{ t('profiles.saveAs') }}</GButton>
      <GButton small variant="primary" @click="emit('save')">{{ t('common.save') }}</GButton>
    </template>
    <ul class="list">
      <li v-for="(name, index) in profiles" :key="name" class="row rise" :class="{ active: name === active }" :style="{ animationDelay: `${index * 0.03}s` }">
        <span class="name">{{ name }}</span>
        <span v-if="name === active" class="badge">{{ t('profiles.active') }}</span>
        <template v-else>
          <GButton small @click="emit('load', name)">{{ t('profiles.load') }}</GButton>
          <GButton v-if="colours" small @click="emit('colours', name)">{{ t('profiles.coloursOnly') }}</GButton>
          <GButton small variant="danger" :aria-label="t('profiles.deleteNamed', { name })" @click="emit('remove', name)">✕</GButton>
        </template>
      </li>
    </ul>
  </GPanel>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-height: 52px;
  padding: 6px 12px;
  background: var(--bar);
  border-left: 3px solid transparent;
}
.row.active {
  border-left-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 10%, var(--bar));
}
.name {
  flex: 1 1 160px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--font-display);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.badge {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
}
</style>
