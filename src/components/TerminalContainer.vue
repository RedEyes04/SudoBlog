<script setup lang="ts">
import { onMounted, watch, ref, nextTick, type Component } from 'vue'
import { useTerminal } from '../composables/useTerminal'
import { posts as postsData } from '../data/posts'
import { friends as friendsData } from '../data/friends'
import { aboutData } from '../data/config'
import type { OutputComponentName } from '../types'
import TerminalHistory from './TerminalHistory.vue'
import TerminalInput from './TerminalInput.vue'
import TerminalPrompt from './TerminalPrompt.vue'
import PostDetail from './output/PostDetail.vue'
import AboutView from './output/AboutView.vue'
import FriendsList from './output/FriendsList.vue'
import HelpOutput from './output/HelpOutput.vue'
import WelcomeBanner from './output/WelcomeBanner.vue'
import PostsList from './output/PostsList.vue'

const {
  history,
  command,
  terminalMode,
  postListSelectedIndex,
  currentPost,
  tabHints,
  fullscreenOutputs,
  executeCommand,
  selectPost,
  recallHistory,
  handleTabComplete,
  clearHistory,
  showBanner,
  goBackFromPost,
  goHome,
  restoreFromHash,
} = useTerminal()

const containerRef = ref<HTMLElement | null>(null)
const inputRef = ref<InstanceType<typeof TerminalInput> | null>(null)

// Component map for rendering inline outputs in full-screen views
const componentMap: Record<OutputComponentName, Component> = {
  WelcomeBanner,
  PostsList,
  PostDetail,
  AboutView,
  FriendsList,
  HelpOutput,
}

onMounted(() => {
  if (!restoreFromHash()) {
    showBanner()
    executeCommand('help')
  }
})

// Scroll to bottom on new history entries (terminal mode only)
const fullscreenModes = ['post-detail', 'about', 'friends']
watch(history, () => {
  if (!fullscreenModes.includes(terminalMode.value)) {
    nextTick(() => {
      const container = containerRef.value
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    })
  }
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
    <!-- Full-screen post detail view -->
    <div v-if="terminalMode === 'post-detail' && currentPost" class="fullscreen">
      <div class="fullscreen-content">
        <PostDetail :post="currentPost" />
      </div>
      <div class="fullscreen-outputs" v-if="fullscreenOutputs.length">
        <div v-for="entry in fullscreenOutputs" :key="entry.id" class="inline-entry">
          <div class="inline-cmd-line">
            <TerminalPrompt />
            <span class="inline-cmd-text">{{ entry.command }}</span>
          </div>
          <div v-if="entry.type === 'html' && entry.html" class="inline-html" v-html="entry.html" />
          <component
            v-else-if="entry.type === 'component' && entry.component"
            :is="componentMap[entry.component.name]"
            v-bind="entry.component.props"
          />
        </div>
      </div>
      <div class="fullscreen-cmd">
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
        <div class="cmd-hint">
          <span class="hint-key">cd ..</span> 返回列表 ·
          <span class="hint-key">help</span> 帮助 ·
          <span class="hint-key">posts</span> 文章 ·
          <span class="hint-key">about</span> 关于 ·
          <span class="hint-key">friend</span> 友链
        </div>
      </div>
    </div>

    <!-- Full-screen about view -->
    <div v-else-if="terminalMode === 'about'" class="fullscreen">
      <div class="fullscreen-content">
        <AboutView :about="aboutData" />
      </div>
      <div class="fullscreen-outputs" v-if="fullscreenOutputs.length">
        <div v-for="entry in fullscreenOutputs" :key="entry.id" class="inline-entry">
          <div class="inline-cmd-line">
            <TerminalPrompt />
            <span class="inline-cmd-text">{{ entry.command }}</span>
          </div>
          <div v-if="entry.type === 'html' && entry.html" class="inline-html" v-html="entry.html" />
          <component
            v-else-if="entry.type === 'component' && entry.component"
            :is="componentMap[entry.component.name]"
            v-bind="entry.component.props"
          />
        </div>
      </div>
      <div class="fullscreen-cmd">
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
        <div class="cmd-hint">
          <span class="hint-key">cd ..</span> 返回终端 ·
          <span class="hint-key">help</span> 帮助 ·
          <span class="hint-key">posts</span> 文章 ·
          <span class="hint-key">friend</span> 友链
        </div>
      </div>
    </div>

    <!-- Full-screen friends view -->
    <div v-else-if="terminalMode === 'friends'" class="fullscreen">
      <div class="fullscreen-content">
        <FriendsList :friends="friendsData" />
      </div>
      <div class="fullscreen-outputs" v-if="fullscreenOutputs.length">
        <div v-for="entry in fullscreenOutputs" :key="entry.id" class="inline-entry">
          <div class="inline-cmd-line">
            <TerminalPrompt />
            <span class="inline-cmd-text">{{ entry.command }}</span>
          </div>
          <div v-if="entry.type === 'html' && entry.html" class="inline-html" v-html="entry.html" />
          <component
            v-else-if="entry.type === 'component' && entry.component"
            :is="componentMap[entry.component.name]"
            v-bind="entry.component.props"
          />
        </div>
      </div>
      <div class="fullscreen-cmd">
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
        <div class="cmd-hint">
          <span class="hint-key">cd ..</span> 返回终端 ·
          <span class="hint-key">help</span> 帮助 ·
          <span class="hint-key">posts</span> 文章 ·
          <span class="hint-key">about</span> 关于
        </div>
      </div>
    </div>

    <!-- Normal terminal view -->
    <div v-else ref="containerRef" class="terminal-body">
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

.fullscreen {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.fullscreen-content {
  flex: 1;
  overflow-y: auto;
}

.fullscreen-outputs {
  max-height: 30vh;
  overflow-y: auto;
  border-top: 1px solid var(--dark-gray);
  padding: 0.5rem 2rem;
}

.inline-entry {
  margin-bottom: 0.25rem;
}

.inline-cmd-line {
  display: flex;
  align-items: baseline;
  line-height: 1.6;
}

.inline-cmd-text {
  color: var(--fg);
}

.inline-html {
  white-space: pre-wrap;
  line-height: 1.6;
}

.fullscreen-cmd {
  border-top: 1px solid var(--dark-gray);
  padding: 0.75rem 2rem;
}

.cmd-hint {
  margin-top: 0.35rem;
  color: var(--dark-gray);
  font-size: 0.8em;
}

.hint-key {
  color: var(--gray);
}

@media (max-width: 768px) {
  .terminal-body {
    padding: 1rem;
  }
}
</style>
