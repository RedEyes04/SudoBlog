<template>
  <div>
    <div class="pg-head"><h2>主题设置</h2><n-button type="primary" :loading="saving" @click="saveAll">保存设置</n-button></div>

    <n-space vertical :size="16">
      <!-- Personal Info -->
      <n-card title="个人信息" class="card">
        <n-form label-placement="top" size="small">
          <n-grid :cols="2" :x-gap="16">
            <n-gi><n-form-item label="昵称"><n-input v-model:value="form.site.name" /></n-form-item></n-gi>
            <n-gi><n-form-item label="头像"><n-input v-model:value="form.site.avatar" /></n-form-item></n-gi>
          </n-grid>
          <n-form-item label="简介"><n-input v-model:value="form.site.bio" type="textarea" :rows="3" /></n-form-item>
          <n-grid :cols="2" :x-gap="16">
            <n-gi><n-form-item label="备案号"><n-input v-model:value="form.site.beian" /></n-form-item></n-gi>
            <n-gi><n-form-item label="Twikoo 评论地址"><n-input v-model:value="form.site.twikooEnvId" placeholder="https://twikoo.xxx.top" /></n-form-item></n-gi>
          </n-grid>
        </n-form>
      </n-card>

      <!-- ASCII Banner -->
      <n-card title="ASCII 横幅" class="card">
        <template #header-extra>
          <span class="card-hint">终端启动时的 ASCII 艺术字横幅</span>
        </template>
        <n-space :size="8" align="center">
          <n-input v-model:value="asciiText" placeholder="输入文字，一键生成" style="flex:1" @keyup.enter="genAscii" />
          <n-button type="primary" :loading="generating" @click="genAscii">生成</n-button>
        </n-space>
        <div v-if="generated" class="ascii-preview"><pre>{{ generated }}</pre><n-button size="tiny" type="primary" style="margin-top:8px" @click="applyAscii">应用</n-button></div>
        <n-input v-model:value="form.asciiBanner" type="textarea" :rows="6" placeholder="直接编辑 ASCII 横幅..." class="ascii-input" />
        <div v-if="form.asciiBanner" class="ascii-render"><pre>{{ form.asciiBanner }}</pre></div>
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
  site: { name: '', avatar: '', bio: '', beian: '', twikooEnvId: '' },
  asciiBanner: '',
})

const asciiText = ref('')
const generated = ref('')
const generating = ref(false)

async function genAscii() {
  if (!asciiText.value.trim()) { message.warning('请输入文字'); return }
  generating.value = true
  try { const { data } = await api.post('/config/ascii', { text: asciiText.value.trim() }); generated.value = data.ascii } catch { }
  finally { generating.value = false }
}
function applyAscii() { form.asciiBanner = '\n' + generated.value + '\n'; message.success('已应用') }

async function saveAll() {
  saving.value = true
  try {
    await store.updateConfig({
      site: { ...store.config.site, name: form.site.name, avatar: form.site.avatar, bio: form.site.bio, beian: form.site.beian, twikooEnvId: form.site.twikooEnvId },
      asciiBanner: form.asciiBanner,
    })
    message.success('已保存')
  } catch { }
  finally { saving.value = false }
}

onMounted(async () => {
  await store.fetchConfig()
  form.site.name = store.config.site.name
  form.site.avatar = store.config.site.avatar
  form.site.bio = store.config.site.bio
  form.site.beian = store.config.site.beian
  form.site.twikooEnvId = store.config.site.twikooEnvId || ''
  form.asciiBanner = store.config.asciiBanner
})
</script>

<style scoped>
.pg-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.pg-head h2 { margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a; }
.card { border-radius: 12px; }
.card-hint { font-size: 12px; color: #999; font-weight: 400; }
.ascii-preview, .ascii-render { margin-top: 12px; background: #1a1a1a; border-radius: 8px; padding: 14px 18px; }
.ascii-preview pre, .ascii-render pre { color: #a0d995; font-family: 'Hack NF', monospace; font-size: 11px; line-height: 1.2; margin: 0; white-space: pre; overflow-x: auto; max-height: 180px; font-smooth: never; -webkit-font-smoothing: none; }
.ascii-input { margin-top: 12px; }
.ascii-input :deep(textarea) { font-family: 'Fira Code', monospace; font-size: 13px; }
</style>
