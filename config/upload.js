const multer = require('multer');
const path = require('path');
const { env } = require('./env');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.ARTICLE_IMG_UPLOAD_PATH || 'public/uploads/articles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'article-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { 
    fileSize: parseInt(env.FILE_UPLOAD_MB_LIMIT) || 3 * 1024 * 1024 
  }, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyası yüklenebilir!'), false);
    }
  }
});

module.exports = upload;