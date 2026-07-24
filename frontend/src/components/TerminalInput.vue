<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import type { TerminalMode } from '../types'
import TerminalPrompt from './TerminalPrompt.vue'

const props = defineProps<{
  command: string
  mode: TerminalMode
  cwd?: string
  tabHints?: string[]
}>()

const emit = defineEmits<{
  'update:command': [value: string]
  execute: []
  selectPost: []
  goBackFromPost: []
  navigatePostList: [direction: 'up' | 'down']
  clear: []
  tabComplete: []
  recallHistory: [direction: 'up' | 'down']
}>()

const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  inputRef.value?.focus()
})

function focusInput() {
  inputRef.value?.focus()
}

defineExpose({ focusInput })

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'l' && e.ctrlKey) {
    e.preventDefault()
    emit('clear')
    return
  }

  if (e.key === 'c' && e.ctrlKey) {
    e.preventDefault()
    emit('update:command', '')
    return
  }

  if (e.key === 'Tab') {
    e.preventDefault()
    emit('tabComplete')
    return
  }

  if (e.key === 'Enter') {
    e.preventDefault()
    if (props.mode === 'posts-list' && props.command === '') {
      emit('selectPost')
    } else {
      emit('execute')
    }
    nextTick(() => inputRef.value?.focus())
    return
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (props.mode === 'posts-list' && props.command === '') {
      emit('navigatePostList', 'up')
    } else {
      emit('recallHistory', 'up')
    }
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (props.mode === 'posts-list' && props.command === '') {
      emit('navigatePostList', 'down')
    } else {
      emit('recallHistory', 'down')
    }
    return
  }
}
</script>

<template>
  <div class="input-wrapper">
    <div class="input-line" @click="focusInput">
      <TerminalPrompt :cwd="props.cwd" />
      <input
        ref="inputRef"
        :value="props.command"
        type="text"
        class="terminal-input"
        autocomplete="off"
        spellcheck="false"
        autofocus
        @input="emit('update:command', ($event.target as HTMLInputElement).value)"
        @keydown="handleKeydown"
      />
    </div>
    <div v-if="props.tabHints && props.tabHints.length > 1" class="tab-hints">
      <span v-for="hint in props.tabHints" :key="hint" class="hint">{{ hint }}</span>
    </div>
  </div>
</template>

<style scoped>
.input-wrapper {
  margin-top: 0.25rem;
}

.input-line {
  display: flex;
  align-items: baseline;
  cursor: text;
}

.terminal-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--fg);
  font-family: var(--font);
  font-size: inherit;
  font-weight: 500;
  line-height: inherit;
  padding: 0;
  margin: 0;
  min-width: 0;
  caret-color: rgba(229, 233, 240, 0.45);
  caret-shape: block;
}

.tab-hints {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em 1em;
  margin-top: 0.3em;
  padding-left: 0.2em;
}

.hint {
  color: var(--dark-gray);
  font-size: 0.9em;
}
</style>
