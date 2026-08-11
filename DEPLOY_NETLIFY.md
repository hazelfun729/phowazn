# Netlify 部署指南

## 前置准备

1. **GitHub 仓库**：将代码推送到 GitHub
2. **Netlify 账号**：在 https://netlify.com 注册
3. **Supabase 凭证**：从 Supabase 控制台获取

---

## 部署步骤

### 1. 推送代码到 GitHub

```bash
cd /workspace/projects
git add .
git commit -m "feat: 准备部署到 Netlify"
git push origin main
```

### 2. 在 Netlify 创建站点

1. 登录 Netlify 控制台
2. 点击 **"Add new site"** → **"Import an existing project"**
3. 选择 **GitHub** 并授权
4. 选择你的仓库

### 3. 配置构建设置

| 设置项 | 值 |
|--------|-----|
| **Build command** | `pnpm run build` |
| **Publish directory** | `.next` |
| **Node version** | `20` |

### 4. 添加环境变量

在 Netlify 控制台 → **Site settings** → **Environment variables** 添加：

| 变量名 | 说明 | 获取方式 |
|--------|------|---------|
| `COZE_SUPABASE_URL` | Supabase 项目 URL | Supabase 控制台 → Settings → API |
| `COZE_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | 同上 |
| `COZE_SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥 | 同上（仅服务端使用） |

### 5. 部署

点击 **"Deploy site"**，等待构建完成（约 2-5 分钟）。

---

## 获取 Supabase 凭证

1. 登录 [Supabase 控制台](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧 **Settings** → **API**
4. 复制以下信息：
   - **Project URL** → `COZE_SUPABASE_URL`
   - **anon public key** → `COZE_SUPABASE_ANON_KEY`
   - **service_role key** → `COZE_SUPABASE_SERVICE_ROLE_KEY`（点击 "Reveal" 显示）

---

## 自定义域名（可选）

1. 在 Netlify 控制台 → **Domain settings**
2. 点击 **"Add custom domain"**
3. 输入你的域名（如 `phowa.org`）
4. 按提示配置 DNS 记录

---

## 注意事项

### 国内访问优化

Netlify 在国内访问速度较慢（3-8秒），可考虑：

1. **使用 CDN**：如 Cloudflare CDN 加速
2. **自定义域名**：使用国内可访问的域名
3. **预渲染**：启用 Next.js 静态导出（需改代码）

### 环境变量安全

- **不要**将 `.env.local` 提交到 Git
- **不要**在客户端代码中使用 `SERVICE_ROLE_KEY`
- **仅**在服务端 API Routes 中使用 `SERVICE_ROLE_KEY`

---

## 故障排查

### 构建失败

检查 Netlify 构建日志，常见原因：
- 依赖安装失败 → 检查 `package.json`
- 环境变量缺失 → 检查是否配置完整
- TypeScript 错误 → 运行 `pnpm ts-check` 本地验证

### 运行时错误

- 检查 Netlify 函数日志（Functions → Logs）
- 确认 Supabase 凭证正确
- 确认数据库表已创建

---

## 部署后验证

1. 访问 `https://你的站点.netlify.app`
2. 测试首页加载
3. 测试 `/submit` 表单提交
4. 测试数据展示
5. 测试管理页面 `/admin`

---

## 自动部署

每次推送到 `main` 分支时，Netlify 会自动重新部署。

如需手动触发：
- Netlify 控制台 → **Deploys** → **Trigger deploy**
