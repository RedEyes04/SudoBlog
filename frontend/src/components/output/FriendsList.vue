<script setup lang="ts">
import { onMounted, onUnmounted, ref, reactive } from 'vue'
import type { Friend } from '../../types'

defineProps<{
  friends: Friend[]
}>()

// ── Application form ──
const showForm = ref(false)
const applying = ref(false)
const submitted = ref(false)
const submitError = ref('')

const applyForm = reactive({
  name: '',
  url: '',
  avatar: '',
  description: '',
  thumbnail: '',
})

async function handleApply() {
  if (!applyForm.name || !applyForm.url) {
    submitError.value = '请填写网站名称和链接'
    return
  }
  applying.value = true
  submitError.value = ''
  try {
    const resp = await fetch('/api/friends/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: applyForm.name.trim(),
        url: applyForm.url.trim(),
        avatar: applyForm.avatar.trim(),
        description: applyForm.description.trim(),
        thumbnail: applyForm.thumbnail.trim(),
      }),
    })
    if (resp.ok) {
      submitted.value = true
    } else {
      const err = await resp.json()
      submitError.value = err.error || '提交失败，请稍后再试'
    }
  } catch {
    submitError.value = '网络错误，请稍后再试'
  } finally {
    applying.value = false
  }
}

// ── Twikoo ──
declare global {
  interface Window {
    twikoo?: { init: (opts: Record<string, unknown>) => void }
  }
}

let timer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  timer = setTimeout(loadTwikoo, 300)
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})

function loadTwikoo() {
  const existing = document.querySelector('script[src*="twikoo"]')
  if (existing) {
    if (window.twikoo) initTwikoo()
    return
  }
  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/twikoo@1.7.14/dist/twikoo.min.js'
  script.onload = () => { if (window.twikoo) initTwikoo() }
  document.body.appendChild(script)
}

function initTwikoo() {
  window.twikoo?.init({
    envId: 'https://twikoo.redeyes.top',
    el: '#tcomment-friends',
    path: '/friends',
    lang: 'zh-CN',
  })
}
</script>

<template>
  <div class="friends-page">
    <div class="friends-content">
      <div class="header">
        友链
      </div>
      <div class="grid">
        <a
          v-for="friend in friends"
          :key="friend.id"
          :href="friend.url"
          target="_blank"
          rel="noopener"
          class="friend-card"
        >
          <img v-if="friend.thumbnail" :src="friend.thumbnail" :alt="friend.name" class="thumbnail" />
          <div class="card-body">
            <div class="card-header">
              <img :src="friend.avatar" :alt="friend.name" class="card-avatar" />
              <h3 class="card-name">{{ friend.name }}</h3>
            </div>
            <p class="card-desc">{{ friend.description }}</p>
          </div>
          <span class="visit-hint">访问 &rarr;</span>
        </a>
      </div>

      <!-- 本站友链 -->
      <div class="my-link-section">
        <div class="my-link-title">本站友链信息 <span class="owo">OωO</span></div>
        <div class="my-link-code">
          <p><span class="label">Name</span>     REDEYESの终端</p>
          <p><span class="label">Link</span>     https://www.redeyes.top/</p>
          <p><span class="label">Avatar</span>   https://bucket.redeyes.top/avater.webp</p>
          <p><span class="label">Desc</span>     努力学网络的计科人</p>
          <p><span class="label">Snapshot</span> https://bucket.redeyes.top/2024/10/20/82681b.webp</p>
        </div>
      </div>

      <!-- 友链申请 -->
      <div class="apply-section">
        <div class="apply-toggle" @click="showForm = !showForm">
          <span class="apply-title">申请友链 <span class="owo">{{ showForm ? '▼' : '▶' }}</span></span>
        </div>
        <form v-if="showForm" class="apply-form" @submit.prevent="handleApply">
          <div class="form-row">
            <label class="form-label">网站名称 <span class="required">*</span></label>
            <input v-model="applyForm.name" type="text" class="form-input" placeholder="你的网站名称" required />
          </div>
          <div class="form-row">
            <label class="form-label">网站链接 <span class="required">*</span></label>
            <input v-model="applyForm.url" type="url" class="form-input" placeholder="https://..." required />
          </div>
          <div class="form-row">
            <label class="form-label">头像链接</label>
            <input v-model="applyForm.avatar" type="url" class="form-input" placeholder="https://...avatar.png" />
          </div>
          <div class="form-row">
            <label class="form-label">网站描述</label>
            <input v-model="applyForm.description" type="text" class="form-input" placeholder="简短描述你的网站" />
          </div>
          <div class="form-row">
            <label class="form-label">缩略图链接</label>
            <input v-model="applyForm.thumbnail" type="url" class="form-input" placeholder="https://...thumbnail.png" />
          </div>
          <button type="submit" class="apply-btn" :disabled="applying">
            {{ applying ? '提交中...' : submitted ? '已提交 ✓' : '提交申请' }}
          </button>
          <p v-if="submitError" class="apply-error">{{ submitError }}</p>
        </form>
      </div>

      <hr class="divider" />

      <!-- Comments -->
      <div id="tcomment-friends" class="comment-section" />
    </div>
  </div>
