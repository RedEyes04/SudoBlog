import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

const UPLOAD_DIR = path.resolve(process.cwd(), '..', 'public', 'images')

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'])

// GET /api/images — list all uploaded images
router.get('/', authMiddleware, (_req, res) => {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      res.json([])
      return
    }

    const files = fs.readdirSync(UPLOAD_DIR)
    const images = files
      .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
      .map((filename) => {
        const stat = fs.statSync(path.join(UPLOAD_DIR, filename))
        return {
          filename,
          url: `/images/${filename}`,
          size: stat.size,
          modifiedAt: stat.mtime.toISOString(),
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

export default router
