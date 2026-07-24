import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import authRoutes from './routes/auth.js'
import postsRoutes from './routes/posts.js'
import uploadRoutes from './routes/upload.js'
import friendsRoutes from './routes/friends.js'
import configRoutes from './routes/config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = parseInt(process.env.PORT || '3456', 10)

// Middleware
app.use(cors())
app.use(cookieParser())
app.use(express.json())

// Serve uploaded images
app.use('/images', express.static(path.resolve(__dirname, '..', '..', 'public', 'images')))

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/posts', postsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/friends', friendsRoutes)
app.use('/api/config', configRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`)
  console.log(`📝 Posts directory: ${process.env.POSTS_DIR || '../posts'}`)
})