</template>

<style scoped>
.friends-page {
  height: 100%;
  padding: 2rem;
}

.friends-content {
  max-width: 960px;
  margin: 0 auto;
  padding-bottom: 1rem;
}

.header {
  color: var(--green);
  font-weight: bold;
  margin-bottom: 1.5rem;
  font-size: 1.2em;
  text-align: center;
}

.header-icon {
  margin-right: 0.4em;
}

.count {
  color: var(--gray);
  font-weight: normal;
  font-size: 0.9em;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.friend-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--dark-gray);
  border-radius: 6px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, background 0.2s;
  background: rgba(0, 0, 0, 0.1);
}

.friend-card:hover {
  border-color: var(--green);
  background: rgba(163, 190, 140, 0.06);
}

.thumbnail {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.card-body {
  padding: 0.8em 1em;
  flex: 1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.6em;
  margin-bottom: 0.5em;
}

.card-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
}

.card-name {
  color: var(--yellow);
  font-size: 1em;
  font-weight: 600;
}

.card-desc {
  color: var(--gray);
  font-size: 0.9em;
  line-height: 1.5;
}

.visit-hint {
  display: block;
  text-align: right;
  padding: 0 1em 0.8em;
  color: var(--blue);
  font-size: 0.85em;
}

.friend-card:hover .visit-hint {
  color: var(--green);
}

/* ── 本站友链 ── */
.my-link-section {
  max-width: 480px;
  margin: 0 auto;
}

.my-link-title {
  color: var(--green);
  font-weight: bold;
  font-size: 1em;
  margin-bottom: 0.6rem;
  text-align: center;
}

.owo {
  color: var(--yellow);
  font-weight: normal;
}

.my-link-code {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--dark-gray);
  border-radius: 4px;
  padding: 0.8em 1em;
  font-family: var(--font);
  font-size: 0.82em;
  color: var(--fg);
  line-height: 1.9;
}

.my-link-code p {
  margin: 0;
}

.label {
  color: rgb(163, 190, 140);
}

/* ── Divider ── */
.divider {
  border: none;
  border-top: 1px solid var(--dark-gray);
  margin: 1.5em 0;
}

/* ── Application form ── */
.apply-section {
  max-width: 480px;
  margin: 0 auto;
}

.apply-toggle {
  cursor: pointer;
  padding: 0.5em 0;
  text-align: center;
  user-select: none;
}

.apply-title {
  color: var(--green);
  font-weight: bold;
  font-size: 0.95em;
}

.apply-form {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--dark-gray);
  border-radius: 4px;
  padding: 1em 1.2em;
  margin-top: 0.6em;
}

.form-row {
  margin-bottom: 0.8em;
}

.form-label {
  display: block;
  color: var(--gray);
  font-size: 0.8em;
  margin-bottom: 0.3em;
}

.required {
  color: var(--red);
}

.form-input {
  width: 100%;
  padding: 0.5em 0.7em;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--dark-gray);
  border-radius: 3px;
  color: var(--fg);
  font-family: var(--font);
  font-size: 0.85em;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: var(--green);
}

.apply-btn {
  display: block;
  width: 100%;
  padding: 0.6em;
  background: var(--green);
  color: var(--bg);
  border: none;
  border-radius: 3px;
  font-family: var(--font);
  font-size: 0.9em;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
}

.apply-btn:hover:not(:disabled) {
  opacity: 0.85;
}

.apply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.apply-error {
  color: var(--red);
  font-size: 0.8em;
  margin-top: 0.5em;
  text-align: center;
}

/* ── Comments ── */
.comment-section {
  width: 100%;
}
</style>
