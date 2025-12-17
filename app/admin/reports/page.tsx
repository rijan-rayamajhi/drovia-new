'use client';

import { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllOrders, ExtendedOrder } from '@/lib/adminOrders';
import { getAdminProducts } from '@/lib/adminProducts';

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'custom'>('7');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ExtendedOrder[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const allOrders = getAllOrders();
      setOrders(allOrders);

      try {
        const allProducts = await getAdminProducts();
        if (Array.isArray(allProducts)) {
          setProducts(allProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error loading products for reports:', error);
        setProducts([]);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...orders];
    const now = new Date();
    let startDate: Date;

    if (dateRange === 'custom') {
      if (customFrom) {
        startDate = new Date(customFrom);
      } else {
        startDate = new Date(0);
      }
      if (customTo) {
        const endDate = new Date(customTo);
        filtered = filtered.filter((o) => {
          const orderDate = new Date(o.createdAt);
          return orderDate >= startDate && orderDate <= endDate;
        });
      } else {
        filtered = filtered.filter((o) => {
          const orderDate = new Date(o.createdAt);
          return orderDate >= startDate;
        });
      }
    } else {
      const days = parseInt(dateRange);
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - days);
      filtered = filtered.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= startDate;
      });
    }

    setFilteredOrders(filtered);
  }, [orders, dateRange, customFrom, customTo]);

  // Calculate metrics
  const totalOrders = filteredOrders.length;
  const totalSales = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const activeProducts = products.filter((p: any) => p.inStock !== false && (p.status !== 'Inactive')).length;

  // Orders over time (group by date)
  const ordersByDate: Record<string, number> = {};
  filteredOrders.forEach((order) => {
    const date = order.createdAt;
    ordersByDate[date] = (ordersByDate[date] || 0) + 1;
  });

  // Sales over time (group by date)
  const salesByDate: Record<string, number> = {};
  filteredOrders.forEach((order) => {
    const date = order.createdAt;
    salesByDate[date] = (salesByDate[date] || 0) + order.total;
  });

  // Get date range for charts
  const getDateRangeForCharts = () => {
    const dates: string[] = [];
    const now = new Date();
    let days = 7;

    if (dateRange === 'custom') {
      if (customFrom && customTo) {
        const start = new Date(customFrom);
        const end = new Date(customTo);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      }
    } else {
      days = parseInt(dateRange);
    }

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
  };

  const chartDates = getDateRangeForCharts();
  const ordersChartData = chartDates.map((date) => ({
    date,
    count: ordersByDate[date] || 0,
  }));
  const salesChartData = chartDates.map((date) => ({
    date,
    amount: salesByDate[date] || 0,
  }));

  const maxOrders = Math.max(...ordersChartData.map((d) => d.count), 1);
  const maxSales = Math.max(...salesChartData.map((d) => d.amount), 1);

  // Top products by sales
  const productSales: Record<string, { name: string; sales: number; revenue: number }> = {};
  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      const productId = item.product.id;
      if (!productSales[productId]) {
        productSales[productId] = {
          name: item.product.name,
          sales: 0,
          revenue: 0,
        };
      }
      productSales[productId].sales += item.quantity;
      productSales[productId].revenue += item.product.price * item.quantity;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const maxProductRevenue = Math.max(...topProducts.map((p) => p.revenue), 1);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Orders', 'Sales'];
    const rows = chartDates.map((date) => [
      date,
      (ordersByDate[date] || 0).toString(),
      (salesByDate[date] || 0).toString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Reports</h1>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Date Range Picker */}
      <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-text-light" />
            <span className="font-medium">Date Range:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['7', '30', '90'] as const).map((days) => (
              <button
                key={days}
                onClick={() => setDateRange(days)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === days
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text hover:bg-gray-200'
                  }`}
              >
                Last {days} days
              </button>
            ))}
            <button
              onClick={() => setDateRange('custom')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === 'custom'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text hover:bg-gray-200'
                }`}
            >
              Custom
            </button>
          </div>
          {dateRange === 'custom' && (
            <div className="flex gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <h3 className="text-text-light text-sm mb-1">Total Orders</h3>
          <p className="text-3xl font-bold text-text">{totalOrders}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <h3 className="text-text-light text-sm mb-1">Total Sales</h3>
          <p className="text-3xl font-bold text-text">{formatCurrency(totalSales)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <h3 className="text-text-light text-sm mb-1">Average Order Value</h3>
          <p className="text-3xl font-bold text-text">{formatCurrency(averageOrderValue)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <h3 className="text-text-light text-sm mb-1">Active Products</h3>
          <p className="text-3xl font-bold text-text">{activeProducts}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Orders Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <h2 className="text-xl font-bold mb-4">Orders Over Time</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {ordersChartData.map((data, index) => (
              <div key={data.date} className="flex-1 flex flex-col items-center group relative">
                <div
                  className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary-dark cursor-pointer relative"
                  style={{ height: `${(data.count / maxOrders) * 100}%` }}
                  title={`${formatDate(data.date)}: ${data.count} orders`}
                />
                <span className="text-xs text-text-light mt-2">
                  {formatDate(data.date)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sales Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <h2 className="text-xl font-bold mb-4">Sales Over Time</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {salesChartData.map((data, index) => (
              <div key={data.date} className="flex-1 flex flex-col items-center group relative">
                <div
                  className="w-full bg-green-500 rounded-t-lg transition-all hover:bg-green-600 cursor-pointer relative"
                  style={{ height: `${(data.amount / maxSales) * 100}%` }}
                  title={`${formatDate(data.date)}: ${formatCurrency(data.amount)}`}
                />
                <span className="text-xs text-text-light mt-2">
                  {formatDate(data.date)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl p-6 shadow-soft"
      >
        <h2 className="text-xl font-bold mb-4">Top 5 Products by Sales</h2>
        <div className="space-y-4">
          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-text-light">No sales data available</div>
          ) : (
            topProducts.map((product, index) => (
              <div key={product.name}>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-text-light">{product.sales} units sold</p>
                    </div>
                  </div>
                  <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(product.revenue / maxProductRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
