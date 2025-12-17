'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Upload, XCircle, Info, CreditCard, Wallet } from 'lucide-react';
import Button from '@/components/Button';
import { Order } from '@/types';
import { requestReturn } from '@/lib/orderRequests';

interface ReturnRequestModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RETURN_REASONS = [
  { value: 'size_issue', label: 'Size Issue' },
  { value: 'damaged_item', label: 'Damaged Item' },
  { value: 'wrong_product', label: 'Wrong Product' },
  { value: 'other', label: 'Other' },
] as const;

export default function ReturnRequestModal({
  order,
  isOpen,
  onClose,
  onSuccess,
}: ReturnRequestModalProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [reason, setReason] = useState<'size_issue' | 'damaged_item' | 'wrong_product' | 'other'>('size_issue');
  const [resolution, setResolution] = useState<'refund' | 'replacement'>('refund');
  const [refundMethod, setRefundMethod] = useState<'bank' | 'wallet'>('wallet');
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    mobileNumber: '',
  });
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleItemToggle = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 3) {
      setError('Maximum 3 images allowed');
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        setError(`Image ${file.name} exceeds 2MB limit`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setImages((prev) => [...prev, imageUrl]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateBankDetails = (): boolean => {
    if (resolution === 'refund' && refundMethod === 'bank') {
      if (!bankDetails.accountHolderName.trim()) {
        setError('Account Holder Name is required');
        return false;
      }
      if (!bankDetails.bankName.trim()) {
        setError('Bank Name is required');
        return false;
      }
      if (!bankDetails.accountNumber.trim() || bankDetails.accountNumber.length < 9) {
        setError('Valid Account Number is required');
        return false;
      }
      if (!bankDetails.ifscCode.trim() || bankDetails.ifscCode.length !== 11) {
        setError('Valid IFSC Code is required (11 characters)');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedItems.size === 0) {
      setError('Please select at least one item to return');
      return;
    }

    if (!validateBankDetails()) {
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const itemIds = Array.from(selectedItems);
      
      // Calculate refund amount for selected items
      const refundAmount = order.items
        .filter((item, index) => {
          const itemId = `${item.product.id}-${item.size}`;
          return selectedItems.has(itemId);
        })
        .reduce((sum, item) => sum + item.product.price * item.quantity, 0);

      const success = requestReturn(
        order.id,
        itemIds,
        reason,
        resolution,
        comment.trim() || undefined,
        images.length > 0 ? images : undefined,
        resolution === 'refund' ? refundMethod : undefined,
        resolution === 'refund' && refundMethod === 'bank' ? bankDetails : undefined,
        refundAmount
      );

      if (success) {
        onSuccess();
        onClose();
        // Reset form
        setSelectedItems(new Set());
        setReason('size_issue');
        setResolution('refund');
        setRefundMethod('wallet');
        setBankDetails({
          accountHolderName: '',
          bankName: '',
          accountNumber: '',
          ifscCode: '',
          mobileNumber: '',
        });
        setComment('');
        setImages([]);
      } else {
        setError('A return request already exists for this order.');
      }
    } catch (err) {
      setError('Failed to submit return request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-soft max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <RefreshCw className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold">Request Order Return</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-text-light">Order ID:</span>
                    <span className="font-semibold">#{order.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-light">Total Amount:</span>
                    <span className="font-bold text-lg text-primary">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>

                {/* Items Selection */}
                <div>
                  <h3 className="font-semibold mb-3">Select Items to Return:</h3>
                  <div className="space-y-2">
                    {order.items.map((item, index) => {
                      const itemId = `${item.product.id}-${item.size}`;
                      const isSelected = selectedItems.has(itemId);
                      return (
                        <label
                          key={index}
                          className={`flex items-center gap-4 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleItemToggle(itemId)}
                            className="w-5 h-5 text-primary focus:ring-primary rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-text-light">
                              Size: {item.size} × Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold">
                            {formatCurrency(item.product.price * item.quantity)}
                          </p>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Return Reason */}
                <div>
                  <label htmlFor="returnReason" className="block text-sm font-medium mb-2">
                    Return Reason <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="returnReason"
                    value={reason}
                    onChange={(e) =>
                      setReason(e.target.value as typeof reason)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    {RETURN_REASONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Resolution Choice */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Resolution Preference <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        resolution === 'refund'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="resolution"
                        value="refund"
                        checked={resolution === 'refund'}
                        onChange={(e) => setResolution(e.target.value as typeof resolution)}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <p className="font-semibold">Refund</p>
                        <p className="text-sm text-text-light mt-1">Get money back</p>
                      </div>
                    </label>
                    <label
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        resolution === 'replacement'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="resolution"
                        value="replacement"
                        checked={resolution === 'replacement'}
                        onChange={(e) => setResolution(e.target.value as typeof resolution)}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <p className="font-semibold">Replacement</p>
                        <p className="text-sm text-text-light mt-1">Get a new item</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Refund Method Selection (only if refund is selected) */}
                {resolution === 'refund' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                        Choose Refund Method <span className="text-red-500">*</span>
                        <div className="group relative">
                          <Info className="w-4 h-4 text-text-light cursor-help" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            Select how you want to receive your refund
                          </div>
                        </div>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Bank Account Option */}
                        <label
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            refundMethod === 'bank'
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="refundMethod"
                            value="bank"
                            checked={refundMethod === 'bank'}
                            onChange={(e) => setRefundMethod(e.target.value as typeof refundMethod)}
                            className="sr-only"
                          />
                          <div className="flex items-start gap-3">
                            <CreditCard className="w-5 h-5 text-primary mt-0.5" />
                            <div className="flex-1">
                              <p className="font-semibold">Refund to Bank Account</p>
                              <p className="text-sm text-text-light mt-1">
                                Direct transfer to your bank account
                              </p>
                            </div>
                          </div>
                        </label>

                        {/* Wallet/Points Option */}
                        <label
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            refundMethod === 'wallet'
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="refundMethod"
                            value="wallet"
                            checked={refundMethod === 'wallet'}
                            onChange={(e) => setRefundMethod(e.target.value as typeof refundMethod)}
                            className="sr-only"
                          />
                          <div className="flex items-start gap-3">
                            <Wallet className="w-5 h-5 text-primary mt-0.5" />
                            <div className="flex-1">
                              <p className="font-semibold">Refund as Wallet/Store Points</p>
                              <p className="text-sm text-text-light mt-1">
                                Credit to store wallet for future orders
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Bank Details Form (only if bank refund is selected) */}
                    {refundMethod === 'bank' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200"
                      >
                        <h4 className="font-semibold text-sm mb-2">Bank Account Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="accountHolderName" className="block text-sm font-medium mb-1">
                              Account Holder Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="accountHolderName"
                              type="text"
                              value={bankDetails.accountHolderName}
                              onChange={(e) =>
                                setBankDetails({ ...bankDetails, accountHolderName: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="Enter account holder name"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="bankName" className="block text-sm font-medium mb-1">
                              Bank Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="bankName"
                              type="text"
                              value={bankDetails.bankName}
                              onChange={(e) =>
                                setBankDetails({ ...bankDetails, bankName: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="Enter bank name"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="accountNumber" className="block text-sm font-medium mb-1">
                              Account Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="accountNumber"
                              type="text"
                              value={bankDetails.accountNumber}
                              onChange={(e) =>
                                setBankDetails({
                                  ...bankDetails,
                                  accountNumber: e.target.value.replace(/\D/g, ''),
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="Enter account number"
                              minLength={9}
                              maxLength={18}
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="ifscCode" className="block text-sm font-medium mb-1">
                              IFSC Code <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="ifscCode"
                              type="text"
                              value={bankDetails.ifscCode}
                              onChange={(e) =>
                                setBankDetails({
                                  ...bankDetails,
                                  ifscCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''),
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="ABCD0123456"
                              minLength={11}
                              maxLength={11}
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label htmlFor="mobileNumber" className="block text-sm font-medium mb-1">
                              Mobile Number <span className="text-text-light">(Optional)</span>
                            </label>
                            <input
                              id="mobileNumber"
                              type="tel"
                              value={bankDetails.mobileNumber}
                              onChange={(e) =>
                                setBankDetails({
                                  ...bankDetails,
                                  mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10),
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="10-digit mobile number"
                              maxLength={10}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Wallet Info (only if wallet refund is selected) */}
                    {refundMethod === 'wallet' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                      >
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">
                              Refund will be credited to your store wallet/points
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                              You can use these points to pay for future orders. 1 point = ₹1
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Additional Comment */}
                <div>
                  <label htmlFor="returnComment" className="block text-sm font-medium mb-2">
                    Additional Comments <span className="text-text-light">(Optional)</span>
                  </label>
                  <textarea
                    id="returnComment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Please provide more details about your return request..."
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload Images <span className="text-text-light">(Optional, Max 3)</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="space-y-3">
                    {images.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {images.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img}
                              alt={`Return image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {images.length < 3 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                      >
                        <Upload className="w-5 h-5 text-text-light" />
                        <span className="text-text-light">Upload Image</span>
                      </button>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
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
                    disabled={isSubmitting || selectedItems.size === 0}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

