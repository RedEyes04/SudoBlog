import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    fs: {
      allow: ['..'], // allow imports from ../data/ and ../posts/
    },
    proxy: {
      '/api': 'http://localhost:3456',
    },
  },
})
