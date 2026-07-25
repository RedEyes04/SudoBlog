<template>
  <div class="editor-root">
    <!-- Top bar -->
    <div class="etop">
      <h2 class="etop-title">{{ isEdit ? '编辑文章' : '新建文章' }}</h2>
      <n-space :size="8">
        <n-button text @click="focusMode = true">
          <template #icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="17" height="17"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg></template>
          专注模式
        </n-button>
        <n-button @click="save('draft')" :loading="saving&&form.status==='draft'">存草稿</n-button>
        <n-button type="primary" @click="save('publish')" :loading="saving&&form.status==='publish'">发布</n-button>
      </n-space>
    </div>

    <!-- Body -->
    <div class="ebody">
      <div class="emain">
        <div class="ecard">
          <input class="etitle" v-model="form.title" placeholder="文章标题" />
          <div class="emeta">
            <input class="esub" v-model="form.subtitle" placeholder="副标题（可选）" />
            <span class="ediv"></span>
            <n-date-picker v-model:formatted-value="form.date" type="date" size="small" value-format="yyyy-MM-dd" style="width:140px" />
            <n-radio-group v-model:value="form.status" size="small">
              <n-radio-button value="draft">草稿</n-radio-button>
              <n-radio-button value="publish">发布</n-radio-button>
            </n-radio-group>
          </div>

          <div class="earea" v-if="editor">
            <div class="etools">
              <button v-for="b in tools" :key="b.t" class="tbtn" :class="{ on: active(b) }" :title="b.t" @click="run(b)" type="button" v-html="b.i"></button>
              <span class="tgap"></span>
              <button class="tbtn" title="图片" @click="imgOpen" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </button>
            </div>
            <editor-content :editor="editor" class="econtent" />
          </div>
        </div>
      </div>

      <div class="eside">
        <div class="sbox"><div class="slabel">封面</div><n-input v-model:value="form.cover" placeholder="图片 URL" size="small" /><img v-if="form.cover" :src="form.cover" class="simg" /></div>
        <div class="sbox"><div class="slabel">标签</div><n-select v-model:value="form.tags" multiple filterable tag placeholder="添加标签" size="small" :options="[]" /></div>
        <div class="sbox"><div class="slabel">摘要</div><n-input v-model:value="form.summary" type="textarea" :rows="3" placeholder="文章摘要..." size="small" /></div>
      </div>
    </div>

    <!-- Focus -->
    <div v-if="focusMode" class="focus">
      <div class="fbar">
        <span class="flabel">专注写作</span>
        <n-space :size="8">
          <n-button @click="save('draft')" :loading="saving&&form.status==='draft'" size="small">存草稿</n-button>
          <n-button type="primary" @click="save('publish')" :loading="saving&&form.status==='publish'" size="small">发布</n-button>
          <n-button text size="small" @click="focusMode=false">退出</n-button>
        </n-space>
      </div>
      <input class="ftitle" v-model="form.title" placeholder="文章标题" />
      <div class="earea farea" v-if="editor">
        <div class="etools">
          <button v-for="b in tools" :key="b.t" class="tbtn" :class="{ on: active(b) }" :title="b.t" @click="run(b)" type="button" v-html="b.i"></button>
          <span class="tgap"></span>
          <button class="tbtn" title="图片" @click="imgOpen" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </button>
        </div>
        <editor-content :editor="editor" class="econtent" />
      </div>
    </div>

    <!-- Image modal -->
    <n-modal v-model:show="imgShow" preset="card" title="插入图片" style="width:400px">
      <n-input v-model:value="imgUrl" placeholder="图片 URL" @keyup.enter="imgInsert" />
      <template #footer><n-space><n-button @click="imgShow=false">取消</n-button><n-button type="primary" @click="imgInsert">插入</n-button></n-space></template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { usePostsStore } from '../stores/posts'

const props = defineProps<{ id?: string }>()
const router = useRouter()
const posts = usePostsStore()
const message = useMessage()
const isEdit = computed(() => !!props.id)
const saving = ref(false)
const focusMode = ref(false)

const form = reactive({
  title:'', subtitle:'', content:'', tags:[] as string[],
  cover:'', status:'draft' as 'publish'|'draft',
  date: new Date().toISOString().slice(0,10), summary:'',
})

const editor = useEditor({
  extensions: [StarterKit.configure({codeBlock:false}),Image.configure({inline:false}),Placeholder.configure({placeholder:'开始写作…'})],
  content:'',
  onUpdate:({editor:ed})=>{ form.content = ed.getHTML() },
})

watch(()=>form.content, v=>{ if(editor.value&&editor.value.getHTML()!==v) editor.value.commands.setContent(v) })

