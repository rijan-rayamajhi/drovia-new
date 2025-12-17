import { NextRequest, NextResponse } from 'next/server';
import {
  createCancelRequest,
  getCancelRequests,
  getPendingCancelRequests,
  updateCancelRequestStatus,
  deleteCancelRequest
} from '@/lib/db/requests';
import { requireAuth, requireAdmin } from '@/lib/auth-middleware';

async function createHandler(req: NextRequest, user: any) {
  try {
    const body = await req.json();
    const { orderId, reason, itemId } = body;
    
    const request = await createCancelRequest(orderId, reason, itemId);
    return NextResponse.json(request, { status: 201 });
  } catch (error: any) {
    console.error('Create cancel request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create cancel request' },
      { status: 500 }
    );
  }
}

async function getAllHandler(req: NextRequest, user: any) {
  try {
    const requests = await getCancelRequests();
    return NextResponse.json(requests);
  } catch (error: any) {
    console.error('Get cancel requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cancel requests' },
      { status: 500 }
    );
  }
}

async function getPendingHandler(req: NextRequest, user: any) {
  try {
    const requests = await getPendingCancelRequests();
    return NextResponse.json(requests);
  } catch (error: any) {
    console.error('Get pending cancel requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending requests' },
      { status: 500 }
    );
  }
}

async function updateHandler(req: NextRequest, user: any) {
  try {
    const body = await req.json();
    const { orderId, status, adminNote } = body;
    
    const request = await updateCancelRequestStatus(orderId, status, adminNote);
    if (!request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(request);
  } catch (error: any) {
    console.error('Update cancel request error:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}

async function deleteHandler(req: NextRequest, user: any) {
  try {
    const body = await req.json();
    const { orderId } = body;
    
    const deleted = await deleteCancelRequest(orderId);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete cancel request error:', error);
    return NextResponse.json(
      { error: 'Failed to delete request' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(createHandler);
export const GET = requireAdmin(getAllHandler);
export const PUT = requireAdmin(updateHandler);
export const DELETE = requireAdmin(deleteHandler);

