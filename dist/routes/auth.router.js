"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/register', auth_controller_1.register);
router.post('/login/request-otp', auth_controller_1.requestOtp);
router.post('/login/verify-otp', auth_controller_1.verifyOtp);
router.get('/me', auth_1.authenticate, auth_controller_1.getCurrentUser);
exports.default = router;
//# sourceMappingURL=auth.router.js.map