import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { sendRegistrationEmail, sendOtpEmail } from '../services/email.service';
import { config } from '../config/auth';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
      },
    });

    await sendRegistrationEmail(email, name);

    res.status(201).json({
      staus: 'success', 
      message: 'Registration successful. Please check your email.', 
      data: { 
        id: user.id,
        name: user.name,
        email: user.email
      } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const requestOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({ error: 'Email not registered' });
      return;
    }

    const otp = generateOtp();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + config.otpExpiryMinutes);

    await prisma.user.update({
      where: { email },
      data: {
        otp,
        otpExpiry,
      },
    });

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.status(200).json({ 
      message: 'OTP sent to your email', 
      data: { 
        email,
        otpExpiry: otpExpiry.toISOString()
      } 
    });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({ error: 'Email not registered' });
      return;
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp || !user.otpExpiry || new Date() > user.otpExpiry) {
      res.status(400).json({ error: 'Invalid or expired OTP' });
      return;
    }

    // Clear OTP after successful verification
    await prisma.user.update({
      where: { email },
      data: {
        otp: null,
        otpExpiry: null,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: '1d' }
    );

    res.status(200).json({ 
      message: 'OTP verified successfully', 
      data: { 
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      } 
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

// Use AuthenticatedRequest instead of Request for protected routes
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // The user ID is set by the auth middleware
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};