"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const banner_controller_1 = require("../controllers/banner.controller");
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: "uploads/" });
router.get("/", banner_controller_1.getBanner);
router.post("/", upload.single("image"), banner_controller_1.uploadBanner);
exports.default = router;
//# sourceMappingURL=banner.router.js.map