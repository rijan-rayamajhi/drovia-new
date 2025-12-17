import connectToDatabase from './mongodb';
import CancelRequest from '@/models/CancelRequest';
import ReturnRequest from '@/models/ReturnRequest';
import { CancelRequest as CancelRequestType, ReturnRequest as ReturnRequestType } from '@/types';

// Cancel Requests
export async function createCancelRequest(
  orderId: string,
  reason?: string,
  itemId?: string
): Promise<CancelRequestType> {
  await connectToDatabase();
  
  const request = await CancelRequest.create({
    orderId,
    itemId,
    reason,
    status: 'Pending',
    requestedAt: new Date()
  });
  
  return {
    orderId: request.orderId.toString(),
    reason: request.reason,
    requestedAt: request.requestedAt.toISOString(),
    status: request.status as 'Pending' | 'Approved' | 'Rejected',
    adminNote: request.adminNote
  };
}

export async function getCancelRequests(): Promise<CancelRequestType[]> {
  await connectToDatabase();
  const requests = await CancelRequest.find({}).populate('orderId').sort({ requestedAt: -1 });
  
  return requests.map(req => ({
    orderId: req.orderId.toString(),
    reason: req.reason,
    requestedAt: req.requestedAt.toISOString(),
    status: req.status as 'Pending' | 'Approved' | 'Rejected',
    adminNote: req.adminNote
  }));
}

export async function getPendingCancelRequests(): Promise<CancelRequestType[]> {
  await connectToDatabase();
  const requests = await CancelRequest.find({ status: 'Pending' })
    .populate('orderId')
    .sort({ requestedAt: -1 });
  
  return requests.map(req => ({
    orderId: req.orderId.toString(),
    reason: req.reason,
    requestedAt: req.requestedAt.toISOString(),
    status: req.status as 'Pending' | 'Approved' | 'Rejected',
    adminNote: req.adminNote
  }));
}

export async function updateCancelRequestStatus(
  orderId: string,
  status: 'Approved' | 'Rejected',
  adminNote?: string
): Promise<CancelRequestType | null> {
  await connectToDatabase();
  
  const request = await CancelRequest.findOne({ orderId });
  if (!request) return null;
  
  request.status = status;
  request.adminNote = adminNote;
  request.processedAt = new Date();
  await request.save();
  
  return {
    orderId: request.orderId.toString(),
    reason: request.reason,
    requestedAt: request.requestedAt.toISOString(),
    status: request.status as 'Pending' | 'Approved' | 'Rejected',
    adminNote: request.adminNote
  };
}

export async function deleteCancelRequest(orderId: string): Promise<boolean> {
  await connectToDatabase();
  const result = await CancelRequest.findOneAndDelete({ orderId });
  return !!result;
}

// Return Requests
export async function createReturnRequest(
  orderId: string,
  items: string[],
  reason: 'size_issue' | 'damaged_item' | 'wrong_product' | 'other',
  resolution: 'refund' | 'replacement',
  comment?: string,
  images?: string[],
  refundMethod?: 'bank' | 'wallet',
  bankDetails?: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    mobileNumber?: string;
  },
  refundAmount?: number,
  itemId?: string
): Promise<ReturnRequestType> {
  await connectToDatabase();
  
  const request = await ReturnRequest.create({
    orderId,
    itemId,
    items,
    reason,
    resolution,
    comment,
    images,
    refundMethod,
    bankDetails,
    refundAmount,
    status: 'Pending',
    requestedAt: new Date()
  });
  
  return {
    orderId: request.orderId.toString(),
    items: request.items.map((id: any) => id.toString()),
    reason: request.reason,
    resolution: request.resolution,
    comment: request.comment,
    images: request.images,
    refundMethod: request.refundMethod,
    bankDetails: request.bankDetails,
    refundAmount: request.refundAmount,
    requestedAt: request.requestedAt.toISOString(),
    status: request.status as 'Pending' | 'Approved' | 'Rejected' | 'Completed',
    adminNote: request.adminNote
  };
}

