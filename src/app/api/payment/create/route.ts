import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { db } from '@/lib/db';
import { orders } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { withAuth } from '@/lib/middleware';
import { createPayment, type EpayConfig } from '@/lib/epay';

export const runtime = 'edge';

// 创建支付订单
export const POST = withAuth(async (request: NextRequest, userId: number) => {
  try {
    const { env } = getRequestContext();
    const body = await request.json() as { orderId?: string; paymentMethod?: string };
    const { orderId, paymentMethod } = body;

    if (!orderId || !paymentMethod) {
      return NextResponse.json({ 
        error: 'Order ID and payment method are required' 
      }, { status: 400 });
    }

    // 验证支付方式
    if (!['alipay', 'wxpay', 'qqpay'].includes(paymentMethod)) {
      return NextResponse.json({ 
        error: 'Invalid payment method' 
      }, { status: 400 });
    }

    // 获取订单信息
    const order = await db()
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(orderId)))
      .get();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 验证订单所有权
    if (order.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 检查订单是否已支付
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({ 
        error: 'Order already paid' 
      }, { status: 400 });
    }

    // 计算支付金额（如果订单有关联服务，使用服务价格）
    const paymentAmount = order.paymentAmount || 0;

    if (paymentAmount <= 0) {
      return NextResponse.json({ 
        error: 'Invalid payment amount' 
      }, { status: 400 });
    }

    // 配置易支付
    const epayConfig: EpayConfig = {
      pid: env.EPAY_PID || '',
      key: env.EPAY_KEY || '',
      apiUrl: env.EPAY_API_URL || '',
      notifyUrl: env.EPAY_NOTIFY_URL || '',
      returnUrl: env.EPAY_RETURN_URL || '',
    };

    // 创建支付订单
    const paymentResult = await createPayment(epayConfig, {
      orderId: `ORDER_${orderId}_${Date.now()}`,
      name: `订单支付 #${orderId}`,
      money: paymentAmount.toFixed(2),
      type: paymentMethod as 'alipay' | 'wxpay' | 'qqpay',
      device: 'mobile',
    });

    if (paymentResult.code !== 1) {
      return NextResponse.json({ 
        error: paymentResult.msg || 'Payment creation failed' 
      }, { status: 500 });
    }

    // 更新订单支付方式
    await db()
      .update(orders)
      .set({
        paymentMethod,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, parseInt(orderId)));

    return NextResponse.json({
      success: true,
      paymentUrl: paymentResult.data?.payurl,
      qrcode: paymentResult.data?.qrcode,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create payment' 
    }, { status: 500 });
  }
});
