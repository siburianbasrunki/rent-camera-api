import cloudinary from "../config/cloudinary";
import fs from "fs";

type UploadOptions = {
  folder: string;
  format?: 'webp' | 'jpg' | 'png';
  transformation?: Array<Record<string, any>>;
};

type UploadResult = {
  imageUrl: string;
  imageId: string;
};

export const uploadToCloudinary = async (
  filePath: string, 
  options: UploadOptions
): Promise<UploadResult> => {
  try {
    const defaultTransformations = [
      { fetch_format: 'auto', quality: 'auto' }
    ];

    const result = await cloudinary.uploader.upload(filePath, {
      folder: options.folder,
      format: options.format || 'webp',
      transformation: options.transformation || defaultTransformations
    });

    // Hapus file temp setelah upload
    fs.unlinkSync(filePath);

    // Pastikan URL menggunakan format yang diinginkan
    const format = options.format || 'webp';
    const imageUrl = result.secure_url.replace(/\.[^/.]+$/, `.${format}`);

    return {
      imageUrl,
      imageId: result.public_id
    };
  } catch (error) {
    // Hapus file temp jika ada error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

export const deleteFromCloudinary = async (imageId: string): Promise<void> => {
  try {
    if (imageId) {
      await cloudinary.uploader.destroy(imageId);
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};