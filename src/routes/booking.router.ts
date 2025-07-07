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
} from "../controllers/booking.controller";

const router = express.Router();
router.use(express.json());
router.use(authenticate);

router.post("/", createBooking);
router.get("/", getUserBookings);
router.get("/:id", getBookingById);
router.get("/admin/all", getAllBookings);
router.get("/:id/payment-status", checkBookingPayment);
router.patch("/:id/cancel", cancelBooking);
router.get("/admin/newest", getNewestBookings);

export default router;
