<template>
  <div>
    <div class="pg-head">
      <h2>图片管理</h2>
      <div class="pg-head-actions">
        <n-checkbox v-if="store.images.length" :checked="allSelected" :indeterminate="someSelected && !allSelected" @update:checked="toggleSelectAll" style="margin-right:4px" />
        <span class="count" v-if="store.images.length">{{ store.images.length }} 张图片</span>
        <n-popconfirm
          v-if="store.unusedImages.length > 0"
          @positive-click="cleanupAll"
        >
          <template #trigger>
            <n-button type="warning" :loading="cleaning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="margin-right:5px;vertical-align:-2px"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              清理未使用图片
            </n-button>
          </template>
          <div style="max-width:280px">
            <p style="margin:0 0 8px;font-weight:600">确定删除所有未使用图片？</p>
            <p style="margin:0;color:#999;font-size:13px">此操作将删除 {{ store.unusedImages.length }} 张未被任何文章引用的图片，不可撤销。</p>
          </div>
        </n-popconfirm>
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

    <!-- Sub-nav -->
    <n-card class="subnav-card" size="small">
      <n-tabs
        v-model:value="store.filter"
        type="bar"
        size="large"
        animated
      >
        <n-tab-pane name="all" :tab="`全部照片 (${store.images.length})`" />
        <n-tab-pane name="published" :tab="`文章 (${store.publishedImages.length})`" />
        <n-tab-pane name="draft" :tab="`草稿 (${store.draftImages.length})`" />
        <n-tab-pane name="unused" :tab="`未使用 (${store.unusedImages.length})`" />
      </n-tabs>
    </n-card>

    <!-- Batch toolbar -->
    <div class="batch-bar" v-if="selected.size > 0">
      <span class="batch-count">已选 {{ selected.size }} 张</span>
      <n-button size="small" quaternary @click="selected.clear()">取消选择</n-button>
      <n-popconfirm @positive-click="batchDel">
        <template #trigger>
          <n-button size="small" type="error">批量删除</n-button>
        </template>
        确定删除选中的 {{ selected.size }} 张图片？
      </n-popconfirm>
    </div>

    <n-empty v-if="!store.loading && store.filteredImages.length === 0" :description="emptyDesc" style="margin-top:80px" />

    <div class="grid" v-else>
      <div
        class="img-card"
        :class="{ selected: selected.has(img.filename) }"
        v-for="img in store.filteredImages"
        :key="img.filename"
      >
        <div class="img-check">
          <n-checkbox :checked="selected.has(img.filename)" @update:checked="() => toggleSelect(img.filename)" />
        </div>
        <div class="img-thumb" @click="previewImg(img.url)">
          <img :src="img.url" :alt="img.filename" loading="lazy" />
        </div>
        <div class="img-info">
          <div class="img-name" :title="img.filename">{{ img.filename }}</div>
          <div class="img-meta">{{ formatSize(img.size) }}</div>
        </div>
        <!-- Usage badges -->
        <div class="img-usage" v-if="img.usedBy.length">
          <n-tag
            v-for="u in img.usedBy"
            :key="u.slug"
            size="tiny"
            :bordered="false"
            :type="u.status === 'publish' ? 'success' : 'warning'"
          >
            {{ u.status === 'publish' ? '文章' : '草稿' }}:{{ u.title }}
          </n-tag>
        </div>
        <div class="img-usage img-unused" v-else>
          <n-tag size="tiny" :bordered="false" type="default">未使用</n-tag>
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
import { NButton, NPopconfirm, NCheckbox, NTag, NTabs, NTabPane, NCard } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useImagesStore } from '../stores/images'
import { useAuthStore } from '../stores/auth'

const store = useImagesStore()
const auth = useAuthStore()
const message = useMessage()

const preview = ref('')
const showPreview = ref(false)
const selected = ref<Set<string>>(new Set())

const allSelected = computed(() => store.images.length > 0 && selected.value.size === store.images.length)
const someSelected = computed(() => selected.value.size > 0)

const emptyDesc = computed(() => {
  if (store.filter === 'unused') return '所有图片都在使用中'
  if (store.filter === 'draft') return '没有草稿中使用的图片'
  if (store.filter === 'published') return '没有文章中使用的图片'
  return '暂无上传的图片'
})

const uploadUrl = '/api/upload'
const uploadHeaders = computed(() => ({
  Authorization: auth.token ? `Bearer ${auth.token}` : '',
}))

function onUploaded() {
  store.fetchImages()
  message.success('上传成功')
}

function toggleSelect(filename: string) {
  const s = selected.value
  if (s.has(filename)) {
    s.delete(filename)
  } else {
    s.add(filename)
  }
  selected.value = new Set(s)
}

function toggleSelectAll(checked: boolean) {
  if (checked) {
    selected.value = new Set(store.images.map((i) => i.filename))
  } else {
    selected.value = new Set()
  }
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
    selected.value.delete(filename)
    selected.value = new Set(selected.value)
    message.success('已删除')
  } catch {
    message.error('删除失败')
  }
}

async function batchDel() {
  try {
    const filenames = [...selected.value]
    await store.batchDeleteImages(filenames)
    selected.value = new Set()
    message.success(`已删除 ${filenames.length} 张图片`)
  } catch {
    message.error('批量删除失败')
  }
}

const cleaning = ref(false)
async function cleanupAll() {
  cleaning.value = true
  try {
    const result = await store.cleanupUnusedImages()
    message.success(`已清理 ${result.count} 张未使用图片`)
  } catch {
    message.error('清理失败')
  } finally {
    cleaning.value = false
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
  margin-bottom: 14px;
}
.pg-head h2 { margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a; }
.pg-head-actions { display: flex; align-items: center; gap: 12px; }
.count { color: #888; font-size: 13px; }

.subnav-card { margin-bottom: 14px; border-radius: 10px; }
.subnav-card :deep(.n-card__content) { padding: 0 10px; }

.batch-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  margin-bottom: 14px;
}
.batch-count { font-size: 13px; color: #666; flex: 1; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.img-card {
  position: relative;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #eee;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.img-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.img-card.selected { border-color: #333; }

.img-check {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.15s;
}
.img-card:hover .img-check,
.img-card.selected .img-check { opacity: 1; }

.img-thumb {
  height: 140px;
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

.img-info { padding: 10px 14px 2px; }
.img-name { font-size: 12px; color: #333; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.img-meta { font-size: 11px; color: #999; margin-top: 2px; }

.img-usage { padding: 6px 14px 2px; display: flex; flex-wrap: wrap; gap: 4px; }
.img-unused { padding-top: 6px; }

.img-actions { padding: 8px 14px 12px; display: flex; gap: 8px; }
</style>
