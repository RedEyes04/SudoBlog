<template>
  <div class="settings-page">
    <div class="page-header">
      <h2>Site Settings</h2>
      <el-button type="primary" :loading="saving" @click="handleSave">
        Save Settings
      </el-button>
    </div>

    <el-row :gutter="20">
      <el-col :span="24">
        <!-- ASCII Banner -->
        <el-card shadow="hover" class="section-card">
          <template #header>
            <span>Banner (ASCII Art)</span>
          </template>

          <!-- Generator -->
          <div class="ascii-generator">
            <el-row :gutter="12">
              <el-col :span="18">
                <el-input v-model="asciiText" placeholder="输入文字，一键生成 ASCII 艺术字..." @keyup.enter="generateAscii" />
              </el-col>
              <el-col :span="6">
                <el-button type="success" :loading="generating" style="width:100%" @click="generateAscii">
                  生成
                </el-button>
              </el-col>
            </el-row>
            <div class="generated-preview" v-if="generatedAscii">
              <pre>{{ generatedAscii }}</pre>
              <el-button size="small" type="primary" style="margin-top:8px" @click="applyGenerated">
                应用到 Banner
              </el-button>
            </div>
          </div>

          <el-divider />

          <el-form label-position="top">
            <el-form-item label="直接编辑">
              <el-input
                v-model="form.asciiBanner"
                type="textarea"
                :rows="8"
                class="banner-textarea"
                placeholder="Enter ASCII art..."
              />
            </el-form-item>
            <div class="banner-preview" v-if="form.asciiBanner">
              <pre>{{ form.asciiBanner }}</pre>
            </div>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="12">
        <!-- Site Info -->
        <el-card shadow="hover" class="section-card">
          <template #header>
            <span>Site Information</span>
          </template>
          <el-form label-position="top">
            <el-form-item label="Site Title">
              <el-input v-model="form.site.title" />
            </el-form-item>
            <el-form-item label="Username (terminal prompt)">
              <el-input v-model="form.site.username" />
            </el-form-item>
            <el-form-item label="Hostname (terminal prompt)">
              <el-input v-model="form.site.hostname" />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="12">
        <!-- Personal Info -->
        <el-card shadow="hover" class="section-card">
          <template #header>
            <span>Personal Information</span>
          </template>
          <el-form label-position="top">
            <el-form-item label="Display Name">
              <el-input v-model="form.site.name" />
            </el-form-item>
            <el-form-item label="Avatar URL">
              <el-input v-model="form.site.avatar" />
            </el-form-item>
            <el-form-item label="Bio">
              <el-input
                v-model="form.site.bio"
                type="textarea"
                :rows="4"
                placeholder="Multi-line bio..."
              />
            </el-form-item>
            <el-form-item label="ICP Beian">
              <el-input v-model="form.site.beian" placeholder="苏ICP备..." />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api'
import { useConfigStore } from '../stores/config'

const store = useConfigStore()
const saving = ref(false)

// ── ASCII Generator ──
const asciiText = ref('')
const generatedAscii = ref('')
const generating = ref(false)

async function generateAscii() {
  if (!asciiText.value.trim()) {
    ElMessage.warning('请输入文字')
    return
  }
  generating.value = true
  try {
    const { data } = await api.post('/config/ascii', {
      text: asciiText.value.trim(),
    })
    generatedAscii.value = data.ascii
  } catch {
    // handled by interceptor
  } finally {
    generating.value = false
  }
}

function applyGenerated() {
  form.asciiBanner = '\n' + generatedAscii.value + '\n'
  ElMessage.success('已应用到 Banner')
}

onMounted(async () => {
  await store.fetchConfig()
  form.asciiBanner = store.config.asciiBanner
  form.site = { ...store.config.site }
})

const form = reactive({
  asciiBanner: '',
  site: {
    title: '',
    username: '',
    hostname: '',
    avatar: '',
    name: '',
    bio: '',
    beian: '',
  },
})

onMounted(async () => {
  await store.fetchConfig()
  form.asciiBanner = store.config.asciiBanner
  form.site = { ...store.config.site }
})

async function handleSave() {
  saving.value = true
  try {
    await store.updateConfig({
      asciiBanner: form.asciiBanner,
      site: form.site,
    })
    ElMessage.success('Settings saved')
  } catch {
    // handled by interceptor
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-header h2 {
  margin: 0;
}
.section-card {
  margin-bottom: 20px;
}
.ascii-generator {
  margin-bottom: 8px;
}
.generated-preview {
  margin-top: 12px;
  background: #2e3440;
  border-radius: 4px;
  padding: 12px 16px;
}
.generated-preview pre {
  color: #a3be8c;
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
  font-size: 11px;
  line-height: 1.15;
  margin: 0;
  white-space: pre;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}
.banner-textarea :deep(textarea) {
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.3;
}
.banner-preview {
  background: #2e3440;
  border-radius: 4px;
  padding: 16px;
  margin-top: 12px;
}
.banner-preview pre {
  color: #a3be8c;
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.2;
  margin: 0;
  white-space: pre;
  overflow-x: auto;
}
</style>
