import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { db } from '@/lib/db';
import { orders } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { verifySign } from '@/lib/epay';

// 支付回调处理（易支付异步通知）
export async function POST(request: NextRequest) {
  try {
    const { env } = getRequestContext();
    const formData = await request.formData();
    
    // 将 FormData 转换为对象
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    // 验证签名
    const epayKey = env.EPAY_KEY || '';
    const isValid = await verifySign(params, epayKey);

    if (!isValid) {
      console.error('Invalid signature');
      return new NextResponse('fail', { status: 400 });
    }

    // 获取支付信息
    const {
      out_trade_no,  // 商户订单号
      trade_no,      // 支付平台交易号
      money,         // 支付金额
      trade_status,  // 交易状态
    } = params;

    // 只处理支付成功的通知
    if (trade_status !== 'TRADE_SUCCESS') {
      return new NextResponse('success');
    }

    // 从商户订单号中提取订单ID（格式：ORDER_{orderId}_{timestamp}）
    const orderIdMatch = out_trade_no.match(/ORDER_(\d+)_/);
    if (!orderIdMatch) {
      console.error('Invalid order ID format');
      return new NextResponse('fail', { status: 400 });
    }

    const orderId = parseInt(orderIdMatch[1]);

    // 获取订单
    const order = await db()
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .get();

    if (!order) {
      console.error('Order not found:', orderId);
      return new NextResponse('fail', { status: 404 });
    }

    // 检查订单是否已经支付
    if (order.paymentStatus === 'paid') {
      return new NextResponse('success');
    }

    // 验证支付金额
    const paymentAmount = parseFloat(money);
    if (order.paymentAmount && Math.abs(order.paymentAmount - paymentAmount) > 0.01) {
      console.error('Payment amount mismatch');
      return new NextResponse('fail', { status: 400 });
    }

    // 更新订单状态
    await db()
      .update(orders)
      .set({
        paymentStatus: 'paid',
        paymentTradeNo: trade_no,
        paymentTime: new Date(),
        status: 'paid',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    console.log('Payment success for order:', orderId);

    // 返回 success 给易支付
    return new NextResponse('success');
  } catch (error) {
    console.error('Payment notify error:', error);
    return new NextResponse('fail', { status: 500 });
  }
}

// 支付同步回调（用户支付完成后跳转）
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const out_trade_no = searchParams.get('out_trade_no');
  
  // 提取订单ID
  const orderIdMatch = out_trade_no?.match(/ORDER_(\d+)_/);
  const orderId = orderIdMatch ? orderIdMatch[1] : null;

  // 重定向到订单详情页或成功页面
  if (orderId) {
    return NextResponse.redirect(new URL(`/order/${orderId}?payment=success`, request.url));
  }

  return NextResponse.redirect(new URL('/payment/success', request.url));
}
