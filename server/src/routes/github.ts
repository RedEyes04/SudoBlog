import { Router } from 'express'

const router = Router()

interface CacheEntry {
  data: { contributions: number[][]; totalContributions: number }
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

/**
 * Fetch GitHub contribution data for a username.
 * Uses GitHub's public contributions endpoint (no auth required).
 * Returns a 52-week × 7-day grid matching the GitHub contribution graph layout.
 */
async function fetchGitHubContributions(username: string): Promise<{
  contributions: number[][]
  totalContributions: number
}> {
  // Fetch GitHub's profile contributions page
  // We parse the embedded contribution data from the HTML
  const profileResp = await fetch(`https://github.com/users/${username}/contributions`)
  if (!profileResp.ok) {
    throw new Error(`GitHub user "${username}" not found or rate limited`)
  }

  const html = await profileResp.text()

  // Extract the contributions data from GitHub's embedded data
  // The contributions graph renders from <rect> elements with data-date and data-count attributes
  const rectPattern = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-count="(\d+)"[^>]*data-level="(\d+)"/g
  const contributionsByDate = new Map<string, { count: number; level: number }>()

  let match: RegExpExecArray | null
  while ((match = rectPattern.exec(html)) !== null) {
    contributionsByDate.set(match[1], {
      count: parseInt(match[2], 10),
      level: parseInt(match[3], 10),
    })
  }

  if (contributionsByDate.size === 0) {
    // Data not found in regex — generate empty grid
    return generateEmptyGrid()
  }

  // Build 52-week × 7-day grid
  // Find the date range: last 52 weeks ending on today or last Sunday
  const today = new Date()
  // End date = today
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate())

  // Start = 52 weeks back from today
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - 52 * 7 + 1)
  // Align start to Sunday
  const startDay = startDate.getDay()
  startDate.setDate(startDate.getDate() - startDay)

  // Build grid: [dayOfWeek (0=Sun..6=Sat)][weekIndex]
  const weeks = 53 // up to 53 columns in a year
  const contributions: number[][] = Array.from({ length: 7 }, () => new Array(weeks).fill(0))
  let totalContributions = 0

  const current = new Date(startDate)
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().slice(0, 10)
      const entry = contributionsByDate.get(dateStr)
      if (entry) {
        contributions[d][w] = entry.level > 0 ? entry.count : 0
        totalContributions += entry.count
      }
      // Only increment date if we're not past today
      current.setDate(current.getDate() + 1)
    }
  }

  return { contributions, totalContributions }
}

function generateEmptyGrid(): { contributions: number[][]; totalContributions: number } {
  const weeks = 53
  const contributions: number[][] = Array.from({ length: 7 }, () => new Array(weeks).fill(0))
  return { contributions, totalContributions: 0 }
}

/** GET /api/github/contributions?username=xxx */
router.get('/contributions', async (req, res) => {
  try {
    const username = (req.query.username as string)?.trim()
    if (!username) {
      res.status(400).json({ error: 'Missing username parameter' })
      return
    }

    // Check cache
    const cached = cache.get(username)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.json(cached.data)
      return
    }

    const data = await fetchGitHubContributions(username)

    // Update cache
    cache.set(username, { data, timestamp: Date.now() })

    res.json(data)
  } catch (err) {
    console.error('Error fetching GitHub contributions:', err)
    res.status(500).json({
      error: 'Failed to fetch GitHub contributions',
      contributions: generateEmptyGrid().contributions,
      totalContributions: 0,
    })
  }
})

export default router
