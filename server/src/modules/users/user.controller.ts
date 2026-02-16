import { Request, Response, NextFunction } from 'express';
import { UserModel as User } from './user.model';
import { ClassSessionModel } from '../classes/class.model';
import { RatingModel as Rating } from '../ratings/rating.model';
import { AuthService } from '../auth/auth.service';
import { updatePasswordSchema } from '../auth/auth.schema';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!._id).select('-passwordHash');
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
    ).select('-passwordHash');
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

export const getInstructors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { specialty } = req.query;
    const filter: { role: string; specialty?: string } = { role: 'INSTRUCTOR' };

    if (specialty) filter.specialty = specialty as string;

    const instructors = await User.find(filter).select('-passwordHash');


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
    const instructor = await User.findById(req.params.id).select('-passwordHash');

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
    const users = await User.find().select('-passwordHash');
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

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = updatePasswordSchema.safeParse(req);
    if (!result.success) return next(result.error);

    await AuthService.updatePassword(req.user!._id.toString(), result.data.body);

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully!'
    });
  } catch (error) {
    next(error);
  }
};