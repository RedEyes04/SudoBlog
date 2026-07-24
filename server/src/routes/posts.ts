import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { authMiddleware } from '../middleware/auth.js'
import { slugify } from '../utils/slugify.js'

const router = Router()

function postsDir(): string {
  return process.env.POSTS_DIR || path.resolve(process.cwd(), '..', 'posts')
}

/** Sanitize filename to prevent path traversal */
function safeSlug(id: string): string {
  if (id.includes('..') || id.includes('/') || id.includes('\\')) {
    throw new Error('Invalid post identifier')
  }
  return id.replace(/\.md$/, '')
}

/** Normalize gray-matter date (can be Date object or string) to YYYY-MM-DD */
function toDateStr(v: unknown): string {
  if (v instanceof Date) return v.toISOString().split('T')[0]
  if (typeof v === 'string') return v
  return ''
}

interface PostMeta {
  title: string
  date: string
  subtitle?: string
  summary?: string
  tags?: string[]
  cover?: string
  status?: 'publish' | 'draft'
}

/** GET /api/posts — List all posts (metadata only) */
router.get('/', (_req, res) => {
  try {
    const dir = postsDir()
    if (!fs.existsSync(dir)) {
      res.json([])
      return
    }

    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))
    const posts = files
      .map((file) => {
        const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
        const { data } = matter(raw)
        return {
          id: file.replace(/\.md$/, ''),
          title: data.title || 'Untitled',
          date: toDateStr(data.date),
          subtitle: data.subtitle || '',
          summary: data.summary || '',
          tags: data.tags || [],
          cover: data.cover || '',
          status: data.status || 'draft',
        }
      })
      .sort((a, b) => b.date.localeCompare(a.date))

    res.json(posts)
  } catch (err) {
    console.error('Error listing posts:', err)
    res.status(500).json({ error: 'Failed to list posts' })
  }
})

/** GET /api/posts/:id — Get single post with full content */
router.get('/:id', (req, res) => {
  try {
    const slug = safeSlug(req.params.id)
    const filePath = path.join(postsDir(), `${slug}.md`)

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Post not found' })
      return
    }

    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(raw)

    res.json({
      id: slug,
      title: data.title || '',
      content: content.trim(),
      meta: {
        date: toDateStr(data.date),
        subtitle: data.subtitle || '',
        summary: data.summary || '',
        tags: data.tags || [],
        cover: data.cover || '',
        status: data.status || 'draft',
      },
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'Invalid post identifier') {
      res.status(400).json({ error: err.message })
      return
    }
    console.error('Error getting post:', err)
    res.status(500).json({ error: 'Failed to get post' })
  }
})

/** POST /api/posts — Create a new post */
router.post('/', authMiddleware, (req, res) => {
  try {
    const { title, content = '', tags = [], cover = '', status = 'draft', subtitle = '', summary = '' } = req.body

    if (!title) {
      res.status(400).json({ error: 'Title is required' })
      return
    }

    const slug = slugify(title)
    const date = new Date().toISOString().split('T')[0]

    const meta: PostMeta = {
      title,
      date,
      status,
      tags,
    }
    if (subtitle) meta.subtitle = subtitle
    if (summary) meta.summary = summary
    if (cover) meta.cover = cover

    const fileContent = matter.stringify(content.trim(), meta)
    const filePath = path.join(postsDir(), `${slug}.md`)

    // Ensure posts directory exists
    const dir = postsDir()
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    if (fs.existsSync(filePath)) {
      res.status(409).json({ error: 'A post with this slug already exists. Try a different title.' })
      return
    }

    fs.writeFileSync(filePath, fileContent, 'utf-8')

    res.status(201).json({
      id: slug,
      title,
      date,
      status,
    })
  } catch (err) {
    console.error('Error creating post:', err)
    res.status(500).json({ error: 'Failed to create post' })
  }
})

/** PUT /api/posts/:id — Update a post */
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const slug = safeSlug(req.params.id)
    const filePath = path.join(postsDir(), `${slug}.md`)

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Post not found' })
      return
    }

    const {
      title,
      content,
      tags,
      cover,
      status,
      date,
      subtitle,
      summary,
    } = req.body

    // Read existing file to merge frontmatter
    const raw = fs.readFileSync(filePath, 'utf-8')
    const existing = matter(raw)

    const meta: PostMeta = {
      title: title ?? existing.data.title ?? 'Untitled',
      date: date ?? toDateStr(existing.data.date),
      subtitle: subtitle ?? existing.data.subtitle ?? '',
      summary: summary ?? existing.data.summary ?? '',
      tags: tags ?? existing.data.tags ?? [],
      cover: cover ?? existing.data.cover ?? '',
      status: status ?? existing.data.status ?? 'draft',
    }

    const newContent = content !== undefined ? content.trim() : existing.content
    const fileContent = matter.stringify(newContent, meta)

    fs.writeFileSync(filePath, fileContent, 'utf-8')

    res.json({
      id: slug,
      title: meta.title,
      date: meta.date,
      status: meta.status,
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'Invalid post identifier') {
      res.status(400).json({ error: err.message })
      return
    }
    console.error('Error updating post:', err)
    res.status(500).json({ error: 'Failed to update post' })
  }
})

/** DELETE /api/posts/:id — Delete a post */
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const slug = safeSlug(req.params.id)
    const filePath = path.join(postsDir(), `${slug}.md`)

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Post not found' })
      return
    }

    fs.unlinkSync(filePath)

    res.json({ success: true })
  } catch (err) {
    if (err instanceof Error && err.message === 'Invalid post identifier') {
      res.status(400).json({ error: err.message })
      return
    }
    console.error('Error deleting post:', err)
    res.status(500).json({ error: 'Failed to delete post' })
  }
})

export default router
