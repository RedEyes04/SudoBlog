import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

const UPLOAD_DIR = path.resolve(process.cwd(), '..', 'public', 'images')
const POSTS_DIR = process.env.POSTS_DIR || path.resolve(process.cwd(), '..', 'posts')

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'])

interface PostUsage {
  slug: string
  title: string
  status: string
}

/** Scan all posts and build a map: filename → list of posts that use it */
function buildUsageMap(): Map<string, PostUsage[]> {
  const usage = new Map<string, PostUsage[]>()

  if (!fs.existsSync(POSTS_DIR)) return usage

  const imgRe = /\/images\/([\w.-]+\.(?:jpg|jpeg|png|gif|webp|svg))/gi

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'))
  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8')
    const { data, content } = matter(raw)
    const slug = file.replace(/\.md$/, '')
    const title = data.title || slug
    const status = data.status || 'draft'

    const used = new Set<string>()

    // Check content for image references
    for (const m of content.matchAll(imgRe)) {
      used.add(m[1].toLowerCase())
    }

    // Also check cover image
    if (data.cover) {
      const cm = data.cover.match(/\/images\/([\w.-]+\.(?:jpg|jpeg|png|gif|webp|svg))/i)
      if (cm) used.add(cm[1].toLowerCase())
    }

    for (const filename of used) {
      if (!usage.has(filename)) usage.set(filename, [])
      usage.get(filename)!.push({ slug, title, status })
    }
  }

  return usage
}

// GET /api/images — list all uploaded images with usage info
router.get('/', authMiddleware, (_req, res) => {
  try {
    const usageMap = buildUsageMap()

    if (!fs.existsSync(UPLOAD_DIR)) {
      res.json([])
      return
    }

    const files = fs.readdirSync(UPLOAD_DIR)
    const images = files
      .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
      .map((filename) => {
        const stat = fs.statSync(path.join(UPLOAD_DIR, filename))
        const usedBy = usageMap.get(filename.toLowerCase()) || []
        return {
          filename,
          url: `/images/${filename}`,
          size: stat.size,
          modifiedAt: stat.mtime.toISOString(),
          usedBy,
        }
      })
      .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())

    res.json(images)
  } catch (err) {
    res.status(500).json({ error: 'Failed to list images' })
  }
})

// DELETE /api/images/:filename — delete an uploaded image
router.delete('/:filename', authMiddleware, (req, res) => {
  const { filename } = req.params

  // Prevent path traversal
  if (!/^[\w.-]+$/.test(filename)) {
    res.status(400).json({ error: 'Invalid filename' })
    return
  }

  const filepath = path.join(UPLOAD_DIR, filename)

  // Ensure resolved path is still within UPLOAD_DIR
  if (!filepath.startsWith(UPLOAD_DIR)) {
    res.status(400).json({ error: 'Invalid filename' })
    return
  }

  if (!fs.existsSync(filepath)) {
    res.status(404).json({ error: 'File not found' })
    return
  }

  try {
    fs.unlinkSync(filepath)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete file' })
  }
})

// POST /api/images/batch-delete — delete multiple images
router.post('/batch-delete', authMiddleware, (req, res) => {
  const { filenames } = req.body

  if (!Array.isArray(filenames) || filenames.length === 0) {
    res.status(400).json({ error: 'filenames must be a non-empty array' })
    return
  }

  const deleted: string[] = []
  const failed: string[] = []

  for (const filename of filenames) {
    // Prevent path traversal
    if (!/^[\w.-]+$/.test(filename)) {
      failed.push(filename)
      continue
    }

    const filepath = path.join(UPLOAD_DIR, filename)

    if (!filepath.startsWith(UPLOAD_DIR)) {
      failed.push(filename)
      continue
    }

    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
        deleted.push(filename)
      } else {
        failed.push(filename)
      }
    } catch {
      failed.push(filename)
    }
  }

  res.json({ deleted, failed, count: deleted.length })
})

export default router
