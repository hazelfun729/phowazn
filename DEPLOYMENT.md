# Cloudflare Pages 部署指南

## 项目说明

这是一个纯静态前端网站，使用 HTML + CSS + JavaScript 构建，后端使用 Supabase Edge Functions。

## 部署步骤

### 1. 更新 GitHub 仓库

将最新代码推送到 GitHub：

```bash
cd /workspace/projects
git add .
git commit -m "feat: 重构为纯静态前端 + Supabase Edge Functions"
git push origin main
```

### 2. 配置 Cloudflare Pages

1. 登录 Cloudflare Dashboard
2. 进入 Workers & Pages
3. 选择你的项目 `phowa`
4. 进入 Settings > Build & Deploy

### 3. 修改构建配置

由于现在是纯静态站点，需要修改构建配置：

**Build settings:**
- Framework preset: `None`
- Build command: 留空 或 `echo 'Static site'`
- Build output directory: `public`

### 4. 配置环境变量

在 Cloudflare Pages 的 Settings > Environment variables 中添加：

**Production:**
- `SUPABASE_URL`: `https://ekgbhbvbnxgqtnhjhqag.supabase.co`
- `SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZ2JoYnZibnhncXRuaGpocWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzOTg0OTQsImV4cCI6MjEwMTk3NDQ5NH0.0ddEEOIE7sFkWVnM6LhrK-jESoTPQJLXtRu1AW01IGw`

**Preview:**
- 同上

### 5. 重新部署

1. 进入 Deployments 标签
2. 点击最新的部署记录
3. 点击 "Retry deployment"

## Supabase Edge Functions 部署

Edge Functions 需要单独部署到 Supabase：

### 方法 1: 使用 Supabase CLI（推荐）

1. 安装 Supabase CLI:
```bash
npm install -g supabase
```

2. 登录 Supabase:
```bash
supabase login
```

3. 链接项目:
```bash
supabase link --project-ref ekgbhbvbnxgqtnhjhqag
```

4. 部署 Edge Functions:
```bash
supabase functions deploy submit
supabase functions deploy records
supabase functions deploy cleanup
```

### 方法 2: 使用 Supabase Dashboard

1. 登录 Supabase Dashboard
2. 进入项目 `ekgbhbvbnxgqtnhjhqag`
3. 进入 Edge Functions
4. 点击 "New Function"
5. 手动创建 `submit`、`records`、`cleanup` 三个函数
6. 复制对应文件内容到 Dashboard

## 功能说明

### 首页 (/)
- HERO 页面：莲花背景，浅金色文案
- 亡者名单：49 天内往生者名单
- 堕胎婴灵名单：49 天内堕胎婴灵名单
- 旁生名单：49 天内旁生众生名单
- 回向：往生愿文和愿生净土文

### 填写名单 (/submit.html)
- 分步表单：日期 → 分类 → 姓名
- 智能姓名清理：自动去除无效字样
- 去重验证：同一分类同一姓名自动去重
- 提交成功后显示"查看名单"和"继续填写"按钮

### 数据逻辑
- 展示 49 天内的记录
- 按往生日期降序排序
- 同一分类同一姓名自动去重
- 每月 1 日自动清理 90 天前的数据

## 技术栈

- **前端**: HTML5 + CSS3 + Vanilla JavaScript
- **后端**: Supabase Edge Functions (Deno)
- **数据库**: Supabase PostgreSQL
- **部署**: Cloudflare Pages (静态站点)

## 本地预览

```bash
cd /workspace/projects/public
python3 -m http.server 5000
```

然后访问 http://localhost:5000

## 联系方式

如有问题，请联系项目管理员。
