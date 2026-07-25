<p align="right">
  <sub>
    <a href="README_EN.md">English</a> | <b>中文</b>
  </sub>
</p>

<p align="center">
  <img width="300" alt="sudoblog-logo" src="https://github.com/user-attachments/assets/a069d4c0-efeb-49e8-99be-246bed26b308" />
</p>

终端风格的个人博客系统，带后台管理面板。访客通过输入 `ls`、`cat` 等命令浏览文章，后台提供可视化编辑器、图片管理和友链审核。

Vue 3 + Express 构建。无数据库 —— 文章是 Markdown 文件，配置是 JSON。

设计灵感来自 [LiveTerm](https://github.com/Cveinnt/LiveTerm)。

---

## 展示

<details open>
<summary><b>访客端 — 终端博客</b></summary>
<br />
<img alt="visitor" src="https://github.com/user-attachments/assets/6669b80b-cc2f-49ac-94c8-74bba7c1c42f" />
</details>

<details>
<summary><b>后台管理</b></summary>
<br />
<img alt="admin" src="https://github.com/user-attachments/assets/911d1342-fe8e-4bb5-b330-11cfac2c0f35" />
</details>

---

## 功能

**访客端**

| 命令 | 说明 |
|---------|-------------|
| `ls` | 查看文章列表 |
| `cat <slug>` | 阅读文章 |
| `about` | 关于页面 |
| `friends` | 友链列表 |
| `help` / `clear` / `whoami` | 工具命令 |

终端特性：打字机效果、Tab 补全、上下箭头翻阅历史命令。

**后台管理**

- 基于 TipTap 的富文本编辑器，支持拖拽上传图片、粘贴 Markdown
- 图片管理 —— 网格预览、按文章/草稿/未使用分类、批量删除
- 友链系统 —— 公开申请表单、后台审核通过或拒绝
- 站点设置 —— 修改站点标题、ASCII Banner、管理员密码

---

## 快速开始

需要 Node.js 18+。

```bash
git clone https://github.com/REDEYES/SudoBlog.git
cd SudoBlog

# 后端
cd server
cp .env.example .env
npm install
npx tsx src/generate-hash.ts <你的密码>   # 把输出粘贴到 .env 的 ADMIN_PASSWORD_HASH
npm run dev                                 # localhost:3456

# 前端（另开终端）
cd frontend
npm install
npm run dev                                 # localhost:5173
```

| | 地址 |
|------|------|
| 博客前台 | `http://localhost:5173` |
| 后台管理 | `http://localhost:5173/admin` |

同一个 Vue 应用同时服务博客和后台 —— `main.ts` 根据 URL 判断挂载哪个应用。

---

## 项目结构

```
├── frontend/src/
│   ├── admin/          # 后台 SPA — 路由、Pinia store、页面
│   ├── components/     # 终端 UI 组件
│   └── composables/    # useTerminal 核心逻辑
├── server/src/routes/  # Express 路由模块
├── posts/              # 博客文章 — Markdown 文件
├── data/               # 站点配置和友链 — JSON 文件
└── public/images/      # 上传的图片
```

没有数据库。文章是带 YAML frontmatter 的 `.md` 文件，配置和数据是 `.json`。

---

## API

认证使用 JWT。需要登录的接口在请求头带 Bearer token，后台登录后自动处理。

```
Auth
  POST   /api/auth/login           登录
  PUT    /api/auth/credentials      修改密码

Posts
  GET    /api/posts                 文章列表
  POST   /api/posts                 创建文章
  GET    /api/posts/:id             查看文章
  PUT    /api/posts/:id             更新文章
  DELETE /api/posts/:id             删除文章

Images
  POST   /api/upload                上传图片（multipart）
  GET    /api/images                图片列表（含使用情况）
  DELETE /api/images/:filename      删除图片
  POST   /api/images/batch-delete   批量删除

Friends
  GET    /api/friends               公开友链列表
  POST   /api/friends               添加友链
  POST   /api/friends/apply         提交申请
  PUT    /api/friends/:id           编辑或审核
  DELETE /api/friends/:id           删除

Config
  GET    /api/config                获取站点配置
  PUT    /api/config                更新站点配置
  POST   /api/config/ascii          生成 ASCII 艺术字
```

---

## 技术栈

Vue 3 / TypeScript / Vite / Pinia / Vue Router / Naive UI / TipTap / Express / gray-matter / multer / JWT / bcryptjs

---

## License

MIT

---

## 致谢

终端设计灵感来自 [Cveinnt/LiveTerm](https://github.com/Cveinnt/LiveTerm)，后者基于 [M4TT72/Terminal](https://github.com/m4tt72/terminal)。
