import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// 获取文件（图片下载/预览）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { env } = getRequestContext();
    const { key } = await params;
    const fileKey = decodeURIComponent(key);

    // 从 R2 获取文件
    const object = await env.R2.get(fileKey);

    if (!object) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // 获取文件内容
    const blob = await object.blob();
    
    // 返回文件
    return new NextResponse(blob, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Content-Length': object.size.toString(),
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('File retrieval error:', error);
    return NextResponse.json({ error: 'Failed to retrieve file' }, { status: 500 });
  }
}
