"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    resendApiKey: process.env.RESEND_API_KEY,
    jwtSecret: process.env.JWT_SECRET,
    otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '15'),
};
//# sourceMappingURL=auth.js.map