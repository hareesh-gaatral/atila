import { IncomingMessage } from 'http';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';
import { randomBytes } from 'crypto';

export async function saveFileLocally(
  file: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ url: string; path: string; filename: string }> {
  const uploadDir = process.env.UPLOAD_DIR || './public/uploads';

  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const ext = originalName.split('.').pop() || 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filepath = join(uploadDir, filename);

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
