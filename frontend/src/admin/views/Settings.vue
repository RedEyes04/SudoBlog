<template>
  <div>
    <div class="pg-head"><h2>系统设置</h2><n-button type="primary" :loading="saving" @click="saveAll">保存设置</n-button></div>

    <n-space vertical :size="16">
      <!-- ASCII Banner -->
      <n-card title="ASCII 横幅" class="card">
        <n-space :size="8" align="center">
          <n-input v-model:value="asciiText" placeholder="输入文字，一键生成" style="flex:1" @keyup.enter="genAscii" />
          <n-button type="primary" :loading="generating" @click="genAscii">生成</n-button>
        </n-space>
        <div v-if="generated" class="ascii-preview"><pre>{{ generated }}</pre><n-button size="tiny" type="primary" style="margin-top:8px" @click="applyAscii">应用</n-button></div>
        <n-input v-model:value="form.asciiBanner" type="textarea" :rows="6" placeholder="直接编辑..." class="ascii-input" />
        <div v-if="form.asciiBanner" class="ascii-render"><pre>{{ form.asciiBanner }}</pre></div>
      </n-card>

      <n-grid :cols="2" :x-gap="16">
        <n-gi>
          <n-card title="站点信息" class="card">
            <n-form label-placement="top" size="small">
              <n-form-item label="站点标题"><n-input v-model:value="form.site.title" /></n-form-item>
              <n-form-item label="终端用户名"><n-input v-model:value="form.site.username" /></n-form-item>
              <n-form-item label="终端主机名"><n-input v-model:value="form.site.hostname" /></n-form-item>
            </n-form>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card title="个人信息" class="card">
            <n-form label-placement="top" size="small">
              <n-form-item label="昵称"><n-input v-model:value="form.site.name" /></n-form-item>
              <n-form-item label="头像"><n-input v-model:value="form.site.avatar" /></n-form-item>
              <n-form-item label="简介"><n-input v-model:value="form.site.bio" type="textarea" :rows="3" /></n-form-item>
              <n-form-item label="备案号"><n-input v-model:value="form.site.beian" /></n-form-item>
              <n-form-item label="Twikoo 评论地址"><n-input v-model:value="form.site.twikooEnvId" placeholder="https://twikoo.xxx.top" /></n-form-item>
            </n-form>
          </n-card>
        </n-gi>
      </n-grid>

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
  asciiBanner: '', site: { title:'', username:'', hostname:'', avatar:'', name:'', bio:'', beian:'', twikooEnvId:'' },
  admin: { path:'/admin', command:'admin' },
})

const asciiText = ref('')
const generated = ref('')
const generating = ref(false)

async function genAscii() {
  if (!asciiText.value.trim()) { message.warning('请输入文字'); return }
  generating.value = true
  try { const { data } = await api.post('/config/ascii',{text:asciiText.value.trim()}); generated.value = data.ascii } catch { }
  finally { generating.value = false }
}
function applyAscii() { form.asciiBanner = '\n' + generated.value + '\n'; message.success('已应用') }

// Credentials
const cred = reactive({ username:'', password:'', confirm:'' })
const changing = ref(false)

async function changeCreds() {
  if (!cred.password) { message.warning('请输入新密码'); return }
  if (cred.password.length < 4) { message.warning('密码至少4位'); return }
  if (cred.password !== cred.confirm) { message.warning('两次密码不一致'); return }
  changing.value = true
  try {
    const p:any = { newPassword: cred.password }
    if (cred.username.trim()) p.newUsername = cred.username.trim()
    await api.put('/auth/credentials', p)
    message.success('凭据已更新')
    cred.username = ''; cred.password = ''; cred.confirm = ''
  } catch { } finally { changing.value = false }
}

async function saveAll() {
  saving.value = true
  try { await store.updateConfig({ asciiBanner:form.asciiBanner, site:form.site, admin:form.admin }); message.success('已保存') } catch { }
  finally { saving.value = false }
}

onMounted(async () => {
  await store.fetchConfig()
  form.asciiBanner = store.config.asciiBanner; form.site = { ...store.config.site }
  if (store.config.admin) { form.admin.path = store.config.admin.path||'/admin'; form.admin.command = store.config.admin.command||'admin' }
})
</script>

<style scoped>
.pg-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.pg-head h2 { margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a; }
.card { border-radius: 12px; }
.ascii-preview, .ascii-render { margin-top: 12px; background: #1a1a1a; border-radius: 8px; padding: 14px 18px; }
.ascii-preview pre, .ascii-render pre { color: #a0d995; font-family: 'Hack NF', monospace; font-size: 11px; line-height: 1.2; margin: 0; white-space: pre; overflow-x: auto; max-height: 180px; font-smooth: never; -webkit-font-smoothing: none; }
.ascii-input { margin-top: 12px; }
.ascii-input :deep(textarea) { font-family: 'Fira Code', monospace; font-size: 13px; }
.sec-title { margin: 0 0 14px; font-size: 14px; font-weight: 600; color: #555; }
.hint { font-size: 11px; color: #999; margin-top: 2px; display: block; }
</style>
