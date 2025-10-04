# 本地开发指南

## 问题说明

由于项目使用了 Cloudflare 特定的服务（D1 数据库、R2 存储），直接使用 `npm run dev` 会遇到以下问题：
- 数据库操作失败（需要 Cloudflare D1）
- 文件上传失败（需要 Cloudflare R2）
- 环境变量获取失败（需要 Cloudflare Workers 环境）

## 本地开发建议

### 方案 1: 前端界面开发和调试（推荐）

如果你主要是开发和调试前端界面，可以直接使用静态 HTML 文件：

```powershell
# 启动一个简单的 HTTP 服务器
npx http-server public -p 3000
```

然后访问：
- http://localhost:3000/client.html - 客户端页面
- http://localhost:3000/admin.html - 管理后台

**优点**:
- 不需要构建
- 可以实时修改 HTML/CSS/JavaScript
- 不依赖后端 API

**缺点**:
- 无法测试真实的 API 调用
- 需要模拟数据

### 方案 2: 使用 Cloudflare 远程数据库（推荐用于 API 测试）

虽然本地运行，但连接到远程的 Cloudflare 服务：

#### 步骤 1: 确保已应用数据库迁移

```powershell
# 生成迁移
npm run drizzle:generate

# 应用到远程数据库
npx wrangler d1 execute tianyancha-db --file=src/drizzle/migrations/0000_fuzzy_silver_centurion.sql --remote
npx wrangler d1 execute tianyancha-db --file=src/drizzle/migrations/0001_heavy_lockheed.sql --remote
npx wrangler d1 execute tianyancha-db --file=src/drizzle/migrations/[新生成的文件].sql --remote
```

#### 步骤 2: 使用 Wrangler Dev

```powershell
# 这会启动一个本地开发服务器，但连接到远程 Cloudflare 服务
npx wrangler pages dev .next --compatibility-flag=nodejs_compat --d1=DB=tianyancha-db --r2=R2=tianyancha-r2
```

**注意**: 这需要先构建 Next.js 项目，但在 Windows 上会遇到构建问题。

### 方案 3: 直接部署测试（最简单）

由于 Windows 构建问题，最简单的方式是：

1. **跳过本地测试**
2. **直接部署到 Cloudflare Workers**
3. **在线上环境测试和调试**

部署步骤：
```powershell
# 使用 GitHub Actions 部署（推荐）
git init
git add .
git commit -m "Initial deployment"
git remote add origin https://github.com/你的用户名/checkfiles.git
git push -u origin main
```

然后在 Cloudflare Workers 的在线环境中测试。

### 方案 4: 使用 WSL 进行本地开发

在 WSL（Linux 环境）中可以正常构建和运行：

```powershell
# 安装 WSL
wsl --install

# 重启后，在 WSL 中
wsl
cd /mnt/d/Desktop/checkfiles/checkfiles
npm install --legacy-peer-deps
npm run dev
```

## 推荐的开发流程

### 阶段 1: 前端开发（本地）
使用 `npx http-server public -p 3000` 开发前端界面

### 阶段 2: API 开发（查看代码）
在 VSCode 中编写和检查 API 代码逻辑

### 阶段 3: 集成测试（部署后）
部署到 Cloudflare Workers 后进行完整测试

## 快速测试 API（部署后）

部署后，使用以下命令测试 API：

```bash
# 设置你的 Workers URL
export API_URL="https://checkfiles.你的账户.workers.dev"

# 测试注册
curl -X POST $API_URL/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# 测试登录
curl -X POST $API_URL/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# 保存返回的 token
export TOKEN="返回的token"

# 测试获取服务列表
curl $API_URL/api/services

# 测试获取订单列表
curl $API_URL/api/orders/list \
  -H "Authorization: Bearer $TOKEN"
```

## 调试技巧

### 1. 查看 Cloudflare Workers 日志

部署后，在 Cloudflare Dashboard 中：
- 进入 Workers & Pages
- 选择你的 Worker
- 查看 **Logs** 标签

### 2. 使用 Postman 测试 API

导入 API 文档中的接口到 Postman 进行测试。

### 3. 浏览器开发者工具

在浏览器中打开前端页面，使用 F12 查看：
- Network 标签：查看 API 请求和响应
- Console 标签：查看 JavaScript 错误

## 总结

**最佳实践**：
1. ✅ 前端界面在本地开发（使用 http-server）
2. ✅ API 代码在 VSCode 中编写和检查
3. ✅ 使用 GitHub Actions 自动部署
4. ✅ 在 Cloudflare Workers 上进行集成测试

这样可以避免 Windows 构建问题，同时保持高效的开发流程。
