import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../users/user.model.js';
import { AppError } from '../../utils/AppError.js';

export const addBodyMetricsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { weight, height, bodyFatPercentage, measurements } = req.body;

    const user = await UserModel.findById(req.user?._id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.metrics = user.metrics || [];
    user.metrics.push({
      weight,
      height,
      bodyFatPercentage,
      measurements,
      updatedAt: new Date(),
    } as any);

    await user.save();

    res.status(201).json({
      status: 'success',
      data: { metrics: user.metrics },
    });
  } catch (error) {
    next(error);
  }
};

export const getBodyMetricsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserModel.findById(req.user?._id).select('metrics');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { metrics: user.metrics || [] },
    });
  } catch (error) {
    next(error);
  }
};