import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export interface SiteSettings {
  title: string
  username: string
  hostname: string
  avatar: string
  name: string
  bio: string
  beian: string
}

export interface AdminSettings {
  path?: string
  command?: string
}

export interface ConfigData {
  site: SiteSettings
  asciiBanner: string
  admin?: AdminSettings
}

export const useConfigStore = defineStore('config', () => {
  const config = ref<ConfigData>({
    site: {
      title: '',
      username: '',
      hostname: '',
      avatar: '',
      name: '',
      bio: '',
      beian: '',
    },
    asciiBanner: '',
  })
  const loading = ref(false)

  async function fetchConfig() {
    loading.value = true
    try {
      const { data } = await api.get('/config')
      config.value = data
    } finally {
      loading.value = false
    }
  }

  async function updateConfig(updates: Partial<ConfigData>) {
    const { data } = await api.put('/config', updates)
    config.value = data
    return data
  }

  return { config, loading, fetchConfig, updateConfig }
})
