<p align="center">
  <img width="300" alt="sudoblog-logo" src="https://github.com/user-attachments/assets/a069d4c0-efeb-49e8-99be-246bed26b308" />
</p>

<p align="center">
  <img alt="GitHub License" src="https://img.shields.io/github/license/REDEYES/SudoBlog?style=flat&color=6366f1" />
  <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/REDEYES/SudoBlog?style=flat&color=f59e0b" />
  <br />
  <strong>一个在浏览器里运行的终端风格博客系统</strong><br />
  输入命令来浏览文章、查看友链、了解作者。
</p>

---

## 📸 预览

<details open>
<summary><b>访客端</b> — 命令行交互式博客</summary>
<br />
<img alt="访客端截图" src="https://github.com/user-attachments/assets/6669b80b-cc2f-49ac-94c8-74bba7c1c42f" />
</details>

<details>
<summary><b>后台管理</b> — 可视化内容管理</summary>
<br />
<img alt="后台端截图" src="https://github.com/user-attachments/assets/911d1342-fe8e-4bb5-b330-11cfac2c0f35" />
</details>

---

## 💡 为什么做这个

传统的博客系统千篇一律——列表页、详情页、侧边栏。SudoBlog 用终端模拟器的方式重新思考了个人博客：访客像操作命令行一样输入 `ls`、`cat`、`help` 来探索内容，打字机效果逐字渲染，就像在真实的终端里和作者对话。

后台管理也保持了克制的设计——没有臃肿的 CMS，没有数据库，文章用 Markdown 文件存储，图片拖拽上传，所见即所得编辑，开箱即用。

---

## ✨ 特性

<table>
<tr>
<td width="50%">

**🖥️ 终端交互**
- 命令解析 + 自动补全
- 打字机逐字渲染
- Tab 切换、history 回溯
- `ls` `cat` `about` `friends` `clear` `help`

**✍️ 文章编辑**
- TipTap 所见即所得
- Markdown 粘贴自动转换
- 拖拽 / 粘贴上传图片
- 封面图 + 标签 + 摘要

</td>
<td width="50%">

**🖼️ 图片管理**
- 网格预览 + 放大查看
- 一键复制 URL
- 按「文章 / 草稿 / 未使用」分类
- 批量选择和删除

**🔗 友链系统**
- 公开申请 → 后台审核
- 头像 + 描述 + 缩略图
- 通过 / 拒绝 / 删除

</td>
</tr>
</table>

---

## 🚀 快速开始

> 需要 Node.js ≥ 18

```bash
# 1. 克隆项目
git clone https://github.com/REDEYES/SudoBlog.git
cd SudoBlog

# 2. 启动后端
cd server
cp .env.example .env
npm install
npx tsx src/generate-hash.ts <你的密码>   # 复制哈希到 .env 的 ADMIN_PASSWORD_HASH
npm run dev                                # → http://localhost:3456

# 3. 启动前端（新终端窗口）
cd frontend
npm install
npm run dev                                # → http://localhost:5173
```

| 入口 | 地址 |
|------|------|
| 前台博客 | `http://localhost:5173` |
| 后台管理 | `http://localhost:5173/admin` |

---

## 🏗️ 架构

```
Sudoblog/
├── frontend/src/
│   ├── admin/           # 后台 SPA（Vue Router + Pinia + Naive UI）
│   │   ├── views/       # Login / Dashboard / Editor / Posts / Images / Friends / Settings
│   │   ├── stores/      # auth / posts / config / friends / images
│   │   └── router/      # 路由 + JWT 登录守卫
│   ├── components/      # 终端 UI 组件（命令行、文章渲染）
│   └── composables/     # useTerminal 核心逻辑
├── server/src/
│   ├── routes/           # auth / posts / upload / images / friends / config
│   └── middleware/       # JWT 认证
├── posts/                # 📝 Markdown 文章
├── data/                 # 📋 JSON 配置
└── public/images/        # 🖼️ 上传图片
```

**核心思路**：同一个 Vue 应用，`main.ts` 根据 URL 判断挂载前台还是后台，共用一套依赖和构建流程。没有数据库——文章是 `.md` 文件，配置是 `.json` 文件。

---

## 📡 API

| 分类 | 端点 | 方法 | 说明 |
|------|------|------|------|
| 🔐 认证 | `/api/auth/login` | POST | 登录 |
| | `/api/auth/credentials` | PUT | 修改密码 |
| 📝 文章 | `/api/posts` | GET / POST | 列表 / 创建 |
| | `/api/posts/:id` | GET / PUT / DELETE | 详情 / 更新 / 删除 |
| 🖼️ 图片 | `/api/upload` | POST | 上传 |
| | `/api/images` | GET | 列表（含使用情况） |
| | `/api/images/:filename` | DELETE | 删除单张 |
| | `/api/images/batch-delete` | POST | 批量删除 |
| 🔗 友链 | `/api/friends` | GET / POST | 列表 / 添加 |
| | `/api/friends/apply` | POST | 公开申请 |
| | `/api/friends/:id` | PUT / DELETE | 审核 / 删除 |
| ⚙️ 配置 | `/api/config` | GET / PUT | 站点配置 |
| | `/api/config/ascii` | POST | ASCII 艺术生成 |

---

## 🛠️ 技术栈

| 层 | 选型 |
|------|------|
| 前端框架 | Vue 3 + TypeScript |
| 构建工具 | Vite 6 |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| UI 组件 | Naive UI |
| 富文本编辑 | TipTap (ProseMirror) |
| 后端框架 | Express 4 |
| 认证 | JWT + bcryptjs |
| 文件上传 | multer |
| Markdown | gray-matter |
| 数据存储 | 文件系统（.md + .json） |

---

## 📄 License

MIT
