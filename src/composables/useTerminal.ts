import { ref, computed } from 'vue'
import type { HistoryEntry, TerminalMode, Post } from '../types'
import { posts as postsData } from '../data/posts'
import { friends as friendsData } from '../data/friends'
import { aboutData, asciiBanner, siteConfig } from '../data/config'

export function useTerminal() {
  // ── Reactive State ──────────────────────────────────────────────
  const history = ref<HistoryEntry[]>([])
  const command = ref('')
  const commandHistory = ref<string[]>([])
  const historyIndex = ref(-1)
  const postListSelectedIndex = ref(0)
  const currentPostId = ref<number | null>(null)
  const tabHints = ref<string[]>([]) // tab completion hints
  let nextEntryId = 1

  // ── Derived ─────────────────────────────────────────────────────
  const terminalMode = computed<TerminalMode>(() => {
    if (history.value.length === 0) return 'home'
    const last = history.value[history.value.length - 1]
    if (!last || last.type !== 'component') return 'home'
    const name = last.component?.name
    if (name === 'PostsList') return 'posts-list'
    if (name === 'PostDetail') return 'post-detail'
    return 'home'
  })

  const currentPost = computed<Post | null>(() => {
    if (currentPostId.value === null) return null
    return postsData.find((p) => p.id === currentPostId.value) ?? null
  })

  // ── Helpers ─────────────────────────────────────────────────────
  function pushEntry(entry: Omit<HistoryEntry, 'id'>) {
    history.value.push({ ...entry, id: nextEntryId++ })
  }

  // ── Command Execution ───────────────────────────────────────────
  function executeCommand(cmd: string): boolean {
    const trimmed = cmd.trim()
    if (!trimmed) {
      if (terminalMode.value === 'posts-list') {
        selectPost(postListSelectedIndex.value)
        command.value = ''
        tabHints.value = []
        return true
      }
      return false
    }

    // Track command history
    if (commandHistory.value.length === 0 || commandHistory.value[commandHistory.value.length - 1] !== trimmed) {
      commandHistory.value.push(trimmed)
    }
    historyIndex.value = -1
    tabHints.value = []

    const args = trimmed.split(' ')
    const cmdName = args[0].toLowerCase()
    const cmdArgs = args.slice(1)

    // Handle context-sensitive commands
    if (cmdName === 'cd') {
      if (terminalMode.value === 'post-detail' || terminalMode.value === 'posts-list') {
        if (cmdArgs.length === 0) {
          pushEntry({ command: trimmed, type: 'html', html: 'cd: 缺少参数。用 <span style="color: var(--green)">cd ..</span> 返回或 <span style="color: var(--green)">cd &lt;编号&gt;</span> 跳转文章。' })
          command.value = ''
          return true
        }
        if (cmdArgs[0] === '..') {
          goBackFromPost()
          command.value = ''
          return true
        }
        pushEntry({ command: trimmed, type: 'html', html: `cd: 未知参数: ${cmdArgs[0]}。试试 <span style="color: var(--green)">cd ..</span> 返回。` })
        command.value = ''
        return true
      }
      pushEntry({ command: trimmed, type: 'html', html: 'cd: 这里不可用。试试 <span style="color: var(--green)">posts</span>、<span style="color: var(--green)">about</span>、<span style="color: var(--green)">friend</span> 或 <span style="color: var(--green)">help</span>。' })
      command.value = ''
      return true
    }

    // Route standard commands
    switch (cmdName) {
      case 'help':
        cmdHelp(trimmed)
        break
      case 'clear':
        cmdClear()
        break
      case 'posts':
        cmdPosts(trimmed)
        break
      case 'about':
        cmdAbout(trimmed)
        break
      case 'friend':
      case 'friends':
        cmdFriend(trimmed)
        break
      case 'banner':
        cmdBanner(trimmed)
        break
      case 'whoami':
        cmdWhoami(trimmed)
        break
      case 'date':
        cmdDate(trimmed)
        break
      case 'echo':
        cmdEcho(trimmed, cmdArgs)
        break
      case 'ls':
        cmdLs(trimmed)
        break
      default:
        pushEntry({
          command: trimmed,
          type: 'html',
          html: `<span style="color: var(--red)">命令未找到: ${cmdName}</span>。输入 '<span style="color: var(--green)">help</span>' 查看可用命令。`,
        })
    }

    command.value = ''
    return true
  }

  // ── Navigation ──────────────────────────────────────────────────
  function selectPost(index: number) {
    const post = postsData[index]
    if (!post) return
    currentPostId.value = post.id
    pushEntry({
      command: `post #${post.id}`,
      type: 'component',
      component: {
        name: 'PostDetail',
        props: { post },
      },
    })
  }

  function goBackFromPost() {
    currentPostId.value = null
    postListSelectedIndex.value = 0
    pushEntry({
      command: 'cd ..',
      type: 'component',
      component: {
        name: 'PostsList',
        props: {
          posts: postsData,
          selectedIndex: postListSelectedIndex,
          onSelect: (index: number) => selectPost(index),
        },
      },
    })
  }

  // ── Command Handlers ────────────────────────────────────────────
  function cmdHelp(cmd: string) {
    pushEntry({
      command: cmd,
      type: 'component',
      component: { name: 'HelpOutput', props: {} },
    })
  }

  function cmdClear() {
    history.value = []
    currentPostId.value = null
    postListSelectedIndex.value = 0
    cmdBanner('banner')
  }

  function cmdPosts(cmd: string) {
    currentPostId.value = null
    postListSelectedIndex.value = 0
    pushEntry({
      command: cmd,
      type: 'component',
      component: {
        name: 'PostsList',
        props: {
          posts: postsData,
          selectedIndex: postListSelectedIndex,
          onSelect: (index: number) => selectPost(index),
        },
      },
    })
  }

  function cmdAbout(cmd: string) {
    pushEntry({
      command: cmd,
      type: 'component',
      component: {
        name: 'AboutView',
        props: { about: aboutData },
      },
    })
  }

  function cmdFriend(cmd: string) {
    pushEntry({
      command: cmd,
      type: 'component',
      component: {
        name: 'FriendsList',
        props: { friends: friendsData },
      },
    })
  }

  function cmdBanner(cmd: string) {
    pushEntry({
      command: cmd,
      type: 'component',
      component: {
        name: 'WelcomeBanner',
        props: { banner: asciiBanner, config: siteConfig },
      },
    })
  }

  function cmdWhoami(cmd: string) {
    pushEntry({ command: cmd, type: 'html', html: siteConfig.username })
  }

  function cmdDate(cmd: string) {
    pushEntry({ command: cmd, type: 'html', html: new Date().toString() })
  }

  function cmdEcho(cmd: string, args: string[]) {
    pushEntry({ command: cmd, type: 'html', html: args.join(' ') })
  }

  function cmdLs(cmd: string) {
    pushEntry({
      command: cmd,
      type: 'html',
      html: `<span style="color: var(--blue)">posts/</span>  <span style="color: var(--blue)">friends/</span>  <span style="color: var(--blue)">about/</span>`,
    })
  }

  // ── History Navigation ──────────────────────────────────────────
  function recallHistory(direction: 'up' | 'down') {
    const cmds = commandHistory.value
    if (cmds.length === 0) return

    if (direction === 'up') {
      if (historyIndex.value < cmds.length - 1) {
        historyIndex.value++
      }
    } else {
      if (historyIndex.value > 0) {
        historyIndex.value--
      } else {
        historyIndex.value = -1
        command.value = ''
        return
      }
    }
    command.value = cmds[cmds.length - 1 - historyIndex.value]
  }

  // ── Tab Completion ──────────────────────────────────────────────
  const availableCommands = [
    'about', 'banner', 'cd', 'clear', 'date', 'echo',
    'friend', 'friends', 'help', 'ls', 'posts', 'whoami',
  ]

  function handleTabComplete() {
    const input = command.value.toLowerCase()
    if (!input) {
      tabHints.value = []
      return
    }

    const matches = availableCommands.filter((c) => c.startsWith(input))
    if (matches.length === 1) {
      command.value = matches[0]
      tabHints.value = []
    } else if (matches.length > 1) {
      tabHints.value = matches
      // Auto-complete the common prefix
      let commonPrefix = matches[0]
      for (let i = 1; i < matches.length; i++) {
        while (!matches[i].startsWith(commonPrefix)) {
          commonPrefix = commonPrefix.slice(0, -1)
        }
      }
      if (commonPrefix.length > input.length) {
        command.value = commonPrefix
      }
    } else {
      tabHints.value = []
    }
  }

  // ── Initial Banner ──────────────────────────────────────────────
  function showBanner() {
    cmdBanner('banner')
  }

  // ── Return ──────────────────────────────────────────────────────
  return {
    history,
    command,
    terminalMode,
    postListSelectedIndex,
    currentPostId,
    currentPost,
    tabHints,
    executeCommand,
    selectPost,
    goBackFromPost,
    recallHistory,
    handleTabComplete,
    clearHistory: cmdClear,
    showBanner,
  }
}