const svg = (d:string)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">${d}</svg>`

const tools = [
  { t:'粗体',     i:svg('<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6zM6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>'),           fn:(e:any)=>e.chain().focus().toggleBold().run(),            on:(e:any)=>e.isActive('bold') },
  { t:'斜体',     i:svg('<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>'), fn:(e:any)=>e.chain().focus().toggleItalic().run(),          on:(e:any)=>e.isActive('italic') },
  { t:'删除线',   i:svg('<path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 3.6 6.2 3.6 6.2 6.4 0 2.5-2.9 3.3-5.5 3L4.8 17"/><line x1="3" y1="12" x2="21" y2="12"/>'), fn:(e:any)=>e.chain().focus().toggleStrike().run(), on:(e:any)=>e.isActive('strike') },
  {},
  { t:'标题1',    i:svg('<path d="M4 12h8M4 18V6m8 12V6m5 12.5V7l-3 2"/>'),               fn:(e:any)=>e.chain().focus().toggleHeading({level:1}).run(), on:(e:any)=>e.isActive('heading',{level:1}) },
  { t:'标题2',    i:svg('<path d="M4 12h8M4 18V6m8 12V6m5 12.5v-7l-5 5"/>'),               fn:(e:any)=>e.chain().focus().toggleHeading({level:2}).run(), on:(e:any)=>e.isActive('heading',{level:2}) },
  {},
  { t:'引用',     i:svg('<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2v3c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>'), fn:(e:any)=>e.chain().focus().toggleBlockquote().run(), on:(e:any)=>e.isActive('blockquote') },
  { t:'无序列表', i:svg('<circle cx="6" cy="6" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="6" cy="18" r="1.5"/><line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/>'), fn:(e:any)=>e.chain().focus().toggleBulletList().run(), on:(e:any)=>e.isActive('bulletList') },
  { t:'有序列表', i:svg('<line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/><path d="M4 16v-4l.5.5M6 4v4H4"/>'), fn:(e:any)=>e.chain().focus().toggleOrderedList().run(), on:(e:any)=>e.isActive('orderedList') },
  { t:'代码',     i:svg('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),    fn:(e:any)=>e.chain().focus().toggleCodeBlock().run(),         on:(e:any)=>e.isActive('codeBlock') },
  { t:'链接',     i:svg('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'), fn:(e:any)=>{const u=prompt('链接地址:');if(u)e.chain().focus().setLink({href:u}).run()}, on:(e:any)=>e.isActive('link') },
  {},
  { t:'分隔线',   i:svg('<line x1="4" y1="12" x2="20" y2="12"/><polyline points="8 8 4 12 8 16"/><polyline points="16 8 20 12 16 16"/>'), fn:(e:any)=>e.chain().focus().setHorizontalRule().run(), on:()=>false },
  { t:'撤销',     i:svg('<polyline points="1 10 10 10 10 1"/><path d="M10 10c0-5 4.5-9 10-9"/>'),         fn:(e:any)=>e.chain().focus().undo().run(),                   on:()=>false },
  { t:'重做',     i:svg('<polyline points="23 10 14 10 14 1"/><path d="M14 10c0-5-4.5-9-10-9"/>'),       fn:(e:any)=>e.chain().focus().redo().run(),                   on:()=>false },
]

function active(b:any) { return b.on && editor.value ? b.on(editor.value) : false }
function run(b:any) { if (b.fn && editor.value) b.fn(editor.value) }

const imgShow = ref(false), imgUrl = ref('')
function imgOpen(){ imgUrl.value=''; imgShow.value=true }
function imgInsert(){ if(imgUrl.value&&editor.value){ editor.value.chain().focus().setImage({src:imgUrl.value}).run(); imgShow.value=false } }

async function save(status:'publish'|'draft') {
  if(!form.title.trim()){ message.warning('请输入文章标题'); return }
  saving.value=true; form.status=status
  try {
    const p={title:form.title.trim(),content:form.content,tags:form.tags,cover:form.cover,status:form.status,date:form.date,subtitle:form.subtitle,summary:form.summary}
    if(isEdit.value&&props.id){ await posts.updatePost(props.id,p); message.success('已更新') }
    else { await posts.createPost(p); message.success('已创建') }
    router.push('/posts')
  }catch{}finally{saving.value=false}
}

onMounted(async()=>{
  if(props.id){ const p=await posts.fetchPost(props.id)
    if(p){ form.title=p.title;form.content=p.content;form.tags=p.meta.tags||[];form.cover=p.meta.cover||'';form.status=p.status;form.date=p.meta.date||p.date;form.subtitle=p.meta.subtitle||'';form.summary=p.meta.summary||''
    if(editor.value)editor.value.commands.setContent(p.content) }
  }
})

onBeforeUnmount(()=>editor.value?.destroy())
</script>

<style scoped>
.editor-root { display: flex; flex-direction: column; height: calc(100vh - 100px); }
.etop { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0; }
.etop-title { font-size: 17px; font-weight: 600; margin: 0; color: #1a1a1a; }
.ebody { flex: 1; display: flex; gap: 16px; min-height: 0; }
.emain { flex: 1; min-width: 0; }
.ecard { background: #fff; border: 1px solid rgba(0,0,0,0.05); border-radius: 10px; padding: 20px 24px; display: flex; flex-direction: column; height: 100%; }
.etitle { border: none; outline: none; font-size: 26px; font-weight: 700; color: #1a1a1a; font-family: inherit; width: 100%; margin-bottom: 6px; }
.etitle::placeholder { color: #ccc; }
.emeta { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
.esub { border: none; outline: none; font-size: 14px; color: #888; font-family: inherit; flex: 1; }
.esub::placeholder { color: #ccc; }
.ediv { width: 1px; height: 16px; background: rgba(0,0,0,0.08); margin: 0 2px; }

.earea { flex: 1; display: flex; flex-direction: column; border: 1px solid rgba(0,0,0,0.06); border-radius: 6px; overflow: hidden; min-height: 0; }
.etools { display: flex; align-items: center; gap: 1px; padding: 4px 8px; background: #fafafa; border-bottom: 1px solid rgba(0,0,0,0.04); flex-shrink: 0; }
.tbtn { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 28px; border: none; border-radius: 4px; background: none; cursor: pointer; color: #999; }
.tbtn:hover { background: rgba(0,0,0,0.04); color: #333; }
.tbtn.on { background: rgba(0,0,0,0.06); color: #111; }
.tgap { flex: 1; }

.econtent { flex: 1; overflow-y: auto; padding: 20px 24px; }
.econtent :deep(.ProseMirror) { outline: none; min-height: 300px; font-size: 16px; line-height: 1.85; color: #2a2a2a; }
.econtent :deep(.ProseMirror p.is-editor-empty:first-child::before) { content: attr(data-placeholder); color: #bbb; float: left; height: 0; pointer-events: none; }
.econtent :deep(h1) { font-size: 1.7em; margin: 0.7em 0 0.3em; font-weight: 700; }
.econtent :deep(h2) { font-size: 1.3em; margin: 0.6em 0 0.2em; font-weight: 600; }
.econtent :deep(blockquote) { border-left: 2px solid #ddd; padding-left: 14px; color: #777; margin: 0.8em 0; }
.econtent :deep(pre) { background: #1a1a1a; color: #ddd; padding: 14px 18px; border-radius: 6px; font-size: 13.5px; overflow-x: auto; }
.econtent :deep(code) { background: rgba(0,0,0,0.03); padding: 1px 4px; border-radius: 3px; font-size: 0.9em; }
.econtent :deep(pre code) { background: none; padding: 0; }
.econtent :deep(img) { max-width: 100%; border-radius: 6px; }
.econtent :deep(ul), .econtent :deep(ol) { padding-left: 1.5em; }
.econtent :deep(hr) { border: none; border-top: 1px solid rgba(0,0,0,0.08); margin: 1.2em 0; }
.econtent :deep(p) { margin: 0.4em 0; }

.eside { width: 220px; flex-shrink: 0; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
.sbox { background: #fff; border: 1px solid rgba(0,0,0,0.05); border-radius: 10px; padding: 14px; }
.slabel { font-size: 11px; font-weight: 600; color: #999; margin-bottom: 8px; letter-spacing: 0.5px; }
.simg { margin-top: 8px; border-radius: 6px; width: 100%; }

/* Focus */
.focus { position: fixed; inset: 0; z-index: 1000; background: #f8f8f8; display: flex; flex-direction: column; }
.fbar { display: flex; align-items: center; justify-content: space-between; height: 46px; padding: 0 20px; border-bottom: 1px solid rgba(0,0,0,0.05); flex-shrink: 0; }
.flabel { font-size: 13px; color: #999; }
.ftitle { border: none; outline: none; background: none; font-size: 30px; font-weight: 700; padding: 28px 64px 12px; color: #1a1a1a; font-family: inherit; flex-shrink: 0; }
.ftitle::placeholder { color: #ccc; }
.farea { margin: 0 64px; flex: 1; border-top: 1px solid rgba(0,0,0,0.04); }
.farea .econtent :deep(.ProseMirror) { font-size: 18px; line-height: 1.9; max-width: 800px; }
.farea .econtent { padding: 28px 0; }
</style>
