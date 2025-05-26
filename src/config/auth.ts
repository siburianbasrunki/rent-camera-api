export const config = {
  resendApiKey: process.env.RESEND_API_KEY,
  jwtSecret: process.env.JWT_SECRET ,
  otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '15'),
};