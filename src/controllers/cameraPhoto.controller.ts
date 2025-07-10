import { Request, Response } from "express";
import { cameraClient, CameraPhoto } from "../lib/prisma";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinaryUpload";

// Add photo to camera
export const addCameraPhoto = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cameraId = req.params.cameraId;

    if (!req.file) {
      res.status(400).json({ error: "No image provided" });
      return;
    }

    const camera = await cameraClient.findUnique({
      where: { id: cameraId },
    });

    if (!camera) {
      res.status(404).json({ error: "Camera not found" });
      return;
    }

    // Check if camera already has 5 photos
    const photoCount = await CameraPhoto.count({
      where: { cameraId },
    });

    if (photoCount >= 5) {
      res.status(400).json({ error: "Maximum 5 photos allowed per camera" });
      return;
    }

    // Upload to Cloudinary
    const imageData = await uploadToCloudinary(req.file.path, {
      folder: "camera-photos",
      format: "webp",
      transformation: [{ width: 1200, crop: "scale" }],
    });

    // Create photo record
    const photo = await CameraPhoto.create({
      data: {
        cameraId,
        imageUrl: imageData.imageUrl,
        imageId: imageData.imageId,
      },
    });

    res.status(201).json({ data: photo });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to add photo to camera" });
  }
};

// Delete camera photo
export const deleteCameraPhoto = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const photoId = req.params.photoId;

    // Find the photo
    const photo = await CameraPhoto.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      res.status(404).json({ error: "Photo not found" });
      return;
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(photo.imageId);

    // Delete from database
    await CameraPhoto.delete({
      where: { id: photoId },
    });

    res.status(200).json({ message: "Photo deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete photo" });
  }
};

// Get all photos for a camera
export const getCameraPhotos = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cameraId = req.params.cameraId;

    const photos = await CameraPhoto.findMany({
      where: { cameraId },
      orderBy: { id: "asc" }, // Added ordering since createdAt might not exist
    });

    res.status(200).json({ data: photos });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get camera photos" });
  }
};
