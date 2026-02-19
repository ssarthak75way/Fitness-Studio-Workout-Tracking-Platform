import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Request } from 'express';
import { AppError } from '../utils/AppError';

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dt7owuhss',
    api_key: '237275669714973',
    api_secret: 'FDrXRUZn_Bfa74xRcByWp7rY3Qw'
});

// Configure Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'fitness-studio/profiles',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    } as any // Type assertion needed for some multer-storage-cloudinary versions
});

// File Filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400) as unknown as null, false);
    }
};

export const uploadProfile = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});
