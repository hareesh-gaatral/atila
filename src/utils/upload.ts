import { IncomingMessage } from 'http';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';
import { randomBytes } from 'crypto';

const isVercel = !!process.env.VERCEL;

async function uploadToCloudinary(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ url: string; path: string; filename: string }> {
  const cloudinary = (await import('cloudinary')).v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const result = await new Promise<any>((resolve, reject) => {
    const ext = filename.split('.').pop() || 'jpg';
    const publicId = `atila-uploads/${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    cloudinary.uploader
      .upload_stream(
        { folder: 'atila-uploads', public_id: publicId, resource_type: 'auto' },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        }
      )
      .end(buffer);
  });

  return {
    url: result.secure_url,
    path: result.public_id,
    filename,
  };
}

export async function saveFileLocally(
  file: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ url: string; path: string; filename: string }> {
  const ext = originalName.split('.').pop() || 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  let processedBuffer = file;

  if (mimeType.startsWith('image/') && mimeType !== 'image/svg+xml') {
    try {
      processedBuffer = await sharp(file)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
    } catch {
      // If sharp fails, use original
    }
  }

  if (isVercel) {
    return uploadToCloudinary(processedBuffer, filename, mimeType);
  }

  const uploadDir = process.env.UPLOAD_DIR || './public/uploads';

  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const filepath = join(uploadDir, filename);
  await writeFile(filepath, processedBuffer);

  return {
    url: `/uploads/${filename}`,
    path: filepath,
    filename,
  };
}

export function parseMultipartForm(
  req: IncomingMessage
): Promise<{ fields: Record<string, string>; file: { buffer: Buffer; filename: string; mimeType: string } | null }> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let fileType = '';
    let fileName = '';

    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve({
        fields: {},
        file: {
          buffer,
          filename: fileName || 'upload.jpg',
          mimeType: fileType || 'image/jpeg',
        },
      });
    });

    req.on('error', reject);
  });
}
