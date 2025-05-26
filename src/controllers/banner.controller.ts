import { Request, Response } from "express";
import { bannerClient } from "../lib/prisma";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinaryUpload";
export const getBanner = async (req: Request, res: Response) => {
  try {
    const banner = await bannerClient.findFirst();
    res.status(200).json({ data: banner });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Terjadi kesalahan saat mengambil data banner" });
  }
};

export const uploadBanner = async (req: Request, res: Response) => {
  try {
    const { title, subTitle, event } = req.body;

    // Hapus banner lama jika ada
    const existingBanner = await bannerClient.findFirst();
    if (existingBanner) {
      await deleteFromCloudinary(existingBanner.imageId);
      await bannerClient.delete({
        where: { id: existingBanner.id },
      });
    }

    // Upload banner baru ke Cloudinary
    let imageData = { imageUrl: "", imageId: "" };
    if (req.file) {
      imageData = await uploadToCloudinary(req.file.path, {
        folder: "banner",
        format: "webp",
        transformation: [{ width: 1200, crop: "scale" }],
      });
    }

    // Simpan data banner baru ke database
    const newBanner = await bannerClient.create({
      data: {
        imageUrl: imageData.imageUrl,
        imageId: imageData.imageId,
        title,
        subTitle,
        event,
      },
    });

    res.status(201).json({ message: "Banner berhasil diunggah", data: newBanner });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Terjadi kesalahan saat mengunggah banner" });
  }
};