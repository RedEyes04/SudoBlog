<script setup lang="ts">
import type { SiteConfig } from '../../types'

defineProps<{
  banner: string
  config: SiteConfig
}>()
</script>

<template>
  <div class="welcome">
    <pre class="ascii-art">{{ banner }}</pre>
    <p class="greeting">
      欢迎来到 <span class="highlight">{{ config.title }}</span> — 终端风格博客
    </p>
    <p class="commands-hint">
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
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── ASCII art ── */
.ascii-art {
  color: var(--green);
  font-size: 0.6em;
  line-height: 1.2;
  margin-bottom: 1rem;
  white-space: pre;
  overflow: hidden;
  font-family: 'Hack NF', monospace;
  font-smooth: never;
  -webkit-font-smoothing: none;
  animation: fadeIn 0.5s 0.05s ease-out both;
}

/* ── Greeting ── */
.greeting {
  margin-bottom: 0.5rem;
  color: var(--fg);
  animation: fadeIn 0.4s 0.15s ease-out both;
}

/* ── Command hints ── */
.commands-hint {
  color: var(--gray);
  font-size: 0.92em;
  animation: fadeIn 0.4s 0.25s ease-out both;
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
