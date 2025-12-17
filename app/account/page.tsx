'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DroviaHeader from '@/components/DroviaHeader';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Package, ShoppingBag, X, RefreshCw, Wallet, ArrowRight } from 'lucide-react';
import { isUserAuthenticated, getUser, logoutUser } from '@/lib/userAuth';
import { getOrders } from '@/lib/orders';
import { getWalletBalance } from '@/lib/wallet';
import CancelRequestModal from '@/components/CancelRequestModal';
import ReturnRequestModal from '@/components/ReturnRequestModal';
import ItemizedOrderCard from '@/components/ItemizedOrderCard';
import { canCancelOrder, canReturnOrder } from '@/lib/orderRequests';
import { Order } from '@/types';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [mounted, setMounted] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [returnModalOrder, setReturnModalOrder] = useState<Order | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!isUserAuthenticated()) {
      router.push('/login');
    } else {
      const userData = getUser();
      setUser(userData);
      loadOrders();
      if (userData) {
        const userId = userData.email || userData.name;
        if (userId) {
          setWalletBalance(getWalletBalance(userId));
        }
      }
    }

    // Listen for order updates
    const handleOrderUpdate = () => {
      loadOrders();
    };
    window.addEventListener('orderRequestUpdated', handleOrderUpdate);

    // Listen for wallet updates
    const handleWalletUpdate = () => {
      const userData = getUser();
      if (userData) {
        const userId = userData.email || userData.name;
        if (userId) {
          setWalletBalance(getWalletBalance(userId));
        }
      }
    };
    window.addEventListener('walletUpdated', handleWalletUpdate);

    return () => {
      window.removeEventListener('orderRequestUpdated', handleOrderUpdate);
      window.removeEventListener('walletUpdated', handleWalletUpdate);
    };
  }, [router]);

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        console.error('Failed to fetch orders');
        // Fallback to local storage if API fails (optional, maybe remove later)
        const userData = getUser();
        const allOrders = getOrders();
        const userOrders = allOrders.filter((order) =>
          order.userId === userData?.email || order.customerName === userData?.name
        );
        setOrders(userOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleCancelSuccess = () => {
    loadOrders();
  };

  const handleReturnSuccess = () => {
    loadOrders();
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-700';
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

  const handleLogout = async () => {
    await logoutUser();
    router.push('/');
  };

  if (!mounted || !user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <DroviaHeader />
      <div className="mt-20 section-padding py-16">
        <div className="container-max max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-8"
          >
            My Account
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Account Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Wallet Card */}
              {walletBalance > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="luxury-card bg-gradient-to-br from-gold/10 to-gold/5 border-2 border-gold/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-gold" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary">Wallet / Store Points</h3>
                        <p className="text-2xl font-bold text-gold mt-1">₹{walletBalance.toLocaleString()}</p>
                      </div>
                    </div>
                    <Link href="/account/wallet">
                      <Button variant="secondary" className="flex items-center gap-2">
                        View History
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 md:p-8 shadow-soft"
              >
                <h2 className="text-2xl font-bold mb-6">Account Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-text-light text-sm mb-1">Full Name</p>
                      <p className="font-semibold text-lg">{user.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-text-light text-sm mb-1">Email</p>
                      <p className="font-semibold text-lg">{user.email}</p>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Phone className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-text-light text-sm mb-1">Phone</p>
                        <p className="font-semibold text-lg">{user.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Order History */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 md:p-8 shadow-soft"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Order History</h2>
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-text-light mx-auto mb-4" />
                    <p className="text-text-light text-lg">No orders yet</p>
                    <Link href="/shop">
                      <Button variant="primary" className="mt-4">
                        Start Shopping
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <ItemizedOrderCard
                        key={order.id}
                        order={order}
                        onUpdate={loadOrders}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-6 shadow-soft sticky top-24"
              >
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/shop">
                    <Button variant="secondary" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                  <Link href="/cart">
                    <Button variant="ghost" className="w-full">
                      View Cart
                    </Button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-6 py-3 rounded-lg font-medium transition-all duration-300 text-red-600 hover:bg-red-50 active:scale-95"
                  >
                    Logout
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {cancelModalOrder && (
        <CancelRequestModal
          order={cancelModalOrder}
          isOpen={!!cancelModalOrder}
          onClose={() => setCancelModalOrder(null)}
          onSuccess={handleCancelSuccess}
        />
      )}
      {returnModalOrder && (
        <ReturnRequestModal
          order={returnModalOrder}
          isOpen={!!returnModalOrder}
          onClose={() => setReturnModalOrder(null)}
          onSuccess={handleReturnSuccess}
        />
      )}

      <Footer />
    </div>
  );
}

