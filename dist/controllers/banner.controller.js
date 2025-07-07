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
        const existingBanner = await prisma_1.bannerClient.findFirst();
        let imageData = {
            imageUrl: (existingBanner === null || existingBanner === void 0 ? void 0 : existingBanner.imageUrl) || "",
            imageId: (existingBanner === null || existingBanner === void 0 ? void 0 : existingBanner.imageId) || ""
        };
        if (req.file) {
            if (existingBanner === null || existingBanner === void 0 ? void 0 : existingBanner.imageId) {
                await (0, cloudinaryUpload_1.deleteFromCloudinary)(existingBanner.imageId);
            }
            imageData = await (0, cloudinaryUpload_1.uploadToCloudinary)(req.file.path, {
                folder: "banner",
                format: "webp",
                transformation: [{ width: 1200, crop: "scale" }],
            });
        }
        const bannerData = {
            imageUrl: imageData.imageUrl,
            imageId: imageData.imageId,
            title: title || (existingBanner === null || existingBanner === void 0 ? void 0 : existingBanner.title) || "",
            subTitle: subTitle || (existingBanner === null || existingBanner === void 0 ? void 0 : existingBanner.subTitle) || "",
            event: event || (existingBanner === null || existingBanner === void 0 ? void 0 : existingBanner.event) || "",
        };
        const newBanner = existingBanner
            ? await prisma_1.bannerClient.update({
                where: { id: existingBanner.id },
                data: bannerData
            })
            : await prisma_1.bannerClient.create({ data: bannerData });
        res.status(201).json({ message: "Banner updated successfully", data: newBanner });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Terjadi kesalahan saat mengunggah banner" });
    }
};
exports.uploadBanner = uploadBanner;
//# sourceMappingURL=banner.controller.js.map