# 部署步骤

## 第一步：修改 Cloudflare Pages 构建配置

1. 登录 Cloudflare Dashboard
2. 进入 Workers & Pages
3. 选择项目 `phowa`
4. 进入 Settings > Build & Deploy

### 修改构建设置：

**Build settings:**
- Framework preset: 选择 `None`
- Build command: 留空（或填写 `echo 'Static site'`）
- Build output directory: `public`

点击 "Save"

## 第二步：重新部署

1. 进入 Deployments 标签
2. 找到最新的部署（应该显示刚才推送的代码）
3. 点击 "Retry deployment" 或等待自动部署

## 第三步：验证网站

部署完成后，访问 https://phowa.pages.dev

应该能看到：
- 首页：莲花背景，浅金色文案
- 导航栏：右上角有"填写名单"链接
- 四个数据板块：亡者、堕胎婴灵、旁生、回向
- 底部：版权信息和数据更新时间

## 第四步：部署 Supabase Edge Functions

### 方法 1: 使用 Supabase CLI（推荐）

在终端执行：

```bash
# 1. 安装 Supabase CLI
npm install -g supabase

# 2. 登录 Supabase
supabase login

# 3. 链接项目
supabase link --project-ref ekgbhbvbnxgqtnhjhqag

# 4. 部署三个 Edge Functions
supabase functions deploy submit
supabase functions deploy records
supabase functions deploy cleanup
```

### 方法 2: 使用 Supabase Dashboard

1. 登录 Supabase Dashboard
2. 进入项目：https://supabase.com/dashboard/project/ekgbhbvbnxgqtnhjhqag
3. 点击左侧菜单 "Edge Functions"
4. 点击 "New Function"

#### 创建 submit 函数：
- 函数名：`submit`
- 复制 `/workspace/projects/supabase/functions/submit/index.ts` 的内容
- 粘贴到 Dashboard 的代码编辑器
- 点击 "Deploy"

#### 创建 records 函数：
- 函数名：`records`
- 复制 `/workspace/projects/supabase/functions/records/index.ts` 的内容
- 粘贴到 Dashboard 的代码编辑器
- 点击 "Deploy"

#### 创建 cleanup 函数：
- 函数名：`cleanup`
- 复制 `/workspace/projects/supabase/functions/cleanup/index.ts` 的内容
- 粘贴到 Dashboard 的代码编辑器
- 点击 "Deploy"

## 第五步：测试表单

1. 访问 https://phowa.pages.dev/submit.html
2. 测试填写表单：
   - 选择往生日期
   - 选择分类（亡者/堕胎婴灵/旁生）
   - 输入姓名
   - 点击提交
3. 验证提交成功后显示"查看名单"和"继续填写"按钮
4. 点击"查看名单"回到首页，验证新数据已显示

## 第六步：设置自动清理（可选）

### 使用 GitHub Actions 自动清理

1. 在 GitHub 仓库创建 `.github/workflows/cleanup.yml`
2. 添加以下内容：

```yaml
name: Monthly Cleanup

on:
  schedule:
    - cron: '0 0 1 * *'  # 每月 1 日 00:00 运行
  workflow_dispatch:  # 允许手动触发

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Cleanup old records
        run: |
          curl -X POST https://ekgbhbvbnxgqtnhjhqag.supabase.co/functions/v1/cleanup \
            -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
            -H "Content-Type: application/json"
```

3. 将 `YOUR_SERVICE_ROLE_KEY` 替换为你的 service_role secret
4. 提交到 GitHub

## 故障排查

### 问题 1: 页面空白
- 检查 Cloudflare Pages 的构建日志
- 确认 Build output directory 是 `public`
- 检查浏览器控制台是否有错误

### 问题 2: 数据加载失败
- 检查 Supabase Edge Functions 是否已部署
- 检查浏览器控制台是否有 CORS 错误
- 确认 SUPABASE_URL 和 SUPABASE_ANON_KEY 正确

### 问题 3: 表单提交失败
- 检查 submit Edge Function 是否已部署
- 检查浏览器控制台是否有错误
- 确认 Supabase 数据库表结构正确

## 完成！

部署完成后，你的网站就可以正常使用了：
- 用户访问首页查看名单
- 用户点击"填写名单"提交新数据
- 数据实时显示（49 天内）
- 每月 1 日自动清理 90 天前的数据
