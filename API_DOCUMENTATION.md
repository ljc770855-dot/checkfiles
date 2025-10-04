# API 文档

## 基础信息

- **Base URL**: `https://your-domain.workers.dev`
- **认证方式**: JWT Bearer Token
- **Content-Type**: `application/json`

## 认证相关 API

### 1. 用户注册

**POST** `/api/register`

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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

### 2. 用户登录

**POST** `/api/login`

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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

---

## 服务相关 API

### 3. 获取服务列表

**GET** `/api/services`

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "高精度商业背景调查",
      "description": "提供目标企业或个人的全面背景报告",
      "price": 999.00,
      "imageUrl": "https://example.com/image.jpg"
    }
  ]
}
```

---

## 订单相关 API

### 4. 创建订单

**POST** `/api/orders`

**认证**: 需要

**请求头:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求体 (FormData):**
- `name`: 客户姓名
- `contact`: 联系方式
- `notes`: 备注
- `serviceId`: 服务ID (可选)
- `files`: 文件 (可选，支持多个)

**响应:**
```json
{
  "message": "Order created successfully",
  "orderId": 123,
  "uploadedFiles": 2
}
```

### 5. 获取用户订单列表

**GET** `/api/orders/list`

**认证**: 需要

**查询参数:**
- `status`: 订单状态筛选 (可选)
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "serviceId": 1,
      "customerName": "张三",
      "customerContact": "13800138000",
      "notes": "备注信息",
      "status": "pending",
      "paymentStatus": "unpaid",
      "paymentAmount": 999.00,
      "createdAt": "2025-10-04T00:00:00.000Z",
      "service": {
        "id": 1,
        "name": "高精度商业背景调查",
        "price": 999.00
      },
      "attachments": ["orders/1/file1.jpg", "orders/1/file2.pdf"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 6. 获取订单详情

**GET** `/api/orders/{id}`

**认证**: 需要

**响应:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "serviceId": 1,
    "customerName": "张三",
    "customerContact": "13800138000",
    "notes": "备注信息",
    "status": "pending",
    "paymentStatus": "unpaid",
    "paymentAmount": 999.00,
    "paymentMethod": null,
    "paymentTradeNo": null,
    "paymentTime": null,
    "createdAt": "2025-10-04T00:00:00.000Z",
    "updatedAt": "2025-10-04T00:00:00.000Z",
    "service": {
      "id": 1,
      "name": "高精度商业背景调查",
      "price": 999.00
    },
    "attachments": [
      {
        "id": 1,
        "fileUrl": "orders/1/file1.jpg"
      }
    ]
  }
}
```

---

## 支付相关 API

### 7. 创建支付订单

**POST** `/api/payment/create`

**认证**: 需要

**请求体:**
```json
{
  "orderId": "123",
  "paymentMethod": "alipay"
}
```

**支付方式:**
- `alipay`: 支付宝
- `wxpay`: 微信支付
- `qqpay`: QQ钱包

**响应:**
```json
{
  "success": true,
  "paymentUrl": "https://pay.example.com/pay?order=xxx",
  "qrcode": "https://pay.example.com/qrcode?order=xxx"
}
```

### 8. 支付回调（异步通知）

**POST** `/api/payment/notify`

**说明**: 此接口由易支付服务器调用，用于接收支付结果通知

**请求体 (FormData):**
- `out_trade_no`: 商户订单号
- `trade_no`: 支付平台交易号
- `money`: 支付金额
- `trade_status`: 交易状态
- `sign`: 签名

**响应:**
```
success
```

### 9. 支付同步回调

**GET** `/api/payment/notify`

**说明**: 用户支付完成后跳转的页面

**查询参数:**
- `out_trade_no`: 商户订单号

**响应**: 重定向到订单详情页

---

## 文件相关 API

### 10. 获取文件

**GET** `/api/files/{key}`

**说明**: 下载或预览上传的文件

**示例**: `/api/files/orders%2F1%2Ffile.jpg`

**响应**: 文件内容（图片、PDF等）

---

## 管理员 API

### 11. 获取所有订单（管理员）

**GET** `/api/admin/orders`

**认证**: 需要（管理员）

**查询参数:**
- `status`: 订单状态筛选 (可选)
- `paymentStatus`: 支付状态筛选 (可选)
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20)

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "customerName": "张三",
      "status": "pending",
      "paymentStatus": "unpaid",
      "paymentAmount": 999.00,
      "createdAt": "2025-10-04T00:00:00.000Z",
      "service": {
        "id": 1,
        "name": "高精度商业背景调查"
      },
      "user": {
        "id": 1,
        "email": "user@example.com"
      },
      "attachmentCount": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 12. 更新订单状态（管理员）

**PATCH** `/api/admin/orders/{id}`

**认证**: 需要（管理员）

**请求体:**
```json
{
  "status": "processing",
  "notes": "正在处理中"
}
```

**订单状态:**
- `pending`: 待处理
- `paid`: 已支付
- `processing`: 处理中
- `completed`: 已完成
- `cancelled`: 已取消

**响应:**
```json
{
  "success": true,
  "message": "Order updated successfully"
}
```

### 13. 获取订单详情（管理员）

**GET** `/api/admin/orders/{id}`

**认证**: 需要（管理员）

**响应:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "serviceId": 1,
    "customerName": "张三",
    "customerContact": "13800138000",
    "notes": "备注信息",
    "status": "pending",
    "paymentStatus": "unpaid",
    "paymentAmount": 999.00,
    "createdAt": "2025-10-04T00:00:00.000Z",
    "updatedAt": "2025-10-04T00:00:00.000Z"
  }
}
```

---

## 错误响应

所有 API 在出错时返回以下格式：

```json
{
  "error": "错误描述信息"
}
```

**常见 HTTP 状态码:**
- `200`: 成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未认证或认证失败
- `403`: 无权限
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 认证说明

需要认证的 API 必须在请求头中包含 JWT Token：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token 有效期为 7 天。
