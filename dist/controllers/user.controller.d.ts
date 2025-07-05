import { Request, Response } from "express";
export interface AuthenticatedRequest extends Request {
    userId?: string;
    userRole?: Role;
}
declare enum Role {
    USER = "USER",
    ADMIN = "ADMIN"
}
export declare const getAllUsers: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getUserById: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateUser: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteUser: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export {};
