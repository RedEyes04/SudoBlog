<template>
  <el-container class="admin-layout">
    <el-aside width="220px">
      <div class="logo">
        <h2>SudoBlog Admin</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/">
          <el-icon><DataAnalysis /></el-icon>
          <span>Dashboard</span>
        </el-menu-item>
        <el-menu-item index="/posts">
          <el-icon><Document /></el-icon>
          <span>Posts</span>
        </el-menu-item>
        <el-menu-item index="/editor">
          <el-icon><Edit /></el-icon>
          <span>New Post</span>
        </el-menu-item>
        <el-menu-item index="/friends">
          <el-icon><UserFilled /></el-icon>
          <span>Friends</span>
        </el-menu-item>
        <el-menu-item index="/applications">
          <el-icon><Bell /></el-icon>
          <span>Applications</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>Settings</span>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-footer">
        <el-button text @click="handleLogout" class="logout-btn">
          <el-icon><SwitchButton /></el-icon>
          Logout
        </el-button>
      </div>
    </el-aside>
    <el-container>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const auth = useAuthStore()

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/editor')) return '/editor'
  if (path.startsWith('/posts')) return '/posts'
  if (path.startsWith('/friends')) return '/friends'
  if (path.startsWith('/applications')) return '/applications'
  if (path.startsWith('/settings')) return '/settings'
  return '/'
})

function handleLogout() {
  auth.logout()
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h2 {
  color: #fff;
  font-size: 18px;
  margin: 0;
}

.el-menu {
  border-right: none;
  flex: 1;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  color: #bfcbd9;
  width: 100%;
  justify-content: flex-start;
}

.el-main {
  background-color: #f0f2f5;
}
</style>
