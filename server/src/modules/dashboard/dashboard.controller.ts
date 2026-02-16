import { Request, Response, NextFunction } from 'express';
import { BookingModel, BookingStatus } from '../bookings/booking.model.js';
import { WorkoutLogModel } from '../workouts/workout.model.js';
import { ClassSessionModel } from '../classes/class.model.js';
import { UserModel, UserRole } from '../users/user.model.js';
import { RatingModel } from '../ratings/rating.model.js';

export const getDashboardStatsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;

    let stats: any = {};

    if (userRole === UserRole.MEMBER) {
      // Member Dashboard Stats
      const upcomingBookings = await BookingModel.find({
        user: userId,
        status: BookingStatus.CONFIRMED,
      })
        .populate('classSession', 'title startTime')
        .sort({ 'classSession.startTime': 1 })
        .limit(5);

      const recentWorkouts = await WorkoutLogModel.find({ user: userId })
        .sort({ date: -1 })
        .limit(5);

      const totalWorkouts = await WorkoutLogModel.countDocuments({ user: userId });

      // Calculate streak
      const workouts = await WorkoutLogModel.find({ user: userId })
        .sort({ date: -1 })
        .select('date');

      let streak = 0;
      if (workouts.length > 0) {
        streak = 1;
        for (let i = 1; i < workouts.length; i++) {
          const current = new Date(workouts[i - 1].date);
          const previous = new Date(workouts[i].date);
          current.setHours(0, 0, 0, 0);
          previous.setHours(0, 0, 0, 0);
          const diff = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
          if (diff === 1) streak++;
          else if (diff > 1) break;
        }
      }

      stats = {
        upcomingBookings,
        recentWorkouts,
        totalWorkouts,
        workoutStreak: streak,
      };
    } else if (userRole === UserRole.INSTRUCTOR) {
      // Instructor Dashboard Stats
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const todaysClasses = await ClassSessionModel.find({
        instructor: userId,
        startTime: { $gte: todayStart, $lte: todayEnd },
      });

      const totalClasses = await ClassSessionModel.countDocuments({ instructor: userId });

      const ratings = await RatingModel.find({
        targetType: 'INSTRUCTOR',
        targetId: userId,
      });

      const avgRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

      stats = {
        todaysClasses,
        totalClasses,
        averageRating: avgRating.toFixed(1),
        totalRatings: ratings.length,
      };
    } else if (userRole === UserRole.ADMIN) {
      // Admin Dashboard Stats
      const totalUsers = await UserModel.countDocuments({ isActive: true });
      const totalMembers = await UserModel.countDocuments({ role: UserRole.MEMBER, isActive: true });
      const totalInstructors = await UserModel.countDocuments({ role: UserRole.INSTRUCTOR, isActive: true });
      const totalClasses = await ClassSessionModel.countDocuments();
      const totalBookings = await BookingModel.countDocuments({ status: BookingStatus.CONFIRMED });

      stats = {
        totalUsers,
        totalMembers,
        totalInstructors,
        totalClasses,
        totalBookings,
      };
    }

    res.status(200).json({
      status: 'success',
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};