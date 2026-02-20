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

        const now = new Date();
        const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

        if (targetType === 'CLASS') {
            const classSession = await ClassSessionModel.findById(targetId);
            if (!classSession) {
                return next(new AppError('Class not found.', 404));
            }

            if (now < classSession.endTime) {
                return next(new AppError('You can only rate a class after it has ended.', 403));
            }

            if (now.getTime() - classSession.endTime.getTime() > FORTY_EIGHT_HOURS) {
                return next(new AppError('Ratings lock 48 hours after the class ends.', 403));
            }

            const booking = await BookingModel.findOne({
                user: userId,
                classSession: targetId,
                status: { $in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] }
            });

            if (!booking) {
                return next(new AppError('You can only rate classes you have attended.', 403));
            }
        } else if (targetType === 'INSTRUCTOR') {
            // Find any past class by this instructor that the user has attended
            const instructorClasses = await ClassSessionModel.find({
                instructor: targetId,
                endTime: { $lte: now } // Only classes that have ended
            });
            const classIds = instructorClasses.map(c => c._id);

            const attendedBookings = await BookingModel.find({
                user: userId,
                classSession: { $in: classIds },
                status: { $in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] }
            }).populate('classSession');

            if (attendedBookings.length === 0) {
                return next(new AppError('You can only rate instructors after attending one of their classes.', 403));
            }

            // Find the most recently ended class among attended
            let latestEndTime = new Date(0);
            for (const booking of attendedBookings) {
                const classSessionObj = booking.classSession as unknown as { endTime: Date };
                if (classSessionObj && classSessionObj.endTime) {
                    const classEndTime = new Date(classSessionObj.endTime);
                    if (classEndTime > latestEndTime) {
                        latestEndTime = classEndTime;
                    }
                }
            }

            if (latestEndTime.getTime() === 0) {
                return next(new AppError('No valid attended class found to rate this instructor.', 403));
            }

            if (now.getTime() - latestEndTime.getTime() > FORTY_EIGHT_HOURS) {
                return next(new AppError('Ratings lock 48 hours after your last class with this instructor ends.', 403));
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

        // Calculate distribution
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const ratingValues: number[] = [];

        for (const r of ratings) {
            if (r.rating >= 1 && r.rating <= 5) {
                distribution[r.rating as keyof typeof distribution]++;
                ratingValues.push(r.rating);
            }
        }

        // Calculate Trimmed Mean (10% from each end)
        let trimmedMean = 0;
        if (ratingValues.length > 0) {
            ratingValues.sort((a, b) => a - b);

            // Trim 10% from each end
            const trimCount = Math.floor(ratingValues.length * 0.1);
            const trimmedValues = ratingValues.slice(trimCount, ratingValues.length - trimCount);

            if (trimmedValues.length > 0) {
                trimmedMean = trimmedValues.reduce((sum, val) => sum + val, 0) / trimmedValues.length;
            } else {
                trimmedMean = ratingValues.reduce((sum, val) => sum + val, 0) / ratingValues.length;
            }
        }

        // Calculate canReview for the current user
        let canReview = false;
        const userId = req.user?._id;

        if (userId) {
            const { BookingModel, BookingStatus } = await import('../bookings/booking.model.js');
            const { ClassSessionModel } = await import('../classes/class.model.js');
            const now = new Date();
            const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

            if (targetType === 'CLASS') {
                const classSession = await ClassSessionModel.findById(targetId);
                if (classSession && now >= classSession.endTime && (now.getTime() - classSession.endTime.getTime() <= FORTY_EIGHT_HOURS)) {
                    const booking = await BookingModel.findOne({
                        user: userId,
                        classSession: targetId,
                        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] }
                    });
                    if (booking) canReview = true;
                }
            } else if (targetType === 'INSTRUCTOR') {
                const instructorClasses = await ClassSessionModel.find({
                    instructor: targetId,
                    endTime: { $lte: now }
                });
                const classIds = instructorClasses.map(c => c._id);

                const attendedBookings = await BookingModel.find({
                    user: userId,
                    classSession: { $in: classIds },
                    status: { $in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] }
                }).populate('classSession');

                if (attendedBookings.length > 0) {
                    let latestEndTime = new Date(0);
                    for (const booking of attendedBookings) {
                        const classSessionObj = booking.classSession as unknown as { endTime: Date };
                        if (classSessionObj && classSessionObj.endTime) {
                            const classEndTime = new Date(classSessionObj.endTime);
                            if (classEndTime > latestEndTime) {
                                latestEndTime = classEndTime;
                            }
                        }
                    }

                    if (latestEndTime.getTime() > 0 && (now.getTime() - latestEndTime.getTime() <= FORTY_EIGHT_HOURS)) {
                        canReview = true;
                    }
                }
            }
        }

        res.status(200).json({
            status: 'success',
            results: ratings.length,
            data: {
                ratings,
                trimmedMean: trimmedMean.toFixed(1),
                distribution,
                canReview
            },
        });
    } catch (error) {
        next(error);
    }
};
