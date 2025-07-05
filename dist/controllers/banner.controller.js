"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBanner = exports.getBanner = void 0;
const prisma_1 = require("../lib/prisma");
const cloudinaryUpload_1 = require("../utils/cloudinaryUpload");
const getBanner = async (req, res) => {
    try {
        const banner = await prisma_1.bannerClient.findFirst();
        res.status(200).json({ data: banner });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Terjadi kesalahan saat mengambil data banner" });
    }
};
exports.getBanner = getBanner;
const uploadBanner = async (req, res) => {
    try {
        const { title, subTitle, event } = req.body;
        // Hapus banner lama jika ada
        const existingBanner = await prisma_1.bannerClient.findFirst();
        if (existingBanner) {
            await (0, cloudinaryUpload_1.deleteFromCloudinary)(existingBanner.imageId);
            await prisma_1.bannerClient.delete({
                where: { id: existingBanner.id },
            });
        }
        // Upload banner baru ke Cloudinary
        let imageData = { imageUrl: "", imageId: "" };
        if (req.file) {
            imageData = await (0, cloudinaryUpload_1.uploadToCloudinary)(req.file.path, {
                folder: "banner",
                format: "webp",
                transformation: [{ width: 1200, crop: "scale" }],
            });
        }
        // Simpan data banner baru ke database
        const newBanner = await prisma_1.bannerClient.create({
            data: {
                imageUrl: imageData.imageUrl,
                imageId: imageData.imageId,
                title,
                subTitle,
                event,
            },
        });
        res.status(201).json({ message: "Banner berhasil diunggah", data: newBanner });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Terjadi kesalahan saat mengunggah banner" });
    }
};
exports.uploadBanner = uploadBanner;
//# sourceMappingURL=banner.controller.js.map