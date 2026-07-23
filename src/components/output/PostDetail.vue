<script setup lang="ts">
import { computed } from 'vue'
import { marked, Renderer } from 'marked'
import type { Post } from '../../types'

const props = defineProps<{
  post: Post
}>()

// ── Custom renderer: add language label + copy button to code blocks ──
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const renderer = new Renderer()
renderer.code = function ({ text, lang }: { text: string; lang?: string }): string {
  const language = lang || 'code'
  // Always escape to prevent HTML in code from being rendered
  const safeCode = escapeHtml(text)
  return `
<div class="code-block-wrapper">
  <div class="code-block-header">
    <span class="code-lang-label">${language}</span>
    <button class="copy-btn">复制</button>
  </div>
  <pre><code class="language-${language}">${safeCode}</code></pre>
</div>`
}

const html = computed(() => {
  return marked.parse(props.post.content, {
    breaks: true,
    gfm: true,
    renderer,
  }) as string
})

// ── Copy button handler (event delegation) ──
function handleCopyClick(e: MouseEvent) {
  const btn = (e.target as HTMLElement).closest('.copy-btn')
  if (!btn) return

  const wrapper = btn.closest('.code-block-wrapper')
  const codeEl = wrapper?.querySelector('code')
  if (!codeEl) return

  navigator.clipboard.writeText(codeEl.textContent || '').then(() => {
    btn.textContent = '已复制'
    setTimeout(() => {
      btn.textContent = '复制'
    }, 2000)
  }).catch(() => {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = codeEl.textContent || ''
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    btn.textContent = '已复制'
    setTimeout(() => {
      btn.textContent = '复制'
    }, 2000)
  })
}
</script>

<template>
  <div class="post-page">
    <div class="post-content" @click="handleCopyClick">
      <!-- Header -->
      <div class="post-header">
        <h1 class="post-title">{{ post.title }}</h1>
        <p class="post-subtitle">{{ post.subtitle }}</p>
        <p class="post-date">{{ post.date }}</p>
      </div>

      <!-- Summary -->
      <div class="post-summary">
        <span class="summary-label">摘要：</span>{{ post.summary }}
      </div>

      <hr class="divider" />

      <!-- Markdown body -->
      <div class="markdown-body" v-html="html" />

      <hr class="divider" />
    </div>
  </div>
</template>

<style scoped>
.post-page {
  height: 100%;
  padding: 2rem;
}

.post-content {
  max-width: 860px;
  margin: 0 auto;
  width: 100%;
  padding-bottom: 1rem;
}

.post-header {
  margin-bottom: 1.5rem;
}

.post-title {
  color: var(--green);
  font-size: 1.6em;
  margin-bottom: 0.2em;
}

.post-subtitle {
  color: var(--yellow);
  font-size: 1.1em;
  margin-bottom: 0.2em;
}

.post-date {
  color: var(--gray);
  font-size: 0.85em;
}

.post-summary {
  background: rgba(163, 190, 140, 0.08);
  border-left: 3px solid var(--green);
  padding: 0.6em 0.8em;
  margin-bottom: 1rem;
  border-radius: 3px;
  color: var(--fg);
  line-height: 1.5;
}

.summary-label {
  color: var(--green);
  font-weight: bold;
}

.divider {
  border: none;
  border-top: 1px solid var(--dark-gray);
  margin: 1.2em 0;
}

/* ── Code block wrapper ── */
.post-content :deep(.code-block-wrapper) {
  margin: 1em 0;
  border: 1px solid var(--dark-gray);
  border-radius: 6px;
  overflow: hidden;
}

.post-content :deep(.code-block-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4em 0.9em;
  background: rgba(76, 86, 106, 0.3);
  border-bottom: 1px solid var(--dark-gray);
}

.post-content :deep(.code-lang-label) {
  color: var(--blue);
  font-size: 0.8em;
  font-family: var(--font);
  text-transform: lowercase;
}

.post-content :deep(.copy-btn) {
  background: transparent;
  border: 1px solid var(--dark-gray);
  color: var(--gray);
  padding: 0.15em 0.7em;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.8em;
  font-family: inherit;
  transition: border-color 0.2s, color 0.2s;
}

.post-content :deep(.copy-btn:hover) {
  border-color: var(--green);
  color: var(--green);
}

.post-content :deep(.code-block-wrapper pre) {
  margin: 0;
  padding: 0.9em;
  background: rgba(0, 0, 0, 0.2);
  overflow-x: auto;
  border-radius: 0;
}

.post-content :deep(.code-block-wrapper code) {
  background: transparent;
  padding: 0;
  font-size: 0.85em;
}
</style>
