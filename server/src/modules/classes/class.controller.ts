import { Request, Response, NextFunction } from 'express';
import { FilterQuery, Types } from 'mongoose';
import { ClassSessionModel, IClassSession, ClassType } from './class.model.js';
import { ClassService } from './class.service.js';
import { createClassSchema } from './class.schema.js';
import { AppError } from '../../utils/AppError.js';

export const createClassHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = createClassSchema.safeParse(req);
    if (!result.success) return next(result.error);

    const classSession = await ClassService.createClass(result.data.body);

    res.status(201).json({
      status: 'success',
      data: { class: classSession },
    });
  } catch (error) {
    next(error);
  }
};

export const getClassesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, type, instructor } = req.query;

    const filter: FilterQuery<IClassSession> = {};

    if (startDate && endDate) {
      filter.startTime = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    if (type) filter.type = type as ClassType;
    if (instructor) filter.instructor = new Types.ObjectId(instructor as string);

    const classes = await ClassSessionModel.find(filter)
      .populate('instructor', 'fullName profileImage specialties')
      .sort({ startTime: 1 });

    res.status(200).json({
      status: 'success',
      results: classes.length,
      data: { classes },
    });
  } catch (error) {
    next(error);
  }
};

export const getClassByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const classSession = await ClassSessionModel.findById(req.params.id)
      .populate('instructor', 'fullName profileImage specialties bio');

    if (!classSession) {
      return next(new AppError('Class not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { class: classSession },
    });
  } catch (error) {
    next(error);
  }
};

export const updateClassHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const classSession = await ClassSessionModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('instructor', 'fullName profileImage');

    if (!classSession) {
      return next(new AppError('Class not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { class: classSession },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteClassHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const classSession = await ClassSessionModel.findByIdAndDelete(req.params.id);

    if (!classSession) {
      return next(new AppError('Class not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelClassHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const classSession = await ClassService.cancelClass(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { class: classSession },
    });
  } catch (error) {
    next(error);
  }
};