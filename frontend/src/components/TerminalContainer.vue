<script setup lang="ts">
import { onMounted, watch, ref, nextTick, type Component } from 'vue'
import { useTerminal } from '../composables/useTerminal'
import { posts } from '../data/posts'
import { friends } from '../data/friends'
import { aboutData, siteConfig } from '../data/config'
import { projects } from '../data/projects'
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
import ProjectsView from './output/ProjectsView.vue'

const {
  history,
  command,
  terminalMode,
  cwd,
  postListSelectedIndex,
  currentPost,
  tabHints,
  fullscreenOutputs,
  loading,
  loadData,
  executeCommand,
  selectPost,
  recallHistory,
  handleTabComplete,
  clearHistory,
  showBanner,
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
  ProjectsView,
}

onMounted(async () => {
  await loadData()
  if (!(await restoreFromHash())) {
    showBanner()
    executeCommand('help')
  }
})

// Scroll to bottom on new history entries (terminal mode only)
const fullscreenModes = ['post-detail', 'about', 'friends', 'projects']
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

function focusTerminal(e: MouseEvent) {
  const target = e.target as HTMLElement
  // Don't steal focus from Twikoo or other inputs
  if (target.closest('#tcomment, input, textarea, button, a, [contenteditable]')) return
  // Don't steal focus if user just made a text selection
  if (window.getSelection()?.toString().trim()) return
  inputRef.value?.focusInput()
}

function onKeyNav(direction: 'up' | 'down') {
  if (direction === 'up') {
    if (postListSelectedIndex.value > 0) {
      postListSelectedIndex.value--
    }
  } else {
    if (postListSelectedIndex.value < posts.value.length - 1) {
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
  <div class="terminal-shell" @click="focusTerminal($event)">
    <div v-if="loading" class="loading">Loading...</div>
    <!-- Full-screen post detail view -->
    <div v-if="terminalMode === 'post-detail' && currentPost" class="fullscreen">
      <div class="fullscreen-content">
        <PostDetail :post="currentPost" :twikoo-env-id="siteConfig.twikooEnvId" />
      </div>
      <div class="fullscreen-outputs" v-if="fullscreenOutputs.length">
        <div v-for="entry in fullscreenOutputs" :key="entry.id" class="inline-entry">
          <div class="inline-cmd-line">
            <TerminalPrompt :cwd="cwd" />
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
          :cwd="cwd"
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
          <span class="hint-key">:wq</span> 返回列表 ·
          <span class="hint-key">vim &lt;id&gt;</span> 文章 ·
          <span class="hint-key">vim about.md</span> 关于 ·
          <span class="hint-key">vim friends.md</span> 友链
        </div>
      </div>
    </div>

    <!-- Full-screen about view -->
    <div v-else-if="terminalMode === 'about'" class="fullscreen">
      <div class="fullscreen-content">
        <AboutView :about="aboutData" :twikoo-env-id="siteConfig.twikooEnvId" />
      </div>
      <div class="fullscreen-outputs" v-if="fullscreenOutputs.length">
        <div v-for="entry in fullscreenOutputs" :key="entry.id" class="inline-entry">
          <div class="inline-cmd-line">
            <TerminalPrompt :cwd="cwd" />
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
          :cwd="cwd"
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
          <span class="hint-key">:wq</span> 返回终端 ·
          <span class="hint-key">vim &lt;id&gt;</span> 文章 ·
          <span class="hint-key">vim friends.md</span> 友链
        </div>
      </div>
    </div>

    <!-- Full-screen friends view -->
    <div v-else-if="terminalMode === 'friends'" class="fullscreen">
      <div class="fullscreen-content">
        <FriendsList :friends="friends" :twikoo-env-id="siteConfig.twikooEnvId" />
      </div>
      <div class="fullscreen-outputs" v-if="fullscreenOutputs.length">
        <div v-for="entry in fullscreenOutputs" :key="entry.id" class="inline-entry">
          <div class="inline-cmd-line">
            <TerminalPrompt :cwd="cwd" />
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
          :cwd="cwd"
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
          <span class="hint-key">:wq</span> 返回终端 ·
          <span class="hint-key">vim &lt;id&gt;</span> 文章 ·
          <span class="hint-key">vim about.md</span> 关于
        </div>
      </div>
    </div>

    <!-- Full-screen projects view -->
    <div v-else-if="terminalMode === 'projects'" class="fullscreen">
      <div class="fullscreen-content">
        <ProjectsView :projects="projects" :twikoo-env-id="siteConfig.twikooEnvId" />
      </div>
      <div class="fullscreen-outputs" v-if="fullscreenOutputs.length">
        <div v-for="entry in fullscreenOutputs" :key="entry.id" class="inline-entry">
          <div class="inline-cmd-line">
            <TerminalPrompt :cwd="cwd" />
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
          :cwd="cwd"
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
          <span class="hint-key">:wq</span> 返回终端 ·
          <span class="hint-key">vim &lt;id&gt;</span> 文章 ·
          <span class="hint-key">vim about.md</span> 关于 ·
          <span class="hint-key">vim friends.md</span> 友链
        </div>
      </div>
    </div>

    <!-- Normal terminal view -->
    <div v-else ref="containerRef" class="terminal-body">
      <TerminalHistory :history="history" :cwd="cwd" />
      <TerminalInput
        ref="inputRef"
        :cwd="cwd"
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

    <!-- Beian -->
    <a v-if="siteConfig.beian" class="beian" href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank" rel="noopener">{{ siteConfig.beian }}</a>
  </div>
</template>

<style scoped>
.terminal-shell {
  height: 100vh;
  width: 100vw;
  background: var(--bg);
  cursor: text;
  position: relative;
  animation: bootFadeIn 0.4s ease-out;
}

/* ── Inset yellow frame with blur effect ── */
.terminal-shell::before {
  content: '';
  position: fixed;
  inset: 5px;
  pointer-events: none;
  z-index: 999;
  border: 2.5px solid rgba(235, 203, 139, 0.6);
  filter: blur(0.3px);
  animation: frameGlow 3s ease-in-out infinite;
}

@keyframes bootFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: var(--green);
  font-family: var(--font);
  font-size: 1.2em;
  clip-path: inset(5px);
}

@keyframes frameGlow {
  0%, 100% {
    border-color: rgba(235, 203, 139, 0.5);
    box-shadow: inset 0 0 30px rgba(235, 203, 139, 0.1), 0 0 20px rgba(235, 203, 139, 0.1);
  }
  50% {
    border-color: rgba(235, 203, 139, 0.8);
    box-shadow: inset 0 0 50px rgba(235, 203, 139, 0.18), 0 0 35px rgba(235, 203, 139, 0.18);
  }
}

.terminal-body {
  height: 100%;
  overflow-y: auto;
  padding: 2rem;
  clip-path: inset(5px);
}

.fullscreen {
  height: 100%;
  display: flex;
  flex-direction: column;
  clip-path: inset(5px);
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

.beian {
  position: fixed;
  bottom: 8px;
  right: 16px;
  color: rgba(229, 233, 240, 0.18);
  font-size: 0.7em;
  font-family: var(--font);
  text-decoration: none;
  z-index: 0;
  transition: color 0.3s;
}

.beian:hover {
  color: rgba(235, 203, 139, 0.5);
}

@media (max-width: 768px) {
  .terminal-body {
    padding: 1rem;
  }
}
</style>
