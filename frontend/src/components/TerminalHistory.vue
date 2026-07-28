<script setup lang="ts">
import type { Component } from 'vue'
import type { HistoryEntry, OutputComponentName } from '../types'
import TerminalPrompt from './TerminalPrompt.vue'
import WelcomeBanner from './output/WelcomeBanner.vue'
import PostsList from './output/PostsList.vue'
import PostDetail from './output/PostDetail.vue'
import AboutView from './output/AboutView.vue'
import FriendsList from './output/FriendsList.vue'
import HelpOutput from './output/HelpOutput.vue'

const props = defineProps<{
  history: HistoryEntry[]
  cwd?: string
}>()

const componentMap: Record<OutputComponentName, Component> = {
  WelcomeBanner,
  PostsList,
  PostDetail,
  AboutView,
  FriendsList,
  HelpOutput,
}

// These are rendered full-screen by TerminalContainer, not inline
const fullscreenComponents = new Set<OutputComponentName>(['PostDetail', 'AboutView', 'FriendsList'])
</script>

<template>
  <div v-for="entry in props.history" :key="entry.id" class="history-entry">
    <!-- Command line -->
    <div class="command-line">
      <TerminalPrompt :cwd="props.cwd" />
      <span class="command-text">{{ entry.command }}</span>
    </div>

    <!-- Output by type -->
    <div v-if="entry.type === 'html' && entry.html" class="output-html" v-html="entry.html" />
    <!-- Fullscreen components: show nothing inline (rendered by TerminalContainer) -->
    <div v-else-if="entry.type === 'component' && entry.component && fullscreenComponents.has(entry.component.name)" class="output-html">
      <span class="muted">（全屏视图）</span>
    </div>
    <component
      v-else-if="entry.type === 'component' && entry.component"
      :is="componentMap[entry.component.name]"
      v-bind="entry.component.props"
    />
  </div>
</template>

<style scoped>
.history-entry {
  margin-bottom: 0;
  animation: entryFadeIn 0.35s ease-out both;
}

@keyframes entryFadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.command-line {
  display: flex;
  align-items: baseline;
  line-height: 1.6;
}

.command-text {
  color: var(--fg);
}

.output-html {
  white-space: pre-wrap;
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.muted {
  color: var(--dark-gray);
  font-style: italic;
}
</style>
