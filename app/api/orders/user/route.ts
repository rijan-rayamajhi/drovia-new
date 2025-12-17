import { NextRequest, NextResponse } from 'next/server';
import { getUserOrders } from '@/lib/db/orders';
import { requireAuth } from '@/lib/auth-middleware';

async function handler(req: NextRequest, user: any) {
  try {
    const orders = await getUserOrders(user.userId);
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Get user orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handler);

