'use client';

import { Order, CartItem, OrderItem } from '@/types';

const ORDERS_STORAGE_KEY = 'userOrders';

export const saveOrder = (order: Order): void => {
  if (typeof window === 'undefined') return;
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  
  // Also save to admin orders
  const adminOrdersStr = localStorage.getItem('adminOrders');
  const adminOrders = adminOrdersStr ? JSON.parse(adminOrdersStr) : {};
  adminOrders[order.id] = { ...order };
  localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
};

export const getOrders = (): Order[] => {
  if (typeof window === 'undefined') return [];
  const ordersStr = localStorage.getItem(ORDERS_STORAGE_KEY);
  const orders = ordersStr ? JSON.parse(ordersStr) : [];
  // Sort by orderDate DESC (newest first)
  return orders.sort((a: Order, b: Order) => {
    const dateA = a.orderDate || a.createdAt;
    const dateB = b.orderDate || b.createdAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
};

export const getUserOrders = (userId: string): Order[] => {
  return getOrders().filter((order) => order.id.includes(userId));
};

// Convert CartItem[] to OrderItem[]
export const convertItemsToOrderItems = (items: CartItem[], orderId: string): OrderItem[] => {
  return items.map((item, index) => ({
    id: `${orderId}-ITEM-${index + 1}`,
    productId: item.product.id,
    sku: `${item.product.id}-${item.size}`,
    size: item.size,
    quantity: item.quantity,
    price: item.product.price,
    status: 'Pending' as const,
    product: item.product,
  }));
};

