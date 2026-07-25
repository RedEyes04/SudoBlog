<template>
  <div>
    <div class="pg-head">
      <h2>图片管理</h2>
      <div class="pg-head-actions">
        <span class="count" v-if="store.images.length">{{ store.images.length }} 张图片</span>
        <n-upload
          :action="uploadUrl"
          :headers="uploadHeaders"
          accept="image/*"
          :show-file-list="false"
          @finish="onUploaded"
        >
          <n-button type="primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="margin-right:5px;vertical-align:-2px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            上传图片
          </n-button>
        </n-upload>
      </div>
    </div>

    <n-empty v-if="!store.loading && store.images.length === 0" description="暂无上传的图片" style="margin-top:80px" />

    <div class="grid" v-else>
      <div class="img-card" v-for="img in store.images" :key="img.filename">
        <div class="img-thumb" @click="previewImg(img.url)">
          <img :src="img.url" :alt="img.filename" loading="lazy" />
        </div>
        <div class="img-info">
          <div class="img-name" :title="img.filename">{{ img.filename }}</div>
          <div class="img-meta">{{ formatSize(img.size) }}</div>
        </div>
        <div class="img-actions">
          <n-button size="tiny" quaternary @click="copyUrl(img.url)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" style="margin-right:3px;vertical-align:-1px"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            复制 URL
          </n-button>
          <n-popconfirm @positive-click="del(img.filename)">
            <template #trigger>
              <n-button size="tiny" quaternary type="error">删除</n-button>
            </template>
            确定删除这张图片？
          </n-popconfirm>
        </div>
      </div>
    </div>

    <n-modal v-model:show="showPreview" preset="card" title="预览" style="width:auto;max-width:90vw">
      <img :src="preview" style="max-width:100%;max-height:75vh;display:block" />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NButton, NPopconfirm } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useImagesStore } from '../stores/images'
import { useAuthStore } from '../stores/auth'

const store = useImagesStore()
const auth = useAuthStore()
const message = useMessage()

const preview = ref('')
const showPreview = ref(false)

const uploadUrl = '/api/upload'
const uploadHeaders = computed(() => ({
  Authorization: auth.token ? `Bearer ${auth.token}` : '',
}))

function onUploaded() {
  store.fetchImages()
  message.success('上传成功')
}

async function copyUrl(url: string) {
  try {
    await navigator.clipboard.writeText(window.location.origin + url)
    message.success('URL 已复制')
  } catch {
    message.error('复制失败')
  }
}

async function del(filename: string) {
  try {
    await store.deleteImage(filename)
    message.success('已删除')
  } catch {
    message.error('删除失败')
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function previewImg(url: string) {
  preview.value = url
  showPreview.value = true
}

onMounted(() => store.fetchImages())
</script>

<style scoped>
.pg-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.pg-head h2 { margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a; }
.pg-head-actions { display: flex; align-items: center; gap: 12px; }
.count { color: #888; font-size: 13px; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.img-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #eee;
  transition: box-shadow 0.15s;
}
.img-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

.img-thumb {
  height: 150px;
  background: #f0f0f0;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.img-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s;
}
.img-thumb:hover img { transform: scale(1.05); }

.img-info { padding: 10px 14px 4px; }
.img-name { font-size: 12px; color: #333; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.img-meta { font-size: 11px; color: #999; margin-top: 2px; }

.img-actions { padding: 4px 14px 12px; display: flex; gap: 8px; }
</style>
