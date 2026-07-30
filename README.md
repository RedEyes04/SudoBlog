<p align="right">
  <sub>
    <a href="README_EN.md">English</a> | <b>中文</b>
  </sub>
</p>

<p align="center">
  <img width="3018" height="1494" alt="PixPin_2026-07-25_16-50-07" src="https://github.com/user-attachments/assets/6bfb1eed-79b1-464e-8741-301466584d78" />
</p>

终端风格的个人博客系统，带后台管理面板。访客通过命令浏览内容，后台提供可视化编辑器、图片管理和友链审核。

Vue 3 + Express，无数据库 —— 文章存 Markdown，配置存 JSON。设计灵感来自 [LiveTerm](https://github.com/Cveinnt/LiveTerm)。

---

## 展示

<details open>
<summary><b>访客端 — 终端博客</b></summary>
<br />
<img width="3018" height="1494" alt="PixPin_2026-07-25_16-50-07" src="https://github.com/user-attachments/assets/6bfb1eed-79b1-464e-8741-301466584d78" />
</details>

<details>
<summary><b>后台管理</b></summary>
<br />
<img alt="admin" src="https://github.com/user-attachments/assets/911d1342-fe8e-4bb5-b330-11cfac2c0f35" />
</details>

---

## 访客端命令

| 命令 | 说明 |
|------|------|
| `help` | 显示所有可用命令 |
| `ls` | 列出当前目录内容（根目录显示 posts/、about.md、friends.md） |
| `cd posts` | 进入文章目录，浏览文章列表 |
| `cd ..` | 返回上一级目录 |
| `vim <slug>` | 通过文章 slug 打开文章（如 `vim 01-getting-started-vue3`） |
| `vim <编号>` | 通过列表编号打开文章（如 `vim 1` 打开第一篇） |
| `vim about.md` | 查看关于页面 |
| `vim friends.md` | 查看友链页面 |
| `:wq` | 退出文章/关于/友链，返回上级 |
| `clear` | 清屏（Ctrl+L 同样生效） |
| `banner` | 重新显示欢迎横幅 |
| `whoami` | 显示当前用户名 |
| `date` | 显示当前时间 |
| `echo <text>` | 输出一段文本 |
| `admin` | 跳转到后台管理（命令可在配置中修改） |

支持 Tab 补全和上下箭头翻阅历史命令，带打字机逐字渲染效果。置顶文章在列表右侧显示 ⭐️ 图标。

### 进入后台

在终端中输入 `admin`（默认，可在 `data/config.json` 中修改），系统会跳转到后台登录页。登录成功后进入管理面板。

```json
// data/config.json
{
  "admin": {
    "path": "/admin",      // 后台路径
    "command": "admin"     // 触发命令
  }
}
```

---

## 后台功能

- **仪表盘** — 文章数量统计、最近文章一览
- **文章编辑器** — TipTap 所见即所得，拖拽上传图片、粘贴 Markdown、文章置顶
- **文章管理** — 列表管理、置顶/取消置顶（⭐️），前端自动置顶优先排序
- **图片管理** — 网格预览、按文章/草稿/未使用分类、批量删除、一键清理未使用图片
- **友链管理** — 添加/编辑友链，审核申请（通过/拒绝），侧边栏待处理气泡提醒
- **邮件通知** — 新友链申请自动邮件通知，SMTP 服务器可配置
- **系统设置** — 站点标题、主机名、邮件服务器、管理员凭据、后台访问路径
- **主题设置** — ASCII 横幅编辑器、个人信息、Twikoo 评论地址

全部配置通过后台界面修改，自动持久化到 `data/config.json`。

---

## 快速开始

需要 Node.js 18+。

```bash
git clone https://github.com/REDEYES/SudoBlog.git
cd SudoBlog

# 后端
cd server
cp .env.example .env                      # 复制环境变量模板
npm install
npx tsx src/generate-hash.ts <你的密码>    # 生成密码哈希，贴到 .env 的 ADMIN_PASSWORD_HASH
npm run dev                                 # localhost:3456

# 前端（另开终端）
cd frontend
npm install
npm run dev                                 # localhost:5173
```

| | 地址 |
|------|------|
| 博客前台 | `http://localhost:5173` |
| 后台管理 | `http://localhost:5173/admin`（或终端内输入 `admin`） |

同一个 Vue 应用同时服务博客和后台 —— `main.ts` 根据 URL 挂载对应应用。首次登录后可前往「系统设置」修改管理员用户名和密码。

---

## 构建部署

### 本地构建

```bash
# 构建前端
cd frontend
npm run build        # 输出到 frontend/dist/
```

### Docker 部署

```bash
docker build -t sudoblog .
docker run -d -p 3456:3456 \
  -v $(pwd)/posts:/app/posts \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/public/images:/app/public/images \
  sudoblog
```

或用 docker-compose：

```bash
docker compose up -d
```

服务运行在 `http://localhost:3456`，后端同时提供 API 和静态文件服务。

### Nginx 反向代理

如需 Nginx 前置，将 `/api` 和 `/images` 代理到后端 `localhost:3456`。

---

## 项目结构

```
├── frontend/src/
│   ├── admin/
│   │   ├── router/         # 后台路由 + 导航守卫
│   │   ├── stores/         # Pinia — auth, posts, friends, images, config
│   │   └── views/          # Dashboard, PostsList, Editor, Friends,
│   │                       # Applications, Images, Settings, ThemeSettings
│   ├── components/output/  # 终端组件 — PostDetail, AboutView, PostsList,
│   │                       # FriendsList, WelcomeBanner, HelpOutput
│   ├── composables/        # useTerminal — 命令解析、Tab 补全、历史记录
│   └── data/               # 前台 API 加载器 — config, posts, friends
├── server/src/
│   ├── routes/             # Express API — auth, posts, config, friends, images, upload
│   └── middleware/         # JWT 认证中间件
├── posts/                  # 文章源文件 — Markdown + YAML frontmatter
├── data/                   # 运行时数据 — config.json, credentials.json, friends.json
└── public/images/          # 上传的图片
```

---

## API

认证使用 JWT。需登录的接口带 Bearer token。

```
POST   /api/auth/login           登录
PUT    /api/auth/credentials      修改密码
GET    /api/posts                 文章列表
POST   /api/posts                 创建文章
GET    /api/posts/:id             文章详情
PUT    /api/posts/:id             更新文章
DELETE /api/posts/:id             删除文章
POST   /api/upload                上传图片
GET    /api/images                图片列表（含使用情况）
DELETE /api/images/:filename      删除图片
POST   /api/images/batch-delete   批量删除图片
POST   /api/images/cleanup-unused 清理未使用图片
GET    /api/friends               友链列表（公开）
POST   /api/friends               添加友链
POST   /api/friends/apply         申请友链（公开）
POST   /api/friends/test-mail     测试邮件发送
PUT    /api/friends/:id           审核/更新友链
DELETE /api/friends/:id           删除友链
GET    /api/config                站点配置（公开）
PUT    /api/config                更新配置
POST   /api/config/ascii          生成 ASCII 字
```

---

## 技术栈

Vue 3 / TypeScript / Vite / Pinia / Vue Router / Naive UI / TipTap / Express / gray-matter / multer / nodemailer / figlet / JWT / bcryptjs

---

---

## 文章格式

文章存储在 `posts/` 目录，使用 Markdown + YAML frontmatter：

```markdown
---
title: 文章标题
date: 2026-07-30
status: publish
tags: [Vue, TypeScript]
cover: /images/cover.jpg
subtitle: 副标题
summary: 摘要
pinned: true
---

文章正文...
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string | 文章标题（必填） |
| `date` | string | 发布日期 `YYYY-MM-DD` |
| `status` | string | `publish`（发布）/ `draft`（草稿） |
| `tags` | string[] | 标签列表 |
| `cover` | string | 封面图片路径 |
| `subtitle` | string | 副标题 |
| `summary` | string | 文章摘要 |
| `pinned` | boolean | 置顶：`true` 置顶，列表优先显示 ⭐️ |

---

MIT

---

致谢：终端设计灵感来自 [Cveinnt/LiveTerm](https://github.com/Cveinnt/LiveTerm)，后者基于 [M4TT72/Terminal](https://github.com/m4tt72/terminal)。
