"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const brand_controller_1 = require("../controllers/brand.controller");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
router.get("/", brand_controller_1.getAllBrands);
router.get("/:id", brand_controller_1.getBrandById);
router.post("/", upload_1.upload.single('image'), brand_controller_1.createBrand);
router.put("/:id", upload_1.upload.single('image'), brand_controller_1.updateBrand);
router.delete("/:id", brand_controller_1.deleteBrand);
exports.default = router;
//# sourceMappingURL=brand.router.js.map