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

export const sendBookingConfirmationEmail = async (
  email: string,
  name: string,
  bookingDetails: {
    cameraName: string;
    bookingDate: string;
    duration: string;
    totalPrice: string;
    paymentCode?: string;
    paymentMethod: string;
  }
) => {
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
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    throw error;
  }
};

export const sendPaymentSuccessEmail = async (
  email: string,
  name: string,
  bookingDetails: {
    cameraName: string;
    bookingDate: string;
    totalPrice: string;
    paymentMethod: string;
  }
) => {
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
  } catch (error) {
    console.error('Error sending payment success email:', error);
    throw error;
  }
};

export const sendReturnConfirmationEmail = async (
  email: string,
  name: string,
  returnDetails: {
    cameraName: string;
    startDate: string;
    endDate: string;
    returnDate: string;
  }
) => {
  try {
    await resend.emails.send({
      from: 'no-reply@rent-admin.site',
      to: email,
      subject: 'Return Confirmation',
      html: `
        <h1>Return Confirmation</h1>
        <p>Hello ${name},</p>
        <p>Thank you for returning the camera. Here are the details of your rental:</p>
        
        <table style="border-collapse: collapse; width: 100%; max-width: 600px; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Camera</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${returnDetails.cameraName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Rental Period</td>
            <td style="padding: 8px; border: 1px solid #ddd;">
              ${new Date(returnDetails.startDate).toLocaleDateString()} - 
              ${new Date(returnDetails.endDate).toLocaleDateString()}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Return Date</td>
            <td style="padding: 8px; border: 1px solid #ddd;">
              ${new Date(returnDetails.returnDate).toLocaleDateString()}
            </td>
          </tr>
        </table>
        
        <p>We hope you had a great experience with our service!</p>
        <p>If you have any feedback about your rental experience, please don't hesitate to reach out.</p>
      `,
    });
  } catch (error) {
    console.error('Error sending return confirmation email:', error);
    throw error;
  }
};