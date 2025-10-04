import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

export function withAuth(handler: (request: NextRequest, userId: number) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const authHeader = request.headers.get('authorization');
      const token = extractTokenFromHeader(authHeader);
      
      if (!token) {
        return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
      }
      
      const payload = await verifyToken(token);
      if (!payload) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }
      
      return await handler(request, payload.userId);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
  };
}

export function optionalAuth(handler: (request: NextRequest, userId?: number) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const authHeader = request.headers.get('authorization');
      const token = extractTokenFromHeader(authHeader);
      
      if (!token) {
        return await handler(request);
      }
      
      const payload = await verifyToken(token);
      if (!payload) {
        return await handler(request);
      }
      
      return await handler(request, payload.userId);
    } catch (error) {
      console.error('Optional auth middleware error:', error);
      return await handler(request);
    }
  };
}