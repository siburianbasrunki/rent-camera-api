import { User } from 'generated/prisma';
import { Multer } from 'multer';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      file?: Multer.File;
      userId?: string; 
    }
  }
}