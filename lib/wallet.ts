'use client';

const WALLET_STORAGE_KEY = 'userWallet';

export interface WalletBalance {
  userId: string;
  balance: number; // Points balance (1 point = ₹1)
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  orderId?: string;
  timestamp: string;
}

export const getWalletBalance = (userId: string): number => {
  if (typeof window === 'undefined') return 0;
  
  const walletStr = localStorage.getItem(WALLET_STORAGE_KEY);
  if (!walletStr) return 0;
  
  const wallets: Record<string, WalletBalance> = JSON.parse(walletStr);
  return wallets[userId]?.balance || 0;
};

export const getWallet = (userId: string): WalletBalance | null => {
  if (typeof window === 'undefined') return null;
  
  const walletStr = localStorage.getItem(WALLET_STORAGE_KEY);
  if (!walletStr) return null;
  
  const wallets: Record<string, WalletBalance> = JSON.parse(walletStr);
  return wallets[userId] || null;
};

export const creditWallet = (
  userId: string,
  amount: number,
  description: string,
  orderId?: string
): boolean => {
  if (typeof window === 'undefined') return false;
  
  const walletStr = localStorage.getItem(WALLET_STORAGE_KEY);
  const wallets: Record<string, WalletBalance> = walletStr ? JSON.parse(walletStr) : {};
  
  if (!wallets[userId]) {
    wallets[userId] = {
      userId,
      balance: 0,
      transactions: [],
    };
  }
  
  const transaction: WalletTransaction = {
    id: `TXN-${Date.now()}`,
    type: 'credit',
    amount,
    description,
    orderId,
    timestamp: new Date().toISOString(),
  };
  
  wallets[userId].balance += amount;
  wallets[userId].transactions.push(transaction);
  
  localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallets));
  
  // Dispatch event
  window.dispatchEvent(new CustomEvent('walletUpdated', { detail: { userId } }));
  
  return true;
};

export const debitWallet = (
  userId: string,
  amount: number,
  description: string,
  orderId?: string
): boolean => {
  if (typeof window === 'undefined') return false;
  
  const wallet = getWallet(userId);
  if (!wallet || wallet.balance < amount) {
    return false; // Insufficient balance
  }
  
  const walletStr = localStorage.getItem(WALLET_STORAGE_KEY);
  const wallets: Record<string, WalletBalance> = walletStr ? JSON.parse(walletStr) : {};
  
  const transaction: WalletTransaction = {
    id: `TXN-${Date.now()}`,
    type: 'debit',
    amount,
    description,
    orderId,
    timestamp: new Date().toISOString(),
  };
  
  wallets[userId].balance -= amount;
  wallets[userId].transactions.push(transaction);
  
  localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallets));
  
  // Dispatch event
  window.dispatchEvent(new CustomEvent('walletUpdated', { detail: { userId } }));
  
  return true;
};

export const getWalletTransactions = (userId: string): WalletTransaction[] => {
  const wallet = getWallet(userId);
  return wallet?.transactions || [];
};

// API-like function to get wallet data
export const getWalletData = (userId: string): { balance: number; currency: string; transactions: WalletTransaction[] } => {
  const wallet = getWallet(userId);
  return {
    balance: wallet?.balance || 0,
    currency: 'INR',
    transactions: wallet?.transactions || [],
  };
};

// Admin function to credit wallet
export const adminCreditWallet = (
  userId: string,
  amount: number,
  description: string,
  orderId?: string
): boolean => {
  return creditWallet(userId, amount, description, orderId);
};

