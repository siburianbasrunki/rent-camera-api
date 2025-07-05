"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Konfigurasi penyimpanan multer
const storage = multer_1.default.diskStorage({
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
    const extname = allowedFileTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    }
    else {
        cb(new Error('Hanya file gambar yang diizinkan!'));
    }
};
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: fileFilter
});
exports.default = upload;
//# sourceMappingURL=multer.js.map