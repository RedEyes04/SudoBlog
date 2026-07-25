<template>
  <div>
    <h2 class="pg-title">仪表盘</h2>
    <div class="stat-row">
      <div class="stat"><span class="stat-n">{{ posts.posts.length }}</span><span class="stat-l">文章总数</span></div>
      <div class="stat"><span class="stat-n">{{ posts.publishedPosts.length }}</span><span class="stat-l">已发布</span></div>
      <div class="stat"><span class="stat-n">{{ posts.draftPosts.length }}</span><span class="stat-l">草稿</span></div>
    </div>

    <n-card title="快捷操作" class="card">
      <n-space>
        <n-button type="primary" @click="$router.push('/editor')">新建文章</n-button>
        <n-button @click="$router.push('/posts')">管理文章</n-button>
      </n-space>
    </n-card>

    <n-card v-if="posts.posts.length" title="最近文章" class="card">
      <n-data-table :columns="cols" :data="recent" :bordered="false" size="small" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, h } from 'vue'
import { NTag } from 'naive-ui'
import { usePostsStore } from '../stores/posts'

const posts = usePostsStore()
const recent = computed(() => posts.posts.slice(0, 5))

const cols = [
  { title:'标题', key:'title' },
  { title:'日期', key:'date', width:140 },
  { title:'状态', key:'status', width:100, render: (r:any) => h(NTag, { type: r.status==='publish'?'success':'default', size:'small', bordered:false }, { default:()=> r.status==='publish'?'已发布':'草稿' }) },
]

onMounted(() => posts.fetchPosts())
</script>

<style scoped>
.pg-title { font-size: 18px; font-weight: 600; margin: 0 0 20px; color: #1a1a1a; }
.stat-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 20px; }
.stat { background: #fff; border-radius: 12px; padding: 22px; text-align: center; border: 1px solid rgba(0,0,0,0.04); }
.stat-n { font-size: 34px; font-weight: 700; color: #1a1a1a; display: block; }
.stat-l { font-size: 12px; color: #999; margin-top: 4px; display: block; }
.card { margin-bottom: 16px; border-radius: 12px; }
</style>
