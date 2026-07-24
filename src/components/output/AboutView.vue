<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { AboutData } from '../../types'

defineProps<{
  about: AboutData
}>()

const visible = ref(false)
const treeReady = ref(false)

let timer: ReturnType<typeof setTimeout> | null = null
onMounted(() => {
  requestAnimationFrame(() => { visible.value = true })
  setTimeout(() => { treeReady.value = true }, 350)
  timer = setTimeout(loadTwikoo, 500)
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})

// ── Twikoo ──
declare global {
  interface Window {
    twikoo?: { init: (opts: Record<string, unknown>) => void }
  }
}

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
    el: '#tcomment-about',
    path: '/about',
    lang: 'zh-CN',
  })
}

const tagline = 'Developer  ·  Runner  ·  Cybersecurity Explorer'

interface TreeNode {
  name: string
  children?: TreeNode[]
}

const tree: TreeNode[] = [
  {
    name: 'frontend',
    children: [
      { name: 'JavaScript' },
      { name: 'TypeScript' },
      { name: 'Vue' },
    ],
  },
  {
    name: 'backend',
    children: [
      { name: 'Node.js' },
      { name: 'Python' },
    ],
  },
  {
    name: 'database',
    children: [
      { name: 'MySQL' },
    ],
  },
]

// Flatten tree into lines for rendering, each with indent level and tree-drawing prefix
interface TreeLine {
  text: string
  isDir: boolean
}

function buildLines(nodes: TreeNode[], prefix: string = ''): { lines: TreeLine[]; count: number } {
  const lines: TreeLine[] = []
  let count = 0

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const isLast = i === nodes.length - 1
    const connector = isLast ? '└── ' : '├── '
    const childPrefix = prefix + (isLast ? '    ' : '│   ')

    if (node.children) {
      lines.push({ text: prefix + connector + node.name + '/', isDir: true })
      const result = buildLines(node.children, childPrefix)
      lines.push(...result.lines)
      count += result.count
    } else {
      lines.push({ text: prefix + connector + node.name, isDir: false })
      count++
    }
  }

  return { lines, count }
}

const { lines: treeLines, count: fileCount } = buildLines(tree)
</script>

<template>
  <div class="about-page" :class="{ visible }">
    <div class="about-content">

      <!-- Hero -->
      <div class="hero">
        <div class="avatar-wrap">
          <img :src="about.avatar" :alt="about.name" class="avatar" />
        </div>
        <h2 class="name">{{ about.name }}<span class="cursor">_</span></h2>
        <p class="tagline">{{ tagline }}</p>
      </div>

      <!-- Bio -->
      <div class="card bio">
        <div class="card-head">关于我</div>
        <div class="bio-text">
          <p v-for="(line, i) in about.bio.split('\n').filter(Boolean)" :key="i">{{ line }}</p>
        </div>
      </div>

      <!-- Skills tree -->
      <div class="card tree-card">
        <div class="card-head">
          <span class="head-label">技术栈</span>
          <span class="head-hint">$ tree skills/</span>
        </div>
        <div class="tree-body">
          <p class="tree-line prompt-line"><span class="dim">skills/</span></p>
          <p
            v-for="(line, i) in treeLines"
            :key="i"
            class="tree-line"
            :class="{ visible: treeReady }"
            :style="{ transitionDelay: `${i * 0.06}s` }"
          >
            <span v-if="line.isDir" class="tree-dir">{{ line.text }}</span>
            <span v-else class="tree-file">{{ line.text }}</span>
          </p>
          <p class="tree-line summary" :class="{ visible: treeReady }" :style="{ transitionDelay: `${treeLines.length * 0.06}s` }">
            <span class="dim">{{ tree.length }} directories, {{ fileCount }} files</span>
          </p>
        </div>
      </div>

      <hr class="divider" />

      <div id="tcomment-about" class="comments" />

    </div>
  </div>
</template>

<style scoped>
/* ── Page entrance ── */
.about-page {
  height: 100%;
  padding: 2.5rem 2rem 2rem;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}
.about-page.visible {
  opacity: 1;
  transform: translateY(0);
}

.about-content {
  max-width: 560px;
  margin: 0 auto;
  padding-bottom: 2rem;
}

/* ── Hero ── */
.hero {
  text-align: center;
  margin-bottom: 2rem;
}

.avatar-wrap {
  display: inline-block;
  margin-bottom: 1rem;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 2px solid var(--dark-gray);
  object-fit: cover;
  transition: border-color 0.4s;
}

.avatar-wrap:hover .avatar {
  border-color: var(--green);
}

.name {
  color: var(--fg);
  font-size: 1.35em;
  font-weight: 600;
  margin-bottom: 0.2em;
}

.cursor {
  color: var(--green);
  font-weight: 400;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0; }
}

.tagline {
  color: var(--gray);
  font-size: 0.85em;
  letter-spacing: 0.03em;
}

/* ── Card ── */
.card {
  border: 1px solid var(--dark-gray);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.12);
  margin-bottom: 1rem;
  overflow: hidden;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.65em 1em;
  border-bottom: 1px solid var(--dark-gray);
}

.head-label {
  font-size: 0.85em;
  font-weight: 600;
  color: var(--green);
}

.head-hint {
  font-size: 0.7em;
  color: var(--dark-gray);
  font-family: var(--font);
}

/* ── Bio ── */
.bio {
  border-left: 2px solid var(--green);
}

.bio-text {
  padding: 0.8em 1em;
  line-height: 1.75;
  font-size: 0.9em;
  color: var(--fg);
}

.bio-text p {
  margin-bottom: 0.3em;
}

.bio-text p:last-child {
  margin-bottom: 0;
}

/* ── Tree ── */
.tree-body {
  padding: 0.8em 1em;
  font-family: var(--font);
  font-size: 0.84em;
  line-height: 1.75;
}

.tree-line {
  margin: 0;
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity 0.25s ease-out, transform 0.25s ease-out;
}

.tree-line.visible {
  opacity: 1;
  transform: translateX(0);
}

.prompt-line {
  opacity: 1;
  transform: none;
}

.tree-dir {
  color: var(--blue);
}

.tree-file {
  color: var(--fg);
}

.summary {
  margin-top: 0.4em;
}

.dim {
  color: var(--dark-gray);
}

/* ── Divider ── */
.divider {
  border: none;
  border-top: 1px solid var(--dark-gray);
  margin: 1.2em 0;
}

/* ── Comments ── */
.comments {
  width: 100%;
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .about-page {
    padding: 1rem;
  }

  .head-hint {
    display: none;
  }

  .tree-body {
    font-size: 0.78em;
  }
}
</style>
