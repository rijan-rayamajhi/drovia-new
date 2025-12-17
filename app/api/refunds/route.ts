import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { processSourceRefund, processWalletRefund, updateRefundStatus } from '@/lib/db/refunds';
import { getWallet } from '@/lib/db/wallet';
import connectDB from '@/lib/mongooseConnect';

export const dynamic = 'force-dynamic';

/**
 * POST /api/refunds - Process a refund (wallet or source)
 */
async function refundHandler(req: NextRequest) {
    try {
        await connectDB();
        const CancelRequest = (await import('@/models/CancelRequest')).default;

        const body = await req.json();
        const { cancelRequestId, userId, refundMethod, refundAmount, razorpayPaymentId, orderId } = body;

        // Handle item-level cancel requests (from localStorage) that don't have MongoDB ObjectId
        let cancelRequest = null;
        let actualRefundMethod = refundMethod;
        let actualRefundAmount = refundAmount;
        let actualRazorpayPaymentId = razorpayPaymentId;
        let actualOrderId = orderId;

        if (cancelRequestId) {
            // Try to find MongoDB cancel request
            // Check if it's a valid ObjectId format
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(cancelRequestId);
            
            if (isValidObjectId) {
                cancelRequest = await CancelRequest.findById(cancelRequestId);
                
                if (cancelRequest) {
                    if (cancelRequest.status !== 'Approved') {
                        return NextResponse.json(
                            { error: 'Cancel request must be approved first' },
                            { status: 400 }
                        );
                    }
                    
                    actualRefundMethod = cancelRequest.refundMethod;
                    actualRefundAmount = cancelRequest.refundAmount;
                    actualRazorpayPaymentId = cancelRequest.razorpayPaymentId;
                    actualOrderId = cancelRequest.orderId.toString();
                }
            }
        }

        // If no MongoDB cancel request found, use provided values (for item-level requests)
        if (!cancelRequest && (!actualRefundMethod || !actualRefundAmount || !userId)) {
            return NextResponse.json(
                { error: 'Refund details are required' },
                { status: 400 }
            );
        }

        // Process refund based on method
        if (actualRefundMethod === 'wallet') {
            // Wallet refund
            if (cancelRequest) {
                await updateRefundStatus(cancelRequestId, 'Processing');
            }

            console.log(`Processing wallet refund: userId=${userId}, amount=${actualRefundAmount}, orderId=${actualOrderId || orderId || 'unknown'}`);
            
            const result = await processWalletRefund(
                userId,
                actualRefundAmount,
                actualOrderId || orderId || 'unknown',
                `Refund for cancelled order`
            );

            if (result.success) {
                if (cancelRequest) {
                    await updateRefundStatus(cancelRequestId, 'Completed');
                }
                // Get updated wallet data to return to frontend
                const wallet = await getWallet(userId);
                return NextResponse.json({
                    success: true,
                    message: 'Wallet credited successfully',
                    refundMethod: 'wallet',
                    amount: actualRefundAmount,
                    userId: userId,
                    wallet: wallet // Include wallet data for frontend sync
                });
            } else {
                if (cancelRequest) {
                    await updateRefundStatus(cancelRequestId, 'Failed');
                }
                return NextResponse.json(
                    { error: result.error || 'Failed to credit wallet' },
                    { status: 500 }
                );
            }
        } else if (actualRefundMethod === 'source') {
            // Razorpay refund
            if (!razorpayPaymentId) {
                return NextResponse.json(
                    { error: 'Payment ID not found for this order' },
                    { status: 400 }
                );
            }

            if (cancelRequest) {
                await updateRefundStatus(cancelRequestId, 'Processing');
            }

            const result = await processSourceRefund(
                actualRazorpayPaymentId || razorpayPaymentId,
                actualRefundAmount,
                actualOrderId || orderId || 'unknown'
            );

            if (result.success) {
                if (cancelRequest) {
                    await updateRefundStatus(cancelRequestId, 'Completed', result.refundId);
                }
                return NextResponse.json({
                    success: true,
                    message: 'Refund initiated successfully',
                    refundMethod: 'source',
                    refundId: result.refundId
                });
            } else {
                if (cancelRequest) {
                    await updateRefundStatus(cancelRequestId, 'Failed');
                }
                return NextResponse.json(
                    { error: result.error || 'Refund failed' },
                    { status: 500 }
                );
            }
        } else {
            return NextResponse.json(
                { error: 'Invalid refund method' },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error('Refund API error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export const POST = requireAdmin(refundHandler);
