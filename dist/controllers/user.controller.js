"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = void 0;
const cloudinaryUpload_1 = require("../utils/cloudinaryUpload");
const prisma_1 = require("../lib/prisma");
var Role;
(function (Role) {
    Role["USER"] = "USER";
    Role["ADMIN"] = "ADMIN";
})(Role || (Role = {}));
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma_1.userClient.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                role: true,
                imageUrl: true,
                createdAt: true,
            },
        });
        res.status(200).json({ data: users });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await prisma_1.userClient.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                role: true,
                imageUrl: true,
                createdAt: true,
            },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.status(200).json({ data: user });
    }
    catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Failed to fetch user" });
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, phoneNumber, role } = req.body;
        if (!name && !phoneNumber && !role && !req.file) {
            res.status(400).json({ error: "No update data provided" });
            return;
        }
        const updateData = {};
        if (name)
            updateData.name = name;
        if (phoneNumber)
            updateData.phoneNumber = phoneNumber;
        if (role)
            updateData.role = role;
        if (req.file) {
            const existingUser = await prisma_1.userClient.findUnique({
                where: { id: userId },
            });
            if (existingUser === null || existingUser === void 0 ? void 0 : existingUser.imageId) {
                await (0, cloudinaryUpload_1.deleteFromCloudinary)(existingUser.imageId);
            }
            const imageData = await (0, cloudinaryUpload_1.uploadToCloudinary)(req.file.path, {
                folder: "user-profiles",
                format: "webp",
            });
            updateData.imageUrl = imageData.imageUrl;
            updateData.imageId = imageData.imageId;
        }
        const updatedUser = await prisma_1.userClient.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                role: true,
                imageUrl: true,
                createdAt: true,
            },
        });
        res.status(200).json({
            message: "User updated successfully",
            data: updatedUser,
        });
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Failed to update user" });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await prisma_1.userClient.findUnique({
            where: { id: userId },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        if (user.imageId) {
            await (0, cloudinaryUpload_1.deleteFromCloudinary)(user.imageId);
        }
        await prisma_1.userClient.delete({
            where: { id: userId },
        });
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Failed to delete user" });
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=user.controller.js.map