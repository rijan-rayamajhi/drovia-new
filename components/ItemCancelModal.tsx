'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import { Order, OrderItem } from '@/types';
import { requestItemCancel } from '@/lib/itemRequests';

interface ItemCancelModalProps {
  order: Order;
  item: OrderItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ItemCancelModal({
  order,
  item,
  isOpen,
  onClose,
  onSuccess,
}: ItemCancelModalProps) {
  const [reason, setReason] = useState('');
  const [refundMethod, setRefundMethod] = useState<'wallet' | 'source'>('wallet');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = requestItemCancel(order.id, item.id, reason || undefined, refundMethod);

    if (success) {
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess();
        setReason('');
        setRefundMethod('wallet');
      }, 500);
    } else {
      setIsSubmitting(false);
      alert('Failed to submit cancel request. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-surface rounded-2xl shadow-luxury-lg max-w-md w-full p-6 md:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-ivory rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-text-primary" />
            </button>

            <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
              Cancel Item
            </h2>
            <p className="text-text-muted mb-6">
              Request cancellation for this item from Order #{order.id}
            </p>

            {/* Item Summary */}
            <div className="bg-ivory rounded-xl p-4 mb-6">
              <p className="font-semibold text-text-primary mb-2">{item.product?.name}</p>
              <div className="text-sm text-text-muted space-y-1">
                <p>SKU: {item.sku}</p>
                <p>Size: {item.size} • Quantity: {item.quantity}</p>
                <p className="font-medium text-text-primary mt-2">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Reason for Cancellation (Optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason..."
              />

              {/* Refund Method Selection */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Refund Method
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-accent" style={{ borderColor: refundMethod === 'wallet' ? 'var(--color-accent)' : 'var(--color-border)' }}>
                    <input
                      type="radio"
                      name="refundMethod"
                      value="wallet"
                      checked={refundMethod === 'wallet'}
                      onChange={(e) => setRefundMethod(e.target.value as 'wallet')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-text-primary">Refund to Wallet</p>
                      <p className="text-sm text-text-muted mt-1">Instant credit • Use for next purchase</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-accent" style={{ borderColor: refundMethod === 'source' ? 'var(--color-accent)' : 'var(--color-border)' }}>
                    <input
                      type="radio"
                      name="refundMethod"
                      value="source"
                      checked={refundMethod === 'source'}
                      onChange={(e) => setRefundMethod(e.target.value as 'source')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-text-primary">Refund to Original Payment Method</p>
                      <p className="text-sm text-text-muted mt-1">3-5 business days • Back to UPI/Card</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

