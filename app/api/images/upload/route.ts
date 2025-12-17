import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/gridfs';
import { requireAuth } from '@/lib/auth-middleware';

async function handler(req: NextRequest, user: any) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${user.userId}-${timestamp}.${extension}`;

    // Upload to GridFS
    const fileId = await uploadImage(buffer, filename, {
      userId: user.userId,
      originalName: file.name,
      contentType: file.type,
      size: file.size
    });

    return NextResponse.json({
      success: true,
      fileId,
      url: `/api/images/${fileId}`
    });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(handler);

