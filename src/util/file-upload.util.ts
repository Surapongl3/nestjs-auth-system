import { fileTypeFromBuffer } from 'file-type';
import * as fs from 'fs/promises';
import { extname } from 'path';
export const allowedImageTypes = ['.jpg', '.jpeg', '.png', '.webp'];

export function generateFilename(file: Express.Multer.File): string {
  const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);

  return uniqueName + extname(file.originalname);
}

export function imageFileFilter(
  req: any,
  file: Express.Multer.File,
  callback: Function,
) {
  const ext = extname(file.originalname).toLowerCase();

  if (!allowedImageTypes.includes(ext)) {
    return callback(new Error('Only image files allowed'), false);
  }

  callback(null, true);
}

export async function validateRealImage(path: string) {
  const buffer = await fs.readFile(path);
  const type = await fileTypeFromBuffer(buffer);

  if (!type || !['image/jpeg', 'image/png', 'image/webp'].includes(type.mime)) {
    throw new Error('Invalid image file');
  }
}
