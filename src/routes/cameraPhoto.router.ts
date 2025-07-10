import express from "express";

import { upload } from "../middleware/upload";
import { addCameraPhoto, deleteCameraPhoto, getCameraPhotos } from "../controllers/cameraPhoto.controller";

const router = express.Router();

router.get("/:cameraId/photos", getCameraPhotos);
router.post("/:cameraId/photos", upload.single('image'), addCameraPhoto);
router.delete("/photos/:photoId", deleteCameraPhoto);

export default router;