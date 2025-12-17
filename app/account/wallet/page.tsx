'use client';

import { useState, useEffect } from 'react';
import DroviaHeader from '@/components/DroviaHeader';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { isUserAuthenticated, getUser } from '@/lib/userAuth';
import { getWalletData, WalletTransaction } from '@/lib/wallet';
import { useRouter } from 'next/navigation';

export default function WalletPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [walletData, setWalletData] = useState<{ balance: number; currency: string; transactions: WalletTransaction[] } | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!isUserAuthenticated()) {
      router.push('/login');
    } else {
      const userData = getUser();
      setUser(userData);
      if (userData) {
        const userId = userData.email || userData.name;
        if (userId) {
          // Sync wallet from server
          syncWalletFromServer(userId);
        }
      }
    }

    const handleWalletUpdate = () => {
      const userData = getUser();
      if (userData) {
        const userId = userData.email || userData.name;
        if (userId) {
          setWalletData(getWalletData(userId));
        }
      }
    };
    window.addEventListener('walletUpdated', handleWalletUpdate);
    return () => window.removeEventListener('walletUpdated', handleWalletUpdate);
  }, [router]);

  const syncWalletFromServer = async (userId: string) => {
    try {
      const response = await fetch('/api/wallet');
      if (response.ok) {
        const serverWallet = await response.json();
        // Update localStorage with server data
        const WALLET_STORAGE_KEY = 'userWallet';
        const walletStr = localStorage.getItem(WALLET_STORAGE_KEY);
        const wallets: Record<string, any> = walletStr ? JSON.parse(walletStr) : {};
        
        wallets[userId] = {
          userId: serverWallet.userId,
          balance: serverWallet.balance,
          transactions: serverWallet.transactions || []
        };
        
        localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallets));
        setWalletData({
          balance: serverWallet.balance,
          currency: 'INR',
          transactions: serverWallet.transactions || []
        });
        
        // Dispatch event to update other components
        window.dispatchEvent(new CustomEvent('walletUpdated', { detail: { userId } }));
      } else {
        // Fallback to localStorage if API fails
        setWalletData(getWalletData(userId));
      }
    } catch (error) {
      console.error('Failed to sync wallet from server:', error);
      // Fallback to localStorage if API fails
      setWalletData(getWalletData(userId));
    }
  };

  if (!mounted || !user || !walletData) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen">
      <DroviaHeader />
      <div className="mt-20 section-padding py-16">
        <div className="container-max max-w-4xl">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors duration-300 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Account
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="luxury-card mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-gold" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary">
                  Wallet / Store Points
                </h1>
                <p className="text-text-muted text-sm mt-1">Your store credit balance</p>
              </div>
            </div>

            <div className="bg-ivory rounded-xl p-6">
              <p className="text-text-muted text-sm mb-2">Available Balance</p>
              <p className="text-4xl md:text-5xl font-bold text-accent">
                ₹{walletData.balance.toLocaleString()}
              </p>
              <p className="text-text-muted text-sm mt-2">{walletData.currency}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="luxury-card"
          >
            <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
              Transaction History
            </h2>

            {walletData.transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-muted">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {walletData.transactions
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-ivory rounded-xl hover:bg-ivory/80 transition-colors duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'credit'
                              ? 'bg-success/10 text-success'
                              : 'bg-error/10 text-error'
                          }`}
                        >
                          {transaction.type === 'credit' ? (
                            <TrendingUp className="w-5 h-5" />
                          ) : (
                            <TrendingDown className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{transaction.description}</p>
                          <p className="text-sm text-text-muted">{formatDate(transaction.timestamp)}</p>
                          {transaction.orderId && (
                            <p className="text-xs text-text-muted mt-1">Order: {transaction.orderId}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold text-lg ${
                            transaction.type === 'credit' ? 'text-success' : 'text-error'
                          }`}
                        >
                          {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

