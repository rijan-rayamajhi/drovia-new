import connectToDatabase from './mongodb';
import Wallet from '@/models/Wallet';
import { WalletBalance, WalletTransaction } from '@/lib/wallet';

export async function getWallet(userId: string): Promise<WalletBalance | null> {
  await connectToDatabase();
  const wallet = await Wallet.findOne({ userId });
  
  if (!wallet) {
    // Create wallet if it doesn't exist
    const newWallet = await Wallet.create({
      userId,
      balance: 0,
      transactions: []
    });
    
    return {
      userId: newWallet.userId.toString(),
      balance: newWallet.balance,
      transactions: newWallet.transactions.map((txn: any) => ({
        id: txn.id,
        type: txn.type,
        amount: txn.amount,
        description: txn.description,
        orderId: txn.orderId?.toString(),
        timestamp: txn.timestamp.toISOString()
      }))
    };
  }
  
  return {
    userId: wallet.userId.toString(),
    balance: wallet.balance,
    transactions: wallet.transactions.map((txn: any) => ({
      id: txn.id,
      type: txn.type,
      amount: txn.amount,
      description: txn.description,
      orderId: txn.orderId?.toString(),
      timestamp: txn.timestamp.toISOString()
    }))
  };
}

export async function creditWallet(
  userId: string,
  amount: number,
  description: string,
  orderId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId || !amount || amount <= 0) {
      console.error('Invalid creditWallet parameters:', { userId, amount, description });
      return { success: false, error: 'Invalid parameters' };
    }

    await connectToDatabase();
    
    let wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        balance: 0,
        transactions: []
      });
    }
    
    const transaction: WalletTransaction = {
      id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'credit',
      amount,
      description,
      orderId,
      timestamp: new Date().toISOString()
    };
    
    // Convert timestamp string to Date for MongoDB
    const transactionDoc: any = {
      ...transaction,
      timestamp: new Date(transaction.timestamp)
    };
    
    wallet.balance += amount;
    wallet.transactions.push(transactionDoc);
    await wallet.save();
    
    console.log(`Wallet credited successfully: User ${userId}, Amount: ${amount}, New Balance: ${wallet.balance}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error crediting wallet:', error);
    return { success: false, error: error.message };
  }
}

export async function debitWallet(
  userId: string,
  amount: number,
  description: string,
  orderId?: string
): Promise<boolean> {
  await connectToDatabase();
  
  const wallet = await Wallet.findOne({ userId });
  
  if (!wallet || wallet.balance < amount) {
    return false; // Insufficient balance
  }
  
  const transaction: WalletTransaction = {
    id: `TXN-${Date.now()}`,
    type: 'debit',
    amount,
    description,
    orderId,
    timestamp: new Date().toISOString()
  };
  
  wallet.balance -= amount;
  wallet.transactions.push(transaction as any);
  await wallet.save();
  
  return true;
}

export async function getWalletTransactions(userId: string): Promise<WalletTransaction[]> {
  const wallet = await getWallet(userId);
  return wallet?.transactions || [];
}

