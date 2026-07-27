import { createApp } from 'vue'
import './styles/global.css'
import App from './App.vue'

async function bootstrap() {
  // Fetch live admin path from API (falls back to /admin)
  let adminPath = '/admin'
  try {
    const res = await fetch('/api/config')
    const config = await res.json()
    if (config.admin?.path) adminPath = config.admin.path
  } catch { /* use default */ }

  // If URL path starts with admin path, mount the admin SPA
  if (window.location.pathname.startsWith(adminPath)) {
    localStorage.setItem('admin_path', adminPath)
    const { mountAdmin } = await import('./admin/mount')
    mountAdmin(adminPath)
    return
  }

  // Otherwise mount the terminal blog
  createApp(App).mount('#app')
}

bootstrap()
