import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import fs from 'node:fs'
import path from 'node:path'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// ── Credentials file ──────────────────────────────────────────────────

function credsPath(): string {
  return path.resolve(process.cwd(), '..', 'data', 'credentials.json')
}

interface Credentials {
  username: string
  passwordHash: string
}

function readCredentials(): Credentials | null {
  try {
    if (fs.existsSync(credsPath())) {
      return JSON.parse(fs.readFileSync(credsPath(), 'utf-8'))
    }
  } catch { /* ignore */ }
  return null
}

function writeCredentials(creds: Credentials): void {
  const dir = path.dirname(credsPath())
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(credsPath(), JSON.stringify(creds, null, 2), 'utf-8')
}

function getCredentials(): Credentials {
  // File-based credentials take precedence over env vars
  const fileCreds = readCredentials()
  if (fileCreds) return fileCreds

  // Fall back to environment variables
  return {
    username: process.env.ADMIN_USERNAME || 'admin',
    passwordHash: process.env.ADMIN_PASSWORD_HASH || '',
  }
}

// ── POST /login ───────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' })
    return
  }

  const creds = getCredentials()

  if (!creds.passwordHash) {
    res.status(500).json({ error: 'Server not configured: no password hash set' })
    return
  }

  if (username !== creds.username) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const valid = await bcrypt.compare(password, creds.passwordHash)
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const secret = process.env.JWT_SECRET || 'default-secret'
  const token = jwt.sign({ username }, secret, { expiresIn: '24h' })

  res.json({ success: true, token })
})

// ── PUT /credentials — Admin: change username/password ────────────────

router.put('/credentials', authMiddleware, async (req, res) => {
  try {
    const { newUsername, newPassword } = req.body

    if (!newUsername || !newPassword) {
      res.status(400).json({ error: 'newUsername and newPassword are required' })
      return
    }

    if (newPassword.length < 4) {
      res.status(400).json({ error: 'Password must be at least 4 characters' })
      return
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    writeCredentials({
      username: newUsername,
      passwordHash,
    })

    res.json({ success: true, username: newUsername })
  } catch (err) {
    console.error('Error updating credentials:', err)
    res.status(500).json({ error: 'Failed to update credentials' })
  }
})

export default router
