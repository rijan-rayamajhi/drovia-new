'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import { Order, OrderItem } from '@/types';
import { requestItemReturn } from '@/lib/itemRequests';

interface ItemReturnModalProps {
  order: Order;
  item: OrderItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ItemReturnModal({
  order,
  item,
  isOpen,
  onClose,
  onSuccess,
}: ItemReturnModalProps) {
  const [reason, setReason] = useState<'size_issue' | 'damaged_item' | 'wrong_product' | 'other'>('size_issue');
  const [comment, setComment] = useState('');
  const [refundMethod, setRefundMethod] = useState<'bank' | 'wallet'>('wallet');
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    mobileNumber: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    Array.from(files).slice(0, 3).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        if (newImages.length === Math.min(files.length, 3)) {
          setImages([...images, ...newImages].slice(0, 3));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = requestItemReturn(
      order.id,
      item.id,
      reason,
      refundMethod,
      comment || undefined,
      images.length > 0 ? images : undefined,
      refundMethod === 'bank' ? bankDetails : undefined
    );

    if (success) {
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess();
        setReason('size_issue');
        setComment('');
        setRefundMethod('wallet');
        setBankDetails({
          accountHolderName: '',
          bankName: '',
          accountNumber: '',
          ifscCode: '',
          mobileNumber: '',
        });
        setImages([]);
      }, 500);
    } else {
      setIsSubmitting(false);
      alert('Failed to submit return request. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-surface rounded-2xl shadow-luxury-lg max-w-2xl w-full p-6 md:p-8 relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-ivory rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-text-primary" />
            </button>

            <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
              Return Item
            </h2>
            <p className="text-text-muted mb-6">
              Request return for this item from Order #{order.id}
            </p>

            {/* Item Summary */}
            <div className="bg-ivory rounded-xl p-4 mb-6">
              <p className="font-semibold text-text-primary mb-2">{item.product?.name}</p>
              <div className="text-sm text-text-muted space-y-1">
                <p>SKU: {item.sku}</p>
                <p>Size: {item.size} • Quantity: {item.quantity}</p>
                <p className="font-medium text-text-primary mt-2">
                  Refund Amount: ₹{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Return Reason */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Return Reason *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full input-field"
                  required
                >
                  <option value="size_issue">Size Issue</option>
                  <option value="damaged_item">Damaged Item</option>
                  <option value="wrong_product">Wrong Product</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Additional Comment */}
              <Input
                label="Additional Comments (Optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Please provide more details..."
              />

              {/* Refund Method */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Refund Method *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRefundMethod('wallet')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      refundMethod === 'wallet'
                        ? 'border-gold bg-gold/5'
                        : 'border-gray-200 hover:border-gold/50'
                    }`}
                  >
                    <h3 className="font-semibold text-text-primary mb-1">Wallet / Store Points</h3>
                    <p className="text-sm text-text-muted">
                      Refund will be credited to your store wallet
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefundMethod('bank')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      refundMethod === 'bank'
                        ? 'border-gold bg-gold/5'
                        : 'border-gray-200 hover:border-gold/50'
                    }`}
                  >
                    <h3 className="font-semibold text-text-primary mb-1">Bank Account</h3>
                    <p className="text-sm text-text-muted">
                      Refund will be transferred to your bank
                    </p>
                  </button>
                </div>
              </div>

              {/* Bank Details */}
              {refundMethod === 'bank' && (
                <div className="space-y-4 bg-ivory p-4 rounded-xl">
                  <Input
                    label="Account Holder Name *"
                    value={bankDetails.accountHolderName}
                    onChange={(e) =>
                      setBankDetails({ ...bankDetails, accountHolderName: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Bank Name *"
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                    required
                  />
                  <Input
                    label="Account Number *"
                    value={bankDetails.accountNumber}
                    onChange={(e) =>
                      setBankDetails({ ...bankDetails, accountNumber: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="IFSC Code *"
                    value={bankDetails.ifscCode}
                    onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                    required
                  />
                  <Input
                    label="Mobile Number (Optional)"
                    value={bankDetails.mobileNumber}
                    onChange={(e) =>
                      setBankDetails({ ...bankDetails, mobileNumber: e.target.value })
                    }
                  />
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Upload Images (Optional, Max 3)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="return-images"
                  disabled={images.length >= 3}
                />
                <label
                  htmlFor="return-images"
                  className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-accent transition-colors"
                >
                  <Upload className="w-5 h-5 text-text-muted" />
                  <span className="text-text-muted">
                    {images.length > 0 ? `${images.length} image(s) selected` : 'Choose images'}
                  </span>
                </label>
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {images.map((img, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                        <img src={img} alt={`Return ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages(images.filter((_, i) => i !== index))}
                          className="absolute top-1 right-1 bg-error text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

