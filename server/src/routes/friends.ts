import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

function dataPath(): string {
  return path.resolve(process.cwd(), '..', 'data', 'friends.json')
}

function readFriends(): FriendRecord[] {
  const filePath = dataPath()
  if (!fs.existsSync(filePath)) return []
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw)
}

function writeFriends(friends: FriendRecord[]): void {
  const dir = path.dirname(dataPath())
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(dataPath(), JSON.stringify(friends, null, 2), 'utf-8')
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || `friend-${Date.now()}`
}

interface FriendRecord {
  id: string
  name: string
  avatar: string
  description: string
  url: string
  thumbnail: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt?: string
}

/** GET /api/friends — Public: list approved friends */
router.get('/', (_req, res) => {
  try {
    const friends = readFriends().filter((f) => f.status === 'approved')
    res.json(friends)
  } catch (err) {
    console.error('Error listing friends:', err)
    res.status(500).json({ error: 'Failed to list friends' })
  }
})

/** GET /api/friends/applications — Admin: list all friends including pending */
router.get('/applications', authMiddleware, (_req, res) => {
  try {
    const friends = readFriends()
    res.json(friends)
  } catch (err) {
    console.error('Error listing applications:', err)
    res.status(500).json({ error: 'Failed to list applications' })
  }
})

/** POST /api/friends/apply — Public: submit a friend link application */
router.post('/apply', (req, res) => {
  try {
    const { name, url, avatar, description, thumbnail } = req.body

    if (!name || !url) {
      res.status(400).json({ error: 'Name and URL are required' })
      return
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      res.status(400).json({ error: 'Invalid URL format' })
      return
    }

    const friends = readFriends()
    const id = slugify(name)

    const record: FriendRecord = {
      id,
      name: name.trim(),
      url: url.trim(),
      avatar: avatar?.trim() || '',
      description: description?.trim() || '',
      thumbnail: thumbnail?.trim() || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    friends.push(record)
    writeFriends(friends)

    res.status(201).json({ success: true, message: 'Application submitted for review' })
  } catch (err) {
    console.error('Error submitting application:', err)
    res.status(500).json({ error: 'Failed to submit application' })
  }
})

/** POST /api/friends — Admin: manually add a friend */
router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, url, avatar, description, thumbnail } = req.body

    if (!name || !url) {
      res.status(400).json({ error: 'Name and URL are required' })
      return
    }

    const friends = readFriends()
    const id = slugify(name)

    const record: FriendRecord = {
      id,
      name: name.trim(),
      url: url.trim(),
      avatar: avatar?.trim() || '',
      description: description?.trim() || '',
      thumbnail: thumbnail?.trim() || '',
      status: 'approved',
      createdAt: new Date().toISOString(),
    }

    friends.push(record)
    writeFriends(friends)

    res.status(201).json(record)
  } catch (err) {
    console.error('Error creating friend:', err)
    res.status(500).json({ error: 'Failed to create friend' })
  }
})

/** PUT /api/friends/:id — Admin: update friend or approve/reject */
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params
    const friends = readFriends()
    const index = friends.findIndex((f) => f.id === id)

    if (index === -1) {
      res.status(404).json({ error: 'Friend not found' })
      return
    }

    const existing = friends[index]
    friends[index] = {
      ...existing,
      name: req.body.name ?? existing.name,
      url: req.body.url ?? existing.url,
      avatar: req.body.avatar ?? existing.avatar,
      description: req.body.description ?? existing.description,
      thumbnail: req.body.thumbnail ?? existing.thumbnail,
      status: req.body.status ?? existing.status,
    }

    writeFriends(friends)
    res.json(friends[index])
  } catch (err) {
    console.error('Error updating friend:', err)
    res.status(500).json({ error: 'Failed to update friend' })
  }
})

/** DELETE /api/friends/:id — Admin: delete friend */
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params
    let friends = readFriends()
    const index = friends.findIndex((f) => f.id === id)

    if (index === -1) {
      res.status(404).json({ error: 'Friend not found' })
      return
    }

    friends.splice(index, 1)
    writeFriends(friends)

    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting friend:', err)
    res.status(500).json({ error: 'Failed to delete friend' })
  }
})

export default router
