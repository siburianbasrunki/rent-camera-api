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

    const existingBanner = await bannerClient.findFirst();
    
    let imageData = { 
      imageUrl: existingBanner?.imageUrl || "", 
      imageId: existingBanner?.imageId || "" 
    };

    if (req.file) {
      if (existingBanner?.imageId) {
        await deleteFromCloudinary(existingBanner.imageId);
      }
      
      imageData = await uploadToCloudinary(req.file.path, {
        folder: "banner",
        format: "webp",
        transformation: [{ width: 1200, crop: "scale" }],
      });
    }

    const bannerData = {
      imageUrl: imageData.imageUrl,
      imageId: imageData.imageId,
      title: title || existingBanner?.title || "",
      subTitle: subTitle || existingBanner?.subTitle || "",
      event: event || existingBanner?.event || "",
    };

    const newBanner = existingBanner 
      ? await bannerClient.update({
          where: { id: existingBanner.id },
          data: bannerData
        })
      : await bannerClient.create({ data: bannerData });

    res.status(201).json({ message: "Banner updated successfully", data: newBanner });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Terjadi kesalahan saat mengunggah banner" });
  }
};