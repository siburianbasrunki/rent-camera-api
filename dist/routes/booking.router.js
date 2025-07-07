"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const booking_controller_1 = require("../controllers/booking.controller");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
router.use(express_1.default.json());
router.use(auth_1.authenticate);
router.post("/", upload_1.upload.single("identityProof"), booking_controller_1.createBooking);
router.get("/", booking_controller_1.getUserBookings);
router.get("/:id", booking_controller_1.getBookingById);
router.get("/admin/all", booking_controller_1.getAllBookings);
router.get("/:id/payment-status", booking_controller_1.checkBookingPayment);
router.patch("/:id/cancel", booking_controller_1.cancelBooking);
router.get("/admin/newest", booking_controller_1.getNewestBookings);
router.post("/:id/return", upload_1.upload.single("returnProof"), booking_controller_1.processReturn);
// router.patch("/:id/verify-return", verifyReturn);
exports.default = router;
//# sourceMappingURL=booking.router.js.map