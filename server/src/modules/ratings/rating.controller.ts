import { Request, Response, NextFunction } from 'express';
import { RatingModel } from './rating.model.js';
import { AppError } from '../../utils/AppError.js';

export const submitRatingHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { targetType, targetId, rating, review } = req.body;
        const userId = req.user?._id;

        // 1. Validation: Ensure user has booked the class/attended instructor's class
        const { BookingModel, BookingStatus } = await import('../bookings/booking.model.js');
        const { ClassSessionModel } = await import('../classes/class.model.js');

        if (targetType === 'CLASS') {
            const booking = await BookingModel.findOne({
                user: userId,
                classSession: targetId,
                status: BookingStatus.CONFIRMED
            });

            if (!booking) {
                return next(new AppError('You can only rate classes you have booked.', 403));
            }
        } else if (targetType === 'INSTRUCTOR') {
            // Find any class by this instructor that the user has booked
            const instructorClasses = await ClassSessionModel.find({ instructor: targetId });
            const classIds = instructorClasses.map(c => c._id);

            const hasAttended = await BookingModel.findOne({
                user: userId,
                classSession: { $in: classIds },
                status: BookingStatus.CONFIRMED
            });

            if (!hasAttended) {
                return next(new AppError('You can only rate instructors after attending one of their classes.', 403));
            }
        }

        const existingRating = await RatingModel.findOne({
            user: userId,
            targetType,
            targetId,
        });

        if (existingRating) {
            existingRating.rating = rating;
            existingRating.review = review;
            await existingRating.save();

            return res.status(200).json({
                status: 'success',
                data: { rating: existingRating },
            });
        }

        const newRating = await RatingModel.create({
            user: userId,
            targetType,
            targetId,
            rating,
            review,
        });

        res.status(201).json({
            status: 'success',
            data: { rating: newRating },
        });
    } catch (error) {
        next(error);
    }
};

export const getRatingsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { targetType, targetId } = req.query;

        const ratings = await RatingModel.find({ targetType, targetId })
            .populate('user', 'fullName profileImage')
            .sort({ createdAt: -1 });

        const avgRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;

        res.status(200).json({
            status: 'success',
            results: ratings.length,
            data: {
                ratings,
                averageRating: avgRating.toFixed(1),
            },
        });
    } catch (error) {
        next(error);
    }
};
