import { Request, Response } from "express";
export declare const getAllCameras: (req: Request, res: Response) => Promise<void>;
export declare const getCameraById: (req: Request, res: Response) => Promise<void>;
export declare const createCamera: (req: Request, res: Response) => Promise<void>;
export declare const updateCamera: (req: Request, res: Response) => Promise<void>;
export declare const deleteCamera: (req: Request, res: Response) => Promise<void>;
