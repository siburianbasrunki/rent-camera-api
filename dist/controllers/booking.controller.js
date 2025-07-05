"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBookings = exports.cancelBooking = exports.checkBookingPayment = exports.getUserBookings = exports.getBookingById = exports.createBooking = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const email_service_1 = require("../services/email.service");
const midtrans_1 = require("../config/midtrans");
const createBooking = async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const userId = req.userId;
        const { cameraId, date, duration, purpose, paymentMethod } = req.body;
        // Validate input
        if (!cameraId || !date || !duration || !purpose || !paymentMethod) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }
        // Get camera details
        const camera = await prisma_1.default.camera.findUnique({
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
        const booking = await prisma_1.default.booking.create({
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
            paymentResponse = await (0, midtrans_1.createVAPayment)(orderId, totalPrice, items, customer);
        }
        else if (paymentMethod === "QRIS") {
            paymentResponse = await (0, midtrans_1.createQRISPayment)(orderId, totalPrice, items, customer);
        }
        else {
            res.status(400).json({ error: "Invalid payment method" });
            return;
        }
        // Save payment details
        const payment = await prisma_1.default.payment.create({
            data: {
                bookingId: booking.id,
                paymentMethod: paymentMethod,
                amount: totalPrice,
                midtransOrderId: orderId,
                paymentCode: ((_b = (_a = paymentResponse.va_numbers) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.va_number) || paymentResponse.qr_code,
                paymentUrl: (_d = (_c = paymentResponse.actions) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.url,
                expiryTime: new Date(paymentResponse.expiry_time || Date.now() + 24 * 60 * 60 * 1000),
            },
        });
        // Send confirmation email
        await (0, email_service_1.sendBookingConfirmationEmail)(booking.user.email, booking.user.name, {
            cameraName: booking.camera.name,
            bookingDate: booking.date.toISOString(),
            duration: duration.toString(),
            totalPrice: `Rp${totalPrice.toLocaleString()}`,
            paymentMethod: paymentMethod === "BANK_TRANSFER" ? "Bank Transfer" : "QRIS",
            paymentCode: payment.paymentCode || undefined,
        });
        res.status(201).json({
            message: "Booking created successfully",
            data: {
                booking,
                payment,
            },
        });
    }
    catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ error: "Failed to create booking" });
    }
};
exports.createBooking = createBooking;
const getBookingById = async (req, res) => {
    try {
        const userId = req.userId;
        const bookingId = req.params.id;
        const booking = await prisma_1.default.booking.findUnique({
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
        if (booking.userId !== userId) {
            res.status(403).json({ error: "Unauthorized" });
            return;
        }
        res.status(200).json({ data: booking });
    }
    catch (error) {
        console.error("Error fetching booking:", error);
        res.status(500).json({ error: "Failed to fetch booking" });
    }
};
exports.getBookingById = getBookingById;
const getUserBookings = async (req, res) => {
    try {
        const userId = req.userId;
        const bookings = await prisma_1.default.booking.findMany({
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
    }
    catch (error) {
        console.error("Error fetching user bookings:", error);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
};
exports.getUserBookings = getUserBookings;
const checkBookingPayment = async (req, res) => {
    var _a;
    try {
        const userId = req.userId;
        const bookingId = req.params.id;
        const booking = await prisma_1.default.booking.findUnique({
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
        if (!((_a = booking.payment) === null || _a === void 0 ? void 0 : _a.midtransOrderId)) {
            res
                .status(400)
                .json({ error: "No payment associated with this booking" });
            return;
        }
        // Check payment status with Midtrans
        const paymentStatus = await (0, midtrans_1.checkPaymentStatus)(booking.payment.midtransOrderId);
        const mapMidtransStatus = (status) => {
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
            await prisma_1.default.payment.update({
                where: { id: booking.payment.id },
                data: {
                    status: mappedStatus,
                },
            });
            // Update booking status if payment is settled
            if (mappedStatus === 'SETTLED') {
                await prisma_1.default.booking.update({
                    where: { id: booking.id },
                    data: {
                        status: "PAID",
                    },
                });
                // Send payment success email
                await (0, email_service_1.sendPaymentSuccessEmail)(booking.user.email, booking.user.name, {
                    cameraName: booking.camera.name,
                    bookingDate: booking.date.toISOString(),
                    totalPrice: `Rp${booking.totalPrice.toLocaleString()}`,
                    paymentMethod: booking.payment.paymentMethod === "BANK_TRANSFER"
                        ? "Bank Transfer"
                        : "QRIS",
                });
            }
        }
        res.status(200).json({
            data: {
                booking,
                paymentStatus: Object.assign(Object.assign({}, paymentStatus), { mappedStatus: mappedStatus }),
            },
        });
    }
    catch (error) {
        console.error("Error checking payment status:", error);
        if (error.message.includes('Transaction not found')) {
            res.status(404).json({ error: "Transaction not found in payment gateway" });
        }
        else {
            res.status(500).json({
                error: "Failed to check payment status",
                details: error.message
            });
        }
    }
};
exports.checkBookingPayment = checkBookingPayment;
const cancelBooking = async (req, res) => {
    try {
        const userId = req.userId;
        const bookingId = req.params.id;
        const booking = await prisma_1.default.booking.findUnique({
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
        const updatedBooking = await prisma_1.default.booking.update({
            where: { id: bookingId },
            data: {
                status: "CANCELLED",
            },
        });
        res.status(200).json({
            message: "Booking cancelled successfully",
            data: updatedBooking,
        });
    }
    catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ error: "Failed to cancel booking" });
    }
};
exports.cancelBooking = cancelBooking;
const getAllBookings = async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.userId },
        });
        if (!user || user.role !== 'ADMIN') {
            res.status(403).json({ error: "Unauthorized: Admin access required" });
            return;
        }
        const bookings = await prisma_1.default.booking.findMany({
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
    }
    catch (error) {
        console.error("Error fetching all bookings:", error);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
};
exports.getAllBookings = getAllBookings;
//# sourceMappingURL=booking.controller.js.map