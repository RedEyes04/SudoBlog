<template>
  <n-config-provider :theme-overrides="theme">
    <n-message-provider>
      <n-layout class="layout" has-sider>
        <n-layout-sider bordered :width="200" class="sider">
          <div class="brand">SudoBlog<span class="brand-sub"> Admin</span></div>
          <nav class="nav">
            <router-link v-for="m in menu" :key="m.k" :to="m.to" class="nav-item" active-class="nav-active">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="17" height="17" v-html="m.icon"></svg>
              <span>{{ m.label }}</span>
            </router-link>
          </nav>
          <div class="sider-foot">
            <button class="logout-btn" @click="logout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              退出登录
            </button>
          </div>
        </n-layout-sider>
        <n-layout>
          <n-layout-header bordered class="header">
            <span class="header-title">{{ pageTitle }}</span>
          </n-layout-header>
          <n-layout-content class="content">
            <router-view />
          </n-layout-content>
        </n-layout>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const auth = useAuthStore()

const pageTitle = computed(() => {
  const p = route.path
  if (p.startsWith('/editor')) return '新建文章'
  if (p.startsWith('/posts')) return '文章管理'
  if (p.startsWith('/friends')) return '友链管理'
  if (p.startsWith('/applications')) return '申请管理'
  if (p.startsWith('/settings')) return '系统设置'
  return '仪表盘'
})

const menu = [
  { k:'dashboard',    to:'/',             label:'仪表盘',   icon:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>' },
  { k:'posts',        to:'/posts',        label:'文章管理', icon:'<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>' },
  { k:'editor',       to:'/editor',       label:'新建文章', icon:'<path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>' },
  { k:'friends',      to:'/friends',      label:'友链管理', icon:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>' },
  { k:'applications', to:'/applications', label:'申请管理', icon:'<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>' },
  { k:'settings',     to:'/settings',     label:'系统设置', icon:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>' },
]

const theme = {
  common: { primaryColor: '#1a1a1a', primaryColorHover: '#333', primaryColorPressed: '#000', borderRadius: '8px' },
}

function logout() { auth.logout() }
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
</style>

<style scoped>
.layout { height: 100vh; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
.sider { background: #0d0d0d !important; display: flex; flex-direction: column; }
.brand { padding: 22px 18px 10px; color: #fff; font-size: 16px; font-weight: 700; letter-spacing: -0.3px; }
.brand-sub { color: #555; font-weight: 400; font-size: 13px; }

.nav { flex: 1; padding: 8px 10px; display: flex; flex-direction: column; gap: 1px; overflow-y: auto; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; color: #888; text-decoration: none; font-size: 13.5px; font-weight: 500; transition: all 0.15s; }
.nav-item:hover { background: rgba(255,255,255,0.04); color: #ccc; }
.nav-active { background: rgba(255,255,255,0.08); color: #fff; font-weight: 600; }

.sider-foot { padding: 12px 10px; border-top: 1px solid rgba(255,255,255,0.06); }

.logout-btn { display: flex; align-items: center; justify-content: center; gap: 7px; width: 100%; padding: 9px 0; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: rgba(255,255,255,0.03); color: #ccc; font-size: 13px; font-family: inherit; cursor: pointer; transition: all 0.15s; }
.logout-btn:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.3); color: #f87171; }

.header { height: 48px; display: flex; align-items: center; padding: 0 24px; background: rgba(255,255,255,0.8); backdrop-filter: blur(12px); }
.header-title { font-size: 14px; font-weight: 600; color: #1a1a1a; }
.content { padding: 24px; background: #f8f8f8; }
</style>
