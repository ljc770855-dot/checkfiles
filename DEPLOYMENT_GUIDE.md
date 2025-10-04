# 完整部署指南

## 📋 项目概述

这是一个基于 Next.js 15 和 Cloudflare Workers 的委托查询服务平台，包含完整的用户认证、订单管理、支付集成和文件上传功能。

---

# 部署指南和问题修复总结

## 已修复的问题

### 1. ✅ Drizzle ORM 配置问题
**问题**: `drizzle.config.ts` 使用了已废弃的 `driver: 'd1-http'` 配置
**修复**: 更新为使用 `wranglerConfigPath` 和 `dbName`

### 2. ✅ 数据库 Schema 默认值问题
**问题**: 使用 `.default(new Date())` 在 SQLite 中不工作
**修复**: 
- 改用 `.$defaultFn(() => new Date())` 用于时间戳
- 改用 `.$default(() => 'pending')` 用于字符串默认值
- 添加 `{ autoIncrement: true }` 到所有主键

### 3. ✅ JWT 认证 Edge Runtime 兼容性问题
**问题**: `jsonwebtoken` 库在 Cloudflare Workers Edge Runtime 中不兼容
**修复**: 
- 创建了新的 `src/lib/jwt.ts` 使用 Web Crypto API
- 更新 `src/lib/auth.ts` 使用新的 JWT 实现
- 所有 token 生成和验证函数改为异步

### 4. ✅ Next.js 配置缺失
**问题**: 缺少 Cloudflare 部署所需的配置
**修复**: 添加了图片优化禁用和 serverActions 配置

### 5. ✅ Wrangler 配置日期错误
**问题**: `compatibility_date` 设置为未来日期 `2025-03-01`
**修复**: 更新为 `2024-10-01`

### 6. ✅ TypeScript 类型定义缺失
**问题**: CloudflareEnv 接口缺少 JWT_SECRET 属性
**修复**: 在 `cloudflare-env.d.ts` 中添加 JWT_SECRET 类型定义

## 部署前准备清单

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
确保 `.env` 或 `.dev.vars` 文件包含以下变量：
```env
JWT_SECRET=your-strong-secret-key-here
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

### 3. 确认 Cloudflare 资源
确保以下资源已在 Cloudflare 中创建：
- ✅ D1 数据库: `tianyancha-db` (ID: b4c84633-9d74-4eff-b482-a72c710c6cf5)
- ✅ R2 存储桶: `tianyancha-r2`

### 4. 生成数据库迁移
```bash
npm run drizzle:generate
```

### 5. 应用数据库迁移
```bash
npm run drizzle:migrate
```

### 6. （可选）填充初始数据
```bash
npm run db:seed
```

## 本地测试

### 开发模式
```bash
npm run dev
```
访问 http://localhost:3000

### 预览 Cloudflare 部署
```bash
npm run preview
```

## 部署到 Cloudflare Workers

### 方式一：使用 npm 脚本
```bash
npm run deploy
```

### 方式二：手动部署
```bash
npx opennextjs-cloudflare build
npx opennextjs-cloudflare deploy
```

## 部署后配置

### 1. 设置 Cloudflare Secrets
在 Cloudflare Dashboard 中设置以下 secrets：
```bash
wrangler secret put JWT_SECRET
```

### 2. 验证绑定
确保 Worker 已正确绑定：
- D1 数据库 (binding: DB)
- R2 存储桶 (binding: R2)

## 常见问题排查

### 问题 1: 数据库连接失败
**检查**:
- D1 数据库 ID 是否正确
- 数据库迁移是否已应用
- wrangler.jsonc 中的绑定配置是否正确

### 问题 2: JWT Token 验证失败
**检查**:
- JWT_SECRET 环境变量是否已设置
- Token 格式是否正确 (Bearer token)
- Token 是否过期 (默认 7 天)

### 问题 3: 文件上传失败
**检查**:
- R2 存储桶名称是否正确
- R2 绑定是否正确配置
- 文件大小是否超过限制 (10MB)

### 问题 4: 本地开发无法连接数据库
**解决方案**:
本地开发需要使用 wrangler 的本地模式：
```bash
# 使用 wrangler dev 而不是 next dev
wrangler dev
```

或者配置本地 D1 数据库：
```bash
wrangler d1 create tianyancha-db-local
```

## 代码改进建议

### 1. 安全性增强
- [ ] 在生产环境使用强 JWT_SECRET
- [ ] 添加请求速率限制
- [ ] 实现 CSRF 保护
- [ ] 添加输入验证和清理

### 2. 性能优化
- [ ] 启用 R2 缓存 (在 open-next.config.ts 中)
- [ ] 添加数据库查询索引
- [ ] 实现 API 响应缓存

### 3. 错误处理
- [ ] 添加全局错误处理中间件
- [ ] 实现结构化日志记录
- [ ] 添加错误监控 (如 Sentry)

### 4. 功能完善
- [ ] 添加用户角色和权限系统
- [ ] 实现订单状态更新 API
- [ ] 添加文件下载功能
- [ ] 实现订单查询和筛选

## 技术栈版本

- Next.js: 15.4.6
- React: 19.1.0
- Drizzle ORM: 0.44.6
- Wrangler: 4.42.0
- @opennextjs/cloudflare: 1.3.0

## 注意事项

1. **不要在代码中硬编码敏感信息**
2. **定期更新依赖包**以获取安全补丁
3. **在部署前进行充分测试**
4. **备份数据库**在进行重大更改前
5. **监控 Cloudflare Workers 使用量**以避免超出配额

## 🎯 新增功能说明

### 支付功能
- ✅ 易支付集成
- ✅ 支持支付宝、微信、QQ钱包
- ✅ 异步支付回调处理
- ✅ 支付状态查询

### 订单管理
- ✅ 用户订单列表和详情
- ✅ 管理员订单管理
- ✅ 订单状态更新
- ✅ 文件上传和访问

### 在线客服
- ✅ 支持第三方客服 SDK 集成
- ✅ 推荐使用美洽、智齿等服务

## 📚 相关文档

- [API 文档](./API_DOCUMENTATION.md) - 完整的 API 接口文档
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [OpenNext.js Cloudflare 文档](https://opennext.js.org/cloudflare)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [Next.js 文档](https://nextjs.org/docs)

## 🔄 数据库迁移

由于添加了支付相关字段，需要重新生成和应用数据库迁移：

```bash
# 生成新的迁移
npm run drizzle:generate

# 应用迁移到远程数据库
npx wrangler d1 execute tianyancha-db --file=src/drizzle/migrations/[新生成的迁移文件].sql --remote
```

## 🎨 前端页面

项目包含两个独立的前端页面：
- `public/client.html` - 客户端页面（用户下单、查看订单）
- `public/admin.html` - 管理后台（管理员管理订单）

这些页面可以直接访问，无需构建。
