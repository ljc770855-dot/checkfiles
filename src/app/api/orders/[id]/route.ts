import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, services, orderAttachments, users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { withAuth } from '@/lib/middleware';

export const runtime = 'edge';

// 获取订单详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证认证
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const { verifyToken } = await import('@/lib/auth');
    const payload = await verifyToken(token);
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.userId;
    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    // 获取订单信息
    const orderData = await db()
      .select({
        order: orders,
        service: services,
      })
      .from(orders)
      .leftJoin(services, eq(orders.serviceId, services.id))
      .where(eq(orders.id, orderId))
      .get();

    if (!orderData) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 验证订单所有权
    if (orderData.order.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 获取订单附件
    const attachments = await db()
      .select()
      .from(orderAttachments)
      .where(eq(orderAttachments.orderId, orderId))
      .all();

    return NextResponse.json({
      success: true,
      data: {
        ...orderData.order,
        service: orderData.service,
        attachments: attachments.map(a => ({
          id: a.id,
          fileUrl: a.fileUrl,
        })),
      },
    });
  } catch (error) {
    console.error('Get order detail error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch order details' 
    }, { status: 500 });
  }
}
