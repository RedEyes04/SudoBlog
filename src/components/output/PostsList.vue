<script setup lang="ts">
import type { Post } from '../../types'

defineProps<{
  posts: Post[]
  selectedIndex: number
  onSelect: (index: number) => void
}>()
</script>

<template>
  <div class="posts-list">
    <div class="header">
      文章列表 <span class="count">（共 {{ posts.length }} 篇）</span>
    </div>
    <div class="list">
      <div
        v-for="(post, index) in posts"
        :key="post.id"
        class="post-item"
        :class="{ selected: index === selectedIndex }"
        @click="onSelect(index)"
      >
        <span class="index">{{ String(index + 1).padStart(2, '0') }}.</span>
        <div class="post-info">
          <span class="title">{{ post.title }}</span>
          <span class="meta">{{ post.date }} &mdash; {{ post.subtitle }}</span>
        </div>
        <span class="arrow" v-if="index === selectedIndex">&#x25B6;</span>
      </div>
    </div>
    <div class="footer-hint">
      <span class="hint-key">&#x2191;&#x2193;</span> 选择 &nbsp;
      <span class="hint-key">Enter</span> 或 <span class="hint-key">点击</span> 打开 &nbsp;
      <span class="hint-key">vim {{ selectedIndex + 1 }}</span> 快速打开 #{{ selectedIndex + 1 }} &nbsp;
      <span class="hint-key">cd ..</span> 返回上级
    </div>
  </div>
</template>

<style scoped>
.posts-list {
  margin-bottom: 0.75rem;
}

.header {
  color: var(--green);
  font-weight: bold;
  margin-bottom: 0.75rem;
  font-size: 1.05em;
}

.header-icon {
  margin-right: 0.4em;
}

.count {
  color: var(--gray);
  font-weight: normal;
  font-size: 0.9em;
}

.list {
  margin-bottom: 0.5rem;
}

.post-item {
  display: flex;
  align-items: center;
  padding: 0.4em 0.5em;
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.15s;
  gap: 0.5em;
}

.post-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.post-item.selected {
  background: rgba(163, 190, 140, 0.12);
  border-left: 3px solid var(--green);
  padding-left: calc(0.5em - 3px);
}

.index {
  color: var(--gray);
  min-width: 2em;
  text-align: right;
  flex-shrink: 0;
}

.post-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.title {
  color: var(--fg);
  font-weight: 500;
}

.meta {
  color: var(--gray);
  font-size: 0.85em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.arrow {
  color: var(--green);
  flex-shrink: 0;
}

.footer-hint {
  color: var(--dark-gray);
  font-size: 0.85em;
  margin-top: 0.5rem;
}

.hint-key {
  color: var(--gray);
}
</style>
