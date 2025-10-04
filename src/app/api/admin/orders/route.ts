import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, services, users, orderAttachments } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { withAuth } from '@/lib/middleware';

export const runtime = 'edge';

// TODO: 添加管理员权限验证
// 当前简化版本，所有认证用户都可以访问
// 生产环境需要在 users 表添加 role 字段并验证

// 获取所有订单（管理员）
export const GET = withAuth(async (request: NextRequest, _userId: number) => {
  try {
    // TODO: 验证用户是否为管理员
    // const user = await db().select().from(users).where(eq(users.id, userId)).get();
    // if (user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // 构建查询
    let query = db()
      .select({
        order: orders,
        service: services,
        user: {
          id: users.id,
          email: users.email,
        },
      })
      .from(orders)
      .leftJoin(services, eq(orders.serviceId, services.id))
      .leftJoin(users, eq(orders.userId, users.id))
      .$dynamic();

    // 状态筛选
    if (status) {
      query = query.where(eq(orders.status, status));
    }
    if (paymentStatus) {
      query = query.where(eq(orders.paymentStatus, paymentStatus));
    }

    const results = await query.all();

    // 手动分页
    const paginatedResults = results.slice(offset, offset + limit);

    // 获取附件数量
    const ordersWithStats = await Promise.all(
      paginatedResults.map(async (result) => {
        const attachmentCount = await db()
          .select()
          .from(orderAttachments)
          .where(eq(orderAttachments.orderId, result.order.id))
          .all();

        return {
          ...result.order,
          service: result.service,
          user: result.user,
          attachmentCount: attachmentCount.length,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: ordersWithStats,
      pagination: {
        page,
        limit,
        total: results.length,
        totalPages: Math.ceil(results.length / limit),
      },
    });
  } catch (error) {
    console.error('Admin get orders error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch orders' 
    }, { status: 500 });
  }
});
