// src/config/upload.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { Request } from 'express';
import { env } from './env';

// process.cwd() kullanımı dist/ klasöründen çalışırken resimlerin kök dizine yüklenmesini sağlar
const relativeUploadDir = env.ARTICLE_IMG_UPLOAD_PATH || 'public/uploads/articles/';
const uploadDir = path.resolve(process.cwd(), relativeUploadDir);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `article-${uniqueSuffix}${ext}`);
  }
});

const mbLimit = parseInt(env.FILE_UPLOAD_MB_LIMIT || '3', 10);
const maxByteSize = mbLimit * 1024 * 1024;

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const upload = multer({
  storage,
  limits: {
    fileSize: maxByteSize
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isMimeValid = file.mimetype.startsWith('image/');
    const isExtValid = allowedExtensions.includes(ext);

    if (isMimeValid && isExtValid) {
      cb(null, true);
    } else {
      cb(new Error('Sadece izin verilen resim formatları (.jpg, .jpeg, .png, .webp, .gif) yüklenebilir!'));
    }
  }
});

export const articleUploadDir = uploadDir;

export const resolveArticleCoverPath = (coverImage?: string | null): string | null => {
  if (!coverImage) return null;

  const normalized = coverImage.replace(/\\/g, '/');
  if (!normalized.startsWith('/uploads/articles/')) return null;

  const filename = path.posix.basename(normalized);
  if (!filename || filename === '.' || filename === '..') return null;
  if (normalized !== `/uploads/articles/${filename}`) return null;

  const resolved = path.resolve(articleUploadDir, filename);
  const relative = path.relative(articleUploadDir, resolved);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return null;

  return resolved;
};

export const unlinkArticleCover = async (coverImage?: string | null): Promise<void> => {
  const filePath = resolveArticleCoverPath(coverImage);
  if (!filePath) return;

  try {
    await fsPromises.unlink(filePath);
  } catch {
    /* dosya yoksa akışı bozma */
  }
};

export default upload;
