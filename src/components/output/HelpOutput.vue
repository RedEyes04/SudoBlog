<script setup lang="ts">
import { computed } from 'vue'

const allCommands = [
  { cmd: 'posts', desc: '浏览博客文章' },
  { cmd: 'about', desc: '关于博主' },
  { cmd: 'friend', desc: '查看友链' },
  { cmd: 'clear', desc: '清屏（或 Ctrl+L）' },
  { cmd: 'banner', desc: '显示欢迎横幅' },
  { cmd: 'whoami', desc: '显示当前用户' },
  { cmd: 'date', desc: '显示当前日期时间' },
  { cmd: 'echo', desc: '输出文本到终端' },
  { cmd: 'ls', desc: '列出可用栏目' },
  { cmd: 'help', desc: '显示此帮助信息' },
  { cmd: 'cd ..', desc: '从文章中返回列表' },
]

// Split into two columns
const half = Math.ceil(allCommands.length / 2)
const leftCol = computed(() => allCommands.slice(0, half))
const rightCol = computed(() => allCommands.slice(half))
</script>

<template>
  <div class="help-output">
    <div class="help-header">可用命令</div>
    <div class="help-columns">
      <div class="help-col">
        <div v-for="item in leftCol" :key="item.cmd" class="help-row">
          <span class="help-cmd">{{ item.cmd }}</span>
          <span class="help-desc">{{ item.desc }}</span>
        </div>
      </div>
      <div class="help-col">
        <div v-for="item in rightCol" :key="item.cmd" class="help-row">
          <span class="help-cmd">{{ item.cmd }}</span>
          <span class="help-desc">{{ item.desc }}</span>
        </div>
      </div>
    </div>
    <div class="help-footer">
      <span class="hint-key">Tab</span> 自动补全 &nbsp;|&nbsp;
      <span class="hint-key">&#x2191;&#x2193;</span> 浏览历史命令 &nbsp;|&nbsp;
      <span class="hint-key">Ctrl+L</span> 清屏
    </div>
  </div>
</template>

<style scoped>
.help-output {
  margin-bottom: 0.75rem;
}

.help-header {
  color: var(--green);
  font-weight: bold;
  margin-bottom: 0.6rem;
}

.help-columns {
  display: flex;
  gap: 2em;
  margin-bottom: 0.6rem;
}

.help-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2em;
}

.help-row {
  display: flex;
  gap: 0.5em;
}

.help-cmd {
  color: var(--yellow);
  font-weight: 500;
  white-space: nowrap;
}

.help-desc {
  color: var(--gray);
}

.help-footer {
  color: var(--dark-gray);
  font-size: 0.85em;
}

.hint-key {
  color: var(--gray);
}
</style>
