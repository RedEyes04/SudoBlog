import { ref } from 'vue'
import type { SiteConfig, AdminConfig } from '../types'

/**
 * Site configuration loaded from /api/config at runtime.
 * After loadConfig() completes, these refs hold live data from the backend.
 */

export const siteConfig = ref<SiteConfig>({
  title: 'SudoBlog',
  username: 'visitor',
  hostname: 'sudoblog',
  avatar: '',
  name: '',
  bio: '',
  beian: '',
})

export const aboutData = ref({
  avatar: '',
  name: '',
  bio: '',
})

export const asciiBanner = ref<string>('')

export const adminConfig: AdminConfig = {
  path: '/admin',
  command: 'admin',
}

export async function loadConfig(): Promise<void> {
  try {
    const res = await fetch('/api/config')
    if (!res.ok) return
    const data = await res.json()

    if (data.site) {
      siteConfig.value = {
        title: data.site.title || 'SudoBlog',
        username: data.site.username || 'visitor',
        hostname: data.site.hostname || 'sudoblog',
        avatar: data.site.avatar || '',
        name: data.site.name || '',
        bio: data.site.bio || '',
        beian: data.site.beian || '',
      }
    }

    aboutData.value = {
      avatar: siteConfig.value.avatar,
      name: siteConfig.value.name,
      bio: siteConfig.value.bio,
    }

    if (data.asciiBanner) {
      asciiBanner.value = data.asciiBanner
    }

    if (data.admin) {
      adminConfig.path = data.admin.path || '/admin'
      adminConfig.command = data.admin.command || 'admin'
    }
  } catch {
    // Keep defaults
  }
}
