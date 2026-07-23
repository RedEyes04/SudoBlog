<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import type { Post } from '../../types'

const props = defineProps<{
  post: Post
}>()

const html = computed(() => {
  return marked.parse(props.post.content, {
    breaks: true,
    gfm: true,
  }) as string
})
</script>

<template>
  <div class="post-detail">
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

    <!-- Context prompt hint -->
    <div class="context-hint">
      <span class="hint-cmd">cd ..</span> 返回文章列表 &nbsp;|&nbsp;
      <span class="hint-cmd">help</span> 查看所有命令
    </div>
  </div>
</template>

<style scoped>
.post-detail {
  margin-bottom: 1rem;
}

.post-header {
  margin-bottom: 1rem;
}

.post-title {
  color: var(--green);
  font-size: 1.5em;
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

.context-hint {
  color: var(--dark-gray);
  font-size: 0.85em;
}

.hint-cmd {
  color: var(--gray);
}
</style>
