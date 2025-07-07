import express from "express";

import { authenticate } from "../middleware/auth";
import {
  createBooking,
  cancelBooking,
  checkBookingPayment,
  getBookingById,
  getUserBookings,
  getAllBookings,
  getNewestBookings,
  processReturn,
} from "../controllers/booking.controller";
import { upload } from "../middleware/upload";

const router = express.Router();
router.use(express.json());
router.use(authenticate);

router.post("/", upload.single("identityProof"), createBooking);
router.get("/", getUserBookings);
router.get("/:id", getBookingById);
router.get("/admin/all", getAllBookings);
router.get("/:id/payment-status", checkBookingPayment);
router.patch("/:id/cancel", cancelBooking);
router.get("/admin/newest", getNewestBookings);
router.post("/:id/return", upload.single("returnProof"), processReturn);
// router.patch("/:id/verify-return", verifyReturn);
export default router;
