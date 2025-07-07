import { Request, Response } from "express";
import prisma, { BookingClient } from "../lib/prisma";
import {
  sendBookingConfirmationEmail,
  sendPaymentSuccessEmail,
} from "../services/email.service";
import { AuthenticatedRequest } from "./user.controller";
import {
  createVAPayment,
  checkPaymentStatus,
  createQRISPayment,
  getMidtransClientKey,
} from "../config/midtrans";

export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { cameraId, date, duration, purpose, paymentMethod } = req.body;

    // Validate input
    if (!cameraId || !date || !duration || !purpose || !paymentMethod) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Get camera details
    const camera = await prisma.camera.findUnique({
      where: { id: cameraId },
    });

    if (!camera) {
      res.status(404).json({ error: "Camera not found" });
      return;
    }

    // Calculate total price
    const pricePerDay = parseFloat(camera.price);
    const totalPrice = pricePerDay * parseInt(duration);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        cameraId,
        date: new Date(date),
        duration: parseInt(duration),
        purpose,
        totalPrice,
      },
      include: {
        user: true,
        camera: true,
      },
    });

    // Generate order ID
    const orderId = `BK-${booking.id.slice(0, 8)}-${Date.now()}`;

    // Create payment based on payment method
    let paymentResponse;
    const items = [
      {
        id: camera.id,
        price: pricePerDay,
        quantity: parseInt(duration),
        name: camera.name,
      },
    ];

    const customer = {
      first_name: booking.user.name,
      email: booking.user.email,
      phone: booking.user.phoneNumber || undefined,
    };

    if (paymentMethod === "BANK_TRANSFER") {
      paymentResponse = await createVAPayment(
        orderId,
        totalPrice,
        items,
        customer
      );
    } else if (paymentMethod === "QRIS") {
      paymentResponse = await createQRISPayment(
        orderId,
        totalPrice,
        items,
        customer
      );
    } else {
      res.status(400).json({ error: "Invalid payment method" });
      return;
    }

    // Save payment details
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        paymentMethod: paymentMethod as any,
        amount: totalPrice,
        midtransOrderId: orderId,
        paymentCode:
          paymentResponse.va_numbers?.[0]?.va_number || paymentResponse.qr_code,
        paymentUrl: paymentResponse.actions?.[0]?.url,
        expiryTime: new Date(
          paymentResponse.expiry_time || Date.now() + 24 * 60 * 60 * 1000
        ),
      },
    });

    // Send confirmation email
    await sendBookingConfirmationEmail(booking.user.email, booking.user.name, {
      cameraName: booking.camera.name,
      bookingDate: booking.date.toISOString(),
      duration: duration.toString(),
      totalPrice: `Rp${totalPrice.toLocaleString()}`,
      paymentMethod:
        paymentMethod === "BANK_TRANSFER" ? "Bank Transfer" : "QRIS",
      paymentCode: payment.paymentCode || undefined,
    });

    res.status(201).json({
      message: "Booking created successfully",
      data: {
        booking,
        payment,
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
};

export const getBookingById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const bookingId = req.params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        camera: true,
        payment: true,
      },
    });

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    if (user?.role !== 'ADMIN' && booking.userId !== userId) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    res.status(200).json({ data: booking });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ error: "Failed to fetch booking" });
  }
};

export const getUserBookings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        camera: true,
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({ data: bookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

export const checkBookingPayment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const bookingId = req.params.id;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
        user: true,
        camera: true,
      },
    });

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    if (booking.userId !== userId) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    if (!booking.payment?.midtransOrderId) {
      res
        .status(400)
        .json({ error: "No payment associated with this booking" });
      return;
    }

    // Check payment status with Midtrans
    const paymentStatus = await checkPaymentStatus(
      booking.payment.midtransOrderId
    );

    const mapMidtransStatus = (status: string): string => {
      switch (status.toLowerCase()) {
        case 'pending':
          return 'PENDING';
        case 'settlement':
          return 'SETTLED';
        case 'expire':
          return 'EXPIRED';
        case 'deny':
        case 'cancel':
          return 'FAILED';
        default:
          return 'PENDING';
      }
    };

    const mappedStatus = mapMidtransStatus(paymentStatus.transaction_status);

    // Update payment status in database if changed
    if (mappedStatus !== booking.payment.status) {
      await prisma.payment.update({
        where: { id: booking.payment.id },
        data: {
          status: mappedStatus as any,
        },
      });

      // Update booking status if payment is settled
      if (mappedStatus === 'SETTLED') {
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: "PAID",
          },
        });

        // Send payment success email
        await sendPaymentSuccessEmail(booking.user.email, booking.user.name, {
          cameraName: booking.camera.name,
          bookingDate: booking.date.toISOString(),
          totalPrice: `Rp${booking.totalPrice.toLocaleString()}`,
          paymentMethod:
            booking.payment.paymentMethod === "BANK_TRANSFER"
              ? "Bank Transfer"
              : "QRIS",
        });
      }
    }

    res.status(200).json({
      data: {
        booking,
        paymentStatus: {
          ...paymentStatus,
          mappedStatus: mappedStatus
        },
      },
    });
  } catch (error: any) {
    console.error("Error checking payment status:", error);
    
    if (error.message.includes('Transaction not found')) {
      res.status(404).json({ error: "Transaction not found in payment gateway" });
    } else {
      res.status(500).json({ 
        error: "Failed to check payment status",
        details: error.message 
      });
    }
  }
};

export const cancelBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const bookingId = req.params.id;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    if (booking.userId !== userId) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    if (booking.status !== "PENDING") {
      res.status(400).json({ error: "Only pending bookings can be cancelled" });
      return;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
      },
    });

    res.status(200).json({
      message: "Booking cancelled successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
};

export const getAllBookings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
    });

    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: "Unauthorized: Admin access required" });
      return;
    }

    const bookings = await prisma.booking.findMany({
      include: {
        camera: true,
        payment: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({ data: bookings });
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

export const getNewestBookings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
    });

    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: "Unauthorized: Admin access required" });
      return;
    }

    const bookings = await BookingClient.findMany({
      include: {
        camera: true,
        payment: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5, 
    });

    res.status(200).json({ data: bookings });
  } catch (error) {
    console.error("Error fetching latest bookings:", error);
    res.status(500).json({ error: "Failed to fetch latest bookings" });
  }
};