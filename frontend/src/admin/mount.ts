import { createApp } from 'vue'
import { createPinia } from 'pinia'
import AdminApp from './AdminApp.vue'
import { createAdminRouter } from './router'

export function mountAdmin(basePath: string) {
  const app = createApp(AdminApp)
  app.use(createPinia())
  app.use(createAdminRouter(basePath))
  app.mount('#app')
}
