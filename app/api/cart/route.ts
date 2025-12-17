import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Cart from '@/models/Cart';
import { requireAuth } from '@/lib/auth-middleware';

// GET: Fetch user's cart
async function getCartHandler(req: NextRequest, user: any) {
  try {
    await connectToDatabase();
    let cart = await Cart.findOne({ userId: user.userId });

    if (!cart) {
      console.log('API GET /api/cart: No cart found for user', user.userId);
      // Return empty cart structure if not found
      return NextResponse.json([]);
    }

    console.log('API GET /api/cart found items:', JSON.stringify(cart.items));
    return NextResponse.json(cart.items);
  } catch (error: any) {
    console.error('Get cart error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Add item to cart
async function addToCartHandler(req: NextRequest, user: any) {
  try {
    await connectToDatabase();
    const { product, size, quantity } = await req.json();
    console.log('API POST /api/cart received:', { productId: product?.id, size, quantity });

    if (!product || !size || !quantity) {
      console.error('API POST /api/cart missing fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let cart = await Cart.findOne({ userId: user.userId });

    if (!cart) {
      cart = new Cart({
        userId: user.userId,
        items: []
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === product.id && item.size === size
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId: product.id,
        product, // Store denormalized product data
        size,
        quantity
      });
    }

    await cart.save();
    console.log('API POST /api/cart saved:', JSON.stringify(cart.items));
    return NextResponse.json(cart.items);
  } catch (error: any) {
    console.error('Add to cart error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update item quantity
async function updateCartHandler(req: NextRequest, user: any) {
  try {
    await connectToDatabase();
    const { productId, size, quantity } = await req.json();

    if (!productId || !size || quantity === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cart = await Cart.findOne({ userId: user.userId });
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const itemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId && item.size === size
    );

    if (itemIndex > -1) {
      if (quantity > 0) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        // Remove item if quantity is 0 or less
        cart.items.splice(itemIndex, 1);
      }
      await cart.save();
      return NextResponse.json(cart.items);
    } else {
      return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Update cart error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove item from cart (or clear cart)
async function deleteCartHandler(req: NextRequest, user: any) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');
    const size = url.searchParams.get('size');
    const clearAll = url.searchParams.get('clear');

    const cart = await Cart.findOne({ userId: user.userId });
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    if (clearAll === 'true') {
      cart.items = [];
    } else if (productId && size) {
      cart.items = cart.items.filter(
        (item: any) => !(item.productId.toString() === productId && item.size === size)
      );
    } else {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    await cart.save();
    return NextResponse.json(cart.items);
  } catch (error: any) {
    console.error('Delete cart error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const GET = requireAuth(getCartHandler);
export const POST = requireAuth(addToCartHandler);
export const PUT = requireAuth(updateCartHandler);
export const DELETE = requireAuth(deleteCartHandler);
