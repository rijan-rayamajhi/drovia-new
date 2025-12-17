import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Order from '@/models/Order';
import { requireAuth, requireAdmin } from '@/lib/auth-middleware';

// POST: Create a new request (Cancel or Return)
async function createRequestHandler(req: NextRequest, user: any) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { type, orderId, ...requestData } = body;

        const order = await Order.findOne({ orderId });
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Verify ownership
        if (order.userId && order.userId.toString() !== user.userId && user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (type === 'cancel') {
            order.cancelRequest = {
                orderId,
                ...requestData,
                requestedAt: new Date(),
                status: 'Pending'
            };
            order.status = 'Cancel Requested';
        } else if (type === 'return') {
            order.returnRequest = {
                orderId,
                ...requestData,
                requestedAt: new Date(),
                status: 'Pending'
            };
            order.status = 'Return Requested';
        } else {
            return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
        }

        await order.save();
        return NextResponse.json({ success: true, order });
    } catch (error: any) {
        console.error('Create request error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: Update request status (Admin only)
async function updateRequestHandler(req: NextRequest, user: any) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { type, orderId, status, adminNote } = body;

        const order = await Order.findOne({ orderId });
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (type === 'cancel') {
            if (!order.cancelRequest) {
                return NextResponse.json({ error: 'No cancel request found' }, { status: 404 });
            }
            order.cancelRequest.status = status;
            if (adminNote) order.cancelRequest.adminNote = adminNote;

            if (status === 'Approved') {
                order.status = 'Cancelled';
            } else if (status === 'Rejected') {
                // Revert to previous status or keep as is? Usually revert to Processing/Pending
                // For now, let's assume we revert to the state before request if possible, or just 'Processing'
                // But simpler to just leave it or set to a specific state.
                // Let's set to 'Processing' if it was pending cancellation.
                order.status = 'Processing';
            }
        } else if (type === 'return') {
            if (!order.returnRequest) {
                return NextResponse.json({ error: 'No return request found' }, { status: 404 });
            }
            order.returnRequest.status = status;
            if (adminNote) order.returnRequest.adminNote = adminNote;

            if (status === 'Approved') {
                order.status = 'Return Approved';
            } else if (status === 'Completed') {
                order.status = 'Return Completed';
            } else if (status === 'Rejected') {
                order.status = 'Delivered';
            }
        } else {
            return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
        }

        await order.save();
        return NextResponse.json({ success: true, order });
    } catch (error: any) {
        console.error('Update request error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const POST = requireAuth(createRequestHandler);
export const PATCH = requireAdmin(updateRequestHandler);
