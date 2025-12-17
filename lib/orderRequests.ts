'use client';

import { CancelRequest, ReturnRequest, Order } from '@/types';

const CANCEL_REQUESTS_KEY = 'orderCancelRequests';
const RETURN_REQUESTS_KEY = 'orderReturnRequests';

export const requestCancel = async (orderId: string, reason?: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'cancel',
        orderId,
        reason
      })
    });

    if (response.ok) {
      window.dispatchEvent(new CustomEvent('orderRequestUpdated'));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error requesting cancellation:', error);
    return false;
  }
};

export const requestReturn = async (
  orderId: string,
  items: string[],
  reason: 'size_issue' | 'damaged_item' | 'wrong_product' | 'other',
  resolution: 'refund' | 'replacement',
  comment?: string,
  images?: string[],
  refundMethod?: 'bank' | 'wallet',
  bankDetails?: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    mobileNumber?: string;
  },
  refundAmount?: number
): Promise<boolean> => {
  try {
    const response = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'return',
        orderId,
        items,
        reason,
        resolution,
        comment,
        images,
        refundMethod,
        bankDetails,
        refundAmount
      })
    });

    if (response.ok) {
      window.dispatchEvent(new CustomEvent('orderRequestUpdated'));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error requesting return:', error);
    return false;
  }
};

export const getCancelRequests = (): CancelRequest[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CANCEL_REQUESTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getReturnRequests = (): ReturnRequest[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(RETURN_REQUESTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getAllRequests = () => {
  return {
    cancelRequests: getCancelRequests(),
    returnRequests: getReturnRequests(),
  };
};

export const updateCancelRequestStatus = async (
  orderId: string,
  status: 'Approved' | 'Rejected',
  adminNote?: string
): Promise<void> => {
  try {
    const response = await fetch('/api/requests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'cancel',
        orderId,
        status,
        adminNote
      })
    });

    if (response.ok) {
      window.dispatchEvent(new CustomEvent('orderRequestUpdated'));
    }
  } catch (error) {
    console.error('Error updating cancel request:', error);
  }
};

export const updateReturnRequestStatus = async (
  orderId: string,
  status: 'Approved' | 'Rejected' | 'Completed',
  adminNote?: string
): Promise<void> => {
  try {
    const response = await fetch('/api/requests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'return',
        orderId,
        status,
        adminNote
      })
    });

    if (response.ok) {
      window.dispatchEvent(new CustomEvent('orderRequestUpdated'));
    }
  } catch (error) {
    console.error('Error updating return request:', error);
  }
};

const updateOrderStatus = (orderId: string, status: Order['status']): void => {
  // Update user orders
  const ordersStr = localStorage.getItem('userOrders');
  if (ordersStr) {
    const orders: Order[] = JSON.parse(ordersStr);
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
      localStorage.setItem('userOrders', JSON.stringify(orders));
    }
  }

  // Update admin orders (stored as object with order IDs as keys)
  const adminOrdersStr = localStorage.getItem('adminOrders');
  if (adminOrdersStr) {
    try {
      const adminOrders: Record<string, any> = JSON.parse(adminOrdersStr);
      if (adminOrders[orderId]) {
        adminOrders[orderId].status = status;
        localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
      }
    } catch (e) {
      console.error('Error updating admin orders:', e);
    }
  }

  // Also update via adminOrders utility if available
  try {
    const { updateOrderStatus: adminUpdateStatus } = require('@/lib/adminOrders');
    adminUpdateStatus(orderId, status as string);
  } catch (e) {
    // adminOrders might not be available, that's okay
  }
};

export const canCancelOrder = (order: Order): boolean => {
  // Can only cancel if order is Pending or Processing
  if (order.status !== 'Pending' && order.status !== 'Processing') return false;

  // Check if already has a pending cancel request
  const cancelRequests = getCancelRequests();
  const hasPendingCancel = cancelRequests.some(
    (r) => r.orderId === order.id && r.status === 'Pending'
  );

  return !hasPendingCancel;
};

export const canReturnOrder = (order: Order): boolean => {
  // Can only return if order is Delivered
  if (order.status !== 'Delivered') return false;

  // Check if already has a pending return request
  const returnRequests = getReturnRequests();
  const hasPendingReturn = returnRequests.some(
    (r) => r.orderId === order.id && r.status === 'Pending'
  );
  if (hasPendingReturn) return false;

  // Check if within return window (14 days from order creation)
  // In production, you'd use actual delivery date
  const orderDate = new Date(order.createdAt);
  const daysSinceOrder = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceOrder <= 14;
};

