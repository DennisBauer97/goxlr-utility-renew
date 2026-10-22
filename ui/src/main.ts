import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import { i18n } from './i18n'
import { routes } from './navigation'
import './styles/main.css'

// Hash routing works no matter how the daemon serves unknown paths.
const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

createApp(App).use(createPinia()).use(router).use(i18n).mount('#app')
