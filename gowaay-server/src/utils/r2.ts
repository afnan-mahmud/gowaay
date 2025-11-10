import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Lazy initialization of S3 client for Cloudflare R2
let r2Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!r2Client) {
    if (!process.env.CF_ACCOUNT_ID || !process.env.CF_R2_ACCESS_KEY_ID || !process.env.CF_R2_SECRET_ACCESS_KEY) {
      throw new Error('Missing required Cloudflare R2 environment variables');
    }
    
    r2Client = new S3Client({
      endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      region: process.env.CF_R2_REGION || 'auto',
      credentials: {
        accessKeyId: process.env.CF_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return r2Client;
}

function getBucketName(): string {
  if (!process.env.CF_R2_BUCKET_NAME) {
    throw new Error('CF_R2_BUCKET_NAME environment variable is required');
  }
  return process.env.CF_R2_BUCKET_NAME;
}

/**
 * Upload a file to Cloudflare R2
 * @param key - The object key (path) in the bucket
 * @param buffer - The file buffer to upload
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadToR2(key: string, buffer: Buffer, contentType: string): Promise<string> {
  try {
    const client = getR2Client();
    const bucketName = getBucketName();
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await client.send(command);

    // Return the public URL
    const publicUrl = `${process.env.CF_R2_PUBLIC_BASE_URL || `https://${bucketName}.${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`}/${key}`;
    return publicUrl;
  } catch (error) {
    console.error('R2 upload error:', error);
    throw new Error('Failed to upload file to R2');
  }
}

/**
 * Delete a file from Cloudflare R2
 * @param key - The object key (path) in the bucket
 */
export async function deleteFromR2(key: string): Promise<void> {
  try {
    const client = getR2Client();
    const bucketName = getBucketName();
    
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await client.send(command);
    console.log(`[R2_DELETE] Deleted: ${key}`);
  } catch (error) {
    console.error('R2 delete error:', error);
    throw new Error('Failed to delete file from R2');
  }
}

/**
 * Extract the R2 key from a public URL
 * @param publicUrl - The public URL of the file
 * @returns The R2 key
 */
export function extractKeyFromUrl(publicUrl: string): string {
  try {
    const url = new URL(publicUrl);
    return url.pathname.slice(1); // Remove leading slash
  } catch (error) {
    console.error('Invalid URL:', publicUrl);
    throw new Error('Invalid public URL');
  }
}
