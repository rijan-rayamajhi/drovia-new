import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/lib/auth-middleware';
import { getUserByEmail } from '@/lib/db/users';
import bcrypt from 'bcrypt';

// Demo credentials (matching those in login page)
const DEMO_USER = {
  email: 'user@demo.com',
  password: 'user123',
  name: 'Demo User',
  id: 'user_123456',
  role: 'user' as const
};

const DEMO_ADMIN = {
  username: 'admin',
  password: 'admin123',
  name: 'Admin User',
  id: 'admin_123456',
  role: 'admin' as const
};

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

    // Check admin
    if (
      emailOrUsername === DEMO_ADMIN.username &&
      password === DEMO_ADMIN.password
    ) {
      user = {
        userId: DEMO_ADMIN.id,
        email: DEMO_ADMIN.username,
        role: DEMO_ADMIN.role,
        name: DEMO_ADMIN.name
      };
    }
    // Check demo user
    else if (
      emailOrUsername === DEMO_USER.email &&
      password === DEMO_USER.password
    ) {
      user = {
        userId: DEMO_USER.id,
        email: DEMO_USER.email,
        role: DEMO_USER.role,
        name: DEMO_USER.name
      };
    }
    // Check database user
    else {
      const dbUser = await getUserByEmail(emailOrUsername);
      if (dbUser) {
        const isValid = await bcrypt.compare(password, dbUser.password);
        if (isValid) {
          user = {
            userId: dbUser._id.toString(),
            email: dbUser.email,
            role: dbUser.role || 'user',
            name: dbUser.name
          };
        }
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
