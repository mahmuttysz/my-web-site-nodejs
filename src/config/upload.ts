import multer, { FileFilterCallback } from 'multer';
import 'multer'; // Express.Multer namespace'ini yüklemek için
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { env } from './env';

const uploadDir = env.ARTICLE_IMG_UPLOAD_PATH || 'public/uploads/articles/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, uploadDir);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
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
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
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

export default upload;