import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/lib/auth-middleware';
import { getUserByEmail } from '@/lib/db/users';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emailOrUsername, password } = body;

    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { error: 'Missing credentials' },
        { status: 400 }
      );
    }

    let user = null;

    const dbUser = await getUserByEmail(emailOrUsername);
    if (dbUser) {
      const isValid = bcrypt.compareSync(password, dbUser.password);
      if (isValid) {
        user = {
          userId: dbUser._id.toString(),
          email: dbUser.email,
          role: dbUser.role || 'user',
          name: dbUser.name
        };
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create token
    const token = createToken(user);

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

    // Set HTTP-only cookie
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
