export interface Post {
  id: number
  title: string
  subtitle: string
  summary: string
  date: string
  content: string // markdown
}

export interface Friend {
  name: string
  avatar: string
  description: string
  url: string
  thumbnail: string
}

export interface SiteConfig {
  title: string
  username: string
  hostname: string
  avatar: string
  bio: string
  name: string
}

export interface AboutData {
  avatar: string
  name: string
  bio: string
}

export type TerminalMode = 'home' | 'posts-list' | 'post-detail' | 'about' | 'friends'

export type OutputComponentName =
  | 'WelcomeBanner'
  | 'PostsList'
  | 'PostDetail'
  | 'AboutView'
  | 'FriendsList'
  | 'HelpOutput'

export interface ComponentEntry {
  name: OutputComponentName
  props: Record<string, unknown>
}

export interface HistoryEntry {
  id: number
  command: string
  type: 'html' | 'component'
  html?: string
  component?: ComponentEntry
}
