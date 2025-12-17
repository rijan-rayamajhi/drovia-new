'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, X, Download, FileText, Wallet, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllOrders, ExtendedOrder } from '@/lib/adminOrders';
import { adminCreditWallet, getWalletBalance } from '@/lib/wallet';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  alternatePhone?: string;
  addresses: string[];
  lastOrderDate?: string;
  totalOrders: number;
  totalSpent: number;
  orders: ExtendedOrder[];
  notes?: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletCreditAmount, setWalletCreditAmount] = useState('');
  const [walletCreditDescription, setWalletCreditDescription] = useState('');
  const [walletCreditError, setWalletCreditError] = useState('');
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const orders = getAllOrders();
    
    // Group orders by customer (phone number as unique identifier)
    const customerMap = new Map<string, Customer>();
    
    orders.forEach((order) => {
      const phone = order.phone;
      if (!customerMap.has(phone)) {
        customerMap.set(phone, {
          id: phone,
          name: order.customerName,
          email: order.email,
          phone: order.phone,
          alternatePhone: order.alternatePhone,
          addresses: [],
          totalOrders: 0,
          totalSpent: 0,
          orders: [],
          notes: '',
        });
      }
      
      const customer = customerMap.get(phone)!;
      customer.totalOrders += 1;
      customer.totalSpent += order.total;
      customer.orders.push(order);
      
      if (order.address && !customer.addresses.includes(order.address)) {
        customer.addresses.push(order.address);
      }
      
      if (!customer.lastOrderDate || order.createdAt > customer.lastOrderDate) {
        customer.lastOrderDate = order.createdAt;
      }
    });
    
    const customersList = Array.from(customerMap.values());
    customersList.sort((a, b) => new Date(b.lastOrderDate || '').getTime() - new Date(a.lastOrderDate || '').getTime());
    
    setCustomers(customersList);
  }, []);

  useEffect(() => {
    let filtered = [...customers];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query) ||
          c.phone.includes(query)
      );
    }

    setFilteredCustomers(filtered);
    setCurrentPage(1);
  }, [customers, searchQuery]);

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerNotes(customer.notes || '');
  };

  const handleCreditWallet = () => {
    if (!selectedCustomer) return;
    
    const amount = parseFloat(walletCreditAmount);
    if (isNaN(amount) || amount <= 0) {
      setWalletCreditError('Please enter a valid amount');
      return;
    }
    
    if (!walletCreditDescription.trim()) {
      setWalletCreditError('Please enter a description');
      return;
    }
    
    // Get user ID from customer (use email or phone)
    const userId = selectedCustomer.email || selectedCustomer.phone;
    if (!userId) {
      setWalletCreditError('Customer ID not found');
      return;
    }
    
    const success = adminCreditWallet(
      userId as string,
      amount,
      walletCreditDescription.trim(),
      undefined
    );
    
    if (success) {
      setWalletCreditAmount('');
      setWalletCreditDescription('');
      setWalletCreditError('');
      setShowWalletModal(false);
      // Refresh customer data
      handleViewCustomer(selectedCustomer);
    } else {
      setWalletCreditError('Failed to credit wallet. Please try again.');
    }
  };
  
  const getCustomerWalletBalance = (customer: Customer): number => {
    const userId = customer.email || customer.phone;
    if (!userId) return 0;
    return getWalletBalance(userId as string);
  };

  const handleSaveNotes = () => {
    if (selectedCustomer) {
      // Save notes to localStorage
      const notesKey = `customer_notes_${selectedCustomer.id}`;
      localStorage.setItem(notesKey, customerNotes);
      setSelectedCustomer({ ...selectedCustomer, notes: customerNotes });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Total Orders', 'Total Spent', 'Last Order Date'];
    const rows = customers.map((c) => [
      c.name,
      c.email || '',
      c.phone,
      c.totalOrders.toString(),
      c.totalSpent.toString(),
      c.lastOrderDate || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Customers</h1>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Name</th>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Email</th>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Phone</th>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Last Order Date</th>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Total Orders</th>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Total Spent</th>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-light">
                    {searchQuery ? 'No customers found matching your search' : 'No customers yet'}
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium">{customer.name}</td>
                    <td className="py-4 px-6 text-text-light">{customer.email || 'N/A'}</td>
                    <td className="py-4 px-6 text-text-light">{customer.phone}</td>
                    <td className="py-4 px-6 text-text-light">{customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'N/A'}</td>
                    <td className="py-4 px-6">{customer.totalOrders}</td>
                    <td className="py-4 px-6 font-semibold">{formatCurrency(customer.totalSpent)}</td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleViewCustomer(customer)}
                        className="text-primary hover:text-primary-dark flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">View</span>
                      </button>
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
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredCustomers.length)} of {filteredCustomers.length} customers
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
                  className={`px-4 py-2 border rounded-lg ${
                    currentPage === page
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

      {/* Customer Profile Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setSelectedCustomer(null)}
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
                  <h2 className="text-2xl font-bold mb-2">Customer Profile</h2>
                  <p className="text-text-light">{selectedCustomer.name}</p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contact Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-3">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-light">Name:</span>
                    <span className="font-medium ml-2">{selectedCustomer.name}</span>
                  </div>
                  {selectedCustomer.email && (
                    <div>
                      <span className="text-text-light">Email:</span>
                      <span className="font-medium ml-2">{selectedCustomer.email}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-text-light">Phone:</span>
                    <span className="font-medium ml-2">{selectedCustomer.phone}</span>
                  </div>
                  {selectedCustomer.alternatePhone && (
                    <div>
                      <span className="text-text-light">Alternate Phone:</span>
                      <span className="font-medium ml-2">{selectedCustomer.alternatePhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Addresses */}
              {selectedCustomer.addresses.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Addresses</h3>
                  <div className="space-y-2">
                    {selectedCustomer.addresses.map((address, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 text-sm">
                        {address}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order History */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Order History</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Order ID</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Items</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Total</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCustomer.orders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-text-light">
                            No orders yet
                          </td>
                        </tr>
                      ) : (
                        selectedCustomer.orders
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((order) => (
                            <tr key={order.id} className="border-b border-gray-100">
                              <td className="py-3 px-4 font-medium">{order.id}</td>
                              <td className="py-3 px-4 text-text-light">{formatDate(order.createdAt)}</td>
                              <td className="py-3 px-4">{order.items.length}</td>
                              <td className="py-3 px-4 font-semibold">{formatCurrency(order.total)}</td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    order.status === 'Delivered'
                                      ? 'bg-green-100 text-green-700'
                                      : order.status === 'Shipped'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <Link
                                  href={`/admin/orders?view=${order.id}`}
                                  className="text-primary hover:text-primary-dark text-sm"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Admin Notes</h3>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  onBlur={handleSaveNotes}
                  placeholder="Add internal notes about this customer..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              {/* Wallet Balance */}
              <div className="bg-gold/10 rounded-lg p-4 mb-6 border border-gold/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-gold" />
                      Wallet Balance
                    </h3>
                    <p className="text-2xl font-bold text-gold">
                      ₹{getCustomerWalletBalance(selectedCustomer).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowWalletModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Credit Wallet
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-light">Total Orders:</span>
                    <span className="font-semibold ml-2">{selectedCustomer.totalOrders}</span>
                  </div>
                  <div>
                    <span className="text-text-light">Total Spent:</span>
                    <span className="font-semibold ml-2">{formatCurrency(selectedCustomer.totalSpent)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Credit Modal */}
      <AnimatePresence>
        {showWalletModal && selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowWalletModal(false);
              setWalletCreditError('');
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Credit Wallet</h2>
                  <p className="text-text-light">Customer: {selectedCustomer.name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowWalletModal(false);
                    setWalletCreditError('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  label="Amount (₹)"
                  type="number"
                  value={walletCreditAmount}
                  onChange={(e) => {
                    setWalletCreditAmount(e.target.value);
                    setWalletCreditError('');
                  }}
                  error={walletCreditError}
                  placeholder="Enter amount"
                  required
                />
                <Input
                  label="Description"
                  value={walletCreditDescription}
                  onChange={(e) => {
                    setWalletCreditDescription(e.target.value);
                    setWalletCreditError('');
                  }}
                  placeholder="e.g., Refund for Order #12345"
                  required
                />
                {walletCreditError && (
                  <p className="text-red-600 text-sm">{walletCreditError}</p>
                )}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowWalletModal(false);
                      setWalletCreditError('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleCreditWallet}
                    className="flex-1"
                  >
                    Credit Wallet
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
