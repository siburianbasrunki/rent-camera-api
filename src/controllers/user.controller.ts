import { Request, Response } from "express";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinaryUpload";
export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: Role;
}

enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

export const getAllUsers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
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
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getUserById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.id;

    const user = await prisma.user.findUnique({
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
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// Update user profile
export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.id;
    const { name, phoneNumber, role } = req.body;

    // Check if there's any data to update
    if (!name && !phoneNumber && !role && !req.file) {
      res.status(400).json({ error: "No update data provided" });
      return;
    }

    const updateData: any = {};

    // Only add fields to update if they are provided
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (role) updateData.role = role;

    // Handle image upload if present
    if (req.file) {
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      // Delete old image if exists
      if (existingUser?.imageId) {
        await deleteFromCloudinary(existingUser.imageId);
      }

      // Upload new image
      const imageData = await uploadToCloudinary(req.file.path, {
        folder: "user-profiles",
        format: "webp",
      });

      updateData.imageUrl = imageData.imageUrl;
      updateData.imageId = imageData.imageId;
    }

    const updatedUser = await prisma.user.update({
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
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// Delete user
export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Delete profile image if exists
    if (user.imageId) {
      await deleteFromCloudinary(user.imageId);
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};
