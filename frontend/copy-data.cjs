/**
 * Prebuild script: copies shared data into frontend/src/ so
 * Vite's import.meta.glob and static imports can embed them at build time.
 *
 * - ../posts/*.md          → src/content/posts/
 * - ../data/*.json          → src/data/
 */
const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')

// ── Posts ──────────────────────────────────────────────────────────
const postsSrc = path.join(rootDir, 'posts')
const postsDest = path.join(__dirname, 'src', 'content', 'posts')

fs.mkdirSync(postsDest, { recursive: true })

const existingPosts = fs.readdirSync(postsDest)
for (const file of existingPosts) {
  if (file.endsWith('.md')) {
    fs.unlinkSync(path.join(postsDest, file))
  }
}

if (fs.existsSync(postsSrc)) {
  const mdFiles = fs.readdirSync(postsSrc).filter((f) => f.endsWith('.md'))
  for (const file of mdFiles) {
    fs.copyFileSync(path.join(postsSrc, file), path.join(postsDest, file))
  }
  console.log(`Copied ${mdFiles.length} post(s) from ${postsSrc}`)
} else {
  console.log(`Posts source ${postsSrc} does not exist — skipping`)
}

// ── Data JSON ──────────────────────────────────────────────────────
const dataSrc = path.join(rootDir, 'data')
const dataDest = path.join(__dirname, 'src', 'data')

if (fs.existsSync(dataSrc)) {
  const jsonFiles = fs.readdirSync(dataSrc).filter((f) => f.endsWith('.json'))
  for (const file of jsonFiles) {
    fs.copyFileSync(path.join(dataSrc, file), path.join(dataDest, file))
  }
  console.log(`Copied ${jsonFiles.length} data file(s) from ${dataSrc}`)
} else {
  console.log(`Data source ${dataSrc} does not exist — skipping`)
}
