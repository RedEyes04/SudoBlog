<p align="right">
  <sub>
    <a href="README_EN.md">English</a> | <b>中文</b>
  </sub>
</p>

<p align="center">
  <img width="300" alt="sudoblog-logo" src="https://github.com/user-attachments/assets/a069d4c0-efeb-49e8-99be-246bed26b308" />
</p>

终端风格的个人博客系统，带后台管理面板。访客通过命令浏览内容，后台提供可视化编辑器、图片管理和友链审核。

Vue 3 + Express，无数据库 —— 文章存 Markdown，配置存 JSON。设计灵感来自 [LiveTerm](https://github.com/Cveinnt/LiveTerm)。

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

## 访客端命令

| 命令 | 说明 |
|------|------|
| `help` | 显示所有可用命令 |
| `ls` | 列出当前目录内容（根目录显示 posts/、about.md、friends.md） |
| `cd posts` | 进入文章目录，浏览文章列表 |
| `cd ..` | 返回上一级目录 |
| `vim <slug>` | 通过文章别名打开文章 |
| `vim about.md` | 查看关于页面 |
| `vim friends.md` | 查看友链页面 |
| `:wq` | 退出文章/关于/友链，返回上级 |
| `clear` | 清屏（Ctrl+L 同样生效） |
| `banner` | 重新显示欢迎横幅 |
| `whoami` | 显示当前用户名 |
| `date` | 显示当前时间 |
| `echo <text>` | 输出一段文本 |
| `admin` | 跳转到后台管理（命令可在配置中修改） |

支持 Tab 补全和上下箭头翻阅历史命令，带打字机逐字渲染效果。

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

- 文章编辑器 —— TipTap 所见即所得，支持拖拽上传图片、粘贴 Markdown
- 图片管理 —— 网格预览、按文章/草稿/未使用分类、批量删除
- 友链管理 —— 添加友链、审核申请（通过/拒绝）
- 站点设置 —— 修改标题、ASCII Banner、管理员密码

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
npx tsx src/generate-hash.ts <你的密码>   # 把输出贴到 .env 的 ADMIN_PASSWORD_HASH
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

同一个 Vue 应用同时服务博客和后台 —— `main.ts` 根据 URL 挂载对应应用。

---

## 构建部署

```bash
# 构建前端
cd frontend
npm run build        # 输出到 frontend/dist/

# 构建产物结构：
# frontend/dist/
#   ├── index.html          # 博客入口
#   ├── admin/index.html    # 后台入口
#   ├── images/             # 静态图片
#   └── assets/             # JS/CSS 资源
```

生产环境需要：
1. 前端静态文件交给 Nginx 或 CDN
2. 后端用 PM2 或 systemd 守护运行
3. Nginx 将 `/api` 和 `/images` 反向代理到后端 `localhost:3456`
4. Nginx 将 `/admin` 路径指向 `dist/admin/index.html`

---

## 项目结构

```
├── frontend/src/
│   ├── admin/          # 后台 SPA — 路由、Pinia store、页面
│   ├── components/     # 前台终端组件
│   └── composables/    # useTerminal 核心逻辑
├── server/src/routes/  # Express 路由
├── posts/              # 文章 — Markdown
├── data/               # 配置和友链 — JSON
└── public/images/      # 上传的图片
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
POST   /api/images/batch-delete   批量删除
GET    /api/friends               友链列表
POST   /api/friends               添加友链
POST   /api/friends/apply         申请友链
PUT    /api/friends/:id           审核
DELETE /api/friends/:id           删除
GET    /api/config                站点配置
PUT    /api/config                更新配置
POST   /api/config/ascii          生成 ASCII 字
```

---

## 技术栈

Vue 3 / TypeScript / Vite / Pinia / Vue Router / Naive UI / TipTap / Express / gray-matter / multer / JWT / bcryptjs

---

MIT

---

致谢：终端设计灵感来自 [Cveinnt/LiveTerm](https://github.com/Cveinnt/LiveTerm)，后者基于 [M4TT72/Terminal](https://github.com/m4tt72/terminal)。
