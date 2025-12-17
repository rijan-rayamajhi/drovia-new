import mongoose from 'mongoose';

const SubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    default: 'Stay Updated'
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  }
});

export default mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema);

