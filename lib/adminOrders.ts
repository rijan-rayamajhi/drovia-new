import { Order } from '@/types';

const ADMIN_ORDERS_STORAGE_KEY = 'adminOrders';

export interface ExtendedOrder extends Order {
  email?: string;
  alternatePhone?: string;
  houseFlat?: string;
  street?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  courier?: string;
  trackingId?: string;
  notes?: string;
  activityLog?: Array<{ timestamp: string; status: string; note?: string }>;
}

export const getAllOrders = (): ExtendedOrder[] => {
  if (typeof window === 'undefined') return [];
  const ordersStr = localStorage.getItem('userOrders');
  if (!ordersStr) return [];
  
  const orders = JSON.parse(ordersStr);
  // Merge with admin-specific data if exists
  const adminDataStr = localStorage.getItem(ADMIN_ORDERS_STORAGE_KEY);
  const adminData = adminDataStr ? JSON.parse(adminDataStr) : {};
  
  return orders.map((order: Order) => ({
    ...order,
    ...adminData[order.id],
  }));
};

export const updateOrderStatus = (orderId: string, status: string, note?: string): void => {
  if (typeof window === 'undefined') return;
  
  const adminDataStr = localStorage.getItem(ADMIN_ORDERS_STORAGE_KEY);
  const adminData = adminDataStr ? JSON.parse(adminDataStr) : {};
  
  if (!adminData[orderId]) {
    adminData[orderId] = {};
  }
  
  adminData[orderId].status = status;
  
  if (!adminData[orderId].activityLog) {
    adminData[orderId].activityLog = [];
  }
  
  adminData[orderId].activityLog.push({
    timestamp: new Date().toISOString(),
    status,
    note,
  });
  
  localStorage.setItem(ADMIN_ORDERS_STORAGE_KEY, JSON.stringify(adminData));
  
  // Also update the main order
  const ordersStr = localStorage.getItem('userOrders');
  if (ordersStr) {
    const orders = JSON.parse(ordersStr);
    const orderIndex = orders.findIndex((o: Order) => o.id === orderId);
    if (orderIndex >= 0) {
      orders[orderIndex].status = status as any;
      localStorage.setItem('userOrders', JSON.stringify(orders));
    }
  }
};

export const updateOrderShipping = (orderId: string, courier: string, trackingId: string): void => {
  if (typeof window === 'undefined') return;
  
  const adminDataStr = localStorage.getItem(ADMIN_ORDERS_STORAGE_KEY);
  const adminData = adminDataStr ? JSON.parse(adminDataStr) : {};
  
  if (!adminData[orderId]) {
    adminData[orderId] = {};
  }
  
  adminData[orderId].courier = courier;
  adminData[orderId].trackingId = trackingId;
  
  localStorage.setItem(ADMIN_ORDERS_STORAGE_KEY, JSON.stringify(adminData));
};

export const updateOrderNotes = (orderId: string, notes: string): void => {
  if (typeof window === 'undefined') return;
  
  const adminDataStr = localStorage.getItem(ADMIN_ORDERS_STORAGE_KEY);
  const adminData = adminDataStr ? JSON.parse(adminDataStr) : {};
  
  if (!adminData[orderId]) {
    adminData[orderId] = {};
  }
  
  adminData[orderId].notes = notes;
  
  localStorage.setItem(ADMIN_ORDERS_STORAGE_KEY, JSON.stringify(adminData));
};

