import express from 'express';
import { register, requestOtp, verifyOtp, getCurrentUser } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login/request-otp', requestOtp);
router.post('/login/verify-otp', verifyOtp);
router.get('/me', authenticate, getCurrentUser);

export default router;