import { createApp } from 'vue'
import './styles/global.css'
import App from './App.vue'
import configData from '../../data/config.json'

interface RawAdminConfig {
  path?: string
  command?: string
}

interface RawConfig {
  site: Record<string, unknown>
  asciiBanner: string
  admin?: RawAdminConfig
}

const raw = configData as RawConfig
const adminConfig = raw.admin || { path: '/admin', command: 'admin' }
const adminPath = adminConfig.path || '/admin'

async function bootstrap() {
  // If URL path starts with admin path, mount the admin SPA
  if (window.location.pathname.startsWith(adminPath)) {
    // Store admin path for API/auth redirects
    localStorage.setItem('admin_path', adminPath)
    const { mountAdmin } = await import('./admin/mount')
    mountAdmin(adminPath)
    return
  }

  // Otherwise mount the terminal blog
  createApp(App).mount('#app')
}

bootstrap()
