<p align="right">
  <sub>
    <b>English</b> | <a href="README.md">中文</a>
  </sub>
</p>

<p align="center">
  <img width="300" alt="sudoblog-logo" src="https://github.com/user-attachments/assets/a069d4c0-efeb-49e8-99be-246bed26b308" />
</p>

A terminal-styled personal blog with an admin dashboard. Visitors navigate via commands, while the admin panel provides a visual editor, image management, and friend-link moderation.

Vue 3 + Express, no database — posts are Markdown files, config is JSON. Design inspired by [LiveTerm](https://github.com/Cveinnt/LiveTerm).

---

## Showcase

<details open>
<summary><b>Visitor — terminal blog</b></summary>
<br />
<img alt="visitor" src="https://github.com/user-attachments/assets/6669b80b-cc2f-49ac-94c8-74bba7c1c42f" />
</details>

<details>
<summary><b>Admin — dashboard</b></summary>
<br />
<img alt="admin" src="https://github.com/user-attachments/assets/911d1342-fe8e-4bb5-b330-11cfac2c0f35" />
</details>

---

## Visitor Commands

| Command | Description |
|------|------|
| `help` | Show all available commands |
| `ls` | List current directory (root shows posts/, about.md, friends.md) |
| `cd posts` | Enter the posts directory and browse |
| `cd ..` | Go back to parent directory |
| `vim <slug>` | Open a post by its slug |
| `vim about.md` | View the about page |
| `vim friends.md` | View friend links |
| `:wq` | Exit current view (post / about / friends) |
| `clear` | Clear screen (or Ctrl+L) |
| `banner` | Redisplay the welcome banner |
| `whoami` | Show current username |
| `date` | Show current date and time |
| `echo <text>` | Print text to terminal |
| `admin` | Jump to admin dashboard (command name is configurable) |

Tab completion and arrow-key history are supported, with typewriter animation on output.

### Entering the Admin Panel

Type `admin` (default; configurable in `data/config.json`) in the terminal. The system redirects to the admin login page.

```json
// data/config.json
{
  "admin": {
    "path": "/admin",      // Admin URL path
    "command": "admin"     // Trigger command
  }
}
```

---

## Admin Features

- Post editor — TipTap WYSIWYG, drag-and-drop image upload, Markdown paste
- Image management — grid preview, filter by published / draft / unused, batch delete
- Friend links — add links, review applications (approve / reject)
- Site settings — edit title, ASCII banner, admin credentials

---

## Getting Started

Requires Node.js 18+.

```bash
git clone https://github.com/REDEYES/SudoBlog.git
cd SudoBlog

# Server
cd server
cp .env.example .env
npm install
npx tsx src/generate-hash.ts <your-password>   # paste output into .env
npm run dev                                     # localhost:3456

# Frontend (new terminal)
cd frontend
npm install
npm run dev                                     # localhost:5173
```

| | URL |
|------|------|
| Blog | `http://localhost:5173` |
| Admin | `http://localhost:5173/admin` (or type `admin` in terminal) |

A single Vue application serves both blog and admin — `main.ts` checks the URL and mounts the appropriate app.

---

## Build

```bash
# Build frontend
cd frontend
npm run build        # Output to frontend/dist/

# Build output:
# frontend/dist/
#   ├── index.html          # Blog entry
#   ├── admin/index.html    # Admin entry
#   ├── images/             # Static images
#   └── assets/             # JS/CSS bundles
```

For production:
1. Serve static files with Nginx or a CDN
2. Run the server with PM2 or systemd
3. Proxy `/api` and `/images` to backend `localhost:3456`
4. Route `/admin` to `dist/admin/index.html`

---

## Project Structure

```
├── frontend/src/
│   ├── admin/          # Admin SPA — router, Pinia stores, views
│   ├── components/     # Terminal UI components
│   └── composables/    # useTerminal core logic
├── server/src/routes/  # Express routes
├── posts/              # Blog posts — Markdown
├── data/               # Config & friends — JSON
└── public/images/      # Uploaded images
```

---

## API

JWT authentication. Protected endpoints require a Bearer token.

```
POST   /api/auth/login           Log in
PUT    /api/auth/credentials      Change credentials
GET    /api/posts                 List posts
POST   /api/posts                 Create post
GET    /api/posts/:id             Get post
PUT    /api/posts/:id             Update post
DELETE /api/posts/:id             Delete post
POST   /api/upload                Upload image
GET    /api/images                List images (with usage info)
DELETE /api/images/:filename      Delete image
POST   /api/images/batch-delete   Batch delete
GET    /api/friends               Friend list
POST   /api/friends               Add friend
POST   /api/friends/apply         Submit application
PUT    /api/friends/:id           Review
DELETE /api/friends/:id           Remove
GET    /api/config                Site config
PUT    /api/config                Update config
POST   /api/config/ascii          Generate ASCII art
```

---

## Tech

Vue 3 / TypeScript / Vite / Pinia / Vue Router / Naive UI / TipTap / Express / gray-matter / multer / JWT / bcryptjs

---

MIT

---

Credits: terminal design inspired by [Cveinnt/LiveTerm](https://github.com/Cveinnt/LiveTerm), based on [M4TT72/Terminal](https://github.com/m4tt72/terminal).
