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
      输入 <span class="cmd">posts</span> 浏览文章 &nbsp;|&nbsp;
      输入 <span class="cmd">friend</span> 查看友链 &nbsp;|&nbsp;
      输入 <span class="cmd">about</span> 了解博主 &nbsp;|&nbsp;
      输入 <span class="cmd">help</span> 查看所有命令
    </p>
  </div>
</template>

<style scoped>
.welcome {
  margin-bottom: 1rem;
}

.ascii-art {
  color: var(--green);
  font-size: 0.6em;
  line-height: 1.2;
  margin-bottom: 1rem;
  white-space: pre;
  overflow: hidden;
}

.greeting {
  margin-bottom: 0.5rem;
  color: var(--fg);
}

.highlight {
  color: var(--yellow);
  font-weight: bold;
}

.commands-hint {
  color: var(--gray);
  font-size: 0.92em;
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
