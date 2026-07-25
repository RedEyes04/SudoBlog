<script setup lang="ts">
import { computed } from 'vue'
import { adminConfig } from '../../data/config'

const allCommands = [
  { cmd: 'cd posts', desc: '进入文章目录' },
  { cmd: 'cd ..', desc: '返回上一级' },
  { cmd: 'ls', desc: '列出当前目录内容' },
  { cmd: 'vim <id>', desc: '打开指定文章' },
  { cmd: 'vim about.md', desc: '查看关于页面' },
  { cmd: 'vim friends.md', desc: '查看友链页面' },
  { cmd: ':wq', desc: '退出 vim / 返回' },
  { cmd: 'clear', desc: '清屏（或 Ctrl+L）' },
  { cmd: 'banner', desc: '显示欢迎横幅' },
  { cmd: 'whoami', desc: '显示当前用户' },
  { cmd: 'date', desc: '显示当前日期时间' },
  { cmd: 'echo', desc: '输出文本到终端' },
  { cmd: adminConfig.command, desc: '进入后台管理系统' },
  { cmd: 'help', desc: '显示此帮助信息' },
]

const half = Math.ceil(allCommands.length / 2)
const leftCol = computed(() => allCommands.slice(0, half))
const rightCol = computed(() => allCommands.slice(half))
</script>

<template>
  <div class="help-output">
    <div class="help-header" :style="{ animationDelay: '1.2s' }">可用命令</div>
    <div class="help-columns">
      <div class="help-col">
        <div v-for="(item, i) in leftCol" :key="item.cmd" class="help-row" :style="{ animationDelay: `${1.3 + i * 0.04}s` }">
          <span class="help-cmd">{{ item.cmd }}</span>
          <span class="help-desc">{{ item.desc }}</span>
        </div>
      </div>
      <div class="help-col">
        <div v-for="(item, i) in rightCol" :key="item.cmd" class="help-row" :style="{ animationDelay: `${1.3 + i * 0.04}s` }">
          <span class="help-cmd">{{ item.cmd }}</span>
          <span class="help-desc">{{ item.desc }}</span>
        </div>
      </div>
    </div>
    <div class="help-footer" :style="{ animationDelay: `${1.3 + allCommands.length * 0.04 + 0.15}s` }">
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
  overflow: hidden;
  white-space: nowrap;
  animation: lineReveal 0.2s steps(3, end) both;
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
  overflow: hidden;
  white-space: nowrap;
  animation: lineReveal 0.2s steps(6, end) both;
}

@keyframes lineReveal {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0 0 0); }
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
  overflow: hidden;
  white-space: nowrap;
  animation: lineReveal 0.3s steps(8, end) both;
}

.hint-key {
  color: var(--gray);
}
</style>
