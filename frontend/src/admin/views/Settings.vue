<template>
  <div>
    <div class="pg-head"><h2>系统设置</h2><n-button type="primary" :loading="saving" @click="saveAll">保存设置</n-button></div>

    <n-space vertical :size="16">
      <n-card title="站点信息" class="card">
        <n-form label-placement="top" size="small">
          <n-grid :cols="3" :x-gap="16">
            <n-gi><n-form-item label="站点标题"><n-input v-model:value="form.site.title" /></n-form-item></n-gi>
            <n-gi><n-form-item label="终端用户名"><n-input v-model:value="form.site.username" /></n-form-item></n-gi>
            <n-gi><n-form-item label="终端主机名"><n-input v-model:value="form.site.hostname" /></n-form-item></n-gi>
          </n-grid>
        </n-form>
      </n-card>

      <!-- SMTP / Email Notification -->
      <n-card title="邮件通知" class="card">
        <template #header-extra>
          <n-button size="small" :loading="testingMail" @click="testMail">发送测试邮件</n-button>
        </template>
        <n-grid :cols="3" :x-gap="16">
          <n-gi>
            <n-form label-placement="top" size="small">
              <n-form-item label="SMTP 服务器"><n-input v-model:value="form.smtp.host" placeholder="smtp.example.com" /></n-form-item>
              <n-form-item label="端口"><n-input-number v-model:value="form.smtp.port" :min="1" :max="65535" style="width:100%" /></n-form-item>
              <n-form-item label="SSL 加密"><n-switch v-model:value="form.smtp.secure" /></n-form-item>
            </n-form>
          </n-gi>
          <n-gi>
            <n-form label-placement="top" size="small">
              <n-form-item label="用户名"><n-input v-model:value="form.smtp.user" /></n-form-item>
              <n-form-item label="密码"><n-input v-model:value="form.smtp.pass" type="password" /></n-form-item>
            </n-form>
          </n-gi>
          <n-gi>
            <n-form label-placement="top" size="small">
              <n-form-item label="发件地址"><n-input v-model:value="form.smtp.from" placeholder="blog@example.com" /></n-form-item>
              <n-form-item label="收件地址"><n-input v-model:value="form.smtp.to" placeholder="admin@example.com" /></n-form-item>
            </n-form>
          </n-gi>
        </n-grid>
      </n-card>

      <!-- Security -->
      <n-card title="安全设置" class="card">
        <n-grid :cols="2" :x-gap="24">
          <n-gi>
            <h4 class="sec-title">管理员凭据</h4>
            <n-form label-placement="top" size="small">
              <n-form-item label="新用户名"><n-input v-model:value="cred.username" placeholder="留空不变" /></n-form-item>
              <n-form-item label="新密码"><n-input v-model:value="cred.password" type="password" placeholder="至少4位" /></n-form-item>
              <n-form-item label="确认密码"><n-input v-model:value="cred.confirm" type="password" placeholder="再次输入" /></n-form-item>
              <n-button type="warning" :loading="changing" @click="changeCreds">更新凭据</n-button>
            </n-form>
          </n-gi>
          <n-gi>
            <h4 class="sec-title">后台访问</h4>
            <n-form label-placement="top" size="small">
              <n-form-item label="URL 路径"><n-input v-model:value="form.admin.path" placeholder="/admin" /><span class="hint">访问此路径进入后台</span></n-form-item>
              <n-form-item label="终端暗号"><n-input v-model:value="form.admin.command" placeholder="admin" /><span class="hint">终端输入此命令跳转后台</span></n-form-item>
            </n-form>
          </n-gi>
        </n-grid>
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import api from '../api'
import { useConfigStore } from '../stores/config'

const store = useConfigStore()
const message = useMessage()
const saving = ref(false)

const form = reactive({
  site: { title: '', username: '', hostname: '' },
  smtp: { host: '', port: 465, secure: true, user: '', pass: '', from: '', to: '' },
  admin: { path: '/admin', command: 'admin' },
})

const testingMail = ref(false)

async function testMail() {
  testingMail.value = true
  try {
    const { data } = await api.post('/friends/test-mail')
    message.success(data.message || '测试邮件已发送')
  } catch { } finally { testingMail.value = false }
}

// Credentials
const cred = reactive({ username: '', password: '', confirm: '' })
const changing = ref(false)

async function changeCreds() {
  if (!cred.password) { message.warning('请输入新密码'); return }
  if (cred.password.length < 4) { message.warning('密码至少4位'); return }
  if (cred.password !== cred.confirm) { message.warning('两次密码不一致'); return }
  changing.value = true
  try {
    const p: any = { newPassword: cred.password }
    if (cred.username.trim()) p.newUsername = cred.username.trim()
    await api.put('/auth/credentials', p)
    message.success('凭据已更新')
    cred.username = ''; cred.password = ''; cred.confirm = ''
  } catch { } finally { changing.value = false }
}

async function saveAll() {
  saving.value = true
  try {
    await store.updateConfig({
      site: { ...store.config.site, title: form.site.title, username: form.site.username, hostname: form.site.hostname },
      smtp: form.smtp,
      admin: form.admin,
    })
    message.success('已保存')
  } catch { }
  finally { saving.value = false }
}

onMounted(async () => {
  await store.fetchConfig()
  form.site.title = store.config.site.title
  form.site.username = store.config.site.username
  form.site.hostname = store.config.site.hostname
  if (store.config.smtp) form.smtp = { ...store.config.smtp }
  if (store.config.admin) { form.admin.path = store.config.admin.path || '/admin'; form.admin.command = store.config.admin.command || 'admin' }
})
</script>

<style scoped>
.pg-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.pg-head h2 { margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a; }
.card { border-radius: 12px; }
.sec-title { margin: 0 0 14px; font-size: 14px; font-weight: 600; color: #555; }
.hint { font-size: 11px; color: #999; margin-top: 2px; display: block; }
</style>
