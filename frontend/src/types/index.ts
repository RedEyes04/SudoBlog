export interface Post {
  slug: string
  title: string
  subtitle: string
  summary: string
  date: string
  content: string // markdown
  tags?: string[]
  cover?: string
  status?: 'publish' | 'draft'
}

export interface Friend {
  id: string
  name: string
  avatar: string
  description: string
  url: string
  thumbnail: string
  status?: 'pending' | 'approved' | 'rejected'
}

export interface SiteConfig {
  title: string
  username: string
  hostname: string
  avatar: string
  bio: string
  name: string
  beian?: string
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
