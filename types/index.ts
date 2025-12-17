export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  gender?: string;
  description?: string;
  fabric?: string;
  sizes?: string[];
  inStock?: boolean;
  featured?: boolean;
  new?: boolean;
  collection?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  sku: string;
  size: string;
  quantity: number;
  price: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancel Requested' | 'Cancelled' | 'Return Requested' | 'Return Approved' | 'Return Completed';
  product?: Product; // For display purposes
}

export interface Order {
  id: string;
  customerName: string;
  email?: string;
  phone: string;
  address: string;
  items: CartItem[]; // Legacy support
  orderItems?: OrderItem[]; // New itemized structure
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancel Requested' | 'Cancelled' | 'Return Requested' | 'Return Approved' | 'Return Completed';
  createdAt: string;
  orderDate?: string; // ISO date string for sorting
  paymentMethod: 'UPI' | 'COD' | 'WALLET' | 'ONLINE';
  userId?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  cancelRequest?: CancelRequest;
  returnRequest?: ReturnRequest;
}

export interface CancelRequest {
  orderId: string;
  reason?: string;
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminNote?: string;
}

export interface ReturnRequest {
  orderId: string;
  items: string[]; // Product IDs to return
  reason: 'size_issue' | 'damaged_item' | 'wrong_product' | 'other';
  comment?: string;
  images?: string[]; // Base64 or URLs
  resolution: 'refund' | 'replacement';
  refundMethod?: 'bank' | 'wallet'; // Only if resolution is 'refund'
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
  refundAmount?: number; // Amount to refund
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
}

export interface Announcement {
  id: string;
  text: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}


