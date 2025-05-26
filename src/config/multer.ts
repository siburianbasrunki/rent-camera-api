import multer from 'multer';
import path from 'path';

// Konfigurasi penyimpanan multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Simpan file upload sementara di folder uploads
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Buat nama file unik dengan timestamp
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Filter file untuk memastikan hanya file gambar yang diupload
const fileFilter = (req, file, cb) => {
  // Menerima hanya file gambar
  const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diizinkan!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 
  },
  fileFilter: fileFilter
});

export default upload;