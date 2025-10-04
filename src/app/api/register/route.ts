import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { hash } from 'bcrypt-ts';
import { generateToken } from '@/lib/auth';

export const runtime = 'edge';

interface RegisterRequestBody {
  email?: string;
  password?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = (await request.json()) as RegisterRequestBody;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const passwordHash = await hash(password, 10);

    const newUser = await db().insert(users).values({
      email,
      passwordHash,
    }).returning({ id: users.id, email: users.email }).get();

    // 生成JWT token
    const token = await generateToken({
      userId: newUser.id,
      email: newUser.email
    });

    return NextResponse.json({ 
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    
    // 检查是否是唯一约束错误
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
