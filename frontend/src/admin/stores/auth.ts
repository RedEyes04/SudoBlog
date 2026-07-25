import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api'

function getAdminPath(): string {
  return localStorage.getItem('admin_path') || '/admin'
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('admin_token'))

  const isAuthenticated = computed(() => !!token.value)

  async function login(username: string, password: string) {
    const { data } = await api.post('/auth/login', { username, password })
    if (data.success) {
      token.value = data.token
      localStorage.setItem('admin_token', data.token)
    }
    return data
  }

  function logout() {
    token.value = null
    localStorage.removeItem('admin_token')
    window.location.href = getAdminPath() + '/login'
  }

  return { token, isAuthenticated, login, logout }
})
