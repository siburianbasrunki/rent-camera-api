import express from "express";
import { 
  getAllCameras, 
  getCameraById, 
  createCamera, 
  updateCamera, 
  deleteCamera, 
  getCameraReviews,
  getReviewById
} from "../controllers/camera.controller";
import { upload } from "../middleware/upload";

const router = express.Router();

router.get("/", getAllCameras);
router.get("/:id", getCameraById);
router.post("/", upload.single('image'), createCamera);
router.put("/:id", upload.single('image'), updateCamera);
router.delete("/:id", deleteCamera);
router.get("/:cameraId/reviews", getCameraReviews);
router.get("/reviews/:id", getReviewById);
export default router;