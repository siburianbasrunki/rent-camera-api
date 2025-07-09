"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndSendBookingReminders = exports.getNewestBookings = exports.getAllBookings = exports.cancelBooking = exports.checkBookingPayment = exports.getUserBookings = exports.getBookingById = exports.processReturn = exports.createBooking = void 0;
const prisma_1 = __importStar(require("../lib/prisma"));
const email_service_1 = require("../services/email.service");
const midtrans_1 = require("../config/midtrans");
const cloudinaryUpload_1 = require("../utils/cloudinaryUpload");
const createBooking = async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const userId = req.userId;
        const { cameraId, startDate, endDate, purpose, paymentMethod } = req.body;
        const identityFile = req.file;
        // Validate input
        if (!cameraId || !startDate || !endDate || !purpose || !paymentMethod) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }
        // Check if camera is available
        const camera = await prisma_1.default.camera.findUnique({
            where: { id: cameraId },
        });
        if (!camera) {
            res.status(404).json({ error: "Camera not found" });
            return;
        }
        if (!camera.avaliable) {
            res.status(400).json({ error: "Camera is not available for booking" });
            return;
        }
        // Validate identity file
        if (!identityFile) {
            res.status(400).json({ error: "Identity proof is required" });
            return;
        }
        // Upload identity proof
        const identityProof = await (0, cloudinaryUpload_1.uploadToCloudinary)(identityFile.path, {
            folder: "identity-proofs",
        });
        // Calculate duration and total price
        const start = new Date(startDate);
        const end = new Date(endDate);
        const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const pricePerDay = parseFloat(camera.price);
        const totalPrice = pricePerDay * duration;
        // Create booking
        const booking = await prisma_1.default.booking.create({
            data: {
                userId,
                cameraId,
                startDate: start,
                endDate: end,
                duration,
                purpose,
                totalPrice,
                identityProofUrl: identityProof.imageUrl,
                identityProofId: identityProof.imageId,
            },
            include: {
                user: true,
                camera: true,
            },
        });
        await prisma_1.default.camera.update({
            where: { id: cameraId },
            data: { avaliable: false },
        });
        // Generate order ID
        const orderId = `BK-${booking.id.slice(0, 8)}-${Date.now()}`;
        // Create payment based on payment method
        let paymentResponse;
        const items = [
            {
                id: camera.id,
                price: pricePerDay,
                quantity: duration,
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
            bookingDate: `${booking.startDate.toLocaleDateString()} - ${booking.endDate.toLocaleDateString()}`,
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
const processReturn = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const returnFile = req.file;
        if (!returnFile) {
            res.status(400).json({ error: "Return proof is required" });
            return;
        }
        // Get booking details
        const booking = await prisma_1.default.booking.findUnique({
            where: { id: bookingId },
            include: {
                camera: true,
                user: true,
            },
        });
        if (!booking) {
            res.status(404).json({ error: "Booking not found" });
            return;
        }
        if (booking.status !== "PAID" && booking.status !== "IN_USE") {
            res.status(400).json({ error: "Booking is not in a returnable state" });
            return;
        }
        // Upload return proof
        const returnProof = await (0, cloudinaryUpload_1.uploadToCloudinary)(returnFile.path, {
            folder: "return-proofs",
        });
        // Update booking and camera status
        const updatedBooking = await prisma_1.default.booking.update({
            where: { id: bookingId },
            data: {
                status: "COMPLETED",
                returnProofUrl: returnProof.imageUrl,
                returnProofId: returnProof.imageId,
                returnDate: new Date(),
            },
        });
        // Mark camera as available again
        await prisma_1.default.camera.update({
            where: { id: booking.cameraId },
            data: { avaliable: true },
        });
        // Send confirmation email
        await (0, email_service_1.sendReturnConfirmationEmail)(booking.user.email, booking.user.name, {
            cameraName: booking.camera.name,
            startDate: booking.startDate.toISOString(),
            endDate: booking.endDate.toISOString(),
            returnDate: new Date().toISOString(),
        });
        res.status(200).json({
            message: "Return processed successfully",
            data: updatedBooking,
        });
    }
    catch (error) {
        console.error("Error processing return:", error);
        res.status(500).json({ error: "Failed to process return" });
    }
};
exports.processReturn = processReturn;
const getBookingById = async (req, res) => {
    try {
        const userId = req.userId;
        const bookingId = req.params.id;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        const booking = await prisma_1.default.booking.findUnique({
            where: { id: bookingId },
            include: {
                camera: true,
                payment: true,
                user: true,
            },
        });
        if (!booking) {
            res.status(404).json({ error: "Booking not found" });
            return;
        }
        if ((user === null || user === void 0 ? void 0 : user.role) !== "ADMIN" && booking.userId !== userId) {
            res.status(403).json({ error: "Unauthorized" });
            return;
        }
        const response = Object.assign(Object.assign({}, booking), { isReturned: booking.status === 'COMPLETED', hasReturnProof: !!booking.returnProofUrl });
        res.status(200).json({ data: response });
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
                case "pending":
                    return "PENDING";
                case "settlement":
                    return "SETTLED";
                case "expire":
                    return "EXPIRED";
                case "deny":
                case "cancel":
                    return "FAILED";
                default:
                    return "PENDING";
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
            if (mappedStatus === "SETTLED") {
                await prisma_1.default.booking.update({
                    where: { id: booking.id },
                    data: {
                        status: "PAID",
                    },
                });
                // Send payment success email
                await (0, email_service_1.sendPaymentSuccessEmail)(booking.user.email, booking.user.name, {
                    cameraName: booking.camera.name,
                    bookingDate: booking.startDate.toISOString(),
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
        if (error.message.includes("Transaction not found")) {
            res
                .status(404)
                .json({ error: "Transaction not found in payment gateway" });
        }
        else {
            res.status(500).json({
                error: "Failed to check payment status",
                details: error.message,
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
        if (!user || user.role !== "ADMIN") {
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
const getNewestBookings = async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.userId },
        });
        if (!user || user.role !== "ADMIN") {
            res.status(403).json({ error: "Unauthorized: Admin access required" });
            return;
        }
        const bookings = await prisma_1.BookingClient.findMany({
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
    }
    catch (error) {
        console.error("Error fetching latest bookings:", error);
        res.status(500).json({ error: "Failed to fetch latest bookings" });
    }
};
exports.getNewestBookings = getNewestBookings;
const checkAndSendBookingReminders = async () => {
    try {
        const now = new Date();
        const reminderTime = new Date(now.getTime() + 5 * 60 * 60 * 1000); // 5 hours from now
        const bookingsToRemind = await prisma_1.default.booking.findMany({
            where: {
                endDate: {
                    lte: reminderTime, // End date is within next 5 hours
                    gte: now, // But hasn't passed yet
                },
                status: {
                    in: ['PAID', 'IN_USE'], // Only active bookings
                },
                reminderSent: false, // Only if reminder hasn't been sent
            },
            include: {
                user: true,
                camera: true,
            },
        });
        for (const booking of bookingsToRemind) {
            try {
                await (0, email_service_1.sendBookingReminderEmail)(booking.user.email, booking.user.name, {
                    cameraName: booking.camera.name,
                    endDate: booking.endDate.toISOString(),
                });
                // Mark reminder as sent
                await prisma_1.default.booking.update({
                    where: { id: booking.id },
                    data: { reminderSent: true },
                });
            }
            catch (error) {
                console.error(`Failed to send reminder for booking ${booking.id}:`, error);
            }
        }
    }
    catch (error) {
        console.error('Error in booking reminder job:', error);
    }
};
exports.checkAndSendBookingReminders = checkAndSendBookingReminders;
//# sourceMappingURL=booking.controller.js.map