import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

function dataPath(): string {
  return path.resolve(process.cwd(), '..', 'data', 'projects.json')
}

interface ProjectRecord {
  id: string
  name: string
  description: string
  tech: string[]
  link: string
  image?: string
  githubRepo?: string
  stars?: number
  language?: string
}

function readProjects(): ProjectRecord[] {
  const filePath = dataPath()
  if (!fs.existsSync(filePath)) return []
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function writeProjects(projects: ProjectRecord[]): void {
  const dir = path.dirname(dataPath())
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(dataPath(), JSON.stringify(projects, null, 2), 'utf-8')
}

/** GET /api/projects — Public: list all projects */
router.get('/', (_req, res) => {
  try {
    const projects = readProjects()
    res.json(projects)
  } catch (err) {
    console.error('Error reading projects:', err)
    res.status(500).json({ error: 'Failed to read projects' })
  }
})

/** POST /api/projects — Admin: create a project */
router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, description, tech, link, image, githubRepo, stars, language } = req.body

    if (!name || !description || !link) {
      res.status(400).json({ error: 'name, description, and link are required' })
      return
    }

    const projects = readProjects()
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')

    const project: ProjectRecord = {
      id,
      name: name.trim(),
      description: description.trim(),
      tech: Array.isArray(tech) ? tech : (tech ? tech.split(',').map((t: string) => t.trim()) : []),
      link: link.trim(),
      image: image?.trim() || '',
      githubRepo: githubRepo?.trim() || '',
      stars: stars || undefined,
      language: language?.trim() || undefined,
    }

    projects.push(project)
    writeProjects(projects)
    res.status(201).json(project)
  } catch (err) {
    console.error('Error creating project:', err)
    res.status(500).json({ error: 'Failed to create project' })
  }
})

/** PUT /api/projects/:id — Admin: update a project */
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const projects = readProjects()
    const index = projects.findIndex((p) => p.id === req.params.id)
    if (index === -1) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    const { name, description, tech, link, image, githubRepo, stars, language } = req.body
    const existing = projects[index]

    projects[index] = {
      ...existing,
      name: name?.trim() || existing.name,
      description: description?.trim() || existing.description,
      tech: Array.isArray(tech) ? tech : (tech ? tech.split(',').map((t: string) => t.trim()) : existing.tech),
      link: link?.trim() || existing.link,
      image: image !== undefined ? image.trim() : existing.image,
      githubRepo: githubRepo !== undefined ? githubRepo.trim() : existing.githubRepo,
      stars: stars !== undefined ? stars : existing.stars,
      language: language !== undefined ? language.trim() : existing.language,
    }

    writeProjects(projects)
    res.json(projects[index])
  } catch (err) {
    console.error('Error updating project:', err)
    res.status(500).json({ error: 'Failed to update project' })
  }
})

/** DELETE /api/projects/:id — Admin: delete a project */
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const projects = readProjects()
    const index = projects.findIndex((p) => p.id === req.params.id)
    if (index === -1) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    projects.splice(index, 1)
    writeProjects(projects)
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting project:', err)
    res.status(500).json({ error: 'Failed to delete project' })
  }
})

export default router
