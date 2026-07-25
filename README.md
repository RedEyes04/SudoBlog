<img src="public/images/sudoblog-logo.png" alt="SudoBlog" width="100%" />

# SudoBlog

> 一个命令行终端风格的个人博客系统，灵感来自 `sudo` 命令。  
> 在浏览器里打开一个 Terminal，输入命令来浏览文章、查看友链、了解作者。

---

## ✨ 特性

- **终端交互体验** — 命令输入、打字机效果、history 回溯，像真正的终端一样操作
- **双模式单应用** — 前台博客 + 后台管理共用一套前端代码，根据 URL 自动切换
- **所见即所得编辑器** — 基于 TipTap 的富文本编辑器，支持 Markdown 粘贴、拖拽上传图片
- **图片管理中心** — 上传、预览、复制 URL、批量删除，按文章/草稿/未使用分类筛选
- **友链系统** — 支持友链申请 → 审核 → 展示的完整流程
- **ASCII 艺术** — 后台内置 ASCII 文字生成器，自定义终端 Banner
- **文件型数据库** — 文章存储为 Markdown 文件，配置和数据用 JSON，零依赖数据库

---

## 🏗️ 项目结构

```
SudoBlog/
├── frontend/               # Vue 3 + Vite（前台 + 后台）
│   └── src/
│       ├── main.ts         # 入口：根据 URL 挂载前台或后台
│       ├── App.vue         # 前台根组件
│       ├── components/     # 终端 UI 组件（命令行、文章渲染等）
│       ├── composables/    # useTerminal（核心终端逻辑）
│       ├── data/           # 构建时从 /data 和 /posts 同步的数据
│       ├── types/          # TypeScript 类型定义
│       └── admin/          # 后台管理 SPA
│           ├── AdminApp.vue
│           ├── mount.ts    # 后台应用挂载入口
│           ├── api/        # Axios 实例 + 拦截器
│           ├── router/     # Vue Router + 登录守卫
│           ├── stores/     # Pinia Store（auth / posts / config / friends / images）
│           ├── components/ # AdminLayout（侧边栏 + 顶栏）
│           └── views/      # 页面：Dashboard / Editor / Posts / Images / Friends / Settings
├── server/                 # Express API 服务
│   └── src/
│       ├── index.ts        # 应用入口 + 路由注册
│       ├── middleware/      # JWT 认证中间件
│       ├── routes/          # 路由模块
│       │   ├── auth.ts      # 登录 / 修改密码
│       │   ├── posts.ts     # 文章 CRUD
│       │   ├── upload.ts    # 图片上传（multer）
│       │   ├── images.ts    # 图片管理（列表 / 删除 / 批量删除）
│       │   ├── friends.ts   # 友链 + 申请审核
│       │   └── config.ts    # 站点配置 / ASCII 生成
│       └── utils/           # slugify 等工具
├── posts/                  # Markdown 文章（.md + YAML frontmatter）
├── data/                   # JSON 数据文件（站点配置、友链）
├── public/images/          # 上传的图片
└── package.json            # 根 workspace 脚本
```

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18
- **npm** >= 9

### 1. 启动后端

```bash
cd server
cp .env.example .env

# 生成密码哈希（替换 <your-password>）
npx tsx src/generate-hash.ts <your-password>

# 编辑 .env 填入哈希值和随机 JWT_SECRET
# PORT=3456
# JWT_SECRET=<随机字符串>
# ADMIN_USERNAME=admin
# ADMIN_PASSWORD_HASH=<上一步的输出>
# POSTS_DIR=../posts

npm install
npm run dev
```

后端运行在 `http://localhost:3456`。

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端运行在 `http://localhost:5173`。

### 3. 访问

| 地址 | 页面 |
|------|------|
| `http://localhost:5173` | 前台终端博客 |
| `http://localhost:5173/admin` | 后台管理登录 |
| `http://localhost:3456/api/health` | 后端健康检查 |

默认管理员用户名：`admin`

---

## 🔧 根目录快捷命令

```bash
npm run dev          # 启动前端
npm run dev:server   # 启动后端
npm run build        # 构建前端（用于部署）
```

---

## 📡 API 接口

### 认证

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| `POST` | `/api/auth/login` | ❌ | 登录，返回 JWT |
| `PUT` | `/api/auth/credentials` | ✅ | 修改管理员用户名/密码 |

### 文章

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| `GET` | `/api/posts` | ❌ | 文章列表（元数据） |
| `GET` | `/api/posts/:id` | ❌ | 文章详情（含正文） |
| `POST` | `/api/posts` | ✅ | 创建文章 |
| `PUT` | `/api/posts/:id` | ✅ | 更新文章 |
| `DELETE` | `/api/posts/:id` | ✅ | 删除文章 |

### 图片

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| `POST` | `/api/upload` | ✅ | 上传图片 |
| `GET` | `/api/images` | ✅ | 图片列表（含使用情况） |
| `DELETE` | `/api/images/:filename` | ✅ | 删除单张图片 |
| `POST` | `/api/images/batch-delete` | ✅ | 批量删除图片 |
| `GET` | `/images/*` | ❌ | 静态文件服务 |

### 友链

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| `GET` | `/api/friends` | ❌ | 已通过友链列表 |
| `GET` | `/api/friends/applications` | ✅ | 全部友链（含待审核） |
| `POST` | `/api/friends` | ✅ | 手动添加友链 |
| `POST` | `/api/friends/apply` | ❌ | 提交友链申请 |
| `PUT` | `/api/friends/:id` | ✅ | 编辑 / 审核（通过/拒绝） |
| `DELETE` | `/api/friends/:id` | ✅ | 删除友链 |

### 配置

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| `GET` | `/api/config` | ❌ | 获取站点配置 |
| `PUT` | `/api/config` | ✅ | 更新站点配置 |
| `POST` | `/api/config/ascii` | ✅ | 生成 ASCII 艺术字 |

---

## 📝 文章格式

文章存储在 `posts/` 目录下，Markdown + YAML frontmatter：

```yaml
---
title: 我的第一篇文章
date: 2026-07-25
subtitle: 可选副标题
summary: 一句话摘要
tags:
  - Vue
  - TypeScript
cover: /images/my-cover.jpg
status: publish    # publish | draft
---

## 正文内容（HTML，由 TipTap 编辑器生成）
```

---

## 🛠️ 技术栈

| 层 | 技术 |
|-----|------|
| 前台 | Vue 3, TypeScript, Vite 6, Composables |
| 后台管理 | Vue 3, Pinia, Vue Router, Naive UI, TipTap |
| 后端 | Express 4, JWT, bcryptjs, multer, gray-matter, figlet |
| 数据 | Markdown 文件 + JSON 文件 |
