import { getRequestContext } from '@cloudflare/next-on-pages';
import { generateToken as generateJWT, verifyToken as verifyJWT, extractTokenFromHeader, type JWTPayload } from './jwt';

export type { JWTPayload };
export { extractTokenFromHeader };

export async function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const { env } = getRequestContext();
  const secret = env.JWT_SECRET || 'fallback-secret-key-change-in-production';
  
  return await generateJWT(payload, secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { env } = getRequestContext();
    const secret = env.JWT_SECRET || 'fallback-secret-key-change-in-production';
    
    return await verifyJWT(token, secret);
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}