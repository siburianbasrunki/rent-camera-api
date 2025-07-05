import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    userId?: string;
}
export declare const authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
