import mongoose from 'mongoose';

const BankDetailsSchema = new mongoose.Schema({
  accountHolderName: {
    type: String
  },
  bankName: {
    type: String
  },
  accountNumber: {
    type: String
  },
  ifscCode: {
    type: String
  },
  mobileNumber: {
    type: String
  }
});

const ReturnRequestSchema = new mongoose.Schema({
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
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  reason: {
    type: String,
    enum: ['size_issue', 'damaged_item', 'wrong_product', 'other'],
    required: true
  },
  resolution: {
    type: String,
    enum: ['refund', 'replacement'],
    required: true
  },
  comment: {
    type: String
  },
  images: [{
    type: String // GridFS file IDs
  }],
  refundMethod: {
    type: String,
    enum: ['bank', 'wallet']
  },
  refundAmount: {
    type: Number,
    min: 0
  },
  bankDetails: {
    type: BankDetailsSchema
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending',
    index: true
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
ReturnRequestSchema.index({ status: 1, requestedAt: -1 });

export default mongoose.models.ReturnRequest || mongoose.model('ReturnRequest', ReturnRequestSchema);

