import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { compare } from 'bcrypt-ts';
import { generateToken } from '@/lib/auth';

export const runtime = 'edge';

interface LoginRequestBody {
  email?: string;
  password?: string;
}
export async function POST(request: NextRequest) {
  try {
    const { email, password } = (await request.json()) as LoginRequestBody;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const user = await db().select().from(users).where(eq(users.email, email)).get();

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 生成JWT token
    const token = await generateToken({
      userId: user.id,
      email: user.email
    });

    return NextResponse.json({ 
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
