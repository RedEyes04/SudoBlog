<template>
  <div>
    <div class="pg-head">
      <h2>项目管理</h2>
      <n-button type="primary" @click="openCreate">新建项目</n-button>
    </div>

    <n-data-table :columns="columns" :data="projects" :bordered="false" :single-line="false" class="table" />

    <!-- Create/Edit Modal -->
    <n-modal v-model:show="showModal" preset="card" :title="editingId ? '编辑项目' : '新建项目'" style="max-width:640px">
      <n-form label-placement="top" size="small">
        <n-grid :cols="2" :x-gap="12">
          <n-gi><n-form-item label="项目名称" required><n-input v-model:value="form.name" /></n-form-item></n-gi>
          <n-gi><n-form-item label="链接" required><n-input v-model:value="form.link" placeholder="https://github.com/..." /></n-form-item></n-gi>
        </n-grid>
        <n-form-item label="描述" required><n-input v-model:value="form.description" type="textarea" :rows="2" /></n-form-item>
        <n-grid :cols="2" :x-gap="12">
          <n-gi>
            <n-form-item label="技术栈">
              <n-select
                v-model:value="form.tech"
                multiple
                tag
                filterable
                placeholder="选择或输入技术栈"
                :options="techOptions"
              />
            </n-form-item>
          </n-gi>
          <n-gi><n-form-item label="GitHub 仓库"><n-input v-model:value="form.githubRepo" placeholder="用户名/仓库名" /></n-form-item></n-gi>
        </n-grid>
        <n-form-item label="项目图片">
          <n-space align="center" :size="12">
            <n-upload
              :action="uploadUrl"
              :headers="uploadHeaders"
              :on-finish="onImageUploaded"
              :show-file-list="false"
              accept="image/*"
              response-type="json"
            >
              <n-button size="small">上传图片</n-button>
            </n-upload>
            <n-input v-model:value="form.image" placeholder="或直接填写图片 URL" style="flex:1" />
            <img v-if="form.image" :src="form.image" class="img-preview" />
          </n-space>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="saving" @click="save">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h, computed } from 'vue'
import { useMessage, NButton, NTag, NPopconfirm } from 'naive-ui'
import api from '../api'

interface Project {
  id: string
  name: string
  description: string
  tech: string[]
  link: string
  image?: string
  githubRepo?: string
  language?: string
}

const message = useMessage()
const projects = ref<Project[]>([])
const showModal = ref(false)
const editingId = ref('')
const saving = ref(false)

const form = reactive({
  name: '',
  description: '',
  tech: [] as string[],
  link: '',
  image: '',
  githubRepo: '',
})

const uploadUrl = '/api/upload'
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`,
}))

function onImageUploaded({ event }: any) {
  const data = event?.target?.response
  if (data?.url) {
    form.image = data.url
    message.success('图片已上传')
  }
}

const techOptions = [
  { label: 'Vue', value: 'Vue' },
  { label: 'React', value: 'React' },
  { label: 'TypeScript', value: 'TypeScript' },
  { label: 'JavaScript', value: 'JavaScript' },
  { label: 'Node.js', value: 'Node.js' },
  { label: 'Express', value: 'Express' },
  { label: 'Python', value: 'Python' },
  { label: 'Go', value: 'Go' },
  { label: 'Rust', value: 'Rust' },
  { label: 'Docker', value: 'Docker' },
  { label: 'Kubernetes', value: 'Kubernetes' },
  { label: 'Vite', value: 'Vite' },
  { label: 'Webpack', value: 'Webpack' },
  { label: 'Tailwind CSS', value: 'Tailwind CSS' },
  { label: 'Next.js', value: 'Next.js' },
  { label: 'Nuxt', value: 'Nuxt' },
  { label: 'Prisma', value: 'Prisma' },
  { label: 'PostgreSQL', value: 'PostgreSQL' },
  { label: 'MySQL', value: 'MySQL' },
  { label: 'MongoDB', value: 'MongoDB' },
  { label: 'Redis', value: 'Redis' },
  { label: 'GraphQL', value: 'GraphQL' },
  { label: 'Nginx', value: 'Nginx' },
  { label: 'Linux', value: 'Linux' },
]

const columns = [
  { title: '名称', key: 'name', width: 120 },
  { title: '描述', key: 'description', ellipsis: { tooltip: true } },
  {
    title: '技术栈', key: 'tech', width: 200,
    render(row: Project) {
      return row.tech?.map((t: string) => h(NTag, { size: 'small', style: { marginRight: '4px' } }, { default: () => t }))
    },
  },
  { title: 'GitHub', key: 'githubRepo', width: 140 },
  {
    title: '操作', key: 'actions', width: 120,
    render(row: Project) {
      return h('div', { style: { display: 'flex', gap: '8px' } }, [
        h(NButton, { size: 'tiny', onClick: () => openEdit(row) }, { default: () => '编辑' }),
        h(NPopconfirm, { onPositiveClick: () => remove(row.id) }, {
          trigger: () => h(NButton, { size: 'tiny', type: 'error' }, { default: () => '删除' }),
          default: () => '确定删除？',
        }),
      ])
    },
  },
]

async function fetchProjects() {
  try {
    const { data } = await api.get('/projects')
    projects.value = data
  } catch { }
}

function openCreate() {
  editingId.value = ''
  form.name = ''; form.description = ''; form.tech = []; form.link = ''; form.image = ''; form.githubRepo = ''
  showModal.value = true
}

function openEdit(p: Project) {
  editingId.value = p.id
  form.name = p.name; form.description = p.description; form.tech = [...(p.tech || [])]; form.link = p.link; form.image = p.image || ''; form.githubRepo = p.githubRepo || ''
  showModal.value = true
}

async function save() {
  if (!form.name.trim() || !form.description.trim() || !form.link.trim()) {
    message.warning('请填写名称、描述和链接')
    return
  }
  saving.value = true
  try {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      tech: form.tech,
      link: form.link.trim(),
      image: form.image.trim(),
      githubRepo: form.githubRepo.trim(),
    }
    if (editingId.value) {
      await api.put(`/projects/${editingId.value}`, payload)
      message.success('已更新')
    } else {
      await api.post('/projects', payload)
      message.success('已创建')
    }
    showModal.value = false
    await fetchProjects()
  } catch { }
  finally { saving.value = false }
}

async function remove(id: string) {
  try {
    await api.delete(`/projects/${id}`)
    message.success('已删除')
    await fetchProjects()
  } catch { }
}

onMounted(() => fetchProjects())
</script>

<style scoped>
.pg-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.pg-head h2 { margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a; }
.table { background: #fff; border-radius: 12px; }
.img-preview { width: 36px; height: 36px; border-radius: 4px; object-fit: cover; border: 1px solid #eee; flex-shrink: 0; }
</style>
