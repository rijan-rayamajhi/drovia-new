'use client';

import { OrderItem } from '@/types';

const ITEM_CANCEL_REQUESTS_KEY = 'itemCancelRequests';
const ITEM_RETURN_REQUESTS_KEY = 'itemReturnRequests';

export interface ItemCancelRequest {
  orderId: string;
  itemId: string;
  reason?: string;
  refundMethod?: 'wallet' | 'source';
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminNote?: string;
}

export interface ItemReturnRequest {
  orderId: string;
  itemId: string;
  reason: 'size_issue' | 'damaged_item' | 'wrong_product' | 'other';
  comment?: string;
  images?: string[];
  refundMethod: 'bank' | 'wallet';
  bankDetails?: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    mobileNumber?: string;
  };
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  adminNote?: string;
  refundAmount?: number;
}

// Business rules
const CANCEL_WINDOW_DAYS = 2; // Can cancel within 2 days
const RETURN_WINDOW_DAYS = 14; // Can return within 14 days of delivery

export const canCancelItem = (orderItem: OrderItem, orderStatus: string): boolean => {
  // Can only cancel if order hasn't shipped
  if (orderStatus === 'Shipped' || orderStatus === 'Delivered') {
    return false;
  }

  // Can only cancel if item status is Pending or Processing
  if (orderItem.status !== 'Pending' && orderItem.status !== 'Processing') {
    return false;
  }

  return true;
};

export const canReturnItem = (orderItem: OrderItem, orderStatus: string, orderDate: string): boolean => {
  // Can only return if order is delivered
  if (orderStatus !== 'Delivered') {
    return false;
  }

  // Can only return if item status is Delivered
  if (orderItem.status !== 'Delivered') {
    return false;
  }

  // Check return window
  const deliveryDate = new Date(orderDate);
  const now = new Date();
  const daysSinceDelivery = Math.floor((now.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
    return false;
  }

  return true;
};

export const requestItemCancel = (
  orderId: string,
  itemId: string,
  reason?: string,
  refundMethod?: 'wallet' | 'source'
): boolean => {
  if (typeof window === 'undefined') return false;

  const request: ItemCancelRequest = {
    orderId,
    itemId,
    reason,
    refundMethod: refundMethod || 'wallet',
    requestedAt: new Date().toISOString(),
    status: 'Pending',
  };

  const requests = getItemCancelRequests();
  // Check if request already exists
  if (requests.find((r) => r.orderId === orderId && r.itemId === itemId && r.status === 'Pending')) {
    return false;
  }

  requests.push(request);
  localStorage.setItem(ITEM_CANCEL_REQUESTS_KEY, JSON.stringify(requests));

  // Update item status
  updateItemStatus(orderId, itemId, 'Cancel Requested');

  // Dispatch event
  window.dispatchEvent(new CustomEvent('orderRequestUpdated'));

  return true;
};

export const requestItemReturn = (
  orderId: string,
  itemId: string,
  reason: 'size_issue' | 'damaged_item' | 'wrong_product' | 'other',
  refundMethod: 'bank' | 'wallet',
  comment?: string,
  images?: string[],
  bankDetails?: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    mobileNumber?: string;
  }
): boolean => {
  if (typeof window === 'undefined') return false;

  const request: ItemReturnRequest = {
    orderId,
    itemId,
    reason,
    refundMethod,
    comment,
    images,
    bankDetails,
    requestedAt: new Date().toISOString(),
    status: 'Pending',
  };

  const requests = getItemReturnRequests();
  // Check if request already exists
  if (requests.find((r) => r.orderId === orderId && r.itemId === itemId && r.status === 'Pending')) {
    return false;
  }

  requests.push(request);
  localStorage.setItem(ITEM_RETURN_REQUESTS_KEY, JSON.stringify(requests));

  // Update item status
  updateItemStatus(orderId, itemId, 'Return Requested');

  // Dispatch event
  window.dispatchEvent(new CustomEvent('orderRequestUpdated'));

  return true;
};

