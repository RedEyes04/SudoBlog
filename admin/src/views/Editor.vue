<template>
  <div class="editor-page">
    <div class="page-header">
      <h2>{{ isEdit ? 'Edit Post' : 'New Post' }}</h2>
      <el-space>
        <el-button @click="$router.back()">Cancel</el-button>
        <el-button
          :type="form.status === 'publish' ? 'success' : 'warning'"
          @click="handleSave(form.status)"
          :loading="saving"
        >
          {{ form.status === 'publish' ? 'Publish' : 'Save Draft' }}
        </el-button>
      </el-space>
    </div>

    <el-row :gutter="20">
      <el-col :span="18">
        <el-card shadow="hover" class="editor-card">
          <el-form label-position="top">
            <el-form-item label="Title">
              <el-input
                v-model="form.title"
                placeholder="Enter post title..."
                size="large"
              />
            </el-form-item>
            <el-form-item label="Content">
              <textarea
                ref="editorRef"
                v-model="form.content"
                class="md-editor"
                placeholder="Write your markdown content here..."
                @paste="handlePaste"
              />
            </el-form-item>
          </el-form>
        </el-card>

        <!-- Preview Card -->
        <el-card shadow="hover" class="preview-card" v-if="form.content">
          <template #header>
            <span>Preview</span>
          </template>
          <div class="markdown-preview" v-html="renderedPreview" />
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="meta-card">
          <template #header>
            <span>Post Settings</span>
          </template>
          <el-form label-position="top" size="small">
            <el-form-item label="Status">
              <el-radio-group v-model="form.status">
                <el-radio value="publish">Publish</el-radio>
                <el-radio value="draft">Draft</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="Date">
              <el-date-picker
                v-model="form.date"
                type="date"
                placeholder="Select date"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <el-form-item label="Tags">
              <el-select
                v-model="form.tags"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="Add tags..."
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="Cover Image URL">
              <el-input v-model="form.cover" placeholder="/images/cover.jpg" />
            </el-form-item>

            <el-form-item label="Subtitle">
              <el-input v-model="form.subtitle" placeholder="Optional subtitle" />
            </el-form-item>

            <el-form-item label="Summary">
              <el-input
                v-model="form.summary"
                type="textarea"
                :rows="3"
                placeholder="Brief summary..."
              />
            </el-form-item>

            <el-divider />

            <el-form-item label="Image Upload">
              <el-upload
                :action="uploadUrl"
                :headers="uploadHeaders"
                :show-file-list="false"
                :on-success="handleUploadSuccess"
                :before-upload="beforeUpload"
                accept="image/*"
              >
                <el-button type="primary" size="small">
                  <el-icon><Upload /></el-icon> Upload Image
                </el-button>
              </el-upload>
              <p class="upload-hint">Uploaded image URL will be copied for markdown insertion.</p>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import { usePostsStore } from '../stores/posts'

const props = defineProps<{ id?: string }>()
const router = useRouter()
const postsStore = usePostsStore()

const isEdit = computed(() => !!props.id)
const editorRef = ref<HTMLTextAreaElement | null>(null)
const saving = ref(false)

const uploadUrl = '/api/upload'
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`,
}))

const form = reactive({
  title: '',
  content: '',
  tags: [] as string[],
  cover: '',
  status: 'draft' as 'publish' | 'draft',
  date: new Date().toISOString().split('T')[0],
  subtitle: '',
  summary: '',
})

const renderedPreview = computed(() => {
  if (!form.content) return ''
  return marked.parse(form.content) as string
})

onMounted(async () => {
  if (props.id) {
    try {
      const post = await postsStore.fetchPost(props.id)
      form.title = post.meta.title || post.title
      form.content = post.content
      form.tags = post.meta.tags || []
      form.cover = post.meta.cover || ''
      form.status = post.meta.status || 'draft'
      form.date = post.meta.date || ''
      form.subtitle = post.meta.subtitle || ''
      form.summary = post.meta.summary || ''
    } catch {
      ElMessage.error('Failed to load post')
      router.push('/posts')
    }
  }
})

async function handleSave(status: 'publish' | 'draft') {
  if (!form.title.trim()) {
    ElMessage.warning('Please enter a title')
    return
  }

  saving.value = true
  form.status = status

  try {
    const payload = {
      title: form.title.trim(),
      content: form.content,
      tags: form.tags,
      cover: form.cover,
      status: form.status,
      date: form.date,
      subtitle: form.subtitle,
      summary: form.summary,
    }

    if (isEdit.value && props.id) {
      await postsStore.updatePost(props.id, payload)
      ElMessage.success('Post updated')
    } else {
      await postsStore.createPost(payload)
      ElMessage.success('Post created')
    }
    router.push('/posts')
  } catch {
    // Error handled by interceptor
  } finally {
    saving.value = false
  }
}

function handleUploadSuccess(response: { url: string }) {
  const markdown = `![image](${response.url})`
  // Insert at cursor or append
  const el = editorRef.value
  if (el) {
    const start = el.selectionStart
    const end = el.selectionEnd
    form.content = form.content.slice(0, start) + markdown + form.content.slice(end)
  } else {
    form.content += markdown
  }
  ElMessage.success('Image uploaded! Markdown inserted at cursor.')
}

function beforeUpload(file: File) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('Only image files are allowed')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('Image must be smaller than 5MB')
    return false
  }
  return true
}

// Handle paste events so pasted images can be detected (basic text paste works fine)
function handlePaste(_e: ClipboardEvent) {
  // Text paste works natively via v-model
}
</script>

<style scoped>
.editor-page {
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

.editor-card {
  margin-bottom: 20px;
}

.md-editor {
  width: 100%;
  min-height: 400px;
  padding: 16px;
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
  font-size: 14px;
  line-height: 1.8;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

.md-editor:focus {
  border-color: #409eff;
}

.markdown-preview {
  padding: 16px;
  line-height: 1.8;
  max-height: 600px;
  overflow-y: auto;
}

.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3) {
  margin-top: 24px;
  margin-bottom: 16px;
}

.markdown-preview :deep(pre) {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
}

.markdown-preview :deep(blockquote) {
  border-left: 4px solid #409eff;
  margin: 0;
  padding: 8px 16px;
  background: #f0f7ff;
}

.markdown-preview :deep(table) {
  border-collapse: collapse;
  width: 100%;
}

.markdown-preview :deep(th),
.markdown-preview :deep(td) {
  border: 1px solid #dcdfe6;
  padding: 8px 12px;
  text-align: left;
}

.markdown-preview :deep(th) {
  background: #f5f7fa;
}

.meta-card {
  position: sticky;
  top: 20px;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  margin-bottom: 0;
}
</style>
