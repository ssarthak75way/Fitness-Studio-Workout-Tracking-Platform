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

    // 1. INSTRUCTOR CERTIFICATION CHECK
    if (input.instructorId) {
      const { UserModel } = await import('../users/user.model.js');
      const instructor = await UserModel.findById(input.instructorId);
      if (instructor && instructor.certifications) {
        const hasValidCert = instructor.certifications.some((c: { name: string; expiryDate: Date }) => c.expiryDate >= startTime);
        if (!hasValidCert && instructor.certifications.length > 0) {
          throw new AppError('Instructor certifications have expired. They cannot be scheduled until renewed.', 403);
        }
      }
    }

    // 2. CONFLICT CHECK: Look for overlapping classes for this instructor
    if (input.instructorId) {
      const conflict = await ClassSessionModel.findOne({
        instructor: input.instructorId,
        isCancelled: false,
        $or: [
          { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
        ],
      }).populate('studio', 'name');

      if (conflict) {
        const conflictStudio = conflict.studio as unknown as { _id: unknown; name?: string; toString(): string };
        const isCrossStudio = conflictStudio.toString() !== input.studioId;

        throw new AppError(
          `Instructor is already booked for "${conflict.title}" from ${conflict.startTime.toLocaleTimeString()} to ${conflict.endTime.toLocaleTimeString()}${isCrossStudio ? ` at ${conflictStudio.name ?? ''}` : ''}`,
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

  // Cancel a class or allow instructor to withdraw
  cancelClass: async (classId: string, instructorId?: string): Promise<IClassSession> => {


    try {
      const classSession = await ClassSessionModel.findById(classId);
      if (!classSession) {
        throw new AppError('Class not found', 404);
      }

      if (classSession.isCancelled) {
        throw new AppError('Class is already cancelled', 400);
      }

      const { BookingModel, BookingStatus } = await import('../bookings/booking.model.js');
      const { NotificationService } = await import('../notifications/notification.service.js');
      const { UserModel, UserRole } = await import('../users/user.model.js');

      // MODE A: INSTRUCTOR WITHDRAWAL (Relinquish but session stays active as a Gap)
      if (instructorId && classSession.instructor?.toString() === instructorId.toString()) {
        classSession.instructor = undefined;
        await classSession.save();

        // Notify potential covers: Find all instructors NOT booked during this time
        const availableInstructors = await UserModel.find({
          role: UserRole.INSTRUCTOR,
          isActive: true
        });

        const freeInstructorIds: string[] = [];
        for (const inst of availableInstructors) {
          const conflict = await ClassSessionModel.findOne({
            instructor: inst._id,
            isCancelled: false,
            $or: [
              { startTime: { $lt: classSession.endTime }, endTime: { $gt: classSession.startTime } }
            ]
          });

          if (!conflict) freeInstructorIds.push(inst._id.toString());
        }

        if (freeInstructorIds.length > 0) {
          await NotificationService.sendBulkNotification(
            freeInstructorIds,
            'WAITLIST_NOTIFICATION', // Use appropriate type or generic
            `URGENT: An instructor has withdrawn from "${classSession.title}". The session at ${classSession.startTime.toLocaleTimeString()} is now an open GAP needing coverage.`,
            classId
          );
        }
      }
      // MODE B: FULL CANCELLATION (Admin action)
      else {
        classSession.isCancelled = true;
        await classSession.save();

        // Notify participants
        const bookings = await BookingModel.find({
          classSession: classId,
          status: { $in: [BookingStatus.CONFIRMED, BookingStatus.WAITLISTED] }
        });

        const userIds = bookings.map(b => b.user.toString());
        if (userIds.length > 0) {
          await NotificationService.sendBulkNotification(
            userIds,
            'CLASS_CANCELLED',
            `Attention: Your class "${classSession.title}" on ${classSession.startTime.toLocaleDateString()} has been cancelled.`,
            classId
          );
        }
      }


      return classSession;
    } catch (error) {
      throw error;
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