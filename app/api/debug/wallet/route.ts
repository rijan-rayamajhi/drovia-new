import { NextRequest, NextResponse } from 'next/server';
import { creditWallet } from '@/lib/db/wallet';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const userId = searchParams.get('userId') || 'test-user';
        const amount = Number(searchParams.get('amount')) || 100;

        console.log(`Debug: Attempting to credit wallet for ${userId} with ${amount}`);

        const success = await creditWallet(
            userId,
            amount,
            'Debug Credit',
            'DEBUG-ORDER-1'
        );

        if (success) {
            return NextResponse.json({ success: true, message: 'Wallet credited successfully' });
        } else {
            return NextResponse.json({ success: false, error: 'creditWallet returned false' }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
