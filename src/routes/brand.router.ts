import express from "express";
import { 
  getAllBrands, 
  getBrandById, 
  createBrand, 
  updateBrand, 
  deleteBrand 
} from "../controllers/brand.controller";
import { upload } from "../middleware/upload";

const router = express.Router();

router.get("/", getAllBrands);
router.get("/:id", getBrandById);
router.post("/", upload.single('image'), createBrand);
router.put("/:id", upload.single('image'), updateBrand);
router.delete("/:id", deleteBrand);

export default router;