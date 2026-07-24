<script setup lang="ts">
import { ref } from 'vue'
import type { SiteConfig } from '../../types'

defineProps<{
  banner: string
  config: SiteConfig
}>()

// greeting typing → 0.6s from 0.1s, hints at 0.8s
const typingDone = ref(false)
setTimeout(() => { typingDone.value = true }, 800)
</script>

<template>
  <div class="welcome">
    <pre class="ascii-art">{{ banner }}</pre>
    <p class="greeting">
      <span class="greeting-text">欢迎来到 <span class="highlight">{{ config.title }}</span> — 终端风格博客</span>
      <span class="greeting-cursor" :class="{ hide: typingDone }">█</span>
    </p>
    <p class="commands-hint" :class="{ visible: typingDone }">
      输入 <span class="cmd">cd posts</span> 浏览文章 &nbsp;|&nbsp;
      输入 <span class="cmd">vim friends.md</span> 查看友链 &nbsp;|&nbsp;
      输入 <span class="cmd">vim about.md</span> 了解博主 &nbsp;|&nbsp;
      输入 <span class="cmd">help</span> 查看所有命令
    </p>
  </div>
</template>

<style scoped>
.welcome {
  margin-bottom: 1rem;
}

/* ── ASCII: just fade in ── */
.ascii-art {
  color: var(--green);
  font-size: 0.6em;
  line-height: 1.2;
  margin-bottom: 1rem;
  white-space: pre;
  overflow: hidden;
}

/* ── Greeting: typewriter ── */
.greeting {
  margin-bottom: 0.5rem;
  color: var(--fg);
  display: flex;
  align-items: baseline;
}

.greeting-text {
  overflow: hidden;
  white-space: nowrap;
  animation: typeReveal 0.6s 0.1s steps(18, end) forwards;
  max-width: 0;
}

@keyframes typeReveal {
  from { max-width: 0; }
  to   { max-width: 100%; }
}

.greeting-cursor {
  color: var(--green);
  animation: cursorBlink 1s step-end infinite;
  margin-left: 1px;
}

.greeting-cursor.hide {
  animation: none;
  opacity: 0;
  transition: opacity 0.3s;
}

@keyframes cursorBlink {
  50% { opacity: 0; }
}

/* ── Command hints: fade in after typing ── */
.commands-hint {
  color: var(--gray);
  font-size: 0.92em;
  overflow: hidden;
  white-space: nowrap;
  clip-path: inset(0 100% 0 0);
  transition: clip-path 0.35s steps(12, end) 0.05s;
}

.commands-hint.visible {
  clip-path: inset(0 0 0 0);
}

.cmd {
  color: var(--green);
  font-weight: bold;
}

@media (max-width: 768px) {
  .ascii-art {
    font-size: 0.4em;
  }
}
</style>
