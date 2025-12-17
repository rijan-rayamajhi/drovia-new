import { NextRequest, NextResponse } from 'next/server';
import { getWallet, creditWallet, debitWallet, getWalletTransactions } from '@/lib/db/wallet';
import { requireAuth, requireAdmin } from '@/lib/auth-middleware';

async function getHandler(req: NextRequest, user: any) {
  try {
    const wallet = await getWallet(user.userId);
    return NextResponse.json(wallet);
  } catch (error: any) {
    console.error('Get wallet error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}

async function creditHandler(req: NextRequest, user: any) {
  try {
    const body = await req.json();
    const { userId, amount, description, orderId } = body;
    
    // Only admin can credit other users' wallets
    const targetUserId = user.role === 'admin' && userId ? userId : user.userId;
    
    const success = await creditWallet(targetUserId, amount, description, orderId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to credit wallet' },
        { status: 500 }
      );
    }
    
    const wallet = await getWallet(targetUserId);
    return NextResponse.json(wallet);
  } catch (error: any) {
    console.error('Credit wallet error:', error);
    return NextResponse.json(
      { error: 'Failed to credit wallet' },
      { status: 500 }
    );
  }
}

async function debitHandler(req: NextRequest, user: any) {
  try {
    const body = await req.json();
    const { amount, description, orderId } = body;
    
    const success = await debitWallet(user.userId, amount, description, orderId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }
    
    const wallet = await getWallet(user.userId);
    return NextResponse.json(wallet);
  } catch (error: any) {
    console.error('Debit wallet error:', error);
    return NextResponse.json(
      { error: 'Failed to debit wallet' },
      { status: 500 }
    );
  }
}

async function transactionsHandler(req: NextRequest, user: any) {
  try {
    const transactions = await getWalletTransactions(user.userId);
    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);
export const POST = requireAuth(creditHandler);
export const PUT = requireAuth(debitHandler);
export const PATCH = requireAuth(transactionsHandler);