export async function getReturnRequests(): Promise<ReturnRequestType[]> {
  await connectToDatabase();
  const requests = await ReturnRequest.find({}).populate('orderId').sort({ requestedAt: -1 });
  
  return requests.map(req => ({
    orderId: req.orderId.toString(),
    items: req.items.map((id: any) => id.toString()),
    reason: req.reason,
    resolution: req.resolution,
    comment: req.comment,
    images: req.images,
    refundMethod: req.refundMethod,
    bankDetails: req.bankDetails,
    refundAmount: req.refundAmount,
    requestedAt: req.requestedAt.toISOString(),
    status: req.status as 'Pending' | 'Approved' | 'Rejected' | 'Completed',
    adminNote: req.adminNote
  }));
}

export async function getPendingReturnRequests(): Promise<ReturnRequestType[]> {
  await connectToDatabase();
  const requests = await ReturnRequest.find({ status: 'Pending' })
    .populate('orderId')
    .sort({ requestedAt: -1 });
  
  return requests.map(req => ({
    orderId: req.orderId.toString(),
    items: req.items.map((id: any) => id.toString()),
    reason: req.reason,
    resolution: req.resolution,
    comment: req.comment,
    images: req.images,
    refundMethod: req.refundMethod,
    bankDetails: req.bankDetails,
    refundAmount: req.refundAmount,
    requestedAt: req.requestedAt.toISOString(),
    status: req.status as 'Pending' | 'Approved' | 'Rejected' | 'Completed',
    adminNote: req.adminNote
  }));
}

export async function updateReturnRequestStatus(
  orderId: string,
  status: 'Approved' | 'Rejected' | 'Completed',
  adminNote?: string
): Promise<ReturnRequestType | null> {
  await connectToDatabase();
  
  const request = await ReturnRequest.findOne({ orderId });
  if (!request) return null;
  
  request.status = status;
  request.adminNote = adminNote;
  request.processedAt = new Date();
  await request.save();
  
  return {
    orderId: request.orderId.toString(),
    items: request.items.map((id: any) => id.toString()),
    reason: request.reason,
    resolution: request.resolution,
    comment: request.comment,
    images: request.images,
    refundMethod: request.refundMethod,
    bankDetails: request.bankDetails,
    refundAmount: request.refundAmount,
    requestedAt: request.requestedAt.toISOString(),
    status: request.status as 'Pending' | 'Approved' | 'Rejected' | 'Completed',
    adminNote: request.adminNote
  };
}

export async function deleteReturnRequest(orderId: string): Promise<boolean> {
  await connectToDatabase();
  const result = await ReturnRequest.findOneAndDelete({ orderId });
  return !!result;
}

// Item-level requests
export async function getItemCancelRequests() {
  await connectToDatabase();
  return await CancelRequest.find({ itemId: { $exists: true } })
    .populate('orderId')
    .populate('itemId')
    .sort({ requestedAt: -1 });
}

export async function getItemReturnRequests() {
  await connectToDatabase();
  return await ReturnRequest.find({ itemId: { $exists: true } })
    .populate('orderId')
    .populate('itemId')
    .sort({ requestedAt: -1 });
}

export async function updateItemCancelRequestStatus(
  orderId: string,
  itemId: string,
  status: 'Approved' | 'Rejected',
  adminNote?: string
) {
  await connectToDatabase();
  
  const request = await CancelRequest.findOne({ orderId, itemId });
  if (!request) return null;
  
  request.status = status;
  request.adminNote = adminNote;
  request.processedAt = new Date();
  await request.save();
  
  return request;
}

export async function updateItemReturnRequestStatus(
  orderId: string,
  itemId: string,
  status: 'Approved' | 'Rejected' | 'Completed',
  adminNote?: string
) {
  await connectToDatabase();
  
  const request = await ReturnRequest.findOne({ orderId, itemId });
  if (!request) return null;
  
  request.status = status;
  request.adminNote = adminNote;
  request.processedAt = new Date();
  await request.save();
  
  return request;
}

export async function deleteItemCancelRequest(orderId: string, itemId: string): Promise<boolean> {
  await connectToDatabase();
  const result = await CancelRequest.findOneAndDelete({ orderId, itemId });
  return !!result;
}

export async function deleteItemReturnRequest(orderId: string, itemId: string): Promise<boolean> {
  await connectToDatabase();
  const result = await ReturnRequest.findOneAndDelete({ orderId, itemId });
  return !!result;
}

