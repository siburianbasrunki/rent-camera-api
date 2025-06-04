import cloudinary from "../config/cloudinary";
import { Request, Response } from "express";
import { brandClient } from "../lib/prisma";
import {
  deleteFromCloudinary,
  uploadToCloudinaryFromBuffer,
} from "../utils/cloudinaryUpload";
// getAllBrands
export const getAllBrands = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const allBrands = await brandClient.findMany({
      include: {
        cameras: true,
      },
    });

    res.status(200).json({ data: allBrands });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat mengambil data brand" });
  }
};

// getBrandById
export const getBrandById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const brandId = req.params.id;
    const brand = await brandClient.findUnique({
      where: {
        id: brandId,
      },
      include: {
        cameras: true,
      },
    });

    if (!brand) {
      res.status(404).json({ error: "Brand tidak ditemukan" });
      return;
    }

    res.status(200).json({ data: brand });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat mengambil data brand" });
  }
};

// createBrand
export const createBrand = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;
    let imageData = { imageUrl: null, imageId: null };

    if (req.file) {
      imageData = await uploadToCloudinaryFromBuffer(
        req.file.buffer,
        req.file.originalname,
        {
          folder: "brands",
          format: "webp",
        }
      );
    }

    const brand = await brandClient.create({
      data: {
        name,
        imageUrl: imageData.imageUrl,
        imageId: imageData.imageId,
      },
    });

    res.status(201).json({ data: brand });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat membuat brand baru" });
  }
};

// updateBrand
export const updateBrand = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const brandId = req.params.id;
    const { name } = req.body;

    const existingBrand = await brandClient.findUnique({
      where: { id: brandId },
    });

    if (!existingBrand) {
      res.status(404).json({ error: "Brand tidak ditemukan" });
      return;
    }

    const updateData: any = {};

    if (name) updateData.name = name;

    if (req.file) {
      if (existingBrand.imageId) {
        await deleteFromCloudinary(existingBrand.imageId);
      }

      const imageData = await uploadToCloudinaryFromBuffer(
        req.file.buffer,
        req.file.originalname,
        {
          folder: "brands",
          format: "webp",
        }
      );
      updateData.imageUrl = imageData.imageUrl;
      updateData.imageId = imageData.imageId;
    }

    const brand = await brandClient.update({
      where: {
        id: brandId,
      },
      data: updateData,
    });

    res.status(200).json({ data: brand });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Terjadi kesalahan saat mengupdate brand" });
  }
};
// deleteBrand
export const deleteBrand = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const brandId = req.params.id;

    const brand = await brandClient.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      res.status(404).json({ error: "Brand tidak ditemukan" });
      return;
    }

    // Hapus semua kamera yang terkait dengan brand ini terlebih dahulu
    await prisma.camera.deleteMany({
      where: { brandId },
    });

    if (brand.imageId) {
      await cloudinary.uploader.destroy(brand.imageId);
    }

    await brandClient.delete({
      where: {
        id: brandId,
      },
    });

    res
      .status(200)
      .json({ message: "Brand dan semua kamera terkait berhasil dihapus" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Terjadi kesalahan saat menghapus brand" });
  }
};
