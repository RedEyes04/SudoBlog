import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = Router()

router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' })
    return
  }

  const adminUsername = process.env.ADMIN_USERNAME || 'admin'
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

  if (!adminPasswordHash) {
    res.status(500).json({ error: 'Server not configured: ADMIN_PASSWORD_HASH not set' })
    return
  }

  if (username !== adminUsername) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const valid = await bcrypt.compare(password, adminPasswordHash)
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const secret = process.env.JWT_SECRET || 'default-secret'
  const token = jwt.sign({ username }, secret, { expiresIn: '24h' })

  res.json({ success: true, token })
})

export default router
