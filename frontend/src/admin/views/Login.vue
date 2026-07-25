<template>
  <n-config-provider :theme-overrides="theme">
  <div class="login">
    <div class="login-card">
      <h1>SudoBlog</h1>
      <p class="sub">管理后台</p>
      <n-form :model="f" :rules="rules" label-placement="top">
        <n-form-item path="username" label="用户名">
          <n-input v-model:value="f.username" placeholder="用户名" size="large" />
        </n-form-item>
        <n-form-item path="password" label="密码">
          <n-input v-model:value="f.password" type="password" placeholder="密码" size="large" @keyup.enter="login" />
        </n-form-item>
        <n-button type="primary" :loading="loading" block size="large" @click="login">登录</n-button>
      </n-form>
      <p class="foot">SudoBlog Admin</p>
    </div>
  </div>
  </n-config-provider>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { createDiscreteApi } from 'naive-ui'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const { message } = createDiscreteApi(['message'])
const loading = ref(false)
const theme = { common: { primaryColor: '#1a1a1a', primaryColorHover: '#333', primaryColorPressed: '#000' } }
const f = reactive({ username: '', password: '' })

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function login() {
  loading.value = true
  try { await auth.login(f.username, f.password); message.success('登录成功'); router.push('/') }
  catch { } finally { loading.value = false }
}
</script>

<style scoped>
.login { display: flex; align-items: center; justify-content: center; height: 100vh; background: #f8f8f8; }
.login-card { width: 360px; padding: 48px 36px 32px; border-radius: 16px; background: #fff; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
h1 { text-align: center; margin: 0; font-size: 24px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px; }
.sub { text-align: center; margin: 4px 0 36px; color: #999; font-size: 13px; }
.foot { text-align: center; margin: 32px 0 0; color: #ccc; font-size: 11px; }
</style>
