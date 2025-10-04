import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderAttachments } from '@/drizzle/schema';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { withAuth } from '@/lib/middleware';

export const runtime = 'edge';

export const POST = withAuth(async (request: NextRequest, userId: number) => {
  try {
    const formData = await request.formData();
    const customerName = formData.get('name') as string;
    const customerContact = formData.get('contact') as string;
    const notes = formData.get('notes') as string;
    const serviceId = formData.get('serviceId') as string;
    const files = formData.getAll('files') as File[];

    // 验证必需字段
    if (!customerName || !customerContact) {
      return NextResponse.json({ 
        error: 'Name and contact are required' 
      }, { status: 400 });
    }

    // 验证文件大小和类型
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    
    for (const file of files) {
      if (file.size > maxFileSize) {
        return NextResponse.json({ 
          error: `File ${file.name} is too large. Maximum size is 10MB.` 
        }, { status: 400 });
      }
      
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ 
          error: `File ${file.name} has unsupported type. Allowed types: JPEG, PNG, GIF, PDF.` 
        }, { status: 400 });
      }
    }

    const { env } = getRequestContext();
    
    // 创建订单
    const newOrder = await db().insert(orders).values({
      userId,
      serviceId: serviceId ? parseInt(serviceId) : null,
      customerName,
      customerContact,
      notes: notes || null,
    }).returning({ id: orders.id }).get();

    // 处理文件上传
    const uploadedFiles = [];
    for (const file of files) {
      try {
        const fileKey = `orders/${newOrder.id}/${Date.now()}-${file.name}`;
        await env.R2.put(fileKey, await file.arrayBuffer());
        
        await db().insert(orderAttachments).values({
          orderId: newOrder.id,
          fileUrl: fileKey,
        });
        
        uploadedFiles.push(fileKey);
      } catch (fileError) {
        console.error(`Failed to upload file ${file.name}:`, fileError);
        // 继续处理其他文件，不中断整个流程
      }
    }

    return NextResponse.json({ 
      message: 'Order created successfully', 
      orderId: newOrder.id,
      uploadedFiles: uploadedFiles.length
    }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create order. Please try again.' 
    }, { status: 500 });
  }
});
