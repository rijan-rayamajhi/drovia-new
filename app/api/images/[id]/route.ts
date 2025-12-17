import { NextRequest, NextResponse } from 'next/server';
import { getImageBuffer, getImageMetadata } from '@/lib/gridfs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get image metadata first to determine content type
    const metadata = await getImageMetadata(id);
    const buffer = await getImageBuffer(id);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': metadata.contentType || 'image/jpeg',
        'Content-Length': metadata.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Image retrieval error:', error);
    return NextResponse.json(
      { error: 'Image not found' },
      { status: 404 }
    );
  }
}

