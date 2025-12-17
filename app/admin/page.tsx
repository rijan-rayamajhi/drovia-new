'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, Package, AlertCircle, Eye, ChevronRight } from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/auth';
import { getOrders } from '@/lib/orders';
import { getAdminProducts } from '@/lib/adminProducts';
import { Order } from '@/types';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  Pending: 'bg-orange-100 text-orange-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState<'7' | '30' | '90'>('7');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!isAdminAuthenticated()) {
      router.push('/admin/login');
    }
  }, [router]);

  useEffect(() => {
    if (mounted) {
      const loadData = async () => {
        const allOrders = getOrders();
        setOrders(allOrders);
        const allProducts = await getAdminProducts(); // Changed to async
        setProducts(allProducts);
      };
      loadData();
    }
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  if (!isAdminAuthenticated()) {
    return null;
  }

  // Calculate KPIs
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const ordersToday = orders.filter((o) => o.createdAt === todayStr);
  const totalSalesToday = ordersToday.reduce((sum, o) => sum + o.total, 0);
  const activeProducts = Array.isArray(products) ? products.filter((p) => p.inStock !== false).length : 0;
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;

  // Get last N days orders for chart
  const getDaysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  const filterStartDate = getDaysAgo(parseInt(dateFilter));
  const filteredOrders = orders.filter((o) => {
    const orderDate = new Date(o.createdAt);
    return orderDate >= filterStartDate;
  });

  // Group orders by date for chart
  const ordersByDate: Record<string, number> = {};
  filteredOrders.forEach((order) => {
    const date = order.createdAt;
    ordersByDate[date] = (ordersByDate[date] || 0) + 1;
  });

  // Get last 7 days dates
  const last7Days = Array.from({ length: parseInt(dateFilter) }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (parseInt(dateFilter) - 1 - i));
    return date.toISOString().split('T')[0];
  });

  const chartData = last7Days.map((date) => ({
    date,
    count: ordersByDate[date] || 0,
  }));

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  // Low stock products (threshold: 5)
  const lowStockProducts = products.filter((p: any) => {
    const stock = typeof p.stock === 'number' ? p.stock : 50; // Default stock if not set
    return stock <= 5;
  });

  // Latest orders (last 10)
  const latestOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || statusColors.Pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-text-light text-sm mb-1">Orders Today</h3>
          <p className="text-3xl font-bold text-text">{ordersToday.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-text-light text-sm mb-1">Total Sales</h3>
          <p className="text-3xl font-bold text-text">{formatCurrency(totalSalesToday)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500 p-3 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-text-light text-sm mb-1">Active Products</h3>
          <p className="text-3xl font-bold text-text">{activeProducts}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-500 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-text-light text-sm mb-1">Pending Orders</h3>
          <p className="text-3xl font-bold text-text">{pendingOrders}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Orders Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-soft overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Daily Orders</h2>
            <div className="flex gap-2">
              {(['7', '30', '90'] as const).map((days) => (
                <button
                  key={days}
                  onClick={() => setDateFilter(days)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${dateFilter === days
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text hover:bg-gray-200'
                    }`}
                >
                  {days} days
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 min-h-[220px] overflow-hidden flex items-end justify-between gap-2">
            {chartData.map((data, index) => (
              <div key={data.date} className="flex-1 flex flex-col items-center group relative min-w-0">
                <div
                  className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary-dark cursor-pointer relative"
                  style={{ height: `${Math.max((data.count / maxCount) * 100, 2)}%`, minHeight: '2px' }}
                  title={`${data.date}: ${data.count} orders`}
                />
                <span className="text-xs text-text-light mt-2 truncate w-full text-center">
                  {new Date(data.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Product Stock Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Low Stock Products</h2>
            {lowStockProducts.length > 0 && (
              <Link
                href="/admin/products?filter=low-stock"
                className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8 text-text-light">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>All products are well stocked</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lowStockProducts.slice(0, 5).map((product: any) => {
                const stock = typeof product.stock === 'number' ? product.stock : 0;
                return (
                  <div key={product.id}>
                    <div className="flex justify-between mb-2">
                      <span className="text-text font-medium">{product.name}</span>
                      <span className="text-text-light">{stock} units</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${Math.min((stock / 5) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Latest Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-soft overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold">Latest Orders</h2>
          <Link
            href="/admin/orders"
            className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-text-light font-semibold">Order ID</th>
                <th className="text-left py-3 px-6 text-text-light font-semibold">Customer Name</th>
                <th className="text-left py-3 px-6 text-text-light font-semibold">Items</th>
                <th className="text-left py-3 px-6 text-text-light font-semibold">Total</th>
                <th className="text-left py-3 px-6 text-text-light font-semibold">Status</th>
                <th className="text-left py-3 px-6 text-text-light font-semibold">Date</th>
                <th className="text-left py-3 px-6 text-text-light font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {latestOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-light">
                    No orders yet
                  </td>
                </tr>
              ) : (
                latestOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-6 font-medium">{order.id}</td>
                    <td className="py-3 px-6">{order.customerName}</td>
                    <td className="py-3 px-6">{order.items.length}</td>
                    <td className="py-3 px-6 font-semibold">{formatCurrency(order.total)}</td>
                    <td className="py-3 px-6">{getStatusBadge(order.status)}</td>
                    <td className="py-3 px-6 text-text-light">{formatDate(order.createdAt)}</td>
                    <td className="py-3 px-6">
                      <Link
                        href={`/admin/orders?view=${order.id}`}
                        className="text-primary hover:text-primary-dark flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">View</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
