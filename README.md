# 💻 SudoBlog

> 一个终端风格的个人博客系统
> 灵感来自命令行交互

## Project Structure

```
Sudoblog/
├── frontend/        # Terminal-style blog (Vue 3 + Vite)
│   └── src/
│       └── content/posts/   # Build-time copy target
│
├── admin/           # Admin management SPA (Vue 3 + Element Plus)
│   └── src/
│       ├── views/   # Login, Dashboard, PostsList, Editor
│       ├── stores/  # Pinia stores
│       └── router/  # Vue Router with auth guard
│
├── server/          # Node.js Express API
│   └── src/
│       ├── routes/  # auth, posts, upload
│       └── middleware/
│
├── posts/           # Markdown articles (shared data)
│
└── public/images/   # Uploaded images
```

## Quick Start

### 1. Setup Server

```bash
cd server
cp .env.example .env
npm install
# Generate password hash:
npx tsx src/generate-hash.ts <your-password>
# Update ADMIN_PASSWORD_HASH in .env with the output
# Generate a random JWT_SECRET and update .env
npm run dev
```

Server runs at `http://localhost:3000`.

Default admin username: `admin`

### 2. Setup Admin

```bash
cd admin
npm install
npm run dev
```

Admin runs at `http://localhost:5174`. Login with admin credentials.

### 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Build

```bash
# Build admin
cd admin && npx vite build   # Output to dist/admin/

# Build frontend
cd frontend && npm run build  # Output to dist/
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | No | Login |
| GET | /api/posts | No | List all posts |
| GET | /api/posts/:id | No | Get single post |
| POST | /api/posts | Yes | Create post |
| PUT | /api/posts/:id | Yes | Update post |
| DELETE | /api/posts/:id | Yes | Delete post |
| POST | /api/upload | Yes | Upload image |

## Post Format

Posts are stored as Markdown files with YAML frontmatter:

```yaml
---
title: My Post Title
date: 2026-07-24
subtitle: Optional subtitle
summary: One-line summary
tags:
  - Vue
  - TypeScript
cover: /images/cover.jpg
status: publish
---
## Markdown content...
```
