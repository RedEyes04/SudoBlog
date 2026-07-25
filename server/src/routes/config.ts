import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import figlet from 'figlet'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

function dataPath(): string {
  return path.resolve(process.cwd(), '..', 'data', 'config.json')
}

interface SiteConfig {
  title: string
  username: string
  hostname: string
  avatar: string
  name: string
  bio: string
  beian: string
}

interface ConfigData {
  site: SiteConfig
  asciiBanner: string
  admin?: { path?: string; command?: string }
}

function readConfig(): ConfigData {
  const filePath = dataPath()
  if (!fs.existsSync(filePath)) {
    return {
      site: {
        title: 'SudoBlog',
        username: 'visitor',
        hostname: 'sudoblog',
        avatar: '',
        name: '',
        bio: '',
        beian: '',
      },
      asciiBanner: '',
    }
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function writeConfig(config: ConfigData): void {
  const dir = path.dirname(dataPath())
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(dataPath(), JSON.stringify(config, null, 2), 'utf-8')
}

/** GET /api/config — Public: return site configuration */
router.get('/', (_req, res) => {
  try {
    const config = readConfig()
    res.json(config)
  } catch (err) {
    console.error('Error reading config:', err)
    res.status(500).json({ error: 'Failed to read config' })
  }
})

/** PUT /api/config — Admin: update site configuration */
router.put('/', authMiddleware, (req, res) => {
  try {
    const config = readConfig()

    // Merge site fields
    if (req.body.site) {
      config.site = { ...config.site, ...req.body.site }
    }

    // Update ASCII banner
    if (typeof req.body.asciiBanner === 'string') {
      config.asciiBanner = req.body.asciiBanner
    }

    // Merge admin fields
    if (req.body.admin) {
      config.admin = { ...config.admin, ...req.body.admin }
    }

    writeConfig(config)
    res.json(config)
  } catch (err) {
    console.error('Error updating config:', err)
    res.status(500).json({ error: 'Failed to update config' })
  }
})

/** POST /api/config/ascii — Admin: generate ASCII art from text */
router.post('/ascii', authMiddleware, (req, res) => {
  try {
    const { text, font = 'ANSI Shadow' } = req.body

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required' })
      return
    }

    figlet.text(text, { font } as figlet.Options, (err, result) => {
      if (err) {
        res.status(400).json({ error: `Failed to generate: ${err.message}` })
        return
      }
      res.json({ ascii: result })
    })
  } catch (err) {
    console.error('Error generating ASCII:', err)
    res.status(500).json({ error: 'Failed to generate ASCII art' })
  }
})

export default router
