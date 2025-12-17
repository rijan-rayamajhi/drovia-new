'use client';

import { Product } from '@/types';

const WISHLIST_STORAGE_KEY = 'wishlistItems';

export const getWishlistItems = (): Product[] => {
  if (typeof window === 'undefined') return [];
  const wishlistStr = localStorage.getItem(WISHLIST_STORAGE_KEY);
  return wishlistStr ? JSON.parse(wishlistStr) : [];
};

export const addToWishlist = (product: Product): void => {
  if (typeof window === 'undefined') return;
  const items = getWishlistItems();
  if (!items.find((item) => item.id === product.id)) {
    items.push(product);
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('wishlistUpdated'));
  }
};

export const removeFromWishlist = (productId: string): void => {
  if (typeof window === 'undefined') return;
  const items = getWishlistItems().filter((item) => item.id !== productId);
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('wishlistUpdated'));
};

export const isInWishlist = (productId: string): boolean => {
  return getWishlistItems().some((item) => item.id === productId);
};

export const getWishlistCount = (): number => {
  return getWishlistItems().length;
};

