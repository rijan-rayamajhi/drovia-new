import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sku: {
    type: String
  },
  size: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancel Requested', 'Cancelled', 'Return Requested', 'Return Approved', 'Return Completed'],
    default: 'Pending'
  },
  product: {
    type: mongoose.Schema.Types.Mixed // Denormalized product data
  }
});

const ActivityLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    required: true
  },
  note: {
    type: String
  }
});

const CancelRequestSchema = new mongoose.Schema({
  orderId: String,
  reason: String,
  requestedAt: Date,
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  adminNote: String
});

const ReturnRequestSchema = new mongoose.Schema({
  orderId: String,
  items: [String],
  reason: String,
  comment: String,
  images: [String],
  resolution: String,
  refundMethod: String,
  bankDetails: {
    accountHolderName: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    mobileNumber: String
  },
  refundAmount: Number,
  requestedAt: Date,
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending'
  },
  adminNote: String
});

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    ref: 'User',
    index: true
  },
  customerName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  alternatePhone: {
    type: String
  },
  address: {
    type: String
  },
  houseFlat: {
    type: String
  },
  street: {
    type: String
  },
  landmark: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  pincode: {
    type: String
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.Mixed
    },
    size: String,
    quantity: Number
  }],
  orderItems: [OrderItemSchema],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancel Requested', 'Cancelled', 'Return Requested', 'Return Approved', 'Return Completed'],
    default: 'Pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'COD', 'WALLET', 'ONLINE'],
    required: true
  },
  courier: {
    type: String
  },
  trackingId: {
    type: String,
    index: true
  },
  notes: {
    type: String
  },
  cancelRequest: CancelRequestSchema,
  returnRequest: ReturnRequestSchema,
  activityLog: [ActivityLogSchema],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  orderDate: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes for better query performance
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);

