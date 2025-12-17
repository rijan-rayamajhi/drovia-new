import mongoose from 'mongoose';

const WishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  productIds: [{
    type: String,
    ref: 'Product'
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before saving
WishlistSchema.pre('save', async function () {
  this.updatedAt = new Date();
});

export default mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema);
