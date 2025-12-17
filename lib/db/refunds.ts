import { creditWallet } from './wallet';

/**
 * Process wallet refund - Credits user's wallet with refund amount
 */
export async function processWalletRefund(
    userId: string,
    amount: number,
    orderId: string,
    description?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        if (!userId || !userId.trim()) {
            return { success: false, error: 'User ID is required' };
        }
        
        if (!amount || amount <= 0) {
            return { success: false, error: 'Invalid refund amount' };
        }

        console.log(`Processing wallet refund: userId=${userId}, amount=${amount}, orderId=${orderId}`);
        
        // Credit the wallet (creditWallet handles DB connection)
        const walletCredited = await creditWallet(
            userId.trim(),
            amount,
            description || `Refund for order ${orderId}`,
            orderId
        );

        if (!walletCredited) {
            return { success: false, error: 'Failed to credit wallet - check server logs for details' };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Wallet refund error:', error);
        return { 
            success: false, 
            error: error.message || 'Unknown error occurred while processing wallet refund' 
        };
    }
}

/**
 * Process source refund via Razorpay
 */
export async function processSourceRefund(
    paymentId: string,
    amount: number,
    orderId: string
): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
        // Get Razorpay credentials from environment
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            return {
                success: false,
                error: 'Razorpay credentials not configured'
            };
        }

        // Create Razorpay refund
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

        const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amount * 100, // Convert to paise
                notes: {
                    order_id: orderId,
                    reason: 'Order cancellation'
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                error: error.error?.description || 'Razorpay refund failed'
            };
        }

        const refundData = await response.json();

        return {
            success: true,
            refundId: refundData.id
        };
    } catch (error: any) {
        console.error('Source refund error:', error);
        return {
            success: false,
            error: error.message || 'Refund processing failed'
        };
    }
}

/**
 * Update refund status in cancel request
 */
export async function updateRefundStatus(
    cancelRequestId: string,
    status: 'Pending' | 'Processing' | 'Completed' | 'Failed',
    refundId?: string
): Promise<boolean> {
    try {
        const CancelRequest = (await import('@/models/CancelRequest')).default;

        const updateData: any = {
            refundStatus: status,
            processedAt: new Date()
        };

        if (refundId) {
            updateData.razorpayRefundId = refundId;
        }

        await CancelRequest.findByIdAndUpdate(cancelRequestId, updateData);

        return true;
    } catch (error) {
        console.error('Update refund status error:', error);
        return false;
    }
}

/**
 * Get refund status from Razorpay
 */
export async function getRefundStatus(razorpayRefundId: string): Promise<{
    status: string;
    amount: number;
    error?: string;
}> {
    try {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            return {
                status: 'unknown',
                amount: 0,
                error: 'Razorpay credentials not configured'
            };
        }

        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

        const response = await fetch(`https://api.razorpay.com/v1/refunds/${razorpayRefundId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });

        if (!response.ok) {
            return {
                status: 'unknown',
                amount: 0,
                error: 'Failed to fetch refund status'
            };
        }

        const refundData = await response.json();

        return {
            status: refundData.status,
            amount: refundData.amount / 100 // Convert from paise
        };
    } catch (error: any) {
        console.error('Get refund status error:', error);
        return {
            status: 'unknown',
            amount: 0,
            error: error.message
        };
    }
}
