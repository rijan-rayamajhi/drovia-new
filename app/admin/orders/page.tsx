'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Eye, X, Calendar, Download, Package, Truck, Printer, AlertTriangle, RefreshCw, Check, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { getAllOrders, updateOrderStatus, updateOrderShipping, updateOrderNotes, ExtendedOrder } from '@/lib/adminOrders';
import { getAllRequests, updateCancelRequestStatus, updateReturnRequestStatus } from '@/lib/orderRequests';
import {
  getItemCancelRequests,
  getItemReturnRequests,
  updateItemCancelRequestStatus,
  updateItemReturnRequestStatus,
  ItemCancelRequest,
  ItemReturnRequest
} from '@/lib/itemRequests';
import { adminCreditWallet } from '@/lib/wallet';

const statusColors: Record<string, string> = {
  Pending: 'bg-orange-100 text-orange-700',
  Processing: 'bg-purple-100 text-purple-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  'Cancel Requested': 'bg-orange-100 text-orange-700',
  'Return Requested': 'bg-yellow-100 text-yellow-700',
  'Return Approved': 'bg-indigo-100 text-indigo-700',
  'Return Completed': 'bg-teal-100 text-teal-700',
};

const statusOptions = ['All', 'Pending', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Cancel Requested', 'Return Requested', 'Return Approved', 'Return Completed'];

function AdminOrdersPageInner() {
  const searchParams = useSearchParams();
  const viewOrderId = searchParams.get('view');

  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ExtendedOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ExtendedOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingData, setShippingData] = useState({ courier: '', trackingId: '' });
  const [orderNotes, setOrderNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showRequestsPanel, setShowRequestsPanel] = useState(false);
  const [requests, setRequests] = useState({ cancelRequests: [], returnRequests: [] });
  const [itemRequests, setItemRequests] = useState<{
    cancelRequests: ItemCancelRequest[];
    returnRequests: ItemReturnRequest[];
  }>({ cancelRequests: [], returnRequests: [] });
  const [requestAdminNotes, setRequestAdminNotes] = useState<Record<string, string>>({});
  const [itemRequestAdminNotes, setItemRequestAdminNotes] = useState<Record<string, string>>({});
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchOrders();
  }, [viewOrderId]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);

        if (viewOrderId) {
          const order = data.find((o: any) => o.id === viewOrderId);
          if (order) {
            setSelectedOrder(order);
            setOrderNotes(order.notes || '');
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const loadRequests = () => {
    // Derive requests from orders (DB)
    const cancelRequests = orders
      .filter((o) => o.cancelRequest)
      .map((o) => o.cancelRequest);

    const returnRequests = orders
      .filter((o) => o.returnRequest)
      .map((o) => o.returnRequest);

    setRequests({ cancelRequests: cancelRequests as any, returnRequests: returnRequests as any });

    if (typeof window !== 'undefined') {
      // Load item-level requests (still from LS for now)
      const itemCancelRequests = getItemCancelRequests();
      const itemReturnRequests = getItemReturnRequests();
      setItemRequests({
        cancelRequests: itemCancelRequests,
        returnRequests: itemReturnRequests,
      });
    }
  };

  useEffect(() => {
    loadRequests();
  }, [orders]);

  useEffect(() => {
    let filtered = [...orders];

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter((o) => o.createdAt >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter((o) => o.createdAt <= dateTo);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(query) ||
          o.customerName.toLowerCase().includes(query) ||
          o.phone.includes(query)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, statusFilter, dateFrom, dateTo, searchQuery]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderStatus(orderId, newStatus, statusNote);
    setOrders(getAllOrders());
    setShowStatusModal(false);
    setStatusNote('');
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(getAllOrders().find((o) => o.id === orderId) || null);
    }
  };

  const handleMarkShipped = () => {
    if (!selectedOrder || !shippingData.courier || !shippingData.trackingId) {
      alert('Please fill in courier and tracking ID');
      return;
    }
    updateOrderShipping(selectedOrder.id, shippingData.courier, shippingData.trackingId);
    updateOrderStatus(selectedOrder.id, 'Shipped', `Shipped via ${shippingData.courier}`);
    setOrders(getAllOrders());
    setSelectedOrder(getAllOrders().find((o) => o.id === selectedOrder.id) || null);
    setShowShippingModal(false);
    setShippingData({ courier: '', trackingId: '' });
  };

  const handleSaveNotes = () => {
    if (selectedOrder) {
      updateOrderNotes(selectedOrder.id, orderNotes);
      setOrders(getAllOrders());
      setSelectedOrder(getAllOrders().find((o) => o.id === selectedOrder.id) || null);
    }
  };

  const printInvoice = (order: ExtendedOrder) => {
    // Build invoice HTML with only essential information
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
            }
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #1E3A8A;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #1E3A8A;
              margin: 0;
              font-size: 28px;
            }
            .header h2 {
              margin: 5px 0;
              font-size: 20px;
              color: #666;
            }
            .invoice-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .invoice-info div {
              flex: 1;
            }
            .invoice-info h3 {
              margin-top: 0;
              color: #1E3A8A;
              font-size: 16px;
            }
            .customer-details {
              background: #f5f5f5;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .customer-details h3 {
              margin-top: 0;
              color: #1E3A8A;
            }
            .customer-details p {
              margin: 5px 0;
              line-height: 1.6;
            }
            .total {
              text-align: right;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #1E3A8A;
            }
            .total h2 {
              font-size: 24px;
              color: #1E3A8A;
              margin: 0;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Fashion Store</h1>
            <h2>Invoice</h2>
          </div>
          
          <div class="invoice-info">
            <div>
              <h3>Order Information</h3>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            </div>
          </div>
          
          <div class="customer-details">
            <h3>Customer & Shipping Details</h3>
            <p><strong>Name:</strong> ${order.customerName}</p>
            <p><strong>Phone:</strong> ${order.phone}</p>
            ${order.alternatePhone ? `<p><strong>Alternate Phone:</strong> ${order.alternatePhone}</p>` : ''}
            ${order.email ? `<p><strong>Email:</strong> ${order.email}</p>` : ''}
            <p><strong>Shipping Address:</strong></p>
            <p style="margin-left: 20px; margin-top: 10px;">
              ${order.houseFlat ? `${order.houseFlat}, ` : ''}
              ${order.street ? `${order.street}, ` : ''}
              ${order.landmark ? `${order.landmark}, ` : ''}
              ${order.city ? `${order.city}, ` : ''}
              ${order.state ? `${order.state} - ` : ''}
              ${order.pincode || ''}
              ${!order.houseFlat && !order.street ? order.address : ''}
            </p>
          </div>
          
          <div class="total">
            <h2>Total Amount: ${formatCurrency(order.total)}</h2>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is a computer-generated invoice.</p>
          </div>
        </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      printWindow.focus();

      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
        // Close window after printing (optional)
        // printWindow.close();
      }, 250);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || statusColors.Pending}`}>
        {status}
      </span>
    );
  };

  const handleApproveCancel = (orderId: string) => {
    updateCancelRequestStatus(orderId, 'Approved', requestAdminNotes[orderId] || '');
    setRequestAdminNotes({ ...requestAdminNotes, [orderId]: '' });
    loadRequests();
    setOrders(getAllOrders());
  };

  const handleRejectCancel = (orderId: string) => {
    updateCancelRequestStatus(orderId, 'Rejected', requestAdminNotes[orderId] || '');
    setRequestAdminNotes({ ...requestAdminNotes, [orderId]: '' });
    loadRequests();
    setOrders(getAllOrders());
  };

  const handleApproveReturn = (orderId: string) => {
    updateReturnRequestStatus(orderId, 'Approved', requestAdminNotes[orderId] || '');
    setRequestAdminNotes({ ...requestAdminNotes, [orderId]: '' });
    loadRequests();
    setOrders(getAllOrders());
  };

  const handleRejectReturn = (orderId: string) => {
    updateReturnRequestStatus(orderId, 'Rejected', requestAdminNotes[orderId] || '');
    setRequestAdminNotes({ ...requestAdminNotes, [orderId]: '' });
    loadRequests();
    setOrders(getAllOrders());
  };

  const handleCompleteReturn = (orderId: string) => {
    updateReturnRequestStatus(orderId, 'Completed', requestAdminNotes[orderId] || '');
    setRequestAdminNotes({ ...requestAdminNotes, [orderId]: '' });
    loadRequests();
    setOrders(getAllOrders());
  };

  // Item-level request handlers
  const handleApproveItemCancel = async (orderId: string, itemId: string) => {
    const cancelRequest = (itemRequests?.cancelRequests || []).find((r: any) => r.orderId === orderId && r.itemId === itemId);
    const order = orders.find((o) => o.id === orderId);
    const item = order?.orderItems?.find((i: any) => i.id === itemId);

    // Process refund if applicable (don't update status until refund succeeds)
    if (cancelRequest && order && item) {
      const refundAmount = item.price * item.quantity;
      const refundMethod = cancelRequest.refundMethod || 'wallet';

      // Ensure userId is present
      const userId = order.userId || (order as any).email || (order as any).phone || 'guest';

      try {
        const response = await fetch('/api/refunds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Don't send cancelRequestId for item-level requests (they're in localStorage, not MongoDB)
            userId: userId,
            refundMethod,
            refundAmount,
            orderId: orderId,
            razorpayPaymentId: (order as any).razorpayPaymentId
          })
        });

        if (!response.ok) {
          const error = await response.json();
          alert(`Refund processing failed: ${error.error || 'Unknown error'}`);
          // Don't update status if refund failed - keep request visible
          loadRequests();
          return;
        } else {
          const result = await response.json();

          // Only update status to Approved after successful refund
          updateItemCancelRequestStatus(orderId, itemId, 'Approved', itemRequestAdminNotes[`${orderId}-${itemId}`] || '');
          setItemRequestAdminNotes({ ...itemRequestAdminNotes, [`${orderId}-${itemId}`]: '' });

          if (refundMethod === 'wallet') {
            // Wallet has been credited in MongoDB
            // Note: User's frontend wallet (localStorage) will need to sync with server
            alert(`Wallet credited with ₹${refundAmount.toLocaleString()}. The user's wallet balance has been updated in the database.`);

            // If wallet data is returned, we could potentially sync it
            // but since this is admin panel, the user's browser needs to fetch it
            if (result.wallet) {
              console.log('Wallet updated:', result.wallet);
            }
          } else {
            alert(`Refund initiated to original payment method. Refund ID: ${result.refundId}`);
          }
        }
      } catch (error) {
        console.error('Refund API error:', error);
        alert('Failed to process refund. Please try again.');
        // Don't update status if refund failed - keep request visible
        loadRequests();
        return;
      }
    } else {
      // If no refund needed, just approve the request
      updateItemCancelRequestStatus(orderId, itemId, 'Approved', itemRequestAdminNotes[`${orderId}-${itemId}`] || '');
      setItemRequestAdminNotes({ ...itemRequestAdminNotes, [`${orderId}-${itemId}`]: '' });
    }

    loadRequests();
    setOrders(getAllOrders());
  };

  const handleRejectItemCancel = (orderId: string, itemId: string) => {
    updateItemCancelRequestStatus(orderId, itemId, 'Rejected', itemRequestAdminNotes[`${orderId}-${itemId}`] || '');
    setItemRequestAdminNotes({ ...itemRequestAdminNotes, [`${orderId}-${itemId}`]: '' });
    loadRequests();
    setOrders(getAllOrders());
  };

  const handleApproveItemReturn = (orderId: string, itemId: string) => {
    const returnRequest = (itemRequests?.returnRequests || []).find((r: any) => r.orderId === orderId && r.itemId === itemId);
    updateItemReturnRequestStatus(orderId, itemId, 'Approved', itemRequestAdminNotes[`${orderId}-${itemId}`] || '');

    // If refund method is wallet, credit user's wallet
    if (returnRequest?.refundMethod === 'wallet') {
      const order = orders.find((o) => o.id === orderId);
      if (order?.userId && order.orderItems) {
        const item = order.orderItems.find((i: any) => i.id === itemId);
        if (item) {
          const refundAmount = returnRequest.refundAmount || (item.price * item.quantity);
          adminCreditWallet(
            order.userId,
            refundAmount,
            `Item return refund for Order #${orderId} - ${item.sku}`,
            orderId
          );
        }
      }
    }

    setItemRequestAdminNotes({ ...itemRequestAdminNotes, [`${orderId}-${itemId}`]: '' });
    loadRequests();
    setOrders(getAllOrders());
  };

  const handleRejectItemReturn = (orderId: string, itemId: string) => {
    updateItemReturnRequestStatus(orderId, itemId, 'Rejected', itemRequestAdminNotes[`${orderId}-${itemId}`] || '');
    setItemRequestAdminNotes({ ...itemRequestAdminNotes, [`${orderId}-${itemId}`]: '' });
    loadRequests();
    setOrders(getAllOrders());
  };

  const handleCompleteItemReturn = (orderId: string, itemId: string) => {
    updateItemReturnRequestStatus(orderId, itemId, 'Completed', itemRequestAdminNotes[`${orderId}-${itemId}`] || '');
    setItemRequestAdminNotes({ ...itemRequestAdminNotes, [`${orderId}-${itemId}`]: '' });
    loadRequests();
    setOrders(getAllOrders());
  };

  const pendingCancelRequests = requests.cancelRequests.filter((r: any) => r.status === 'Pending');
  const pendingReturnRequests = requests.returnRequests.filter((r: any) => r.status === 'Pending');
  const pendingItemCancelRequests = (itemRequests?.cancelRequests || []).filter((r: any) => r.status === 'Pending');
  const pendingItemReturnRequests = (itemRequests?.returnRequests || []).filter((r: any) => r.status === 'Pending');

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>
        {((pendingCancelRequests.length + pendingReturnRequests.length + pendingItemCancelRequests.length + pendingItemReturnRequests.length) > 0) && (
          <button
            onClick={() => setShowRequestsPanel(!showRequestsPanel)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors relative"
          >
            <AlertTriangle className="w-5 h-5" />
            <span>User Requests</span>
            {(pendingCancelRequests.length + pendingReturnRequests.length + pendingItemCancelRequests.length + pendingItemReturnRequests.length) > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {pendingCancelRequests.length + pendingReturnRequests.length + pendingItemCancelRequests.length + pendingItemReturnRequests.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* User Requests Panel */}
      <AnimatePresence>
        {showRequestsPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-white rounded-xl shadow-soft overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                User Requests ({pendingCancelRequests.length + pendingReturnRequests.length + pendingItemCancelRequests.length + pendingItemReturnRequests.length})
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Cancel Requests */}
              {pendingCancelRequests.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <X className="w-4 h-4 text-orange-600" />
                    Cancellation Requests ({pendingCancelRequests.length})
                  </h3>
                  <div className="space-y-4">
                    {pendingCancelRequests.map((request: any) => {
                      let order = orders.find((o) => o.id === request.orderId);

                      // If order not found in admin orders, try userOrders
                      if (!order && typeof window !== 'undefined') {
                        const userOrdersStr = localStorage.getItem('userOrders');
                        if (userOrdersStr) {
                          const userOrders = JSON.parse(userOrdersStr);
                          order = userOrders.find((o: any) => o.id === request.orderId);
                        }
                      }

                      if (!order) {
                        return (
                          <div key={request.orderId} className="border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-red-600">Order #{request.orderId} not found</p>
                          </div>
                        );
                      }

                      return (
                        <div key={request.orderId} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-semibold">Order #{request.orderId}</p>
                              <p className="text-sm text-text-light">
                                Requested: {new Date(request.requestedAt).toLocaleString('en-IN')}
                              </p>
                              {request.reason && (
                                <p className="text-sm text-text-light mt-2">
                                  <strong>Reason:</strong> {request.reason}
                                </p>
                              )}
                            </div>
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                              Pending
                            </span>
                          </div>
                          <div className="mb-3">
                            <p className="text-sm text-text-light">
                              Customer: {order.customerName} | Total: ₹{order.total.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Admin note (optional)"
                              value={requestAdminNotes[request.orderId] || ''}
                              onChange={(e) => setRequestAdminNotes({ ...requestAdminNotes, [request.orderId]: e.target.value })}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                              onClick={() => handleApproveCancel(request.orderId)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectCancel(request.orderId)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Return Requests */}
              {pendingReturnRequests.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-600" />
                    Return Requests ({pendingReturnRequests.length})
                  </h3>
                  <div className="space-y-4">
                    {pendingReturnRequests.map((request: any) => {
                      let order = orders.find((o) => o.id === request.orderId);

                      // If order not found in admin orders, try userOrders
                      if (!order && typeof window !== 'undefined') {
                        const userOrdersStr = localStorage.getItem('userOrders');
                        if (userOrdersStr) {
                          const userOrders = JSON.parse(userOrdersStr);
                          order = userOrders.find((o: any) => o.id === request.orderId);
                        }
                      }

                      const reasonLabels: Record<string, string> = {
                        size_issue: 'Size Issue',
                        damaged_item: 'Damaged Item',
                        wrong_product: 'Wrong Product',
                        other: 'Other',
                      };

                      if (!order) {
                        return (
                          <div key={request.orderId} className="border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-red-600">Order #{request.orderId} not found</p>
                          </div>
                        );
                      }

                      return (
                        <div key={request.orderId} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-semibold">Order #{request.orderId}</p>
                              <p className="text-sm text-text-light">
                                Requested: {new Date(request.requestedAt).toLocaleString('en-IN')}
                              </p>
                              <p className="text-sm text-text-light mt-1">
                                <strong>Reason:</strong> {reasonLabels[request.reason] || request.reason}
                              </p>
                              <p className="text-sm text-text-light">
                                <strong>Resolution:</strong> {request.resolution === 'refund' ? 'Refund' : 'Replacement'}
                              </p>
                              {request.resolution === 'refund' && request.refundMethod && (
                                <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                                  <p className="text-sm font-medium mb-1">
                                    Refund Method: <span className="capitalize">{request.refundMethod === 'bank' ? 'Bank Account' : 'Wallet/Points'}</span>
                                  </p>
                                  {request.refundAmount && (
                                    <p className="text-sm text-text-light">
                                      Refund Amount: ₹{request.refundAmount.toLocaleString()}
                                    </p>
                                  )}
                                  {request.refundMethod === 'bank' && request.bankDetails && (
                                    <div className="mt-2 text-xs space-y-1">
                                      <p><strong>Account Holder:</strong> {request.bankDetails.accountHolderName}</p>
                                      <p><strong>Bank:</strong> {request.bankDetails.bankName}</p>
                                      <p><strong>Account Number:</strong> {request.bankDetails.accountNumber}</p>
                                      <p><strong>IFSC:</strong> {request.bankDetails.ifscCode}</p>
                                      {request.bankDetails.mobileNumber && (
                                        <p><strong>Mobile:</strong> {request.bankDetails.mobileNumber}</p>
                                      )}
                                    </div>
                                  )}
                                  {request.refundMethod === 'wallet' && (
                                    <p className="text-xs text-blue-600 mt-1">
                                      Will be credited to user's wallet/points balance
                                    </p>
                                  )}
                                </div>
                              )}
                              {request.comment && (
                                <p className="text-sm text-text-light mt-2">
                                  <strong>Comment:</strong> {request.comment}
                                </p>
                              )}
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                              Pending
                            </span>
                          </div>
                          {request.images && request.images.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-medium mb-2">Uploaded Images:</p>
                              <div className="grid grid-cols-3 gap-2">
                                {request.images.map((img: string, idx: number) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`Return image ${idx + 1}`}
                                    className="w-full h-20 object-cover rounded-lg border border-gray-200"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="mb-3">
                            <p className="text-sm text-text-light">
                              Customer: {order.customerName} | Total: ₹{order.total.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Admin note (optional)"
                              value={requestAdminNotes[request.orderId] || ''}
                              onChange={(e) => setRequestAdminNotes({ ...requestAdminNotes, [request.orderId]: e.target.value })}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                              onClick={() => handleApproveReturn(request.orderId)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectReturn(request.orderId)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Item-Level Cancel Requests */}
              {pendingItemCancelRequests.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <X className="w-4 h-4 text-orange-600" />
                    Item Cancellation Requests ({pendingItemCancelRequests.length})
                  </h3>
                  <div className="space-y-4">
                    {pendingItemCancelRequests.map((request: any) => {
                      const order = orders.find((o) => o.id === request.orderId);
                      if (!order) return null;
                      const item = order.orderItems?.find((i: any) => i.id === request.itemId);
                      if (!item) return null;

                      return (
                        <div key={`${request.orderId}-${request.itemId}`} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-semibold">Order #{request.orderId} - Item: {item.sku}</p>
                              <p className="text-sm text-text-light">{item.product?.name}</p>
                              <p className="text-sm text-text-light">
                                Requested: {new Date(request.requestedAt).toLocaleString('en-IN')}
                              </p>
                              {request.reason && (
                                <p className="text-sm text-text-light mt-2">
                                  <strong>Reason:</strong> {request.reason}
                                </p>
                              )}
                              {request.refundMethod && (
                                <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                                  <p className="text-sm font-medium">
                                    Refund Method: <span className="capitalize">{request.refundMethod === 'wallet' ? 'Wallet (Instant)' : 'Original Payment Method (3-5 days)'}</span>
                                  </p>
                                  <p className="text-xs text-text-light mt-1">
                                    Amount: ₹{(item.price * item.quantity).toLocaleString()}
                                  </p>
                                </div>
                              )}
                            </div>
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                              Pending
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Admin note (optional)"
                              value={itemRequestAdminNotes[`${request.orderId}-${request.itemId}`] || ''}
                              onChange={(e) => setItemRequestAdminNotes({ ...itemRequestAdminNotes, [`${request.orderId}-${request.itemId}`]: e.target.value })}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                              onClick={() => handleApproveItemCancel(request.orderId, request.itemId)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectItemCancel(request.orderId, request.itemId)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Item-Level Return Requests */}
              {pendingItemReturnRequests.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-600" />
                    Item Return Requests ({pendingItemReturnRequests.length})
                  </h3>
                  <div className="space-y-4">
                    {pendingItemReturnRequests.map((request: any) => {
                      const order = orders.find((o) => o.id === request.orderId);
                      if (!order) return null;
                      const item = order.orderItems?.find((i: any) => i.id === request.itemId);
                      if (!item) return null;

                      return (
                        <div key={`${request.orderId}-${request.itemId}`} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-semibold">Order #{request.orderId} - Item: {item.sku}</p>
                              <p className="text-sm text-text-light">{item.product?.name}</p>
                              <p className="text-sm text-text-light">
                                Requested: {new Date(request.requestedAt).toLocaleString('en-IN')}
                              </p>
                              <p className="text-sm text-text-light mt-1">
                                <strong>Reason:</strong> {request.reason === 'size_issue' ? 'Size Issue' : request.reason === 'damaged_item' ? 'Damaged Item' : request.reason === 'wrong_product' ? 'Wrong Product' : 'Other'}
                              </p>
                              {request.refundMethod && (
                                <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                                  <p className="text-sm font-medium mb-1">
                                    Refund Method: <span className="capitalize">{request.refundMethod === 'bank' ? 'Bank Account' : 'Wallet/Points'}</span>
                                  </p>
                                  {request.refundMethod === 'bank' && request.bankDetails && (
                                    <div className="mt-2 text-xs space-y-1">
                                      <p><strong>Account:</strong> {request.bankDetails.accountHolderName}</p>
                                      <p><strong>Bank:</strong> {request.bankDetails.bankName}</p>
                                      <p><strong>IFSC:</strong> {request.bankDetails.ifscCode}</p>
                                    </div>
                                  )}
                                  {request.refundMethod === 'wallet' && (
                                    <p className="text-xs text-blue-600 mt-1">
                                      Will be credited to user's wallet
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                              Pending
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Admin note (optional)"
                              value={itemRequestAdminNotes[`${request.orderId}-${request.itemId}`] || ''}
                              onChange={(e) => setItemRequestAdminNotes({ ...itemRequestAdminNotes, [`${request.orderId}-${request.itemId}`]: e.target.value })}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                              onClick={() => handleApproveItemReturn(request.orderId, request.itemId)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectItemReturn(request.orderId, request.itemId)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {pendingCancelRequests.length === 0 && pendingReturnRequests.length === 0 && pendingItemCancelRequests.length === 0 && pendingItemReturnRequests.length === 0 && (
                <div className="text-center py-8 text-text-light">
                  <p>No pending requests</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Order ID, Customer..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="From Date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="To Date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Order ID</th>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Customer</th>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Items</th>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Total</th>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Payment</th>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Status</th>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Date</th>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-light">
                    No orders found
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium">{order.id}</td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-text-light">{order.phone}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">{order.items.length}</td>
                    <td className="py-4 px-6 font-semibold">{formatCurrency(order.total)}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(order.status)}</td>
                    <td className="py-4 px-6 text-text-light">{formatDate(order.createdAt)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setOrderNotes(order.notes || '');
                          }}
                          className="text-primary hover:text-primary-dark flex items-center gap-1 p-1 rounded hover:bg-primary/10 transition-colors"
                          title="View order"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => printInvoice(order)}
                          className="text-green-600 hover:text-green-700 flex items-center gap-1 p-1 rounded hover:bg-green-50 transition-colors"
                          title="Print invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-text-light">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} orders
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 border rounded-lg ${currentPage === page
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Order Details</h2>
                  <p className="text-text-light">Order ID: {selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Order Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-light">Date:</span>
                      <span className="font-medium">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light">Payment:</span>
                      <span className="font-medium">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light">Status:</span>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Customer Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-text-light">Name:</span>
                      <span className="font-medium ml-2">{selectedOrder.customerName}</span>
                    </div>
                    <div>
                      <span className="text-text-light">Phone:</span>
                      <span className="font-medium ml-2">{selectedOrder.phone}</span>
                    </div>
                    {selectedOrder.alternatePhone && (
                      <div>
                        <span className="text-text-light">Alternate Phone:</span>
                        <span className="font-medium ml-2">{selectedOrder.alternatePhone}</span>
                      </div>
                    )}
                    {selectedOrder.email && (
                      <div>
                        <span className="text-text-light">Email:</span>
                        <span className="font-medium ml-2">{selectedOrder.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-3">Shipping Address</h3>
                <div className="text-sm">
                  {selectedOrder.houseFlat && (
                    <div>
                      <span className="text-text-light">House/Flat:</span>
                      <span className="font-medium ml-2">{selectedOrder.houseFlat}</span>
                    </div>
                  )}
                  {selectedOrder.street && (
                    <div>
                      <span className="text-text-light">Street:</span>
                      <span className="font-medium ml-2">{selectedOrder.street}</span>
                    </div>
                  )}
                  {selectedOrder.landmark && (
                    <div>
                      <span className="text-text-light">Landmark:</span>
                      <span className="font-medium ml-2">{selectedOrder.landmark}</span>
                    </div>
                  )}
                  {(selectedOrder.city || selectedOrder.state || selectedOrder.pincode) && (
                    <div>
                      <span className="text-text-light">City, State, Pincode:</span>
                      <span className="font-medium ml-2">
                        {[selectedOrder.city, selectedOrder.state, selectedOrder.pincode]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  )}
                  {!selectedOrder.houseFlat && !selectedOrder.street && (
                    <div className="text-text-light">{selectedOrder.address}</div>
                  )}
                </div>
              </div>

              {/* Shipping Details */}
              {(selectedOrder.courier || selectedOrder.trackingId) && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Shipping Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">Courier</label>
                      <input
                        type="text"
                        value={selectedOrder.courier || ''}
                        onChange={(e) => {
                          const updated = { ...selectedOrder, courier: e.target.value };
                          setSelectedOrder(updated);
                        }}
                        onBlur={() => {
                          if (selectedOrder.courier) {
                            updateOrderShipping(selectedOrder.id, selectedOrder.courier || '', selectedOrder.trackingId || '');
                            setOrders(getAllOrders());
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">Tracking ID</label>
                      <input
                        type="text"
                        value={selectedOrder.trackingId || ''}
                        onChange={(e) => {
                          const updated = { ...selectedOrder, trackingId: e.target.value };
                          setSelectedOrder(updated);
                        }}
                        onBlur={() => {
                          if (selectedOrder.trackingId) {
                            updateOrderShipping(selectedOrder.id, selectedOrder.courier || '', selectedOrder.trackingId || '');
                            setOrders(getAllOrders());
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Product</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Size</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Qty</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-text-light">Price</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-text-light">Subtotal</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedOrder.orderItems || selectedOrder.items.map((item, index) => ({
                        id: `${selectedOrder.id}-ITEM-${index + 1}`,
                        productId: item.product.id,
                        sku: `${item.product.id}-${item.size}`,
                        size: item.size,
                        quantity: item.quantity,
                        price: item.product.price,
                        status: selectedOrder.status as any,
                        product: item.product,
                      }))).map((item: any, index: number) => (
                        <tr key={item.id || index} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.product?.image || item.product.image}
                                alt={item.product?.name || item.product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div>
                                <span className="font-medium block">{item.product?.name || item.product.name}</span>
                                <span className="text-xs text-text-muted">SKU: {item.sku || `${item.productId}-${item.size}`}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-text-light">{item.size}</td>
                          <td className="py-3 px-4">{item.quantity}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(item.price)}</td>
                          <td className="py-3 px-4 text-right font-semibold">
                            {formatCurrency(item.price * item.quantity)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status] || statusColors.Pending}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={5} className="py-3 px-4 text-right font-semibold">Total:</td>
                        <td className="py-3 px-4 text-right font-bold text-lg">
                          {formatCurrency(selectedOrder.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Order Activity Log */}
              {selectedOrder.activityLog && selectedOrder.activityLog.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Activity Log</h3>
                  <div className="space-y-2">
                    {selectedOrder.activityLog.map((log, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm bg-gray-50 p-3 rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium">{log.status}</div>
                          <div className="text-text-light text-xs">{formatDateTime(log.timestamp)}</div>
                          {log.note && <div className="text-text-light mt-1">{log.note}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Admin Notes</h3>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  onBlur={handleSaveNotes}
                  placeholder="Add internal notes (not visible to customer)..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    setNewStatus(e.target.value);
                    setShowStatusModal(true);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                {selectedOrder.status !== 'Shipped' && selectedOrder.status !== 'Delivered' && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowShippingModal(true);
                    }}
                  >
                    <Package className="w-4 h-4 inline mr-2" />
                    Mark as Shipped
                  </Button>
                )}
                <Button variant="secondary" onClick={() => selectedOrder && printInvoice(selectedOrder)}>
                  <Download className="w-4 h-4 inline mr-2" />
                  Print Invoice
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Change Modal */}
      <AnimatePresence>
        {showStatusModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowStatusModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Change Order Status</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-text mb-2">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-text mb-2">Note (Optional)</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>
              <div className="flex gap-4">
                <Button variant="secondary" onClick={() => setShowStatusModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    if (selectedOrder) {
                      handleStatusChange(selectedOrder.id, newStatus);
                    }
                  }}
                  className="flex-1"
                >
                  Update Status
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shipping Modal */}
      <AnimatePresence>
        {showShippingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowShippingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Mark as Shipped</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Courier *</label>
                  <input
                    type="text"
                    value={shippingData.courier}
                    onChange={(e) => setShippingData({ ...shippingData, courier: e.target.value })}
                    placeholder="e.g., FedEx, DHL, BlueDart"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Tracking ID *</label>
                  <input
                    type="text"
                    value={shippingData.trackingId}
                    onChange={(e) => setShippingData({ ...shippingData, trackingId: e.target.value })}
                    placeholder="Enter tracking number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="secondary" onClick={() => setShowShippingModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleMarkShipped} className="flex-1">
                  Mark as Shipped
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={null}>
      <AdminOrdersPageInner />
    </Suspense>
  );
}
