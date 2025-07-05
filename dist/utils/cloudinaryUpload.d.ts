type UploadOptions = {
    folder: string;
    format?: 'webp' | 'jpg' | 'png';
    transformation?: Array<Record<string, any>>;
};
type UploadResult = {
    imageUrl: string;
    imageId: string;
};
export declare const uploadToCloudinary: (filePath: string, options: UploadOptions) => Promise<UploadResult>;
export declare const deleteFromCloudinary: (imageId: string) => Promise<void>;
export {};
