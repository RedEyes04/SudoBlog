<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { marked, Renderer } from 'marked'
import type { Post } from '../../types'

declare global {
  interface Window {
    twikoo?: {
      init: (opts: Record<string, unknown>) => void
    }
  }
}

const props = defineProps<{
  post: Post
}>()

// ── TOC: extract headings from raw markdown ──
interface TocItem {
  id: string
  text: string
  level: number // 1 = h1, 2 = h2
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w一-鿿＀-￯]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const tocItems = computed<TocItem[]>(() => {
  // Strip fenced code blocks so `#` inside them isn't treated as a heading
  const cleanContent = props.post.content.replace(/```[\s\S]*?```/g, '')
  const headingRegex = /^(#{1,2})\s+(.+)$/gm
  const items: TocItem[] = []
  let match: RegExpExecArray | null
  while ((match = headingRegex.exec(cleanContent)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    items.push({ id: slugify(text), text, level })
  }
  return items
})

// ── Active heading tracking ──
const activeId = ref<string>('')

let observer: IntersectionObserver | null = null

function setupScrollSpy() {
  const headings = document.querySelectorAll('.markdown-body h1[id], .markdown-body h2[id]')
  if (headings.length === 0) return

  observer = new IntersectionObserver(
    (entries) => {
      // Find the first heading that is currently intersecting (visible)
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
          break
        }
      }
    },
    { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
  )

  headings.forEach((h) => observer!.observe(h))
}

function scrollToHeading(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeId.value = id
  }
}

// ── Custom renderer: add ids to headings, language label + copy button to code blocks ──
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const renderer = new Renderer()

// Add IDs to h1/h2 for TOC anchor linking

renderer.heading = function ({ text, depth }: { text: string; depth: number }): string {
  if (depth <= 2) {
    const id = slugify(text)
    return `<h${depth} id="${id}">${text}</h${depth}>`
  }
  return `<h${depth}>${text}</h${depth}>`
}

renderer.code = function ({ text, lang }: { text: string; lang?: string }): string {
  const language = lang || 'code'
  const safeCode = escapeHtml(text)
  // Base64-encode original text so copy can retrieve it reliably,
  // avoiding any HTML-entity or template-literal corruption.
  const encoded = btoa(unescape(encodeURIComponent(text)))
  return [
    '<div class="code-block-wrapper">',
      '<div class="code-block-header">',
        '<span class="code-lang-label">' + language + '</span>',
        '<button class="copy-btn">复制</button>',
      '</div>',
      '<pre><code class="language-' + language + '" data-code="' + encoded + '">' + safeCode + '</code></pre>',
    '</div>',
  ].join('')
}

const html = computed(() => {
  return marked.parse(props.post.content, {
    breaks: true,
    gfm: true,
    renderer,
  }) as string
})

// ── Twikoo comment system ──
function loadTwikoo() {
  const existing = document.querySelector('script[src*="twikoo"]')
  if (existing) {
    if (window.twikoo) initTwikoo()
    return
  }
  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/twikoo@1.7.14/dist/twikoo.min.js'
  script.onload = () => {
    if (window.twikoo) initTwikoo()
  }
  document.body.appendChild(script)
}

function initTwikoo() {
  window.twikoo?.init({
    envId: 'https://twikoo.redeyes.top',
    el: '#tcomment',
    path: window.location.hash || '/',
    lang: 'zh-CN',
  })
}

onMounted(() => {
  loadTwikoo()
  // Delay scroll-spy so the DOM is rendered
  setTimeout(setupScrollSpy, 100)
})

onUnmounted(() => {
  observer?.disconnect()
})

// ── Copy button handler (event delegation) ──
function handleCopyClick(e: MouseEvent) {
  const btn = (e.target as HTMLElement).closest('.copy-btn')
  if (!btn) return

  const wrapper = btn.closest('.code-block-wrapper')
  const codeEl = wrapper?.querySelector('code')
  if (!codeEl) return

  // Prefer data-code (base64 of original) to avoid any encoding round-trip loss
  let textToCopy: string
  const raw = codeEl.getAttribute('data-code')
  if (raw) {
    try {
      textToCopy = decodeURIComponent(escape(atob(raw)))
    } catch {
      textToCopy = codeEl.textContent || ''
    }
  } else {
    textToCopy = codeEl.textContent || ''
  }

  navigator.clipboard.writeText(textToCopy).then(() => {
    btn.textContent = '已复制'
    setTimeout(() => {
      btn.textContent = '复制'
    }, 2000)
  }).catch(() => {
    const textarea = document.createElement('textarea')
    textarea.value = textToCopy
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
    <!-- Main content -->
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

      <!-- Comments -->
      <div id="tcomment" class="comment-section" />
    </div>

    <!-- TOC floating sidebar (right side) -->
    <nav v-if="tocItems.length > 0" class="toc-sidebar">
      <div class="toc-title">目录</div>
      <ul class="toc-list">
        <li
          v-for="item in tocItems"
          :key="item.id"
          class="toc-item"
          :class="{
            'toc-h1': item.level === 1,
            'toc-h2': item.level === 2,
            active: activeId === item.id,
          }"
          @click="scrollToHeading(item.id)"
        >
          {{ item.text }}
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
.post-page {
  height: 100%;
  padding: 2rem;
  display: flex;
  gap: 2rem;
  justify-content: center;
}

/* ── TOC floating sidebar (right side) ── */
.toc-sidebar {
  position: fixed;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  width: 220px;
  max-height: calc(100vh - 14rem);
  overflow-y: auto;
  padding: 0.8rem 1rem;
  background: rgba(46, 52, 64, 0.85);
  backdrop-filter: blur(6px);
  border: 1px solid var(--dark-gray);
  border-left: 3px solid var(--green);
  border-radius: 6px;
  z-index: 10;
  transition: opacity 0.3s;
}

.toc-title {
  color: var(--green);
  font-weight: bold;
  font-size: 0.95em;
  margin-bottom: 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--dark-gray);
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  color: var(--gray);
  font-size: 0.82em;
  line-height: 1.5;
  padding: 0.25em 0;
  cursor: pointer;
  transition: color 0.15s, padding-left 0.15s;
  border-radius: 2px;
  word-break: break-word;
}

.toc-item:hover {
  color: var(--fg);
}

.toc-item.active {
  color: var(--green);
  font-weight: bold;
}

.toc-h1 {
  /* top-level: no indent */
}

.toc-h2 {
  padding-left: 1.2em;
}

/* ── Main content ── */
.post-content {
  max-width: 860px;
  min-width: 0;
  flex: 1;
  padding-bottom: 1rem;
  padding-right: 0;
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

/* ── Twikoo comments ── */
.comment-section {
  margin-top: 1rem;
  width: 100%;
}

/* ── Responsive: hide TOC on narrow screens ── */
@media (max-width: 1200px) {
  .toc-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .post-page {
    padding: 1rem;
  }
}
</style>
