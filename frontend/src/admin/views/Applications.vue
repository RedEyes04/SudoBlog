<template>
  <div>
    <div class="pg-head"><h2>申请管理</h2></div>
    <n-card class="card">
      <n-tabs v-model:value="tab" type="segment" class="tabs">
        <n-tab-pane name="pending" tab="待处理" />
        <n-tab-pane name="all" tab="全部" />
      </n-tabs>
      <n-data-table :columns="cols" :data="filtered" :loading="store.loading" :bordered="false" size="small" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { NButton, NTag, NPopconfirm } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useFriendsStore } from '../stores/friends'

const store = useFriendsStore()
const message = useMessage()
const tab = ref('pending')

const filtered = computed(() => tab.value==='pending' ? store.applications.filter(a=>a.status==='pending') : store.applications)

function fmt(d: string) { return new Date(d).toLocaleString('zh-CN') }

async function approve(id:string) { try { await store.approveFriend(id); message.success('已通过') } catch { } }
async function reject(id:string) { try { await store.rejectFriend(id); message.success('已拒绝') } catch { } }
async function del(id:string) { try { await store.deleteFriend(id); message.success('已删除') } catch { } }

const cols = [
  { title:'名称', key:'name' },
  { title:'链接', key:'url', ellipsis:true, render:(r:any)=>h('a',{href:r.url,target:'_blank',style:{color:'#1a1a1a',textDecoration:'none'}},r.url) },
  { title:'描述', key:'description', ellipsis:true },
  { title:'提交时间', key:'createdAt', width:160, render:(r:any)=>r.createdAt?fmt(r.createdAt):'-' },
  { title:'状态', key:'status', width:90, render:(r:any)=>h(NTag,{type:r.status==='approved'?'success':r.status==='rejected'?'error':'warning',size:'small',bordered:false},{default:()=>r.status==='approved'?'已通过':r.status==='rejected'?'已拒绝':'待处理'}) },
  { title:'操作', key:'actions', width:160, render:(r:any)=>r.status==='pending'?h('div',{style:{display:'flex',gap:'6px'}},[
    h(NButton,{size:'tiny',type:'success',onClick:()=>approve(r.id)},{default:()=>'通过'}),
    h(NButton,{size:'tiny',type:'error',onClick:()=>reject(r.id)},{default:()=>'拒绝'}),
  ]):h(NPopconfirm,{onPositiveClick:()=>del(r.id)},{default:()=>'确定删除？',trigger:()=>h(NButton,{size:'tiny',type:'error'},{default:()=>'删除'})}) },
]

onMounted(() => store.fetchApplications())
</script>

<style scoped>
.pg-head { margin-bottom: 18px; }
.pg-head h2 { margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a; }
.card { border-radius: 12px; }
.tabs { margin-bottom: 12px; }
</style>
