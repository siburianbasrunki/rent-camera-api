"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBrand = exports.updateBrand = exports.createBrand = exports.getBrandById = exports.getAllBrands = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const prisma_1 = require("../lib/prisma");
const cloudinaryUpload_1 = require("../utils/cloudinaryUpload");
// getAllBrands
const getAllBrands = async (req, res) => {
    try {
        const allBrands = await prisma_1.brandClient.findMany({
            include: {
                cameras: true
            }
        });
        res.status(200).json({ data: allBrands });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ error: "Terjadi kesalahan saat mengambil data brand" });
    }
};
exports.getAllBrands = getAllBrands;
// getBrandById
const getBrandById = async (req, res) => {
    try {
        const brandId = req.params.id;
        const brand = await prisma_1.brandClient.findUnique({
            where: {
                id: brandId,
            },
            include: {
                cameras: true
            }
        });
        if (!brand) {
            res.status(404).json({ error: "Brand tidak ditemukan" });
            return;
        }
        res.status(200).json({ data: brand });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ error: "Terjadi kesalahan saat mengambil data brand" });
    }
};
exports.getBrandById = getBrandById;
// createBrand
const createBrand = async (req, res) => {
    try {
        const { name } = req.body;
        let imageData = { imageUrl: null, imageId: null };
        if (req.file) {
            imageData = await (0, cloudinaryUpload_1.uploadToCloudinary)(req.file.path, {
                folder: "brands",
                format: "webp"
            });
        }
        const brand = await prisma_1.brandClient.create({
            data: {
                name,
                imageUrl: imageData.imageUrl,
                imageId: imageData.imageId
            },
        });
        res.status(201).json({ data: brand });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ error: "Terjadi kesalahan saat membuat brand baru" });
    }
};
exports.createBrand = createBrand;
// updateBrand
const updateBrand = async (req, res) => {
    try {
        const brandId = req.params.id;
        const { name } = req.body;
        const existingBrand = await prisma_1.brandClient.findUnique({
            where: { id: brandId }
        });
        if (!existingBrand) {
            res.status(404).json({ error: "Brand tidak ditemukan" });
            return;
        }
        const updateData = {};
        if (name)
            updateData.name = name;
        if (req.file) {
            if (existingBrand.imageId) {
                await (0, cloudinaryUpload_1.deleteFromCloudinary)(existingBrand.imageId);
            }
            const imageData = await (0, cloudinaryUpload_1.uploadToCloudinary)(req.file.path, {
                folder: "brands",
                format: "webp"
            });
            updateData.imageUrl = imageData.imageUrl;
            updateData.imageId = imageData.imageId;
        }
        const brand = await prisma_1.brandClient.update({
            where: {
                id: brandId,
            },
            data: updateData,
        });
        res.status(200).json({ data: brand });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ error: "Terjadi kesalahan saat mengupdate brand" });
    }
};
exports.updateBrand = updateBrand;
// deleteBrand
const deleteBrand = async (req, res) => {
    try {
        const brandId = req.params.id;
        const brand = await prisma_1.brandClient.findUnique({
            where: { id: brandId }
        });
        if (!brand) {
            res.status(404).json({ error: "Brand tidak ditemukan" });
            return;
        }
        // Hapus semua kamera yang terkait dengan brand ini terlebih dahulu
        await prisma.camera.deleteMany({
            where: { brandId }
        });
        if (brand.imageId) {
            await cloudinary_1.default.uploader.destroy(brand.imageId);
        }
        await prisma_1.brandClient.delete({
            where: {
                id: brandId,
            },
        });
        res.status(200).json({ message: "Brand dan semua kamera terkait berhasil dihapus" });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ error: "Terjadi kesalahan saat menghapus brand" });
    }
};
exports.deleteBrand = deleteBrand;
//# sourceMappingURL=brand.controller.js.map