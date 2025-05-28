import { Resend } from 'resend';
import { config } from '../config/auth';

const resend = new Resend(config.resendApiKey);

export const sendRegistrationEmail = async (email: string, name: string) => {
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
  } catch (error) {
    console.error('Error sending registration email:', error);
    throw error;
  }
};

export const sendOtpEmail = async (email: string, otp: string) => {
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
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};