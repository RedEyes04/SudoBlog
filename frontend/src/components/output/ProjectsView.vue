<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import type { Project } from '../../types'
import { githubUsername } from '../../data/projects'

const props = defineProps<{
  projects: Project[]
  twikooEnvId?: string
}>()

const visible = ref(false)

// ── Global GitHub heatmap ──
const contributions = ref<number[][]>([])
const totalContributions = ref(0)
const loadingContributions = ref(false)
const contribError = ref('')
const contribUsername = ref('')

onMounted(() => {
  requestAnimationFrame(() => { visible.value = true })
  if (githubUsername.value) {
    fetchContributions(githubUsername.value)
  }
  timer = setTimeout(loadTwikoo, 500)
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})

async function fetchContributions(username: string) {
  loadingContributions.value = true
  contribError.value = ''
  contribUsername.value = username
  try {
    const resp = await fetch(`/api/github/contributions?username=${encodeURIComponent(username)}`)
    if (!resp.ok) throw new Error('Failed')
    const data = await resp.json()
    contributions.value = data.contributions
    totalContributions.value = data.totalContributions || 0
  } catch {
    contribError.value = 'Failed to load'
    contributions.value = Array.from({ length: 7 }, () =>
      Array.from({ length: 53 }, () => Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0)
    )
    totalContributions.value = 0
  } finally {
    loadingContributions.value = false
  }
}

// ── Heatmap helpers ──
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const monthLabels = computed(() => {
  const labels: { col: number; label: string }[] = []
  const now = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() - 52 * 7 + 1)
  const startDay = start.getDay()
  start.setDate(start.getDate() - startDay)

  const current = new Date(start)
  let lastMonth = current.getMonth()
  for (let w = 0; w < 53 && current <= now; w++) {
    const month = current.getMonth()
    if (month !== lastMonth || w === 0) {
      labels.push({ col: w, label: MONTHS[month] })
      lastMonth = month
    }
    current.setDate(current.getDate() + 7)
  }
  return labels
})

function cellClass(level: number): string {
  if (level <= 0) return 'cell-0'
  if (level <= 1) return 'cell-1'
  if (level <= 2) return 'cell-2'
  if (level <= 3) return 'cell-3'
  return 'cell-4'
}

// ── Twikoo ──
declare global {
  interface Window {
    twikoo?: { init: (opts: Record<string, unknown>) => void }
  }
}

let timer: ReturnType<typeof setTimeout> | null = null

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
  if (!props.twikooEnvId) return
  window.twikoo?.init({
    envId: props.twikooEnvId,
    el: '#tcomment-projects',
    path: '/projects',
    lang: 'zh-CN',
  })
}
</script>

<template>
  <div class="projects-page" :class="{ visible }">
    <div class="projects-content">

      <div class="header">Projects</div>

      <div v-if="projects.length === 0" class="empty-state">
        <p>还没有添加项目。</p>
        <p class="muted">在后台管理页面中配置你的项目列表。</p>
      </div>

      <!-- Project rows: text left, image right with blur -->
      <div v-for="project in projects" :key="project.name" class="project-row">
        <a :href="project.link" target="_blank" rel="noopener" class="row-inner">
          <!-- Text content (left) -->
          <div class="row-info">
            <span class="project-name">{{ project.name }}</span>
            <p class="project-desc">{{ project.description }}</p>
            <div class="tech-tags">
              <span v-for="t in project.tech" :key="t" class="tag">{{ t }}</span>
            </div>
          </div>

          <!-- Image (right) with blur gradient on left edge -->
          <div v-if="project.image" class="row-image">
            <img :src="project.image" :alt="project.name" />
          </div>
          <div v-else class="row-image row-image-empty">
            <span class="image-placeholder">{{ project.name[0] }}</span>
          </div>
        </a>
      </div>

      <!-- Global GitHub heatmap -->
      <div class="heatmap-section">
        <div v-if="!githubUsername && !contribUsername" class="heatmap-placeholder">
          <p>GitHub 用户名未配置。</p>
          <p class="muted">在后台设置中配置 GitHub 用户名以显示贡献热力图。</p>
        </div>

        <div v-else-if="loadingContributions" class="heatmap-loading">
          <p>Loading {{ contribUsername || githubUsername }}'s contributions...</p>
        </div>

        <div v-else class="heatmap-wrapper">
          <div v-if="contribError" class="heatmap-error">{{ contribError }}</div>

          <div class="heatmap-scroll">
            <div class="heatmap-grid-wrapper">
              <div class="month-row">
                <span class="day-label-spacer" />
                <div class="month-labels">
                  <span
                    v-for="m in monthLabels"
                    :key="m.col"
                    class="month-label"
                    :style="{ gridColumn: m.col + 1 }"
                  >{{ m.label }}</span>
                </div>
              </div>

              <div class="heatmap-body">
                <div class="day-labels">
                  <span v-for="(_, d) in 7" :key="d" class="day-label">
                    {{ ['', 'Mon', '', 'Wed', '', 'Fri', ''][d] }}
                  </span>
                </div>
                <div class="heatmap-grid">
                  <div v-for="(row, d) in contributions" :key="d" class="heatmap-row">
                    <div
                      v-for="(count, w) in row"
                      :key="w"
                      :class="['cell', cellClass(count)]"
                      :title="`${count} contributions`"
                    />
                  </div>
                </div>
              </div>

              <div class="legend">
                <span class="legend-label">Less</span>
                <span class="cell cell-0 legend-cell" />
                <span class="cell cell-1 legend-cell" />
                <span class="cell cell-2 legend-cell" />
                <span class="cell cell-3 legend-cell" />
                <span class="cell cell-4 legend-cell" />
                <span class="legend-label">More</span>
              </div>

              <p v-if="totalContributions > 0" class="contrib-total">
                {{ totalContributions.toLocaleString() }} contributions in the last year
              </p>
            </div>
          </div>
        </div>
      </div>

      <hr class="divider" />

      <div id="tcomment-projects" class="comment-section" />
    </div>
  </div>
