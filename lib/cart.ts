'use client';

import { CartItem, Product } from '@/types';

const CART_STORAGE_KEY = 'cartItems';

export const getCartItems = async (): Promise<CartItem[]> => {
  if (typeof window === 'undefined') return [];

  try {
    const response = await fetch('/api/cart', {
      cache: 'no-store',
      headers: { 'Pragma': 'no-cache' }
    });
    console.log('getCartItems API status:', response.status);

    if (response.ok) {
      const items = await response.json();
      console.log('getCartItems API items:', items);
      return items;
    } else {
      console.warn('getCartItems API failed, falling back to LS. Status:', response.status);
    }
  } catch (error) {
    console.error('Failed to fetch cart from API:', error);
  }

  // Fallback to local storage
  const cartStr = localStorage.getItem(CART_STORAGE_KEY);
  console.log('getCartItems Fallback items:', cartStr);
  return cartStr ? JSON.parse(cartStr) : [];
};

export const addToCart = async (product: Product, size: string, quantity: number = 1): Promise<boolean> => {
  console.log('addToCart called (async version)', { product, size, quantity });
  if (typeof window === 'undefined') return false;

  try {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product, size, quantity })
    });

    console.log('addToCart API response status:', response.status);

    if (response.ok) {
      window.dispatchEvent(new Event('cartUpdated'));
      return true;
    } else if (response.status === 401) {
      console.log('User not logged in, falling back to local storage');
      // Fall through to local storage logic
    } else {
      const errorData = await response.json();
      console.error('addToCart API failed:', errorData);
      alert(`Cart Error: ${errorData.error || 'Failed to add to server cart'}`);
      return false;
    }
  } catch (error: any) {
    console.error('Failed to add to cart via API:', error);
    // If network error, maybe fallback? But for now let's alert
    alert(`Cart Network Error: ${error.message}`);
    return false;
  }

  // Fallback to local storage (for guests)
  try {
    const items = await getLocalCartItems();
    const existingIndex = items.findIndex(
      (item) => item.product.id === product.id && item.size === size
    );

    if (existingIndex >= 0) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({ product, size, quantity });
    }

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('cartUpdated'));
    return true;
  } catch (e) {
    console.error('LocalStorage error:', e);
    alert('Your cart is full. Please clear some items or log in to save more.');
    return false;
  }
};

export const removeFromCart = async (productId: string, size: string): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    const response = await fetch(`/api/cart?productId=${productId}&size=${size}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      window.dispatchEvent(new Event('cartUpdated'));
      return;
    }
  } catch (error) {
    console.error('Failed to remove from cart via API:', error);
  }

  // Fallback to local storage
  const items = getLocalCartItems().filter(
    (item) => !(item.product.id === productId && item.size === size)
  );
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cartUpdated'));
};

export const updateCartItemQuantity = async (productId: string, size: string, quantity: number): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    const response = await fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, size, quantity })
    });

    if (response.ok) {
      window.dispatchEvent(new Event('cartUpdated'));
      return;
    }
  } catch (error) {
    console.error('Failed to update cart via API:', error);
  }

  // Fallback to local storage
  const items = getLocalCartItems();
  const item = items.find((item) => item.product.id === productId && item.size === size);
  if (item) {
    item.quantity = Math.max(1, quantity);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('cartUpdated'));
  }
};

export const getCartCount = async (): Promise<number> => {
  const items = await getCartItems();
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

export const clearCart = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    await fetch('/api/cart?clear=true', { method: 'DELETE' });
  } catch (error) {
    console.error('Failed to clear cart via API:', error);
  }

  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new Event('cartUpdated'));
};

// Helper for local storage access
const getLocalCartItems = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  const cartStr = localStorage.getItem(CART_STORAGE_KEY);
  return cartStr ? JSON.parse(cartStr) : [];
};

