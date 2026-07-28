import { ref, computed, watch } from 'vue'
import type { HistoryEntry, TerminalMode, Post } from '../types'
import { posts, loadPosts, loadPost } from '../data/posts'
import { friends, loadFriends } from '../data/friends'
import { aboutData, asciiBanner, siteConfig, adminConfig, loadConfig } from '../data/config'

export function useTerminal() {
  // ── Reactive State ──────────────────────────────────────────────
  const history = ref<HistoryEntry[]>([])
  const command = ref('')
  const commandHistory = ref<string[]>([])
  const historyIndex = ref(-1)
  const postListSelectedIndex = ref(0)
  const currentPostSlug = ref<string | null>(null)
  const currentPostDetail = ref<Post | null>(null)
  const tabHints = ref<string[]>([])
  const loading = ref(true)
  let nextEntryId = 1

  // ── Explicit mode (NOT derived from history — non-navigation commands don't change it)
  const terminalMode = ref<TerminalMode>('home')

  // ── URL Hash Sync ─────────────────────────────────────────────────
  function syncHash() {
    let hash = ''
    switch (terminalMode.value) {
      case 'post-detail':
        if (currentPostSlug.value !== null) hash = `#/posts/${currentPostSlug.value}`
        break
      case 'posts-list':
        hash = '#/posts'
        break
      case 'about':
        hash = '#/about'
        break
      case 'friends':
        hash = '#/friends'
        break
      default:
        break
    }
    window.history.replaceState(null, '', hash || window.location.pathname)
  }

  watch([terminalMode, currentPostSlug], () => syncHash())

  async function restoreFromHash(): Promise<boolean> {
    const hash = window.location.hash

    if (hash.startsWith('#/posts/')) {
      const slug = hash.slice('#/posts/'.length)
      if (slug) {
        const fullPost = await loadPost(slug)
        if (fullPost) {
          currentPostSlug.value = fullPost.slug
          currentPostDetail.value = fullPost
          terminalMode.value = 'post-detail'
          pushEntry({
            command: `post #${fullPost.slug}`,
            type: 'component',
            component: { name: 'PostDetail', props: { post: fullPost, twikooEnvId: siteConfig.value.twikooEnvId } },
          })
          return true
        }
      }
      cmdPosts('posts')
      return true
    }

    switch (hash) {
      case '#/posts':
        cmdPosts('posts')
        return true
      case '#/about':
        cmdAbout('about')
        return true
      case '#/friends':
        cmdFriend('friends')
        return true
      default:
        return false
    }
  }

  const currentPost = computed<Post | null>(() => {
    return currentPostDetail.value
  })

  // ── Current working directory (for prompt display) ──────────────
  const cwd = computed(() => {
    return terminalMode.value === 'posts-list' ? '~/posts' : '~'
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

    if (commandHistory.value.length === 0 || commandHistory.value[commandHistory.value.length - 1] !== trimmed) {
      commandHistory.value.push(trimmed)
    }
    historyIndex.value = -1
    tabHints.value = []

    const args = trimmed.split(' ')
    const cmdName = args[0].toLowerCase()
    const cmdArgs = args.slice(1)

    if (cmdName === 'cd') {
      // cd with no args → show current path
      if (cmdArgs.length === 0) {
        if (terminalMode.value === 'post-detail') {
          pushEntry({ command: trimmed, type: 'html', html: `正在查看文章 #${currentPostSlug.value} — 用 <span style="color: var(--green)">:wq</span> 返回列表。` })
        } else if (terminalMode.value === 'posts-list') {
          pushEntry({ command: trimmed, type: 'html', html: '/posts — 输入编号或回车进入文章。用 <span style="color: var(--green)">cd ..</span> 返回根目录。' })
        } else if (terminalMode.value === 'about') {
          pushEntry({ command: trimmed, type: 'html', html: '正在查看 about.md — 用 <span style="color: var(--green)">:wq</span> 返回。' })
        } else if (terminalMode.value === 'friends') {
          pushEntry({ command: trimmed, type: 'html', html: '正在查看 friends.md — 用 <span style="color: var(--green)">:wq</span> 返回。' })
        } else {
          pushEntry({ command: trimmed, type: 'html', html: '/ — 试试 <span style="color: var(--green)">cd posts</span>、<span style="color: var(--green)">vim about.md</span>、<span style="color: var(--green)">vim friends.md</span>。' })
        }
        command.value = ''
        return true
      }

      // cd ..
      if (cmdArgs[0] === '..') {
        if (terminalMode.value === 'post-detail') {
          goBackFromPost()
        } else if (terminalMode.value === 'posts-list' || terminalMode.value === 'about' || terminalMode.value === 'friends') {
          goHome()
        } else {
          pushEntry({ command: trimmed, type: 'html', html: '已经在根目录 /。' })
        }
        command.value = ''
        return true
      }

      // cd posts
      if (cmdArgs[0] === 'posts') {
        if (terminalMode.value === 'posts-list') {
          pushEntry({ command: trimmed, type: 'html', html: '已经在 /posts 目录。' })
        } else {
          cmdPosts(trimmed)
        }
        command.value = ''
        return true
      }

      pushEntry({ command: trimmed, type: 'html', html: `cd: 没有这个目录: ${cmdArgs[0]}。试试 <span style="color: var(--green)">cd posts</span>。` })
      command.value = ''
      return true
    }

    // ── Vim-style exit commands ──
    if (cmdName === ':wq' || cmdName === ':q!' || cmdName === ':q') {
      if (terminalMode.value === 'post-detail') {
        goBackFromPost()
      } else if (terminalMode.value === 'about' || terminalMode.value === 'friends') {
        goHome()
      } else {
        pushEntry({ command: trimmed, type: 'html', html: '不在 vim 中。' })
      }
      command.value = ''
      return true
    }

    switch (cmdName) {
      case 'help':
        cmdHelp(trimmed)
        break
      case 'clear':
        cmdClear()
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
      case 'vim':
        if (cmdArgs.length === 0) {
          pushEntry({ command: trimmed, type: 'html', html: 'vim: 缺少参数。试试 <span style="color: var(--green)">vim 1</span>、<span style="color: var(--green)">vim about.md</span>。' })
        } else if (cmdArgs[0] === 'about.md') {
          cmdAbout(trimmed)
        } else if (cmdArgs[0] === 'friends.md') {
          cmdFriend(trimmed)
        } else {
          // vim <slug> — open post by slug
          const slug = cmdArgs[0]
          const post = posts.value.find((p) => p.slug === slug)
          if (post) {
            openPostDetail(post.slug, trimmed)
          } else {
            pushEntry({ command: trimmed, type: 'html', html: `vim: 文章不存在: ${cmdArgs[0]}` })
          }
        }
        break
      default:
        // Check if it's the admin command (dynamic from config)
        if (cmdName === adminConfig.command) {
          pushEntry({
            command: trimmed,
            type: 'html',
            html: `正在跳转到后台管理系统 <span style="color: var(--green)">${adminConfig.path}/login</span>...`,
          })
          setTimeout(() => {
            window.location.href = adminConfig.path + '/login'
          }, 300)
        } else {
          pushEntry({
            command: trimmed,
            type: 'html',
            html: `命令未找到: <span style="color: var(--red)">${cmdName}</span>。输入 <span style="color: var(--green)">help</span> 查看可用命令。`,
          })
        }
    }

    command.value = ''
    return true
  }

  // ── Navigation ──────────────────────────────────────────────────
  async function selectPost(index: number) {
    const post = posts.value[index]
    if (!post) return
    await openPostDetail(post.slug, `post #${post.slug}`)
  }

  async function openPostDetail(slug: string, displayCommand: string) {
    const fullPost = await loadPost(slug)
    if (!fullPost) {
      pushEntry({ command: displayCommand, type: 'html', html: `文章加载失败: ${slug}` })
      return
    }
    currentPostSlug.value = fullPost.slug
    currentPostDetail.value = fullPost
    terminalMode.value = 'post-detail'
    pushEntry({
      command: displayCommand,
      type: 'component',
      component: { name: 'PostDetail', props: { post: fullPost, twikooEnvId: siteConfig.value.twikooEnvId } },
    })
  }

  function goBackFromPost() {
    currentPostSlug.value = null
    currentPostDetail.value = null
    postListSelectedIndex.value = 0
    terminalMode.value = 'posts-list'
    cmdPosts('posts')
  }

  function goHome() {
    currentPostSlug.value = null
    currentPostDetail.value = null
    postListSelectedIndex.value = 0
    terminalMode.value = 'home'
    showBanner()
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
    // In fullscreen modes, only clear inline outputs — don't jump home
    const fullscreenModes: TerminalMode[] = ['post-detail', 'about', 'friends']
    if (fullscreenModes.includes(terminalMode.value)) {
      const lastNavIndex = findLastNavIndex()
      if (lastNavIndex >= 0) {
        history.value = history.value.slice(0, lastNavIndex + 1)
      }
      return
    }

    history.value = []
    currentPostSlug.value = null
    currentPostDetail.value = null
    postListSelectedIndex.value = 0
    terminalMode.value = 'home'
    cmdBanner('banner')
  }

  function findLastNavIndex(): number {
    const fullscreenNavComponents = ['PostDetail', 'AboutView', 'FriendsList']
    for (let i = history.value.length - 1; i >= 0; i--) {
      const entry = history.value[i]
      if (entry.type === 'component' && entry.component && fullscreenNavComponents.includes(entry.component.name)) {
        return i
      }
    }
    return -1
  }

  function cmdPosts(cmd: string) {
    currentPostSlug.value = null
    currentPostDetail.value = null
    postListSelectedIndex.value = 0
    terminalMode.value = 'posts-list'
    pushEntry({
      command: cmd,
      type: 'component',
      component: {
        name: 'PostsList',
        props: {
          posts: posts.value,
          selectedIndex: postListSelectedIndex,
          onSelect: (index: number) => selectPost(index),
        },
      },
    })
  }

  function cmdAbout(cmd: string) {
    terminalMode.value = 'about'
    pushEntry({
      command: cmd,
      type: 'component',
      component: {
        name: 'AboutView',
        props: { about: aboutData.value, twikooEnvId: siteConfig.value.twikooEnvId },
      },
    })
  }

  function cmdFriend(cmd: string) {
    terminalMode.value = 'friends'
    pushEntry({
      command: cmd,
      type: 'component',
      component: {
        name: 'FriendsList',
        props: { friends: friends.value, twikooEnvId: siteConfig.value.twikooEnvId },
      },
    })
  }

  function cmdBanner(cmd: string) {
    terminalMode.value = 'home'
    pushEntry({
      command: cmd,
      type: 'component',
      component: {
        name: 'WelcomeBanner',
        props: { banner: asciiBanner.value, config: siteConfig.value },
      },
    })
  }

  function cmdWhoami(cmd: string) {
    pushEntry({ command: cmd, type: 'html', html: siteConfig.value.username })
  }

  function cmdDate(cmd: string) {
    pushEntry({ command: cmd, type: 'html', html: new Date().toString() })
  }

  function cmdEcho(cmd: string, args: string[]) {
    pushEntry({ command: cmd, type: 'html', html: args.join(' ') })
  }

  function cmdLs(cmd: string) {
    if (terminalMode.value === 'posts-list' || terminalMode.value === 'post-detail') {
      const items = posts.value.map((p, i) => `<span style="color: var(--blue)">${i + 1}.</span> ${p.title}`).join('<br>')
      pushEntry({ command: cmd, type: 'html', html: items || '(空)' })
    } else {
      pushEntry({
        command: cmd,
        type: 'html',
        html: `<span style="color: var(--blue)">posts/</span>  <span style="color: var(--green)">about.md</span>  <span style="color: var(--green)">friends.md</span>`,
      })
    }
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
    'banner', 'cd', 'clear', 'date', 'echo',
    'help', 'ls', 'vim', 'whoami',
  ]

  function handleTabComplete() {
    const input = command.value
    if (!input) { tabHints.value = []; return }

    const parts = input.split(' ')
    const cmdName = parts[0].toLowerCase()

    // ── Completing first word (command name) ──
    if (parts.length === 1) {
      const matches = availableCommands.filter((c) => c.startsWith(cmdName))
      if (matches.length === 1) {
        command.value = matches[0] + ' '
        tabHints.value = []
      } else if (matches.length > 1) {
        tabHints.value = matches
        let commonPrefix = matches[0]
        for (let i = 1; i < matches.length; i++) {
          while (!matches[i].startsWith(commonPrefix)) {
            commonPrefix = commonPrefix.slice(0, -1)
          }
        }
        if (commonPrefix.length > cmdName.length) {
          command.value = commonPrefix
        }
      } else {
        tabHints.value = []
      }
      return
    }

    // ── Completing arguments ──
    const partialArg = parts.slice(1).join(' ').toLowerCase()

    if (cmdName === 'cd') {
      const cdArgs = ['posts', '..']
      const matches = cdArgs.filter((a) => a.startsWith(partialArg))
      if (matches.length === 1) {
        command.value = 'cd ' + matches[0]
        tabHints.value = []
      } else if (matches.length > 1) {
        tabHints.value = matches.map((m) => 'cd ' + m)
      } else {
        tabHints.value = []
      }
      return
    }

    if (cmdName === 'vim') {
      const vimArgs = ['about.md', 'friends.md']
      const matches = vimArgs.filter((a) => a.startsWith(partialArg))
      if (matches.length === 1) {
        command.value = 'vim ' + matches[0]
        tabHints.value = []
      } else if (matches.length > 1) {
        tabHints.value = matches.map((m) => 'vim ' + m)
      } else {
        tabHints.value = []
      }
      return
    }

    tabHints.value = []
  }

  // ── Full-screen inline outputs ──────────────────────────────────
  const fullscreenOutputs = computed(() => {
    const lastNavIndex = findLastNavIndex()
    if (lastNavIndex === -1) return []
    const outputs = history.value.slice(lastNavIndex + 1)
    return outputs.slice(-2)
  })

  // ── Data Loading ────────────────────────────────────────────────
  async function loadData() {
    loading.value = true
    await Promise.all([loadPosts(), loadFriends(), loadConfig()])
    loading.value = false
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
    cwd,
    postListSelectedIndex,
    currentPostSlug,
    currentPost,
    tabHints,
    loading,
    loadData,
    executeCommand,
    selectPost,
    goBackFromPost,
    goHome,
    recallHistory,
    handleTabComplete,
    fullscreenOutputs,
    clearHistory: cmdClear,
    showBanner,
    restoreFromHash,
  }
}
