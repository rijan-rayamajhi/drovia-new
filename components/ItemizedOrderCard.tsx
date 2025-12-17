'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { X, RefreshCw } from 'lucide-react';
import { Order, OrderItem } from '@/types';
import { canCancelItem, canReturnItem, getItemCancelRequest, getItemReturnRequest } from '@/lib/itemRequests';
import ItemCancelModal from './ItemCancelModal';
import ItemReturnModal from './ItemReturnModal';

interface ItemizedOrderCardProps {
  order: Order;
  onUpdate: () => void;
}

export default function ItemizedOrderCard({ order, onUpdate }: ItemizedOrderCardProps) {
  const [cancelModalItem, setCancelModalItem] = useState<{ order: Order; item: OrderItem } | null>(null);
  const [returnModalItem, setReturnModalItem] = useState<{ order: Order; item: OrderItem } | null>(null);

  // Use orderItems if available, otherwise convert from items
  const orderItems: OrderItem[] = order.orderItems || (order.items?.map((item, index) => ({
    id: `${order.id}-ITEM-${index + 1}`,
    productId: item.product.id,
    sku: `${item.product.id}-${item.size}`,
    size: item.size,
    quantity: item.quantity,
    price: item.product.price,
    status: order.status as OrderItem['status'],
    product: item.product,
  })) || []);

  const getItemStatusColor = (status: OrderItem['status']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-success/10 text-success';
      case 'Shipped':
        return 'bg-blue-100 text-blue-700';
      case 'Processing':
        return 'bg-purple-100 text-purple-700';
      case 'Cancel Requested':
        return 'bg-orange-100 text-orange-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      case 'Return Requested':
        return 'bg-yellow-100 text-yellow-700';
      case 'Return Approved':
        return 'bg-indigo-100 text-indigo-700';
      case 'Return Completed':
        return 'bg-teal-100 text-teal-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <>
      <div className="border border-gray-200 rounded-xl p-6 hover:shadow-soft transition-shadow">
        {/* Order Header */}
        <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
          <div>
            <p className="font-semibold text-text-primary text-lg">Order #{order.id}</p>
            <p className="text-sm text-text-muted mt-1">{order.createdAt}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-xl text-accent">₹{order.total.toLocaleString()}</p>
            <p className="text-xs text-text-muted mt-1">{order.paymentMethod}</p>
          </div>
        </div>

        {/* Itemized Items */}
        <div className="space-y-4">
          {orderItems.map((item) => {
            const canCancel = canCancelItem(item, order.status);
            const canReturn = canReturnItem(item, order.status, order.orderDate || order.createdAt);
            const cancelRequest = getItemCancelRequest(order.id, item.id);
            const returnRequest = getItemReturnRequest(order.id, item.id);

            return (
              <div
                key={item.id}
                className="bg-ivory rounded-lg p-4 border border-gray-100"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product?.image || '/placeholder-product.jpg'}
                      alt={item.product?.name || 'Product'}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-text-primary mb-1 line-clamp-2">
                          {item.product?.name || 'Product'}
                        </h4>
                        <div className="flex flex-wrap gap-2 text-sm text-text-muted">
                          <span>SKU: {item.sku}</span>
                          <span>•</span>
                          <span>Size: {item.size}</span>
                          <span>•</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-text-primary">₹{(item.price * item.quantity).toLocaleString()}</p>
                        <p className="text-xs text-text-muted">₹{item.price.toLocaleString()} each</p>
                      </div>
                    </div>

                    {/* Item Status */}
                    <div className="flex items-center justify-between mt-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getItemStatusColor(item.status)}`}>
                        {item.status}
                      </span>

                      {/* Item Actions */}
                      <div className="flex gap-2">
                        {canCancel && !cancelRequest && (
                          <button
                            onClick={() => setCancelModalItem({ order, item })}
                            className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-xs font-medium"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </button>
                        )}
                        {canReturn && !returnRequest && (
                          <button
                            onClick={() => setReturnModalItem({ order, item })}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Return
                          </button>
                        )}
                        {cancelRequest && cancelRequest.status === 'Pending' && (
                          <span className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium">
                            Cancel Pending
                          </span>
                        )}
                        {returnRequest && returnRequest.status === 'Pending' && (
                          <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                            Return Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Address */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-text-muted">{order.address}</p>
        </div>
      </div>

      {/* Modals */}
      {cancelModalItem && (
        <ItemCancelModal
          order={cancelModalItem.order}
          item={cancelModalItem.item}
          isOpen={!!cancelModalItem}
          onClose={() => setCancelModalItem(null)}
          onSuccess={() => {
            setCancelModalItem(null);
            onUpdate();
          }}
        />
      )}

      {returnModalItem && (
        <ItemReturnModal
          order={returnModalItem.order}
          item={returnModalItem.item}
          isOpen={!!returnModalItem}
          onClose={() => setReturnModalItem(null)}
          onSuccess={() => {
            setReturnModalItem(null);
            onUpdate();
          }}
        />
      )}
    </>
  );
}

