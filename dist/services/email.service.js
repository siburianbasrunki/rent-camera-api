"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPaymentSuccessEmail = exports.sendBookingConfirmationEmail = exports.sendOtpEmail = exports.sendRegistrationEmail = void 0;
const resend_1 = require("resend");
const auth_1 = require("../config/auth");
const resend = new resend_1.Resend(auth_1.config.resendApiKey);
const sendRegistrationEmail = async (email, name) => {
    try {
        await resend.emails.send({
            from: 'no-reply@rent-admin.site',
            to: email,
            subject: 'Registration Successful',
            html: `
        <h1>Welcome to Our Service, ${name}!</h1>
        <p>Your account has been successfully registered.</p>
        <p>You can now log in using your email address.</p>
      `,
        });
    }
    catch (error) {
        console.error('Error sending registration email:', error);
        throw error;
    }
};
exports.sendRegistrationEmail = sendRegistrationEmail;
const sendOtpEmail = async (email, otp) => {
    try {
        await resend.emails.send({
            from: 'no-reply@rent-admin.site',
            to: email,
            subject: 'Your OTP Code',
            html: `
        <h1>Your OTP Code</h1>
        <p>Use the following code to log in:</p>
        <h2 style="font-size: 24px; letter-spacing: 2px;">${otp}</h2>
        <p>This code will expire in 15 minutes.</p>
      `,
        });
    }
    catch (error) {
        console.error('Error sending OTP email:', error);
        throw error;
    }
};
exports.sendOtpEmail = sendOtpEmail;
const sendBookingConfirmationEmail = async (email, name, bookingDetails) => {
    try {
        await resend.emails.send({
            from: 'no-reply@rent-admin.site',
            to: email,
            subject: 'Booking Confirmation',
            html: `
        <h1>Booking Confirmation</h1>
        <p>Hello ${name},</p>
        <p>Your booking has been confirmed with the following details:</p>
        
        <table style="border-collapse: collapse; width: 100%; max-width: 600px; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Camera</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${bookingDetails.cameraName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Booking Date</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${bookingDetails.bookingDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Duration</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${bookingDetails.duration} hours</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Total Price</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${bookingDetails.totalPrice}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Payment Method</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${bookingDetails.paymentMethod}</td>
          </tr>
          ${bookingDetails.paymentCode ? `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Payment Code</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${bookingDetails.paymentCode}</td>
          </tr>
          ` : ''}
        </table>
        
        <p>Thank you for your booking!</p>
      `,
        });
    }
    catch (error) {
        console.error('Error sending booking confirmation email:', error);
        throw error;
    }
};
exports.sendBookingConfirmationEmail = sendBookingConfirmationEmail;
const sendPaymentSuccessEmail = async (email, name, bookingDetails) => {
    try {
        await resend.emails.send({
            from: 'no-reply@rent-admin.site',
            to: email,
            subject: 'Payment Successful',
            html: `
        <h1>Payment Successful</h1>
        <p>Hello ${name},</p>
        <p>Your payment for the following booking has been successfully processed:</p>
        
        <table style="border-collapse: collapse; width: 100%; max-width: 600px; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Camera</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${bookingDetails.cameraName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Booking Date</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${bookingDetails.bookingDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Total Paid</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${bookingDetails.totalPrice}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Payment Method</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${bookingDetails.paymentMethod}</td>
          </tr>
        </table>
        
        <p>Thank you for your payment!</p>
      `,
        });
    }
    catch (error) {
        console.error('Error sending payment success email:', error);
        throw error;
    }
};
exports.sendPaymentSuccessEmail = sendPaymentSuccessEmail;
//# sourceMappingURL=email.service.js.map