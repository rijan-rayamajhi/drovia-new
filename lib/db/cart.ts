import connectToDatabase from './mongodb';
import Cart from '@/models/Cart';
import { CartItem } from '@/types';

export async function getCart(userId: string): Promise<CartItem[]> {
  await connectToDatabase();
  const cart = await Cart.findOne({ userId }).populate('items.productId');
  
  if (!cart) return [];
  
  return cart.items.map((item: any) => ({
    product: item.product || item.productId,
    size: item.size,
    quantity: item.quantity
  }));
}

export async function addToCart(
  userId: string,
  product: any,
  size: string,
  quantity: number = 1
): Promise<CartItem[]> {
  await connectToDatabase();
  
  let cart = await Cart.findOne({ userId });
  
  if (!cart) {
    cart = await Cart.create({
      userId,
      items: []
    });
  }
  
  const existingItemIndex = cart.items.findIndex(
    (item: any) => item.productId.toString() === product.id && item.size === size
  );
  
  if (existingItemIndex >= 0) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({
      productId: product.id,
      product,
      size,
      quantity
    });
  }
  
  await cart.save();
  
  return cart.items.map((item: any) => ({
    product: item.product || item.productId,
    size: item.size,
    quantity: item.quantity
  }));
}

export async function removeFromCart(
  userId: string,
  productId: string,
  size: string
): Promise<CartItem[]> {
  await connectToDatabase();
  
  const cart = await Cart.findOne({ userId });
  if (!cart) return [];
  
  cart.items = cart.items.filter(
    (item: any) => !(item.productId.toString() === productId && item.size === size)
  );
  
  await cart.save();
  
  return cart.items.map((item: any) => ({
    product: item.product || item.productId,
    size: item.size,
    quantity: item.quantity
  }));
}

export async function updateCartItemQuantity(
  userId: string,
  productId: string,
  size: string,
  quantity: number
): Promise<CartItem[]> {
  await connectToDatabase();
  
  const cart = await Cart.findOne({ userId });
  if (!cart) return [];
  
  const item = cart.items.find(
    (item: any) => item.productId.toString() === productId && item.size === size
  );
  
  if (item) {
    item.quantity = Math.max(1, quantity);
    await cart.save();
  }
  
  return cart.items.map((item: any) => ({
    product: item.product || item.productId,
    size: item.size,
    quantity: item.quantity
  }));
}

export async function clearCart(userId: string): Promise<void> {
  await connectToDatabase();
  await Cart.findOneAndUpdate({ userId }, { items: [] });
}

