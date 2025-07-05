"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const fs_1 = __importDefault(require("fs"));
const uploadToCloudinary = async (filePath, options) => {
    try {
        const defaultTransformations = [
            { fetch_format: 'auto', quality: 'auto' }
        ];
        const result = await cloudinary_1.default.uploader.upload(filePath, {
            folder: options.folder,
            format: options.format || 'webp',
            transformation: options.transformation || defaultTransformations
        });
        // Hapus file temp setelah upload
        fs_1.default.unlinkSync(filePath);
        // Pastikan URL menggunakan format yang diinginkan
        const format = options.format || 'webp';
        const imageUrl = result.secure_url.replace(/\.[^/.]+$/, `.${format}`);
        return {
            imageUrl,
            imageId: result.public_id
        };
    }
    catch (error) {
        // Hapus file temp jika ada error
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        throw error;
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
const deleteFromCloudinary = async (imageId) => {
    try {
        if (imageId) {
            await cloudinary_1.default.uploader.destroy(imageId);
        }
    }
    catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw error;
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
//# sourceMappingURL=cloudinaryUpload.js.map