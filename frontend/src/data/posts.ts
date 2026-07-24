import type { Post } from '../types'

/**
 * Lightweight browser-compatible frontmatter parser.
 * Handles YAML-like key:value pairs and simple list syntax (no gray-matter dependency).
 */
function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) {
    throw new Error('Invalid post format: missing frontmatter')
  }

  const data: Record<string, unknown> = {}
  const lines = match[1].split('\n')
  let currentKey: string | null = null
  let currentList: string[] = []

  function flushList() {
    if (currentKey && currentList.length > 0) {
      data[currentKey] = currentList
      currentList = []
      currentKey = null
    }
  }

  for (const line of lines) {
    // List item (e.g., "  - Vue")
    const listMatch = line.match(/^\s+-\s+(.+)$/)
    if (listMatch) {
      // The current key was set by the parent line
      currentList.push(listMatch[1].trim())
      continue
    }

    // Flush any pending list before starting a new key
    flushList()

    // Key-value pair (e.g., "title: My Post")
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)$/)
    if (kvMatch) {
      const key = kvMatch[1]
      let value: string = kvMatch[2].trim()

      // Unwrap quotes
      if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
        value = value.slice(1, -1)
      }

      if (value === '') {
        // Empty value — might be a list header
        currentKey = key
        currentList = []
      } else {
        data[key] = value
        currentKey = null
      }
    }
  }

  // Flush any remaining list
  flushList()

  return { data, content: match[2].trim() }
}

/**
 * Load all .md files from src/content/posts/ at build time.
 *
 * At build time, the prebuild script copies ../posts/*.md into src/content/posts/,
 * so import.meta.glob can embed them as raw strings.
 *
 * Each file uses YAML frontmatter:
 *   ---
 *   title: My Post
 *   subtitle: A Subtitle
 *   summary: One-line summary
 *   date: 2026-07-01
 *   tags:
 *     - Vue
 *     - TypeScript
 *   cover: /images/post.png
 *   status: publish
 *   ---
 *   ## Markdown body...
 *
 * The filename slug (without .md) becomes the post identifier.
 */
const modules = import.meta.glob('../content/posts/*.md', {
  query: '?raw',
  eager: true,
})

const rawPosts: Post[] = Object.entries(modules)
  .map(([path, mod]) => {
    const raw: string = typeof mod === 'string' ? mod : (mod as { default: string }).default
    const { data, content } = parseFrontmatter(raw)

    const filename = path.split('/').pop() || ''
    const slug = filename.replace(/\.md$/, '')

    return {
      slug,
      title: String(data.title || 'Untitled'),
      subtitle: String(data.subtitle || ''),
      summary: String(data.summary || ''),
      date: String(data.date || ''),
      content,
      tags: Array.isArray(data.tags) ? data.tags : [],
      cover: String(data.cover || ''),
      status: (data.status === 'publish' ? 'publish' : 'draft') as 'publish' | 'draft',
    }
  })
  .sort((a, b) => b.date.localeCompare(a.date)) // newest first

export const posts: Post[] = rawPosts
