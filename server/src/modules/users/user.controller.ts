import { Request, Response, NextFunction } from 'express';
import { UserModel as User } from './user.model';
import { ClassSessionModel } from '../classes/class.model';
import { RatingModel as Rating } from '../ratings/rating.model';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!._id).select('-password');
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, email, bio, certifications } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { fullName, email, bio, certifications },
      { new: true, runValidators: true }
    ).select('-password');
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

export const getInstructors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { specialty } = req.query;
    const filter: any = { role: 'INSTRUCTOR' };

    const instructors = await User.find(filter).select('-password');

    // Get ratings for each instructor
    const instructorsWithRatings = await Promise.all(
      instructors.map(async (instructor) => {
        const ratings = await Rating.find({
          targetType: 'INSTRUCTOR',
          targetId: instructor._id
        });
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;

        return {
          ...instructor.toObject(),
          averageRating: avgRating,
          totalRatings: ratings.length,
        };
      })
    );

    res.status(200).json({ status: 'success', data: { instructors: instructorsWithRatings } });
  } catch (error) {
    next(error);
  }
};

export const getInstructorProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instructor = await User.findById(req.params.id).select('-password');

    if (!instructor || instructor.role !== 'INSTRUCTOR') {
      return res.status(404).json({ status: 'error', message: 'Instructor not found' });
    }

    // Get upcoming classes
    const upcomingClasses = await ClassSessionModel.find({
      instructor: instructor._id,
      startTime: { $gte: new Date() },
    }).sort({ startTime: 1 }).limit(10);

    // Get ratings
    const ratings = await Rating.find({
      targetType: 'INSTRUCTOR',
      targetId: instructor._id
    }).populate('user', 'fullName').sort({ createdAt: -1 });

    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    res.status(200).json({
      status: 'success',
      data: {
        instructor: {
          ...instructor.toObject(),
          averageRating: avgRating,
          totalRatings: ratings.length,
        },
        upcomingClasses,
        ratings,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ status: 'success', data: { users } });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};