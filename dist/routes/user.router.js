"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const upload_1 = require("../middleware/upload");
// import { authenticate } from "../middleware/auth";
const router = express_1.default.Router();
router.use(express_1.default.json());
router.use(express_1.default.urlencoded({ extended: true }));
router.patch("/:id", upload_1.upload.single("file"), user_controller_1.updateUser);
router.get("/", user_controller_1.getAllUsers);
router.get("/:id", user_controller_1.getUserById);
// router.patch("/:id", updateUser);
router.delete("/:id", user_controller_1.deleteUser);
exports.default = router;
//# sourceMappingURL=user.router.js.map