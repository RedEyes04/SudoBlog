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
}>()

const componentMap: Record<OutputComponentName, Component> = {
  WelcomeBanner,
  PostsList,
  PostDetail,
  AboutView,
  FriendsList,
  HelpOutput,
}
</script>

<template>
  <div v-for="entry in props.history" :key="entry.id" class="history-entry">
    <!-- Command line -->
    <div class="command-line">
      <TerminalPrompt />
      <span class="command-text">{{ entry.command }}</span>
    </div>

    <!-- Output by type -->
    <div v-if="entry.type === 'html' && entry.html" class="output-html" v-html="entry.html" />
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
</style>
