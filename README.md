# 天眼查 - 委托查询平台

一个基于 Next.js 15 和 Cloudflare 的现代化委托查询服务平台。

## 功能特性

- 🔐 **用户认证系统** - JWT token 认证
- 📋 **订单管理** - 完整的订单创建和跟踪
- 📁 **文件上传** - 支持多种文件格式上传到 Cloudflare R2
- 🎨 **响应式设计** - 移动端友好的用户界面
- ⚡ **Edge Runtime** - 基于 Cloudflare Workers 的高性能部署
- 🗄️ **数据库** - 使用 Drizzle ORM 和 Cloudflare D1

## 技术栈

- **前端**: Next.js 15, React 19, Tailwind CSS
- **后端**: Next.js API Routes, Edge Runtime
- **数据库**: Cloudflare D1 (SQLite)
- **存储**: Cloudflare R2
- **认证**: JWT (jsonwebtoken)
- **ORM**: Drizzle ORM
- **部署**: Cloudflare Pages

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境变量配置

复制环境变量示例文件：

```bash
cp env.example .env.local
```

编辑 `.env.local` 文件，填入你的配置：

```env
# Cloudflare 配置
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_API_TOKEN=your_api_token_here
CLOUDFLARE_DATABASE_ID=b4c84633-9d74-4eff-b482-a72c710c6cf5

# JWT 密钥 (生产环境请使用强密钥)
JWT_SECRET=your_jwt_secret_key_here

# 应用配置
NEXT_PUBLIC_APP_NAME=天眼查
NEXT_PUBLIC_APP_DESCRIPTION=权威、高效的商业及个人信息查询服务
```

### 3. 数据库设置

运行数据库迁移：

```bash
npm run drizzle:migrate
```

### 4. 开发模式

```bash
npm run dev
```

访问 `http://localhost:3000` 查看应用。

### 5. 部署到 Cloudflare

```bash
npm run deploy
```

## 项目结构

```
checkfiles/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API 路由
│   │   │   ├── login/      # 登录 API
│   │   │   ├── register/   # 注册 API
│   │   │   ├── services/   # 服务列表 API
│   │   │   └── orders/     # 订单 API
│   │   ├── layout.tsx      # 根布局
│   │   └── page.tsx        # 首页
│   ├── drizzle/            # 数据库相关
│   │   ├── migrations/     # 数据库迁移
│   │   └── schema.ts       # 数据库模式
│   └── lib/                # 工具库
│       ├── auth.ts         # JWT 认证工具
│       ├── db.ts           # 数据库连接
│       └── middleware.ts   # 认证中间件
├── public/                 # 静态文件
│   ├── client.html         # 客户端页面
│   └── admin.html         # 管理后台
├── drizzle.config.ts       # Drizzle 配置
├── wrangler.jsonc         # Cloudflare Workers 配置
└── package.json           # 项目依赖
```

## API 文档

### 认证相关

#### POST /api/register
用户注册

**请求体:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

#### POST /api/login
用户登录

**请求体:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

### 服务相关

#### GET /api/services
获取服务列表

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "高精度商业背景调查",
      "description": "提供目标企业或个人的全面背景报告...",
      "price": 999.00,
      "imageUrl": "https://placehold.co/400x200/4f46e5/ffffff?text=项目图片"
    }
  ]
}
```

### 订单相关

#### POST /api/orders
创建订单 (需要认证)

**请求头:**
```
Authorization: Bearer jwt_token_here
```

**请求体:** (FormData)
- `name`: 客户姓名
- `contact`: 联系方式
- `notes`: 备注
- `serviceId`: 服务ID (可选)
- `files`: 文件 (可选)

**响应:**
```json
{
  "message": "Order created successfully",
  "orderId": 123,
  "uploadedFiles": 2
}
```

## 数据库模式

### Users 表
- `id`: 主键
- `email`: 邮箱 (唯一)
- `password_hash`: 密码哈希
- `created_at`: 创建时间

### Services 表
- `id`: 主键
- `name`: 服务名称
- `description`: 服务描述
- `price`: 价格
- `image_url`: 图片URL

### Orders 表
- `id`: 主键
- `user_id`: 用户ID (外键)
- `service_id`: 服务ID (外键)
- `customer_name`: 客户姓名
- `customer_contact`: 联系方式
- `notes`: 备注
- `status`: 状态 (默认: pending)
- `created_at`: 创建时间

### Order Attachments 表
- `id`: 主键
- `order_id`: 订单ID (外键)
- `file_url`: 文件URL

## 部署说明

### Cloudflare Pages 部署

1. 确保已配置 Cloudflare 账户和 API token
2. 运行 `npm run deploy` 进行部署
3. 在 Cloudflare Dashboard 中配置环境变量

### 环境变量

在 Cloudflare Dashboard 中设置以下环境变量：
- `JWT_SECRET`: JWT 签名密钥
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 账户ID
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token

## 开发指南

### 添加新的 API 路由

1. 在 `src/app/api/` 下创建新的路由文件
2. 使用 `withAuth` 中间件保护需要认证的路由
3. 遵循现有的错误处理模式

### 数据库迁移

1. 修改 `src/drizzle/schema.ts`
2. 运行 `npm run drizzle:generate` 生成迁移
3. 运行 `npm run drizzle:migrate` 应用迁移

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！