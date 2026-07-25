<template>
  <div>
    <div class="pg-head"><h2>文章管理</h2><n-button type="primary" @click="$router.push('/editor')">新建文章</n-button></div>
    <n-card class="card">
      <n-data-table :columns="cols" :data="posts.posts" :loading="posts.loading" :bordered="false" size="small" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NTag, NPopconfirm } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { usePostsStore } from '../stores/posts'

const router = useRouter()
const posts = usePostsStore()
const message = useMessage()

async function del(id: string) {
  try { await posts.deletePost(id); message.success('已删除') } catch { }
}

const cols = [
  { title:'标题', key:'title', ellipsis:true },
  { title:'日期', key:'date', width:130 },
  { title:'状态', key:'status', width:90, render:(r:any)=>h(NTag,{type:r.status==='publish'?'success':'default',size:'small',bordered:false},{default:()=>r.status==='publish'?'已发布':'草稿'}) },
  { title:'操作', key:'actions', width:160, render:(r:any)=>h('div',{style:{display:'flex',gap:'6px'}},[
    h(NButton,{size:'tiny',onClick:()=>router.push('/editor/'+r.id)},{default:()=>'编辑'}),
    h(NPopconfirm,{onPositiveClick:()=>del(r.id)},{default:()=>'确定删除？',trigger:()=>h(NButton,{size:'tiny',type:'error'},{default:()=>'删除'})}),
  ])},
]

onMounted(() => posts.fetchPosts())
</script>

<style scoped>
.pg-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.pg-head h2 { margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a; }
.card { border-radius: 12px; }
</style>
