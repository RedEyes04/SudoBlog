# SudoBlog 部署指南

## 环境要求

- Docker

---

## 1. 克隆项目

```bash
git clone https://github.com/RedEyes04/SudoBlog.git
cd SudoBlog
```

## 2. 启动

```bash
docker run -d \
  --name sudoblog \
  -p 3456:3456 \
  -v $(pwd)/posts:/posts \
  -v $(pwd)/data:/data \
  -v $(pwd)/public/images:/public/images \
  -e JWT_SECRET=<生成一个> \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD_HASH=<生成一个> \
  --restart unless-stopped \
  ghcr.io/redeyes04/sudoblog:latest
```

生成密钥和密码哈希：

```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 密码哈希（把 你的密码 换掉）
node -e "console.log(require('bcryptjs').hashSync('你的密码', 10))"
```

## 3. 配置反向代理

Nginx 配置示例（宝塔面板直接在站点设置里改）：

```nginx
server {
    listen 443 ssl;
    server_name 你的域名;

    # SSL 证书略...

    location / {
        proxy_pass http://127.0.0.1:3456;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

重载：

```bash
nginx -s reload
```

---

## 更新部署

```bash
docker pull ghcr.io/redeyes04/sudoblog:latest
docker rm -f sudoblog
# 重新执行第 2 步的 docker run 命令
```

---

## 环境变量

| 变量 | 说明 |
|------|------|
| `JWT_SECRET` | JWT 签名密钥 |
| `ADMIN_USERNAME` | 后台登录用户名 |
| `ADMIN_PASSWORD_HASH` | 密码的 bcrypt 哈希 |

---

## 常见问题

**Q: 容器没启动？**

```bash
docker logs sudoblog
```

**Q: 文章不显示？**

检查 `posts/` 目录是否挂载正确，里面有 `.md` 文件。
