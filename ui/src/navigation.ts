import type { RouteRecordRaw } from 'vue-router'

export interface NavItem {
  name: string
  path: string
  /** i18n key of the label */
  label: string
  /** Hidden on hardware that lacks the feature (the Mini has no effects or sampler). */
  fullOnly?: boolean
  /** Shown directly in the phone tab bar; the rest live behind "More". */
  primary?: boolean
}

export const navItems: NavItem[] = [
  { name: 'mixer', path: '/', label: 'nav.mixer', primary: true },
  { name: 'routing', path: '/routing', label: 'nav.routing' },
  { name: 'mic', path: '/mic', label: 'nav.mic', primary: true },
  { name: 'effects', path: '/effects', label: 'nav.effects', fullOnly: true, primary: true },
  { name: 'sampler', path: '/sampler', label: 'nav.sampler', fullOnly: true, primary: true },
  { name: 'lighting', path: '/lighting', label: 'nav.lighting' },
  { name: 'profiles', path: '/profiles', label: 'nav.profiles' },
  { name: 'system', path: '/system', label: 'nav.system' },
]

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'mixer', component: () => import('./views/MixerView.vue') },
  { path: '/routing', name: 'routing', component: () => import('./views/RoutingView.vue') },
  { path: '/mic', name: 'mic', component: () => import('./views/MicView.vue') },
  { path: '/effects', name: 'effects', component: () => import('./views/EffectsView.vue') },
  { path: '/sampler', name: 'sampler', component: () => import('./views/SamplerView.vue') },
  { path: '/lighting', name: 'lighting', component: () => import('./views/LightingView.vue') },
  { path: '/profiles', name: 'profiles', component: () => import('./views/ProfilesView.vue') },
  { path: '/system', name: 'system', component: () => import('./views/SystemView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]
