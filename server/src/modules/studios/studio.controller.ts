import { Request, Response, NextFunction } from 'express';
import { StudioModel } from './studio.model.js';
import { AppError } from '../../utils/AppError.js';

export const createStudioHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const studio = await StudioModel.create(req.body);
        res.status(201).json({
            status: 'success',
            data: { studio },
        });
    } catch (error) {
        next(error);
    }
};

export const getAllStudiosHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const studios = await StudioModel.find({ isActive: true });
        res.status(200).json({
            status: 'success',
            results: studios.length,
            data: { studios },
        });
    } catch (error) {
        next(error);
    }
};

export const getStudioByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const studio = await StudioModel.findById(req.params.id);
        if (!studio) {
            return next(new AppError('Studio not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: { studio },
        });
    } catch (error) {
        next(error);
    }
};

export const updateStudioHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const studio = await StudioModel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!studio) {
            return next(new AppError('Studio not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: { studio },
        });
    } catch (error) {
        next(error);
    }
};

export const deleteStudioHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const studio = await StudioModel.findByIdAndUpdate(req.params.id, { isActive: false });
        if (!studio) {
            return next(new AppError('Studio not found', 404));
        }
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};
