import { Request, Response } from "express";
export interface AuthenticatedRequest extends Request {
    userId?: string;
    userRole?: Role;
}
declare enum Role {
    USER = "USER",
    ADMIN = "ADMIN"
}
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const requestOtp: (req: Request, res: Response) => Promise<void>;
export declare const verifyOtp: (req: Request, res: Response) => Promise<void>;
export declare const getCurrentUser: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export {};
