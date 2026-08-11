# Cloudflare Pages 部署指南

## 前置准备

### 1. 注册账号
- 访问 https://cloudflare.com
- 注册免费账号（无需翻墙）

### 2. 准备 GitHub 仓库
- 将代码推送到 GitHub
- 确保仓库包含所有必要文件

---

## 部署步骤

### 第1步：进入 Cloudflare Dashboard
1. 登录 https://dash.cloudflare.com
2. 左侧菜单点击 "Workers & Pages"
3. 点击 "Create" → "Pages"

### 第2步：连接 GitHub
1. 点击 "Connect to Git"
2. 授权 Cloudflare 访问你的 GitHub
3. 选择你的仓库

### 第3步：配置构建设置

| 配置项 | 值 |
|--------|-----|
| **Project name** | phowa-merit（或你喜欢的名字） |
| **Production branch** | main |
| **Framework preset** | Next.js |
| **Build command** | `pnpm install && pnpm next build` |
| **Build output directory** | `.next` |
| **Root directory** | `/`（留空） |

### 第4步：添加环境变量

在 "Environment Variables" 部分添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 Supabase URL | 从 Supabase 控制台获取 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 Supabase Anon Key | 从 Supabase 控制台获取 |
| `SUPABASE_SERVICE_ROLE_KEY` | 你的 Supabase Service Role Key | 从 Supabase 控制台获取 |

**获取 Supabase 密钥的方法**：
1. 登录 https://supabase.com/dashboard
2. 选择你的项目
3. 点击左侧 "Settings" → "API"
4. 复制以下值：
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role secret → `SUPABASE_SERVICE_ROLE_KEY`

### 第5步：部署
1. 点击 "Save and Deploy"
2. 等待构建完成（约2-5分钟）
3. 部署成功后会获得域名：`phowa-merit.pages.dev`

---

## 自定义域名（可选）

### 使用 Cloudflare 域名
1. 在 Cloudflare Dashboard 添加域名
2. 在 Pages 项目设置中绑定域名
3. 自动配置 DNS 和 SSL

### 使用第三方域名
1. 在域名服务商处添加 DNS 记录
2. 在 Cloudflare Pages 设置中添加自定义域名
3. 验证 DNS 配置

---

## 环境变量说明

### 必须配置的环境变量

```env
# Supabase 数据库连接
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 如何获取

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Supabase Dashboard → Settings → API → Project URL

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Supabase Dashboard → Settings → API → anon public key

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Supabase Dashboard → Settings → API → service_role secret
   - ⚠️ 注意：此密钥有完全数据库访问权限，不要泄露

---

## 部署后检查清单

- [ ] 访问生产域名，确认页面正常显示
- [ ] 测试表单提交功能
- [ ] 测试数据查询功能
- [ ] 确认 Supabase 数据正常写入
- [ ] 测试移动端响应式布局
- [ ] 生成新的二维码（使用生产域名）

---

## 常见问题

### Q: 构建失败怎么办？
A: 检查构建日志，通常是环境变量缺失或依赖安装问题

### Q: 页面显示空白？
A: 检查浏览器控制台错误，通常是环境变量配置错误

### Q: 表单提交失败？
A: 检查 Supabase 密钥是否正确，RLS 策略是否启用

### Q: 如何更新代码？
A: 推送代码到 GitHub，Cloudflare Pages 会自动重新部署

---

## 更新部署

每次推送代码到 GitHub 的 main 分支，Cloudflare Pages 会自动：
1. 拉取最新代码
2. 执行构建命令
3. 部署新版本
4. 保持旧版本可回滚

---

## 费用说明

**Cloudflare Pages 免费额度**：
- ✅ 无限站点
- ✅ 无限请求
- ✅ 无限带宽
- ✅ 500 次构建/月
- ✅ 自定义域名

对于你的项目，免费额度完全够用。
