import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getAllOrders, getUserOrders } from '@/lib/db/orders';
import { requireAuth, requireAdmin } from '@/lib/auth-middleware';

async function createHandler(req: NextRequest, user: any) {
  try {
    const body = await req.json();
    const order = await createOrder({
      ...body,
      userId: user.userId
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}

async function getHandler(req: NextRequest, user: any) {
  try {
    if (user.role === 'admin') {
      const orders = await getAllOrders();
      return NextResponse.json(orders);
    } else {
      const orders = await getUserOrders(user.userId);
      return NextResponse.json(orders);
    }
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(createHandler);
export const GET = requireAuth(getHandler);