</template>

<style scoped>
/* ── Page entrance ── */
.projects-page {
  height: 100%;
  padding: 2.5rem 2rem 2rem;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}
.projects-page.visible {
  opacity: 1;
  transform: translateY(0);
}

.projects-content {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 2rem;
}

/* ── Header ── */
.header {
  color: var(--green);
  font-weight: bold;
  margin-bottom: 1.8rem;
  font-size: 1.2em;
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--gray);
  border: 1px dashed var(--dark-gray);
  border-radius: 4px;
}

.muted { color: var(--dark-gray); font-size: 0.85em; }

/* ── Project row ── */
.project-row {
  margin-bottom: 0.75rem;
}

.row-inner {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--dark-gray);
  border-radius: 6px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, background 0.2s;
  background: rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.row-inner:hover {
  border-color: var(--green);
  background: rgba(163, 190, 140, 0.04);
}

/* ── Text content (left) ── */
.row-info {
  flex: 1;
  padding: 1em 1.2em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.project-name {
  color: var(--blue);
  font-size: 0.95em;
  font-weight: 600;
  margin-bottom: 0.3em;
}

.project-desc {
  color: var(--gray);
  font-size: 0.82em;
  line-height: 1.55;
  margin: 0 0 0.6em;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35em;
}

.tag {
  display: inline-block;
  padding: 0.1em 0.5em;
  background: rgba(163, 190, 140, 0.12);
  color: var(--green);
  border-radius: 3px;
  font-size: 0.7em;
  font-family: var(--font);
}

/* ── Image (right) with blur gradient ── */
.row-image {
  width: 200px;
  min-width: 200px;
  position: relative;
  overflow: hidden;
}

.row-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Gaussian blur gradient on left edge via mask-image */
  mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 8%, rgba(0,0,0,0.7) 20%, black 40%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 8%, rgba(0,0,0,0.7) 20%, black 40%);
}

.row-image-empty {
  width: 120px;
  min-width: 120px;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  color: var(--green);
  font-size: 2em;
  font-weight: 700;
  font-family: var(--font);
  opacity: 0.5;
}

/* ── Heatmap section ── */
.heatmap-section {
  margin-top: 2rem;
}

.heatmap-placeholder, .heatmap-loading {
  text-align: center;
  padding: 1.5rem 1rem;
  color: var(--gray);
  border: 1px dashed var(--dark-gray);
  border-radius: 4px;
}

.heatmap-placeholder p { margin: 0.3em 0; }

.heatmap-error {
  text-align: center;
  color: var(--red);
  font-size: 0.85em;
  margin-bottom: 0.5em;
}

.heatmap-scroll {
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.heatmap-grid-wrapper {
  display: inline-block;
  min-width: fit-content;
}

.month-row {
  display: flex;
  align-items: flex-end;
  margin-bottom: 2px;
}

.day-label-spacer {
  width: 32px;
  flex-shrink: 0;
}

.month-labels {
  display: grid;
  grid-template-columns: repeat(53, 12px);
  gap: 3px;
  font-size: 0.65em;
  color: var(--dark-gray);
}

.month-label {
  grid-row: 1;
  font-family: var(--font);
}

.heatmap-body {
  display: flex;
  gap: 4px;
}

.day-labels {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 28px;
  flex-shrink: 0;
}

.day-label {
  height: 12px;
  line-height: 12px;
  font-size: 0.6em;
  color: var(--dark-gray);
  font-family: var(--font);
}

.heatmap-grid {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.heatmap-row {
  display: flex;
  gap: 3px;
}

.cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.cell-0 { background: rgba(255, 255, 255, 0.04); }
.cell-1 { background: rgba(163, 190, 140, 0.2); }
.cell-2 { background: rgba(163, 190, 140, 0.4); }
.cell-3 { background: rgba(163, 190, 140, 0.65); }
.cell-4 { background: rgba(163, 190, 140, 0.9); }

.legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
  margin-top: 6px;
  padding-left: 32px;
}

.legend-label {
  font-size: 0.6em;
  color: var(--dark-gray);
  margin: 0 2px;
  font-family: var(--font);
}

.legend-cell {
  cursor: default;
}

.contrib-total {
  text-align: right;
  font-size: 0.7em;
  color: var(--gray);
  margin-top: 4px;
  padding-left: 32px;
}

/* ── Divider ── */
.divider {
  border: none;
  border-top: 1px solid var(--dark-gray);
  margin: 2rem 0 1rem;
}

.comment-section { width: 100%; }

@media (max-width: 640px) {
  .projects-page { padding: 1rem; }
  .row-image { width: 100px; min-width: 100px; }
}
</style>
