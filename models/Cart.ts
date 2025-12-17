import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  product: {
    type: mongoose.Schema.Types.Mixed, // Denormalized product data
    required: true
  },
  size: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
});

const CartSchema = new mongoose.Schema({
  userId: {
    type: String, // Changed from ObjectId to String to match Auth system
    required: true,
    unique: true,
    index: true
  },
  items: [CartItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before saving
CartSchema.pre('save', async function () {
  this.updatedAt = new Date();
});

export default mongoose.models.Cart || mongoose.model('Cart', CartSchema);

