import { NextRequest, NextResponse } from 'next/server';
import {
  createReturnRequest,
  getReturnRequests,
  getPendingReturnRequests,
  updateReturnRequestStatus,
  deleteReturnRequest
} from '@/lib/db/requests';
import { requireAuth, requireAdmin } from '@/lib/auth-middleware';

async function createHandler(req: NextRequest, user: any) {
  try {
    const body = await req.json();
    const {
      orderId,
      items,
      reason,
      resolution,
      comment,
      images,
      refundMethod,
      bankDetails,
      refundAmount,
      itemId
    } = body;
    
    const request = await createReturnRequest(
      orderId,
      items,
      reason,
      resolution,
      comment,
      images,
      refundMethod,
      bankDetails,
      refundAmount,
      itemId
    );
    
    return NextResponse.json(request, { status: 201 });
  } catch (error: any) {
    console.error('Create return request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create return request' },
      { status: 500 }
    );
  }
}

async function getAllHandler(req: NextRequest, user: any) {
  try {
    const requests = await getReturnRequests();
    return NextResponse.json(requests);
  } catch (error: any) {
    console.error('Get return requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch return requests' },
      { status: 500 }
    );
  }
}

async function getPendingHandler(req: NextRequest, user: any) {
  try {
    const requests = await getPendingReturnRequests();
    return NextResponse.json(requests);
  } catch (error: any) {
    console.error('Get pending return requests error:', error);
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
    
    const request = await updateReturnRequestStatus(orderId, status, adminNote);
    if (!request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(request);
  } catch (error: any) {
    console.error('Update return request error:', error);
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
    
    const deleted = await deleteReturnRequest(orderId);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete return request error:', error);
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

