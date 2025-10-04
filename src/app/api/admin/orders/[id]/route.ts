import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { withAuth } from '@/lib/middleware';

export const runtime = 'edge';

// 更新订单状态（管理员）
export async function PATCH(
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

    // TODO: 验证管理员权限

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const body = await request.json() as { status?: string; notes?: string };
    const { status, notes } = body;

    // 验证状态值
    const validStatuses = ['pending', 'paid', 'processing', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // 检查订单是否存在
    const order = await db()
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .get();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 更新订单
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status) {
      updateData.status = status;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    await db()
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId));

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
    });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ 
      error: 'Failed to update order' 
    }, { status: 500 });
  }
}

// 获取订单详情（管理员）
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

    // TODO: 验证管理员权限

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const order = await db()
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .get();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch order' 
    }, { status: 500 });
  }
}
