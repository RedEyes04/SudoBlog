<script setup lang="ts">
import { onMounted, watch, ref, nextTick } from 'vue'
import { useTerminal } from '../composables/useTerminal'
import { posts as postsData } from '../data/posts'
import TerminalHistory from './TerminalHistory.vue'
import TerminalInput from './TerminalInput.vue'

const {
  history,
  command,
  terminalMode,
  postListSelectedIndex,
  tabHints,
  executeCommand,
  selectPost,
  recallHistory,
  handleTabComplete,
  clearHistory,
  showBanner,
} = useTerminal()

const containerRef = ref<HTMLElement | null>(null)
const inputRef = ref<InstanceType<typeof TerminalInput> | null>(null)

onMounted(() => {
  showBanner()
  // Auto-run help after banner so user sees available commands
  executeCommand('help')
})

// Smart scroll: when entering a post, scroll to top of that post.
// For normal commands, scroll to bottom (input line).
watch(history, () => {
  nextTick(() => {
    const container = containerRef.value
    if (!container) return

    const last = history.value[history.value.length - 1]
    if (last?.type === 'component' && last.component?.name === 'PostDetail') {
      // Scroll to the post detail component
      const postEl = container.querySelector('.post-detail')
      if (postEl) {
        postEl.scrollIntoView({ block: 'start', behavior: 'smooth' })
        return
      }
    }
    // Default: scroll to bottom
    container.scrollTop = container.scrollHeight
  })
}, { deep: true })

function focusTerminal() {
  inputRef.value?.focusInput()
}

function onKeyNav(direction: 'up' | 'down') {
  if (direction === 'up') {
    if (postListSelectedIndex.value > 0) {
      postListSelectedIndex.value--
    }
  } else {
    if (postListSelectedIndex.value < postsData.length - 1) {
      postListSelectedIndex.value++
    }
  }
}

function onUpdateCommand(val: string) {
  command.value = val
}

function onExecute() {
  executeCommand(command.value)
}

function onSelectPost() {
  selectPost(postListSelectedIndex.value)
}

function onClear() {
  clearHistory()
}

function onTabComplete() {
  handleTabComplete()
}

function onRecallHistory(direction: 'up' | 'down') {
  recallHistory(direction)
}
</script>

<template>
  <div class="terminal-shell" @click="focusTerminal">
    <div ref="containerRef" class="terminal-body">
      <TerminalHistory :history="history" />
      <TerminalInput
        ref="inputRef"
        :command="command"
        :mode="terminalMode"
        :tab-hints="tabHints"
        @update:command="onUpdateCommand"
        @execute="onExecute"
        @select-post="onSelectPost"
        @navigate-post-list="onKeyNav"
        @clear="onClear"
        @tab-complete="onTabComplete"
        @recall-history="onRecallHistory"
      />
    </div>
  </div>
</template>

<style scoped>
.terminal-shell {
  height: 100vh;
  width: 100vw;
  background: var(--bg);
  cursor: text;
}

.terminal-body {
  height: 100%;
  overflow-y: auto;
  padding: 2rem;
}

@media (max-width: 768px) {
  .terminal-body {
    padding: 1rem;
  }
}
</style>
