import axios from 'axios'
import { createDiscreteApi } from 'naive-ui'

const { message } = createDiscreteApi(['message'])

const api = axios.create({ baseURL: '/api', timeout: 10000 })

function getAdminPath(): string {
  return localStorage.getItem('admin_path') || '/admin'
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      const p = getAdminPath()
      if (!window.location.pathname.endsWith('/login')) {
        window.location.href = p + '/login'
      }
    }
    const msg = error.response?.data?.error || '请求失败'
    message.error(msg)
    return Promise.reject(error)
  },
)

export default api
