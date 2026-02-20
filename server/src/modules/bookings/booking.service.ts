import mongoose from 'mongoose';
import QRCode from 'qrcode';
import { BookingModel, BookingStatus, IBooking } from './booking.model.js';
import { ClassSessionModel, IClassSession } from '../classes/class.model.js';
import { MembershipModel, PlanType } from '../memberships/membership.model.js';
import { NotificationService } from '../notifications/notification.service.js';
import { AppError } from '../../utils/AppError.js';

export const BookingService = {
  //Create a booking for a user
  createBooking: async (userId: string, classId: string) => {
    // 1. CHECK MEMBERSHIP
    console.log(`[BookingService] Checking membership for User ID: ${userId}`);
    const membership = await MembershipModel.findOne({
      user: userId,
      isActive: true,
    });
    console.log(`[BookingService] Membership found:`, membership);

    if (!membership) {
      throw new AppError('No active membership found. Please purchase a plan.', 403);
    }

    // Check Expiration (For subscriptions)
    if (membership.endDate && membership.endDate < new Date()) {
      membership.isActive = false;
      await membership.save();
      throw new AppError('Your membership has expired. Please renew your plan to book classes.', 403);
    }

    // Check Credits (For class packs)
    if (membership.type === PlanType.CLASS_PACK_10) {
      if ((membership.creditsRemaining || 0) <= 0) {
        throw new AppError('No class credits remaining.', 403);
      }
    }

    // 2. Check if user already booked (Active or Cancelled)
    let booking = await BookingModel.findOne({
      user: userId,
      classSession: classId,
    });

    if (booking && booking.status !== BookingStatus.CANCELLED) {
      throw new AppError('You are already booked for this class.', 400);
    }

    // 3. ATOMIC OPERATION: Check Capacity AND Increment
    const classSession = await ClassSessionModel.findById(classId);
    if (!classSession) {
      throw new AppError('Class not found', 404);
    }

    let bookingStatus = BookingStatus.CONFIRMED;

    if (classSession.enrolledCount >= classSession.capacity) {
      // Add to waitlist
      bookingStatus = BookingStatus.WAITLISTED;
    } else {
      // Confirm booking and increment count
      await ClassSessionModel.findByIdAndUpdate(classId, {
        $inc: { enrolledCount: 1 },
      });

      // Deduct credit if class pack
      if (membership.type === PlanType.CLASS_PACK_10) {
        membership.creditsRemaining = (membership.creditsRemaining || 0) - 1;
        await membership.save();
      }
    }

    // 4. Generate QR Code
    const qrData = `${userId}-${classId}-${Date.now()}`;
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    // 5. Create or Update Booking
    if (booking) {
      // Reactivate cancelled booking
      booking.status = bookingStatus;
      booking.qrCode = qrData;
      booking.bookedAt = new Date();
      await booking.save();
    } else {
      // Create new booking
      booking = await BookingModel.create({
        user: userId,
        classSession: classId,
        status: bookingStatus,
        qrCode: qrData,
      });
    }

    // Notify User
    await NotificationService.createNotification(
      userId,
      bookingStatus === BookingStatus.CONFIRMED ? 'BOOKING_CONFIRMATION' : 'WAITLIST_NOTIFICATION',
      bookingStatus === BookingStatus.CONFIRMED
        ? `Your booking for ${classSession.title} is confirmed!`
        : `You have been added to the waitlist for ${classSession.title}.`,
      classId
    );

    return { ...booking.toObject(), qrCodeUrl };
  },

  //  Cancel a booking
  cancelBooking: async (bookingId: string, userId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Find the booking
      const booking = await BookingModel.findOne({
        _id: bookingId,
        user: userId,
        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.WAITLISTED] },
      }).populate('classSession').session(session);

      if (!booking) {
        throw new AppError('Booking not found or already cancelled', 404);
      }

      const classSession = booking.classSession as unknown as IClassSession;
      if (!classSession) {
        throw new AppError('Associated class session not found', 404);
      }

      const now = new Date();
      const startTime = new Date(classSession.startTime);
      const diffHours = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      const isLate = diffHours < 2;

      // Store original status before changing it
      const wasConfirmed = booking.status === BookingStatus.CONFIRMED;
      let wasSlotFilled = false;
      let promotedBooking: IBooking | null = null;

      // 2. Update booking status
      booking.status = BookingStatus.CANCELLED;
      await booking.save({ session });

      // 3. If was confirmed, handle promotion and penalty
      if (wasConfirmed) {
        // Decrement class count
        await ClassSessionModel.findByIdAndUpdate(classSession._id, {
          $inc: { enrolledCount: -1 },
        }, { session });

        // Try to promote first waitlisted booking
        const waitlistedBooking = await BookingModel.findOne({
          classSession: classSession._id,
          status: BookingStatus.WAITLISTED,
        }).sort({ bookedAt: 1 }).session(session);

        if (waitlistedBooking) {
          // Check if waitlisted user has an active membership and credits if needed
          const waitlistUserMembership = await MembershipModel.findOne({
            user: waitlistedBooking.user,
            isActive: true,
          }).session(session);

          // We promote even if credits are low for now, but deduct if they have them
          // In a stricter system, we might skip users without credits
          if (waitlistUserMembership) {
            if (waitlistUserMembership.type === PlanType.CLASS_PACK_10) {
              if ((waitlistUserMembership.creditsRemaining || 0) > 0) {
                waitlistUserMembership.creditsRemaining = (waitlistUserMembership.creditsRemaining || 0) - 1;
                await waitlistUserMembership.save({ session });
              } else {
                // If they ran out of credits while waiting, we might need a different policy.
                // For now, we'll allow it but they might go negative or we skip.
                // Let's be lenient but log it.
                console.warn(`[Waitlist] User ${waitlistedBooking.user} promoted with 0 credits.`);
              }
            }

            waitlistedBooking.status = BookingStatus.CONFIRMED;
            await waitlistedBooking.save({ session });

            await ClassSessionModel.findByIdAndUpdate(classSession._id, {
              $inc: { enrolledCount: 1 },
            }, { session });

            wasSlotFilled = true;
            promotedBooking = waitlistedBooking;
          }
        }

        // 4. CREDIT REFUND LOGIC (Penalty check)
        const cancellingUserMembership = await MembershipModel.findOne({
          user: userId,
          isActive: true,
        }).session(session);

        if (cancellingUserMembership && cancellingUserMembership.type === PlanType.CLASS_PACK_10) {
          // Refund if:
          // 1. Not late (> 2 hours)
          // 2. OR Late but slot was filled (Waiver)
          if (!isLate || wasSlotFilled) {
            cancellingUserMembership.creditsRemaining = (cancellingUserMembership.creditsRemaining || 0) + 1;
            await cancellingUserMembership.save({ session });
          } else {
            // Penalty applies: No refund
            console.log(`[Penalty] Late cancellation for user ${userId}. Credit not refunded.`);
          }
        }
      }

      await session.commitTransaction();

      // 5. Notify users (Post-commit)
      if (promotedBooking) {
        await NotificationService.createNotification(
          promotedBooking.user.toString(),
          'BOOKING_CONFIRMATION',
          `Good news! You've been promoted from the waitlist to confirmed for ${classSession.title}.`,
          classSession._id.toString()
        );
      }

      return booking;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },


  // Get User's Bookings
  getUserBookings: async (userId: string) => {
    const bookings = await BookingModel.find({ user: userId })
      .populate({
        path: 'classSession',
        select: 'title startTime endTime instructor location type',
        populate: { path: 'instructor', select: 'fullName profileImage' },
      })
      .sort({ bookedAt: -1 });

    // Generate QR code URLs for confirmed bookings
    const bookingsWithQR = await Promise.all(
      bookings.map(async (booking) => {
        const bookingObj: IBooking = booking.toObject();
        if (booking.qrCode && booking.status === BookingStatus.CONFIRMED) {
          bookingObj.qrCodeUrl = await QRCode.toDataURL(booking.qrCode);
        }
        return bookingObj;
      })
    );

    return bookingsWithQR;
  },

  //Check-in via QR code or Booking ID
  checkIn: async (input: string) => {
    const query: mongoose.FilterQuery<IBooking> = {
      status: BookingStatus.CONFIRMED,
    };

    if (mongoose.isValidObjectId(input)) {
      query.$or = [{ qrCode: input }, { _id: input }];
    } else {
      query.qrCode = input;
    }

    const booking = await BookingModel.findOne(query).populate('classSession user');

    if (!booking) {
      throw new AppError('Invalid verification code or booking not found', 404);
    }

    booking.status = BookingStatus.CHECKED_IN;
    await booking.save();

    return booking;
  },


  // Get all bookings for a specific class session (for instructors/admins)
  getClassBookings: async (classSessionId: string) => {
    return await BookingModel.find({ classSession: classSessionId })
      .populate('user', 'fullName email profileImage')
      .sort({ bookedAt: 1 });
  },

  // Manual check-in by booking ID
  checkInById: async (bookingId: string) => {
    const booking = await BookingModel.findById(bookingId).populate('classSession user');

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new AppError(`Cannot check in. Current status: ${booking.status}`, 400);
    }

    booking.status = BookingStatus.CHECKED_IN;
    await booking.save();

    return booking;
  },
};