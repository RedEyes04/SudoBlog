<template>
  <div>
    <div class="pg-head">
      <h2>文章管理</h2>
      <div class="pg-head-actions">
        <n-button @click="openImport">导入文章</n-button>
        <n-button type="primary" @click="$router.push('/editor')">新建文章</n-button>
      </div>
    </div>
    <n-card class="card">
      <n-data-table :columns="cols" :data="posts.posts" :loading="posts.loading" :bordered="false" size="small" />
    </n-card>

    <!-- Import modal -->
    <n-modal v-model:show="showImport" preset="card" title="导入 Markdown 文章" style="width:520px" :mask-closable="false">
      <n-form label-placement="top" size="small">
        <n-form-item label="选择 Markdown 文件">
          <input ref="fileInput" type="file" accept=".md,.markdown,text/markdown" style="display:none" @change="onFilePicked" />
          <n-space align="center">
            <n-button @click="($refs.fileInput as HTMLInputElement).click()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15" style="margin-right:5px;vertical-align:-2px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              {{ pickedFile ? pickedFile.name : '选择 .md 文件' }}
            </n-button>
            <n-button v-if="pickedFile" type="primary" :loading="importing" @click="doImport">
              导入并编辑
            </n-button>
          </n-space>
        </n-form-item>
      </n-form>
      <div class="import-hint">导入后自动存为草稿，可在编辑器中修改后发布</div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, h, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NTag, NPopconfirm, NModal, NForm, NFormItem, NSpace } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { usePostsStore } from '../stores/posts'

const router = useRouter()
const posts = usePostsStore()
const message = useMessage()

const showImport = ref(false)
const importing = ref(false)
const pickedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function openImport() {
  pickedFile.value = null
  showImport.value = true
}

function onFilePicked(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) pickedFile.value = file
}

async function doImport() {
  if (!pickedFile.value) return
  importing.value = true
  try {
    const formData = new FormData()
    formData.append('file', pickedFile.value)
    formData.append('status', 'draft')
    const token = localStorage.getItem('admin_token')
    const res = await fetch('/api/posts/import', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token || ''}` },
      body: formData,
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || '导入失败')
    }
    const data = await res.json()
    message.success('导入成功，已存为草稿')
    showImport.value = false
    posts.fetchPosts()
    // Jump to editor so user can review and publish
    router.push(`/editor/${data.id}`)
  } catch (e: any) {
    message.error(e.message || '导入失败')
  } finally {
    importing.value = false
  }
}

async function del(id: string) {
  try { await posts.deletePost(id); message.success('已删除') } catch { }
}

async function pin(id: string, pinned: boolean) {
  try {
    await posts.togglePin(id, !pinned)
    message.success(pinned ? '已取消置顶' : '已置顶')
  } catch { }
}

const cols = [
  { title:'', key:'pinned', width:40, render:(r:any)=>r.pinned ? h('span',{style:{fontSize:'15px'}}, '⭐️') : '' },
  { title:'标题', key:'title', ellipsis:true },
  { title:'日期', key:'date', width:130 },
  { title:'状态', key:'status', width:90, render:(r:any)=>h(NTag,{type:r.status==='publish'?'success':'default',size:'small',bordered:false},{default:()=>r.status==='publish'?'已发布':'草稿'}) },
  { title:'操作', key:'actions', width:220, render:(r:any)=>h('div',{style:{display:'flex',gap:'6px'}},[
    h(NButton,{size:'tiny',onClick:()=>pin(r.id, r.pinned)},{default:()=>r.pinned?'取消置顶':'置顶'}),
    h(NButton,{size:'tiny',onClick:()=>router.push('/editor/'+r.id)},{default:()=>'编辑'}),
    h(NPopconfirm,{onPositiveClick:()=>del(r.id)},{default:()=>'确定删除？',trigger:()=>h(NButton,{size:'tiny',type:'error'},{default:()=>'删除'})}),
  ])},
]

onMounted(() => posts.fetchPosts())
</script>

<style scoped>
.pg-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.pg-head h2 { margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a; }
.pg-head-actions { display: flex; gap: 10px; }
.card { border-radius: 12px; }
.hint { font-size: 11px; color: #999; margin-top: 4px; display: block; }
.import-hint { font-size: 12px; color: #999; text-align: center; padding-top: 4px; }
</style>
