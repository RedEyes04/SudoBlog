import type { Post } from '../types'

/**
 * Load all .md files from src/content/posts/ at build time.
 *
 * Each file uses YAML-like frontmatter:
 *   ---
 *   id: 1
 *   title: My Post
 *   subtitle: A Subtitle
 *   summary: One-line summary
 *   date: 2026-07-01
 *   ---
 *   ## Markdown body...
 *
 * To add a new post, drop a new .md file into src/content/posts/.
 */
const modules = import.meta.glob('../content/posts/*.md', {
  query: '?raw',
  eager: true,
})

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) {
    throw new Error('Invalid post format: missing frontmatter')
  }

  const meta: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    let value = line.slice(colonIdx + 1).trim()
    // Unwrap quotes
    if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
      value = value.slice(1, -1)
    }
    meta[key] = value
  }

  return { meta, body: match[2].trim() }
}

const rawPosts: Post[] = Object.entries(modules)
  .map(([, mod]) => {
    // Eager glob returns { default: string }; unwrap it
    const raw: string = typeof mod === 'string' ? mod : (mod as { default: string }).default
    const { meta, body } = parseFrontmatter(raw)
    return {
      id: parseInt(meta.id, 10),
      title: meta.title,
      subtitle: meta.subtitle,
      summary: meta.summary,
      date: meta.date,
      content: body,
    }
  })
  .sort((a, b) => b.id - a.id) // newest first

export const posts: Post[] = rawPosts
