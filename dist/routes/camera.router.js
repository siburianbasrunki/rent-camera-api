"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const camera_controller_1 = require("../controllers/camera.controller");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
router.get("/", camera_controller_1.getAllCameras);
router.get("/:id", camera_controller_1.getCameraById);
router.post("/", upload_1.upload.single('image'), camera_controller_1.createCamera);
router.put("/:id", upload_1.upload.single('image'), camera_controller_1.updateCamera);
router.delete("/:id", camera_controller_1.deleteCamera);
exports.default = router;
//# sourceMappingURL=camera.router.js.map