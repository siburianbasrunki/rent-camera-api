"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.verifyOtp = exports.requestOtp = exports.register = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const email_service_1 = require("../services/email.service");
const auth_1 = require("../config/auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var Role;
(function (Role) {
    Role["USER"] = "USER";
    Role["ADMIN"] = "ADMIN";
})(Role || (Role = {}));
const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};
const register = async (req, res) => {
    try {
        const { name, email, phoneNumber } = req.body;
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(400).json({ error: "Email already registered" });
            return;
        }
        const user = await prisma_1.default.user.create({
            data: {
                name,
                email,
                phoneNumber,
                role: Role.USER,
            },
        });
        await (0, email_service_1.sendRegistrationEmail)(email, name);
        res.status(201).json({
            status: "success",
            message: "Registration successful. Please check your email.",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Registration failed" });
    }
};
exports.register = register;
const requestOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            res.status(404).json({ error: "Email not registered" });
            return;
        }
        const otp = generateOtp();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + auth_1.config.otpExpiryMinutes);
        await prisma_1.default.user.update({
            where: { email },
            data: {
                otp,
                otpExpiry,
            },
        });
        // Send OTP email
        await (0, email_service_1.sendOtpEmail)(email, otp);
        res.status(200).json({
            message: "OTP sent to your email",
            data: {
                email,
                otpExpiry: otpExpiry.toISOString(),
            },
        });
    }
    catch (error) {
        console.error("OTP request error:", error);
        res.status(500).json({ error: "Failed to send OTP" });
    }
};
exports.requestOtp = requestOtp;
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            res.status(404).json({ error: "Email not registered" });
            return;
        }
        // Check if OTP matches and is not expired
        if (user.otp !== otp || !user.otpExpiry || new Date() > user.otpExpiry) {
            res.status(400).json({ error: "Invalid or expired OTP" });
            return;
        }
        // Clear OTP after successful verification
        await prisma_1.default.user.update({
            where: { email },
            data: {
                otp: null,
                otpExpiry: null,
            },
        });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, auth_1.config.jwtSecret, { expiresIn: "1d" });
        res.status(200).json({
            message: "OTP verified successfully",
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            },
        });
    }
    catch (error) {
        console.error("OTP verification error:", error);
        res.status(500).json({ error: "Failed to verify OTP" });
    }
};
exports.verifyOtp = verifyOtp;
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.status(200).json({ data: user });
    }
    catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ error: "Failed to get user" });
    }
};
exports.getCurrentUser = getCurrentUser;
//# sourceMappingURL=auth.controller.js.map