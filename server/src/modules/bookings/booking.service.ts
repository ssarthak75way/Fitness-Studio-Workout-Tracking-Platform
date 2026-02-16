import mongoose from 'mongoose';
import QRCode from 'qrcode';
import { BookingModel, BookingStatus } from './booking.model.js';
import { ClassSessionModel } from '../classes/class.model.js';
import { MembershipModel, PlanType } from '../memberships/membership.model.js';
import { NotificationService } from '../notifications/notification.service.js';
import { AppError } from '../../utils/AppError.js';

export const BookingService = {
  //Create a booking for a user
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
    // 1. Find the booking
    const booking = await BookingModel.findOne({
      _id: bookingId,
      user: userId,
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.WAITLISTED] },
    }).populate('classSession');

    if (!booking) {
      throw new AppError('Booking not found or already cancelled', 404);
    }

    const classSession: any = booking.classSession;
    if (!classSession) {
      throw new AppError('Associated class session not found', 404);
    }

    // Store original status before changing it
    const wasConfirmed = booking.status === BookingStatus.CONFIRMED;

    // 2. Update booking status
    booking.status = BookingStatus.CANCELLED;
    await booking.save();

    // 3. If was confirmed, decrement class count and promote waitlist
    if (wasConfirmed) {
      await ClassSessionModel.findByIdAndUpdate(classSession._id, {
        $inc: { enrolledCount: -1 },
      });

      // Promote first waitlisted booking
      const waitlistedBooking = await BookingModel.findOne({
        classSession: classSession._id,
        status: BookingStatus.WAITLISTED,
      }).sort({ bookedAt: 1 });

      if (waitlistedBooking) {
        waitlistedBooking.status = BookingStatus.CONFIRMED;
        await waitlistedBooking.save();

        await ClassSessionModel.findByIdAndUpdate(classSession._id, {
          $inc: { enrolledCount: 1 },
        });

        // Notify promoted user
        await NotificationService.createNotification(
          waitlistedBooking.user.toString(),
          'BOOKING_CONFIRMATION',
          `Good news! You've been promoted from the waitlist to confirmed for ${classSession.title}.`,
          classSession._id.toString()
        );
      }
    }

    return booking;
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
        const bookingObj: any = booking.toObject();
        if (booking.qrCode && booking.status === BookingStatus.CONFIRMED) {
          bookingObj.qrCodeUrl = await QRCode.toDataURL(booking.qrCode);
        }
        return bookingObj;
      })
    );

    return bookingsWithQR;
  },

   //Check-in via QR code
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