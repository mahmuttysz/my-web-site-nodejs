const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { env } = require('./env');

const uploadDir = env.ARTICLE_IMG_UPLOAD_PATH || 'public/uploads/articles/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `article-${uniqueSuffix}${ext}`);
  }
});

const mbLimit = parseInt(env.FILE_UPLOAD_MB_LIMIT, 10) || 3;
const maxByteSize = mbLimit * 1024 * 1024;

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const upload = multer({
  storage,
  limits: {
    fileSize: maxByteSize
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isMimeValid = file.mimetype.startsWith('image/');
    const isExtValid = allowedExtensions.includes(ext);

    if (isMimeValid && isExtValid) {
      cb(null, true);
    } else {
      cb(new Error('Sadece izin verilen resim formatları (.jpg, .jpeg, .png, .webp, .gif) yüklenebilir!'), false);
    }
  }
});

module.exports = upload;