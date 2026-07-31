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
  pinned?: boolean
}

export interface Project {
  id?: string
  name: string
  description: string
  tech: string[]
  link: string
  image?: string
  githubRepo?: string
  stars?: number
  language?: string
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
  twikooEnvId?: string
  githubUsername?: string
}

export interface AdminConfig {
  path: string
  command: string
}

export interface AboutData {
  avatar: string
  name: string
  bio: string
}

export type TerminalMode = 'home' | 'posts-list' | 'post-detail' | 'about' | 'friends' | 'projects'

export type OutputComponentName =
  | 'WelcomeBanner'
  | 'PostsList'
  | 'PostDetail'
  | 'AboutView'
  | 'FriendsList'
  | 'HelpOutput'
  | 'ProjectsView'

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
