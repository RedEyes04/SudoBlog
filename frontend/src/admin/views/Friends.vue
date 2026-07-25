<template>
  <div>
    <div class="pg-head"><h2>友链管理</h2><n-button type="primary" @click="open(null)">添加友链</n-button></div>
    <n-card class="card">
      <n-data-table :columns="cols" :data="store.friends" :loading="store.loading" :bordered="false" size="small" />
    </n-card>

    <n-modal v-model:show="show" preset="card" :title="editing?'编辑友链':'添加友链'" style="width:480px">
      <n-form :model="form" label-placement="top">
        <n-form-item label="名称" required><n-input v-model:value="form.name" placeholder="站点名称" /></n-form-item>
        <n-form-item label="链接" required><n-input v-model:value="form.url" placeholder="https://..." /></n-form-item>
        <n-form-item label="头像"><n-input v-model:value="form.avatar" placeholder="URL" /></n-form-item>
        <n-form-item label="描述"><n-input v-model:value="form.description" type="textarea" :rows="2" placeholder="简要描述" /></n-form-item>
        <n-form-item label="缩略图"><n-input v-model:value="form.thumbnail" placeholder="URL" /></n-form-item>
      </n-form>
      <template #footer><n-space><n-button @click="show=false">取消</n-button><n-button type="primary" @click="save">{{ editing?'更新':'添加' }}</n-button></n-space></template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { NButton, NPopconfirm } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useFriendsStore, type FriendRecord } from '../stores/friends'

const store = useFriendsStore()
const message = useMessage()
const show = ref(false)
const editing = ref<FriendRecord|null>(null)
const form = reactive({ name:'', url:'', avatar:'', description:'', thumbnail:'' })

function open(f: FriendRecord|null) {
  editing.value = f
  if (f) { form.name=f.name; form.url=f.url; form.avatar=f.avatar; form.description=f.description; form.thumbnail=f.thumbnail }
  else { form.name=''; form.url=''; form.avatar=''; form.description=''; form.thumbnail='' }
  show.value = true
}

async function save() {
  if (!form.name||!form.url) { message.warning('名称和链接不能为空'); return }
  try {
    if (editing.value) { await store.updateFriend(editing.value.id,{...form}); message.success('已更新') }
    else { await store.createFriend({...form}); message.success('已添加') }
    show.value = false
  } catch { }
}

async function del(id:string) { try { await store.deleteFriend(id); message.success('已删除') } catch { } }

const cols = [
  { title:'头像', key:'avatar', width:70, render:(r:any)=>h('img',{src:r.avatar,style:{width:'36px',height:'36px',borderRadius:'6px',objectFit:'cover'}}) },
  { title:'名称', key:'name' },
  { title:'链接', key:'url', ellipsis:true, render:(r:any)=>h('a',{href:r.url,target:'_blank',style:{color:'#1a1a1a',textDecoration:'none'}},r.url) },
  { title:'描述', key:'description', ellipsis:true },
  { title:'操作', key:'actions', width:140, render:(r:any)=>h('div',{style:{display:'flex',gap:'6px'}},[
    h(NButton,{size:'tiny',onClick:()=>open(r)},{default:()=>'编辑'}),
    h(NPopconfirm,{onPositiveClick:()=>del(r.id)},{default:()=>'确定删除？',trigger:()=>h(NButton,{size:'tiny',type:'error'},{default:()=>'删除'})}),
  ])},
]

onMounted(() => store.fetchFriends())
</script>

<style scoped>
.pg-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.pg-head h2 { margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a; }
.card { border-radius: 12px; }
</style>
