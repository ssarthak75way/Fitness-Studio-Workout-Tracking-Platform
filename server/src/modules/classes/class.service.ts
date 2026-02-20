import mongoose from 'mongoose';
import { ClassSessionModel, IClassSession } from './class.model';
import { CreateClassInput } from './class.schema';
import { addMinutes, addDays, addWeeks, parseISO } from 'date-fns'; // Recommended for date math
import { AppError } from '../../utils/AppError';

// We use a class or object to group service methods
export const ClassService = {
  createClass: async (input: CreateClassInput): Promise<IClassSession> => {
    const startTime = parseISO(input.startTime);
    const endTime = addMinutes(startTime, input.durationMinutes);

    // 1. CONFLICT CHECK: Look for overlapping classes for this instructor
    if (input.instructorId) {
      const conflict = await ClassSessionModel.findOne({
        instructor: input.instructorId,
        isCancelled: false,
        $or: [
          { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
        ],
      });

      if (conflict) {
        throw new AppError(
          `Instructor is already booked from ${conflict.startTime.toLocaleTimeString()} to ${conflict.endTime.toLocaleTimeString()}`,
          409
        );
      }
    }

    // 2. LOCATION & STUDIO CONFLICT CHECK
    if (input.location) {
      const locationConflict = await ClassSessionModel.findOne({
        studio: input.studioId,
        location: input.location,
        isCancelled: false,
        $or: [
          { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
        ],
      });

      if (locationConflict) {
        throw new AppError(
          `Location ${input.location} in this studio is already booked for "${locationConflict.title}"`,
          409
        );
      }
    }

    // 2. Prepare base data object
    const classData = {
      title: input.title,
      description: input.description,
      type: input.type,
      instructor: input.instructorId ? new mongoose.Types.ObjectId(input.instructorId) : undefined,
      studio: new mongoose.Types.ObjectId(input.studioId),
      startTime: startTime,
      endTime: endTime,
      capacity: input.capacity,
      location: input.location,
    };

    // 3. Handle Recurrence
    if (input.isRecurring && input.recurrenceFrequency && input.recurrenceCount) {
      const sessions = [];
      for (let i = 0; i < input.recurrenceCount; i++) {
        let currentStartTime, currentEndTime;

        if (input.recurrenceFrequency === 'DAILY') {
          currentStartTime = addDays(startTime, i);
          currentEndTime = addDays(endTime, i);
        } else {
          currentStartTime = addWeeks(startTime, i);
          currentEndTime = addWeeks(endTime, i);
        }

        sessions.push({
          ...classData,
          startTime: currentStartTime,
          endTime: currentEndTime,
          recurrenceRule: `RRULE:FREQ=${input.recurrenceFrequency};COUNT=${input.recurrenceCount}`
        });
      }

      const createdSessions = await ClassSessionModel.insertMany(sessions);
      return createdSessions[0] as unknown as IClassSession; // Return the first one
    }

    // 4. Save Single Session to DB
    const newClass = await ClassSessionModel.create(classData);
    return newClass;
  },

  //Cancel a class and notify participants
  cancelClass: async (classId: string): Promise<IClassSession> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const classSession = await ClassSessionModel.findById(classId).session(session);
      if (!classSession) {
        throw new AppError('Class not found', 404);
      }

      if (classSession.isCancelled) {
        throw new AppError('Class is already cancelled', 400);
      }

      const originalInstructor = classSession.instructor;

      // 1. Mark as cancelled
      classSession.isCancelled = true;
      await classSession.save({ session });

      // 2. Find all bookings (Confirmed/Waitlisted)
      const { BookingModel, BookingStatus } = await import('../bookings/booking.model.js');
      const { NotificationService } = await import('../notifications/notification.service.js');

      const bookings = await BookingModel.find({
        classSession: classId,
        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.WAITLISTED] }
      }).session(session);

      const userIds = bookings.map(b => b.user.toString());

      if (userIds.length > 0) {
        // 3. Notify Users
        await NotificationService.sendBulkNotification(
          userIds,
          'CLASS_CANCELLED',
          `Attention: Your class "${classSession.title}" on ${classSession.startTime.toLocaleDateString()} has been cancelled.`,
          classId
        );
      }

      // 4. AUTO-COVER LOGIC
      if (originalInstructor) {
        // Find "Gaps" (instructor: null) that this instructor could now cover
        const gap = await ClassSessionModel.findOne({
          instructor: { $exists: false },
          isCancelled: false,
          startTime: { $gte: classSession.startTime },
          endTime: { $lte: classSession.endTime },
        }).session(session);

        if (gap) {
          // Found a gap! Suggest or auto-assign?
          // The prompt says "check whether they can auto-cover a gap at another"
          // We will assign them and notify them.
          gap.instructor = originalInstructor;
          await gap.save({ session });

          await NotificationService.createNotification(
            originalInstructor.toString(),
            'PROMOTION', // Using existing type for now or could add a new one
            `Auto-Cover Alert: Since your class "${classSession.title}" was cancelled, you have been automatically assigned to cover "${gap.title}" at a different studio.`
          );
        }
      }

      await session.commitTransaction();
      return classSession;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  //Get classes within a date range (for Calendar)
  getClassesByDateRange: async (start: Date, end: Date): Promise<IClassSession[]> => {
    return ClassSessionModel.find({
      startTime: { $gte: start, $lte: end },
    })
      .populate('instructor', 'fullName profileImage')
      .populate('studio', 'name address')
      .sort({ startTime: 1 });
  },
};