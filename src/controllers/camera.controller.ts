import cloudinary from "../config/cloudinary";
import { Request, Response } from "express";
import { cameraClient } from "../lib/prisma";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

// getAllCameras
export const getAllCameras = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const allCameras = await cameraClient.findMany({
      include: {
        brand: true,
      },
    });

    res.status(200).json({ data: allCameras });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat mengambil data camera" });
  }
};

// getCameraById
export const getCameraById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cameraId = req.params.id;
    const camera = await cameraClient.findUnique({
      where: { id: cameraId },
      include: {
        brand: true,
        features: true,
      },
    });

    if (!camera) {
      res.status(404).json({ error: "Camera tidak ditemukan" });
      return;
    }

    const response = {
      ...camera,
      ciri_ciri: camera.features.map((f) => ({ ciri: f.value })),
      features: undefined,
    };

    res.status(200).json({ data: response });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat mengambil data camera" });
  }
};
// createCamera
export const createCamera = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, price, avaliable, brandId, features } = req.body;
    let imageData = { imageUrl: null, imageId: null };

    if (req.file) {
      imageData = await uploadToCloudinary(req.file.path, {
        folder: "cameras",
        format: "webp",
        transformation: [{ width: 1200, crop: "scale" }],
      });
    }

    // Parse features if provided
    const featuresArray = features ? JSON.parse(features) : [];

    const camera = await cameraClient.create({
      data: {
        name,
        price,
        avaliable: avaliable === "true",
        brand: { connect: { id: brandId } },
        imageUrl: imageData.imageUrl,
        imageId: imageData.imageId,
        features: {
          create: featuresArray.map((f: string) => ({ value: f })),
        },
      },
      include: {
        features: true,
      },
    });

    res.status(201).json({
      data: {
        ...camera,
        ciri_ciri: camera.features.map((f) => ({ ciri: f.value })),
        features: undefined,
      },
    });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat membuat camera baru" });
  }
};

// updateCamera
export const updateCamera = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cameraId = req.params.id;
    const { name, price, avaliable, brandId, features } = req.body;

    const existingCamera = await cameraClient.findUnique({
      where: { id: cameraId },
      include: { features: true },
    });

    if (!existingCamera) {
      res.status(404).json({ error: "Camera tidak ditemukan" });
      return;
    }

    const updateData: any = {};

    if (name) updateData.name = name;
    if (price) updateData.price = price;
    if (avaliable !== undefined) updateData.avaliable = avaliable === "true";
    if (brandId) {
      updateData.brand = {
        connect: { id: brandId },
      };
    }

    if (features) {
      const parsedFeatures = JSON.parse(features);

      await cameraClient.update({
        where: { id: cameraId },
        data: {
          features: {
            deleteMany: {},
          },
        },
      });

      updateData.features = {
        create: parsedFeatures.map((f: string) => ({ value: f })),
      };
    }

    if (req.file) {
      if (existingCamera.imageId) {
        await cloudinary.uploader.destroy(existingCamera.imageId);
      }

      const imageData = await uploadToCloudinary(req.file.path, {
        folder: "cameras",
        format: "webp",
        transformation: [{ width: 1200, crop: "scale" }],
      });
      updateData.imageUrl = imageData.imageUrl;
      updateData.imageId = imageData.imageId;
    }

    const camera = await cameraClient.update({
      where: {
        id: cameraId,
      },
      data: updateData,
      include: {
        features: true,
      },
    });

    res.status(200).json({
      data: {
        ...camera,
        ciri_ciri: camera.features.map((f) => ({ ciri: f.value })),
        features: undefined,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Terjadi kesalahan saat mengupdate camera" });
  }
};

// deleteCamera
export const deleteCamera = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cameraId = req.params.id;

    const camera = await prisma.camera.findUnique({
      where: { id: cameraId },
    });

    if (!camera) {
      res.status(404).json({ error: "Camera tidak ditemukan" });
      return;
    }

    await prisma.feature.deleteMany({
      where: { cameraId: cameraId }
    });

    await prisma.camera.delete({
      where: { id: cameraId },
    });

    if (camera.imageId) {
      await cloudinary.uploader.destroy(camera.imageId)
        .catch(e => console.error("Error deleting image from Cloudinary:", e));
    }

    res.status(200).json({ message: "Camera berhasil dihapus" });
  } catch (e) {
    console.error("Delete camera error:", e);
    res.status(500).json({ 
      error: "Terjadi kesalahan saat menghapus camera",
      details: e.message 
    });
  }
};