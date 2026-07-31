<template>
  <div>
    <div class="pg-head"><h2>GitHub 设置</h2><n-button type="primary" :loading="saving" @click="saveAll">保存设置</n-button></div>

    <n-space vertical :size="16">
      <n-card title="基础配置" class="card">
        <n-form label-placement="top" size="small">
          <n-form-item label="GitHub 用户名">
            <n-input v-model:value="form.githubUsername" placeholder="例如 REDEYES" />
          </n-form-item>
          <div class="form-hint">配置后，Projects 页面可显示 GitHub 贡献热力图。确保你的 GitHub 账户为公开状态。</div>
        </n-form>
      </n-card>

      <n-card title="项目仓库热力图" class="card">
        <template #header-extra>
          <span class="card-hint">在项目管理中为每个项目设置 Github 仓库即可显示独立热力图</span>
        </template>
        <div class="info-block">
          <p>在「项目管理」页面中，为每个项目填写 <code>GitHub 仓库</code> 字段（格式：<code>用户名/仓库名</code>），</p>
          <p>该项目的卡片上就会显示该项目仓库的贡献热力图。</p>
        </div>
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { useConfigStore } from '../stores/config'

const store = useConfigStore()
const message = useMessage()
const saving = ref(false)

const form = reactive({
  githubUsername: '',
})

async function saveAll() {
  saving.value = true
  try {
    await store.updateConfig({
      site: { ...store.config.site, githubUsername: form.githubUsername },
    })
    message.success('已保存')
  } catch { }
  finally { saving.value = false }
}

onMounted(async () => {
  await store.fetchConfig()
  form.githubUsername = store.config.site.githubUsername || ''
})
</script>

<style scoped>
.pg-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.pg-head h2 { margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a; }
.card { border-radius: 12px; }
.card-hint { font-size: 12px; color: #999; font-weight: 400; }
.form-hint { margin-top: 4px; font-size: 12px; color: #999; }
.info-block { color: #666; font-size: 13px; line-height: 1.8; }
.info-block code { background: #f0f0f0; padding: 1px 6px; border-radius: 3px; font-size: 12px; }
</style>