export const getItemCancelRequests = (): ItemCancelRequest[] => {
  if (typeof window === 'undefined') return [];
  const requestsStr = localStorage.getItem(ITEM_CANCEL_REQUESTS_KEY);
  return requestsStr ? JSON.parse(requestsStr) : [];
};

export const getItemReturnRequests = (): ItemReturnRequest[] => {
  if (typeof window === 'undefined') return [];
  const requestsStr = localStorage.getItem(ITEM_RETURN_REQUESTS_KEY);
  return requestsStr ? JSON.parse(requestsStr) : [];
};

export const getItemCancelRequest = (orderId: string, itemId: string): ItemCancelRequest | null => {
  const requests = getItemCancelRequests();
  return requests.find((r) => r.orderId === orderId && r.itemId === itemId) || null;
};

export const getItemReturnRequest = (orderId: string, itemId: string): ItemReturnRequest | null => {
  const requests = getItemReturnRequests();
  return requests.find((r) => r.orderId === orderId && r.itemId === itemId) || null;
};

const updateItemStatus = (orderId: string, itemId: string, status: OrderItem['status']): void => {
  if (typeof window === 'undefined') return;

  // Update in user orders
  const ordersStr = localStorage.getItem('userOrders');
  if (ordersStr) {
    const orders = JSON.parse(ordersStr);
    const order = orders.find((o: any) => o.id === orderId);
    if (order && order.orderItems) {
      const item = order.orderItems.find((i: OrderItem) => i.id === itemId);
      if (item) {
        item.status = status;
        localStorage.setItem('userOrders', JSON.stringify(orders));
      }
    }
  }

  // Update in admin orders
  const adminOrdersStr = localStorage.getItem('adminOrders');
  if (adminOrdersStr) {
    const adminOrders = JSON.parse(adminOrdersStr);
    if (adminOrders[orderId] && adminOrders[orderId].orderItems) {
      const item = adminOrders[orderId].orderItems.find((i: OrderItem) => i.id === itemId);
      if (item) {
        item.status = status;
        localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
      }
    }
  }
};

export const updateItemCancelRequestStatus = (
  orderId: string,
  itemId: string,
  status: 'Approved' | 'Rejected',
  adminNote?: string
): void => {
  if (typeof window === 'undefined') return;

  const requests = getItemCancelRequests();
  const request = requests.find((r) => r.orderId === orderId && r.itemId === itemId);
  if (request) {
    request.status = status;
    request.adminNote = adminNote;
    localStorage.setItem(ITEM_CANCEL_REQUESTS_KEY, JSON.stringify(requests));

    if (status === 'Approved') {
      updateItemStatus(orderId, itemId, 'Cancelled');
    } else {
      // Revert to previous status (would need to track previous status)
      updateItemStatus(orderId, itemId, 'Pending');
    }

    window.dispatchEvent(new CustomEvent('orderRequestUpdated'));
  }
};

export const updateItemReturnRequestStatus = (
  orderId: string,
  itemId: string,
  status: 'Approved' | 'Rejected' | 'Completed',
  adminNote?: string
): void => {
  if (typeof window === 'undefined') return;

  const requests = getItemReturnRequests();
  const request = requests.find((r) => r.orderId === orderId && r.itemId === itemId);
  if (request) {
    request.status = status;
    request.adminNote = adminNote;
    localStorage.setItem(ITEM_RETURN_REQUESTS_KEY, JSON.stringify(requests));

    if (status === 'Approved') {
      updateItemStatus(orderId, itemId, 'Return Approved');
    } else if (status === 'Completed') {
      updateItemStatus(orderId, itemId, 'Return Completed');
    } else {
      // Revert to Delivered
      updateItemStatus(orderId, itemId, 'Delivered');
    }

    window.dispatchEvent(new CustomEvent('orderRequestUpdated'));
  }
};

