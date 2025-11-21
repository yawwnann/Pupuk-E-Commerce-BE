import multer from 'multer';
import path from 'path';

// Konfigurasi Multer untuk menyimpan file di memory
const storage = multer.memoryStorage();

// Filter file - hanya accept image
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept image files only
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Konfigurasi upload
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
});

// Middleware untuk single file upload
export const uploadSingle = upload.single('image');

// Middleware untuk multiple files upload
export const uploadMultiple = upload.array('images', 5); // max 5 images
