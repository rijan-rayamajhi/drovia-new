import mongoose from 'mongoose';

const CancelRequestSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  reason: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
    index: true
  },
  refundMethod: {
    type: String,
    enum: ['source', 'wallet'],
    default: 'wallet'
  },
  refundAmount: {
    type: Number,
    min: 0
  },
  refundStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed', 'Failed'],
    default: 'Pending'
  },
  razorpayRefundId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  adminNote: {
    type: String
  },
  requestedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  processedAt: {
    type: Date
  }
});

// Index for pending requests query
CancelRequestSchema.index({ status: 1, requestedAt: -1 });

export default mongoose.models.CancelRequest || mongoose.model('CancelRequest', CancelRequestSchema);

