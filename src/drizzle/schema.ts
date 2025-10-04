import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const services = sqliteTable('services', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  imageUrl: text('image_url'),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  serviceId: integer('service_id').references(() => services.id),
  customerName: text('customer_name').notNull(),
  customerContact: text('customer_contact').notNull(),
  notes: text('notes'),
  status: text('status').notNull().$default(() => 'pending'), // pending, paid, processing, completed, cancelled
  // 支付相关字段
  paymentStatus: text('payment_status').$default(() => 'unpaid'), // unpaid, paid, refunded
  paymentAmount: real('payment_amount'),
  paymentMethod: text('payment_method'), // alipay, wxpay, qqpay
  paymentTradeNo: text('payment_trade_no'), // 支付平台交易号
  paymentTime: integer('payment_time', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const orderAttachments = sqliteTable('order_attachments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').references(() => orders.id),
  fileUrl: text('file_url').notNull(),
});
