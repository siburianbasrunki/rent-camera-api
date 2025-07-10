"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_1 = require("../middleware/upload");
const cameraPhoto_controller_1 = require("../controllers/cameraPhoto.controller");
const router = express_1.default.Router();
router.get("/:cameraId/photos", cameraPhoto_controller_1.getCameraPhotos);
router.post("/:cameraId/photos", upload_1.upload.single('image'), cameraPhoto_controller_1.addCameraPhoto);
router.delete("/photos/:photoId", cameraPhoto_controller_1.deleteCameraPhoto);
exports.default = router;
//# sourceMappingURL=cameraPhoto.router.js.map