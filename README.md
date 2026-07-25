<p align="center">
  <img width="300" alt="sudoblog-logo" src="https://github.com/user-attachments/assets/a069d4c0-efeb-49e8-99be-246bed26b308" />
</p>

<p align="center">
  一个在浏览器里跑的终端风格博客。
</p>

---

## 截图

<details open>
<summary>访客端</summary>
<br />
<img alt="访客端截图" src="https://github.com/user-attachments/assets/6669b80b-cc2f-49ac-94c8-74bba7c1c42f" />
</details>

<details>
<summary>后台管理</summary>
<br />
<img alt="后台端截图" src="https://github.com/user-attachments/assets/911d1342-fe8e-4bb5-b330-11cfac2c0f35" />
</details>

---

## 这是什么

访客打开页面看到的是一个终端模拟器，输入 `ls` 列出文章，`cat` 读内容，`about` 看作者介绍，`friends` 看友链。打字机效果逐字输出，Tab 补全、上下键翻历史记录都有。

后台就是一个管理面板，写文章（TipTap 编辑器，图片拖进去自动上传）、管图片（按文章/草稿/未使用分类，批量删）、审核友链申请、改站点设置。

没有数据库，文章存 Markdown 文件，配置存 JSON。部署就是把文件扔服务器上。

---

## 跑起来

需要 Node.js 18+。

```bash
git clone https://github.com/REDEYES/SudoBlog.git
cd SudoBlog

# 后端
cd server && cp .env.example .env && npm install
npx tsx src/generate-hash.ts 你的密码   # 把输出填进 .env 的 ADMIN_PASSWORD_HASH
npm run dev                              # localhost:3456

# 前端，另开一个终端
cd frontend && npm install && npm run dev # localhost:5173
```

- 前台 `localhost:5173`
- 后台 `localhost:5173/admin`

---

## 项目结构

```
├── frontend/src/
│   ├── admin/          # 后台 SPA，路由、store、页面全在这
│   ├── components/     # 前台终端组件
│   └── composables/    # useTerminal，核心交互
├── server/src/routes/  # Express 路由，按模块拆的
├── posts/              # 文章，.md 文件
├── data/               # 站点配置、友链，JSON
└── public/images/      # 上传的图片
```

前台和后台是同一个 Vue 应用，`main.ts` 根据 URL 决定挂载哪个。目的就是少一个构建步骤。

---

## API

需要登录的接口带 JWT，登录后前端自动在请求头带 token。

```
POST   /api/auth/login          登录
PUT    /api/auth/credentials     改密码

GET    /api/posts                文章列表
POST   /api/posts                写文章
GET    /api/posts/:id            看文章
PUT    /api/posts/:id            改文章
DELETE /api/posts/:id            删文章

POST   /api/upload               上传图片
GET    /api/images               图片列表（带使用情况）
DELETE /api/images/:filename     删图片
POST   /api/images/batch-delete  批量删

GET    /api/friends              友链
POST   /api/friends              加友链
POST   /api/friends/apply        申请友链
PUT    /api/friends/:id          审核
DELETE /api/friends/:id          删友链

GET    /api/config               站点配置
PUT    /api/config               改配置
POST   /api/config/ascii         生成 ASCII 字
```

---

## 用了什么

Vue 3 / TypeScript / Vite / Pinia / Vue Router / Naive UI / TipTap / Express / gray-matter / multer / JWT

---

MIT
