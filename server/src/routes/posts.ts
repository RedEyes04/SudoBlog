import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import multer from 'multer'
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
  pinned?: boolean
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
          pinned: data.pinned === true || data.pinned === 'true',
        }
      })
      .sort((a, b) => {
        // Pinned posts first
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        // Then by date descending
        return b.date.localeCompare(a.date)
      })

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
      pinned,
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
      pinned: pinned ?? existing.data.pinned ?? false,
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

/** POST /api/posts/import — Import a Markdown file as a new post */
const importUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

router.post('/import', authMiddleware, importUpload.single('file'), (req, res) => {
  try {
    const file = req.file
    if (!file) {
      res.status(400).json({ error: '请选择要导入的 Markdown 文件' })
      return
    }

    const raw = file.buffer.toString('utf-8')
    const parsed = matter(raw)

    // Normalize content: strip wrapping <p> tags, fix Obsidian image syntax
    let content = parsed.content.trim()
    if (/^<p>[\s\S]*<\/p>$/.test(content)) {
      content = content.replace(/^<p>/, '').replace(/<\/p>$/, '')
    }
    // Strip Obsidian image width: ![alt|600](url) → ![alt](url)
    content = content.replace(/!\[([^\]]*)\|\d+\]\(/g, '![$1](')

    // Protect URLs from heading regex (URLs may contain # fragments)
    const links: string[] = []
    content = content.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (m) => { links.push(m); return `\x00L${links.length - 1}\x00` })
    const urlList: string[] = []
    content = content.replace(/https?:\/\/\S+/g, (m) => { if (m.includes('#')) { urlList.push(m); return `\x00U${urlList.length - 1}\x00` } return m })

    // Protect code blocks from heading regexes
    const codeBlocks: string[] = []
    content = content.replace(/```[\s\S]*?```/g, (m) => { codeBlocks.push(m); return `\x00C${codeBlocks.length - 1}\x00` })

    // Fix mangled headings: # # → ##, # # # → ###
    content = content.replace(/# # # /g, '### ')
    content = content.replace(/# # /g, '## ')
    // Merge split headings: lone # with # on next line (optional blank line between) → ##
    content = content.replace(/^#\s*\n\s*# /gm, '## ')
    // Restore newlines before markdown headings
    content = content.replace(/([^\n])(#{1,3})([^\s#])/g, '$1\n$2 $3')
    content = content.replace(/([^\n])(#{1,3})\s/g, '$1\n$2 ')
    // Restore newlines before/after code fences
    content = content.replace(/([^\n])\s*(```)/g, '$1\n$2')
    content = content.replace(/(```)\s*([^\n`])/g, '$1\n$2')
    // Clean stray "复制" labels
    content = content.replace(/\n复制\n/g, '\n')
    content = content.replace(/^复制\n/gm, '')
    // Clean "code\n复制\n" platform UI labels
    content = content.replace(/\n?code\n复制\n/g, '\n')
    // Clean remaining stray lone # lines (after merges above)
    content = content.replace(/^#\s*$/gm, '')
    // Convert HTML entities
    content = content.replace(/&nbsp;/g, ' ')

    // Restore protected items
    content = content.replace(/\x00C(\d+)\x00/g, (_, i) => codeBlocks[parseInt(i)])
    content = content.replace(/\x00L(\d+)\x00/g, (_, i) => links[parseInt(i)])
    content = content.replace(/\x00U(\d+)\x00/g, (_, i) => urlList[parseInt(i)])

    const bodyStatus = req.body.status as string | undefined
    const forceSlug = req.body.slug as string | undefined

    // Normalize frontmatter
    const title = parsed.data.title?.trim()
      || file.originalname.replace(/\.md$/i, '').replace(/[-_]/g, ' ')
      || 'Untitled'

    const slug = forceSlug || slugify(title)
    const date = toDateStr(parsed.data.date) || new Date().toISOString().split('T')[0]
    const status: 'publish' | 'draft' =
      bodyStatus === 'publish' ? 'publish'
      : parsed.data.status === 'publish' ? 'publish'
      : 'draft'

    const meta: PostMeta = {
      title,
      date,
      status,
      subtitle: parsed.data.subtitle || '',
      summary: parsed.data.summary || '',
      tags: Array.isArray(parsed.data.tags) ? parsed.data.tags : (parsed.data.tags ? [parsed.data.tags] : []),
      cover: parsed.data.cover || '',
      pinned: parsed.data.pinned === true || parsed.data.pinned === 'true' || false,
    }

    const filePath = path.join(postsDir(), `${slug}.md`)

    // Check for slug conflict
    if (fs.existsSync(filePath) && !forceSlug) {
      res.status(409).json({ error: `slug "${slug}" 已存在，请修改文章标题或手动指定 slug` })
      return
    }

    // Ensure posts directory exists
    const dir = postsDir()
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    const fileContent = matter.stringify(content, meta)
    fs.writeFileSync(filePath, fileContent, 'utf-8')

    res.status(201).json({
      id: slug,
      title: meta.title,
      date: meta.date,
      status: meta.status,
      pinned: meta.pinned,
    })
  } catch (err) {
    console.error('Error importing post:', err)
    res.status(500).json({ error: '导入文章失败' })
  }
})

export default router
