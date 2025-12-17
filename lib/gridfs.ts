import { GridFSBucket, ObjectId } from 'mongodb';
import clientPromise from './mongodb';

const BUCKET_NAME = 'images';

/**
 * Upload an image to GridFS
 * @param fileBuffer - The image file as a Buffer
 * @param filename - The filename for the image
 * @param metadata - Optional metadata to store with the file
 * @returns The GridFS file ID
 */
export async function uploadImage(
  fileBuffer: Buffer,
  filename: string,
  metadata?: Record<string, any>
): Promise<string> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME });

    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(filename, {
        metadata: metadata || {}
      });

      uploadStream.write(fileBuffer);
      uploadStream.end();

      uploadStream.on('finish', () => {
        resolve(uploadStream.id.toString());
      });

      uploadStream.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error('Error uploading image to GridFS:', error);
    throw error;
  }
}

/**
 * Get image buffer from GridFS
 * @param fileId - The GridFS file ID
 * @returns The image buffer
 */
export async function getImageBuffer(fileId: string): Promise<Buffer> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME });

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

      downloadStream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      downloadStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      downloadStream.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error('Error getting image from GridFS:', error);
    throw error;
  }
}

/**
 * Delete an image from GridFS
 * @param fileId - The GridFS file ID
 */
export async function deleteImage(fileId: string): Promise<void> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME });

    await bucket.delete(new ObjectId(fileId));
  } catch (error) {
    console.error('Error deleting image from GridFS:', error);
    throw error;
  }
}

/**
 * Check if an image exists in GridFS
 * @param fileId - The GridFS file ID
 * @returns True if image exists
 */
export async function imageExists(fileId: string): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME });

    const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();
    return files.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Get image metadata from GridFS
 * @param fileId - The GridFS file ID
 * @returns Image metadata
 */
export async function getImageMetadata(fileId: string): Promise<any> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME });

    const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();
    if (files.length === 0) {
      throw new Error('Image not found');
    }

    const file = files[0] as any;

    return {
      filename: file.filename,
      length: file.length,
      uploadDate: file.uploadDate,
      contentType: file.contentType ?? file.metadata?.contentType,
      metadata: file.metadata
    };
  } catch (error) {
    console.error('Error getting image metadata:', error);
    throw error;
  }
}

