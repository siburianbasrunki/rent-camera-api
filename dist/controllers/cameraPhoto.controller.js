"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCameraPhotos = exports.deleteCameraPhoto = exports.addCameraPhoto = void 0;
const prisma_1 = require("../lib/prisma");
const cloudinaryUpload_1 = require("../utils/cloudinaryUpload");
// Add photo to camera
const addCameraPhoto = async (req, res) => {
    try {
        const cameraId = req.params.cameraId;
        if (!req.file) {
            res.status(400).json({ error: "No image provided" });
            return;
        }
        const camera = await prisma_1.cameraClient.findUnique({
            where: { id: cameraId },
        });
        if (!camera) {
            res.status(404).json({ error: "Camera not found" });
            return;
        }
        // Check if camera already has 5 photos
        const photoCount = await prisma_1.CameraPhoto.count({
            where: { cameraId },
        });
        if (photoCount >= 5) {
            res.status(400).json({ error: "Maximum 5 photos allowed per camera" });
            return;
        }
        // Upload to Cloudinary
        const imageData = await (0, cloudinaryUpload_1.uploadToCloudinary)(req.file.path, {
            folder: "camera-photos",
            format: "webp",
            transformation: [{ width: 1200, crop: "scale" }],
        });
        // Create photo record
        const photo = await prisma_1.CameraPhoto.create({
            data: {
                cameraId,
                imageUrl: imageData.imageUrl,
                imageId: imageData.imageId,
            },
        });
        res.status(201).json({ data: photo });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to add photo to camera" });
    }
};
exports.addCameraPhoto = addCameraPhoto;
// Delete camera photo
const deleteCameraPhoto = async (req, res) => {
    try {
        const photoId = req.params.photoId;
        // Find the photo
        const photo = await prisma_1.CameraPhoto.findUnique({
            where: { id: photoId },
        });
        if (!photo) {
            res.status(404).json({ error: "Photo not found" });
            return;
        }
        // Delete from Cloudinary
        await (0, cloudinaryUpload_1.deleteFromCloudinary)(photo.imageId);
        // Delete from database
        await prisma_1.CameraPhoto.delete({
            where: { id: photoId },
        });
        res.status(200).json({ message: "Photo deleted successfully" });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to delete photo" });
    }
};
exports.deleteCameraPhoto = deleteCameraPhoto;
// Get all photos for a camera
const getCameraPhotos = async (req, res) => {
    try {
        const cameraId = req.params.cameraId;
        const photos = await prisma_1.CameraPhoto.findMany({
            where: { cameraId },
            orderBy: { id: "asc" }, // Added ordering since createdAt might not exist
        });
        res.status(200).json({ data: photos });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to get camera photos" });
    }
};
exports.getCameraPhotos = getCameraPhotos;
//# sourceMappingURL=cameraPhoto.controller.js.map