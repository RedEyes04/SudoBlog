<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { SiteConfig } from '../../types'

defineProps<{
  banner: string
  config: SiteConfig
}>()

const greetingDone = ref(false)

onMounted(() => {
  // After typing animation completes (~1.5s), reveal the command hints
  setTimeout(() => { greetingDone.value = true }, 1500)
})
</script>

<template>
  <div class="welcome">
    <pre class="ascii-art">{{ banner }}</pre>
    <p class="greeting">
      <span class="greeting-text">欢迎来到 <span class="highlight">{{ config.title }}</span> — 终端风格博客</span>
      <span class="greeting-cursor" :class="{ hide: greetingDone }">█</span>
    </p>
    <p class="commands-hint" :class="{ visible: greetingDone }">
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

/* ── ASCII art: scan-line reveal + glow ── */
.ascii-art {
  color: var(--green);
  font-size: 0.6em;
  line-height: 1.2;
  margin-bottom: 1rem;
  white-space: pre;
  overflow: hidden;
  animation: scanReveal 0.8s ease-out forwards, glowPulse 2s 0.8s ease-in-out;
  text-shadow: 0 0 8px rgba(163, 190, 140, 0.4);
}

@keyframes scanReveal {
  from {
    clip-path: inset(0 0 100% 0);
    opacity: 0;
  }
  to {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }
}

@keyframes glowPulse {
  0%, 100% {
    text-shadow: 0 0 8px rgba(163, 190, 140, 0.4);
  }
  50% {
    text-shadow: 0 0 18px rgba(163, 190, 140, 0.7);
  }
}

/* ── Greeting: typewriter reveal ── */
.greeting {
  margin-bottom: 0.5rem;
  color: var(--fg);
  display: flex;
  align-items: baseline;
}

.greeting-text {
  overflow: hidden;
  white-space: nowrap;
  animation: typeReveal 1.2s 0.3s steps(30, end) forwards;
  max-width: 0;
}

@keyframes typeReveal {
  from { max-width: 0; }
  to { max-width: 100%; }
}

/* ── Blinking cursor ── */
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

/* ── Command hints: delayed fade-in ── */
.commands-hint {
  color: var(--gray);
  font-size: 0.92em;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.commands-hint.visible {
  opacity: 1;
  transform: translateY(0);
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
