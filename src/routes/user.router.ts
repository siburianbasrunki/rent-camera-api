import express from "express";
import {
  getAllUsers,
  deleteUser,
  getUserById,
  updateUser,
} from "../controllers/user.controller";
import { upload } from "../middleware/upload";
// import { authenticate } from "../middleware/auth";

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.patch("/:id", upload.single("file"), updateUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
// router.patch("/:id", updateUser);

router.delete("/:id", deleteUser);

export default router;
