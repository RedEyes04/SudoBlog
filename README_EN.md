<p align="right">
  <sub>
    <b>English</b> | <a href="README.md">中文</a>
  </sub>
</p>

<p align="center">
  <img width="300" alt="sudoblog-logo" src="https://github.com/user-attachments/assets/a069d4c0-efeb-49e8-99be-246bed26b308" />
</p>

A terminal-styled personal blog with an admin dashboard. Visitors browse posts by typing commands like `ls` and `cat`, while the admin panel provides a visual editor, image management, and friend-link moderation.

Built with Vue 3 and Express. No database — posts are Markdown files, config is JSON.

Design inspired by [LiveTerm](https://github.com/Cveinnt/LiveTerm).

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

## Features

**Visitor side**

| Command | Description |
|---------|-------------|
| `ls` | List all published posts |
| `cat <slug>` | Read a post |
| `about` | About page |
| `friends` | View friend links |
| `help` / `clear` / `whoami` | Utility commands |

Terminal behavior: typewriter effect, tab completion, command history with arrow keys.

**Admin panel**

- Rich-text editor based on TipTap — drag and drop images, paste Markdown
- Image management — grid view with preview, categorized by published / draft / unused, batch delete
- Friend-link system — public application form, approve or reject in admin
- Site settings — change site title, ASCII banner, admin credentials

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
npx tsx src/generate-hash.ts <your-password>   # paste the output into .env
npm run dev                                     # localhost:3456

# Frontend (new terminal)
cd frontend
npm install
npm run dev                                     # localhost:5173
```

| | URL |
|------|------|
| Blog | `http://localhost:5173` |
| Admin | `http://localhost:5173/admin` |

The same Vue application serves both the blog and the admin panel — `main.ts` checks the URL and mounts the appropriate app.

---

## Project Structure

```
├── frontend/src/
│   ├── admin/          # Admin SPA — router, Pinia stores, views
│   ├── components/     # Terminal UI components
│   └── composables/    # useTerminal core logic
├── server/src/routes/  # Express route modules
├── posts/              # Blog posts — Markdown files
├── data/               # Site config and friend links — JSON files
└── public/images/      # Uploaded images
```

No database. Posts are `.md` files with YAML frontmatter. Config and data are `.json` files.

---

## API

Authentication uses JWT. Protected endpoints require a Bearer token — the admin panel attaches it automatically after login.

```
Auth
  POST   /api/auth/login           Log in
  PUT    /api/auth/credentials      Change credentials

Posts
  GET    /api/posts                 List posts
  POST   /api/posts                 Create post
  GET    /api/posts/:id             Get post
  PUT    /api/posts/:id             Update post
  DELETE /api/posts/:id             Delete post

Images
  POST   /api/upload                Upload image (multipart)
  GET    /api/images                List images with usage info
  DELETE /api/images/:filename      Delete image
  POST   /api/images/batch-delete   Batch delete

Friends
  GET    /api/friends               Public friend list
  POST   /api/friends               Add friend
  POST   /api/friends/apply         Submit application
  PUT    /api/friends/:id           Edit or review
  DELETE /api/friends/:id           Remove

Config
  GET    /api/config                Get site config
  PUT    /api/config                Update site config
  POST   /api/config/ascii          Generate ASCII art
```

---

## Tech

Vue 3 / TypeScript / Vite / Pinia / Vue Router / Naive UI / TipTap / Express / gray-matter / multer / JWT / bcryptjs

---

## License

MIT

---

## Credits

Terminal design inspired by [Cveinnt/LiveTerm](https://github.com/Cveinnt/LiveTerm), which is based on [M4TT72/Terminal](https://github.com/m4tt72/terminal).
