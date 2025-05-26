import { getBanner, uploadBanner } from "../controllers/banner.controller";
import express from "express";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getBanner);
router.post("/", upload.single("image"), uploadBanner);

export default router;
