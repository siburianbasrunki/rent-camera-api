import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { sendRegistrationEmail, sendOtpEmail } from '../services/email.service';
import { config } from '../config/auth';
import jwt from 'jsonwebtoken';
// import { v4 as uuidv4 } from 'uuid';

const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
      },
    });

    // Send registration email
    await sendRegistrationEmail(email, name);

    res.status(201).json({ 
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

export const requestOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'Email not registered' });
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

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'Email not registered' });
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp || !user.otpExpiry || new Date() > user.otpExpiry) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
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

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // The user ID is set by the auth middleware
    const userId = req.user.id;

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
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};