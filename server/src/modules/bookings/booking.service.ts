import mongoose from 'mongoose';
import QRCode from 'qrcode';
import { BookingModel, BookingStatus } from './booking.model.js';
import { ClassSessionModel } from '../classes/class.model.js';
import { MembershipModel, PlanType } from '../memberships/membership.model.js';
import { NotificationService } from '../notifications/notification.service.js';
import { AppError } from '../../utils/AppError.js';

export const BookingService = {
  /**
   * Create a booking for a user
   */
  createBooking: async (userId: string, classId: string) => {
    // 1. CHECK MEMBERSHIP
    const membership = await MembershipModel.findOne({
      user: userId,
      isActive: true,
    });

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

    // 2. Check if user already booked
    const existingBooking = await BookingModel.findOne({
      user: userId,
      classSession: classId,
      status: { $ne: BookingStatus.CANCELLED },
    });

    if (existingBooking) {
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

    // 5. Create the Booking Record
    const booking = await BookingModel.create({
      user: userId,
      classSession: classId,
      status: bookingStatus,
      qrCode: qrData,
    });

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

  /**
   * Cancel a booking
   */
  cancelBooking: async (bookingId: string, userId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Find and update booking status
      const booking = await BookingModel.findOne({
        _id: bookingId,
        user: userId,
        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.WAITLISTED] },
      }).populate('classSession').session(session);

      if (!booking) {
        throw new AppError('Booking not found or already cancelled', 404);
      }

      const classSession: any = booking.classSession;

      // Store original status before changing it
      const wasConfirmed = booking.status === BookingStatus.CONFIRMED;

      booking.status = BookingStatus.CANCELLED;
      await booking.save({ session });

      // 2. If was confirmed, decrement class count and promote waitlist
      if (wasConfirmed) {
        await ClassSessionModel.findByIdAndUpdate(
          booking.classSession,
          { $inc: { enrolledCount: -1 } },
          { session }
        );

        // Promote first waitlisted booking
        const waitlistedBooking = await BookingModel.findOne({
          classSession: booking.classSession,
          status: BookingStatus.WAITLISTED,
        })
          .sort({ bookedAt: 1 })
          .session(session);

        if (waitlistedBooking) {
          waitlistedBooking.status = BookingStatus.CONFIRMED;
          await waitlistedBooking.save({ session });
          await ClassSessionModel.findByIdAndUpdate(
            booking.classSession,
            { $inc: { enrolledCount: 1 } },
            { session }
          );

          // Notify promoted user
          await NotificationService.createNotification(
            waitlistedBooking.user.toString(),
            'BOOKING_CONFIRMATION',
            `Good news! You've been promoted from the waitlist to confirmed for ${classSession.title}.`,
            booking.classSession.toString()
          );
        }
      }

      await session.commitTransaction();
      return booking;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  /**
   * Get User's Bookings
   */
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
        const bookingObj: any = booking.toObject();
        if (booking.qrCode && booking.status === BookingStatus.CONFIRMED) {
          bookingObj.qrCodeUrl = await QRCode.toDataURL(booking.qrCode);
        }
        return bookingObj;
      })
    );

    return bookingsWithQR;
  },

  /**
   * Check-in via QR code
   */
  checkIn: async (qrCode: string) => {
    const booking = await BookingModel.findOne({
      qrCode,
      status: BookingStatus.CONFIRMED,
    }).populate('classSession user');

    if (!booking) {
      throw new AppError('Invalid QR code or booking not found', 404);
    }

    booking.status = BookingStatus.CHECKED_IN;
    await booking.save();

    return booking;
  },
};