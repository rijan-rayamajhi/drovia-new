import connectToDatabase from './mongodb';
import Order from '@/models/Order';
import { Order as OrderType } from '@/types';

export async function createOrder(orderData: OrderType): Promise<OrderType> {
  await connectToDatabase();

  const order = await Order.create({
    orderId: orderData.id,
    userId: orderData.userId ? orderData.userId : undefined,
    customerName: orderData.customerName,
    email: orderData.email,
    phone: orderData.phone,
    address: orderData.address,
    items: orderData.items,
    orderItems: orderData.orderItems,
    total: orderData.total,
    status: orderData.status || 'Pending',
    paymentMethod: orderData.paymentMethod,
    orderDate: orderData.orderDate ? new Date(orderData.orderDate) : new Date(),
    createdAt: orderData.createdAt ? new Date(orderData.createdAt) : new Date()
  });

  return {
    id: order.orderId,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address || '',
    items: order.items,
    orderItems: order.orderItems,
    total: order.total,
    status: order.status as OrderType['status'],
    paymentMethod: order.paymentMethod as OrderType['paymentMethod'],
    createdAt: order.createdAt.toISOString(),
    orderDate: order.orderDate.toISOString(),
    userId: order.userId?.toString(),
    email: order.email
  };
}

export async function getOrderById(orderId: string): Promise<OrderType | null> {
  await connectToDatabase();
  const order = await Order.findOne({ orderId }).populate('userId');

  if (!order) return null;

  return {
    id: order.orderId,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address || '',
    items: order.items,
    orderItems: order.orderItems,
    total: order.total,
    status: order.status as OrderType['status'],
    paymentMethod: order.paymentMethod as OrderType['paymentMethod'],
    createdAt: order.createdAt.toISOString(),
    orderDate: order.orderDate.toISOString(),
    userId: order.userId?.toString(),
    email: order.email
  };
}

export async function getUserOrders(userId: string): Promise<OrderType[]> {
  await connectToDatabase();
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });

  return orders.map(order => ({
    id: order.orderId,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address || '',
    items: order.items,
    orderItems: order.orderItems,
    total: order.total,
    status: order.status as OrderType['status'],
    paymentMethod: order.paymentMethod as OrderType['paymentMethod'],
    createdAt: order.createdAt.toISOString(),
    orderDate: order.orderDate.toISOString(),
    userId: order.userId?.toString(),
    email: order.email
  }));
}

export async function getAllOrders(): Promise<OrderType[]> {
  await connectToDatabase();
  const orders = await Order.find({}).sort({ createdAt: -1 });

  return orders.map(order => ({
    id: order.orderId,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address || '',
    items: order.items,
    orderItems: order.orderItems,
    total: order.total,
    status: order.status as OrderType['status'],
    paymentMethod: order.paymentMethod as OrderType['paymentMethod'],
    createdAt: order.createdAt.toISOString(),
    orderDate: order.orderDate.toISOString(),
    userId: order.userId?.toString(),
    email: order.email
  }));
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderType['status'],
  note?: string
): Promise<OrderType | null> {
  await connectToDatabase();

  const order = await Order.findOne({ orderId });
  if (!order) return null;

  order.status = status;
  if (note) {
    order.activityLog.push({
      timestamp: new Date(),
      status,
      note
    });
  }

  await order.save();

  return {
    id: order.orderId,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address || '',
    items: order.items,
    orderItems: order.orderItems,
    total: order.total,
    status: order.status as OrderType['status'],
    paymentMethod: order.paymentMethod as OrderType['paymentMethod'],
    createdAt: order.createdAt.toISOString(),
    orderDate: order.orderDate.toISOString(),
    userId: order.userId?.toString(),
    email: order.email
  };
}

export async function updateOrderShipping(
  orderId: string,
  courier: string,
  trackingId: string
): Promise<OrderType | null> {
  await connectToDatabase();

  const order = await Order.findOne({ orderId });
  if (!order) return null;

  order.courier = courier;
  order.trackingId = trackingId;
  await order.save();

  return {
    id: order.orderId,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address || '',
    items: order.items,
    orderItems: order.orderItems,
    total: order.total,
    status: order.status as OrderType['status'],
    paymentMethod: order.paymentMethod as OrderType['paymentMethod'],
    createdAt: order.createdAt.toISOString(),
    orderDate: order.orderDate.toISOString(),
    userId: order.userId?.toString(),
    email: order.email
  };
}

