import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, services, orderAttachments } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { withAuth } from '@/lib/middleware';

// 获取用户订单列表
export const GET = withAuth(async (request: NextRequest, userId: number) => {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // 订单状态筛选
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // 构建查询
    let query = db()
      .select({
        order: orders,
        service: services,
      })
      .from(orders)
      .leftJoin(services, eq(orders.serviceId, services.id))
      .where(eq(orders.userId, userId))
      .$dynamic();

    // 如果有状态筛选
    if (status) {
      query = query.where(eq(orders.status, status));
    }

    // 执行查询（注意：Drizzle 的分页可能需要手动实现）
    const results = await query.all();

    // 手动分页
    const paginatedResults = results.slice(offset, offset + limit);

    // 获取每个订单的附件
    const ordersWithAttachments = await Promise.all(
      paginatedResults.map(async (result) => {
        const attachments = await db()
          .select()
          .from(orderAttachments)
          .where(eq(orderAttachments.orderId, result.order.id))
          .all();

        return {
          ...result.order,
          service: result.service,
          attachments: attachments.map(a => a.fileUrl),
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: ordersWithAttachments,
      pagination: {
        page,
        limit,
        total: results.length,
        totalPages: Math.ceil(results.length / limit),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch orders' 
    }, { status: 500 });
  }
});
