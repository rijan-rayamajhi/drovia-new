import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  orderId: {
    type: String, // Changed to String to support order IDs as strings
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

const WalletSchema = new mongoose.Schema({
  userId: {
    type: String, // Changed to String to support email/name as userId
    required: true,
    unique: true,
    index: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  transactions: [TransactionSchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for transaction queries
WalletSchema.index({ 'transactions.timestamp': -1 });

export default mongoose.models.Wallet || mongoose.model('Wallet', WalletSchema);

