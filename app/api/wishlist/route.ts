import { NextRequest, NextResponse } from 'next/server';
import { getWishlist, addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/db/wishlist';
import { requireAuth } from '@/lib/auth-middleware';

async function getHandler(req: NextRequest, user: any) {
  try {
    const wishlist = await getWishlist(user.userId);
    return NextResponse.json(wishlist);
  } catch (error: any) {
    console.error('Get wishlist error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

async function addHandler(req: NextRequest, user: any) {
  try {
    const body = await req.json();
    const { productId } = body;
    
    const wishlist = await addToWishlist(user.userId, productId);
    return NextResponse.json(wishlist);
  } catch (error: any) {
    console.error('Add to wishlist error:', error);
    return NextResponse.json(
      { error: 'Failed to add item to wishlist' },
      { status: 500 }
    );
  }
}

async function removeHandler(req: NextRequest, user: any) {
  try {
    const body = await req.json();
    const { productId } = body;
    
    const wishlist = await removeFromWishlist(user.userId, productId);
    return NextResponse.json(wishlist);
  } catch (error: any) {
    console.error('Remove from wishlist error:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from wishlist' },
      { status: 500 }
    );
  }
}

async function checkHandler(req: NextRequest, user: any) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    const inWishlist = await isInWishlist(user.userId, productId);
    return NextResponse.json({ inWishlist });
  } catch (error: any) {
    console.error('Check wishlist error:', error);
    return NextResponse.json(
      { error: 'Failed to check wishlist' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);
export const POST = requireAuth(addHandler);
export const DELETE = requireAuth(removeHandler);
export const PATCH = requireAuth(checkHandler);

