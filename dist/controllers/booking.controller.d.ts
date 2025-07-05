import { Response } from "express";
import { AuthenticatedRequest } from "./user.controller";
export declare const createBooking: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getBookingById: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getUserBookings: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const checkBookingPayment: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const cancelBooking: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getAllBookings: (req: AuthenticatedRequest, res: Response) => Promise<void>;
