import { Request, Response, NextFunction } from 'express';
import { BookingService } from './booking.service.js';
import { AppError } from '../../utils/AppError.js';

export const createBookingHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { classSessionId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const booking = await BookingService.createBooking(userId.toString(), classSessionId);

    res.status(201).json({
      status: 'success',
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserBookingsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const bookings = await BookingService.getUserBookings(userId!.toString());

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings },
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBookingHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    await BookingService.cancelBooking(id, userId!.toString());

    res.status(200).json({
      status: 'success',
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const checkInHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { qrCode, lat, lng, override } = req.body;
    const staffId = req.user?._id?.toString();

    const memberLocation = (lat !== undefined && lng !== undefined) ? { lat, lng } : undefined;
    const booking = await BookingService.checkIn(qrCode, memberLocation, staffId, !!override);

    res.status(200).json({
      status: 'success',
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};


export const getClassBookingsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { classSessionId } = req.params;
    const bookings = await BookingService.getClassBookings(classSessionId);

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings },
    });
  } catch (error) {
    next(error);
  }
};

export const manualCheckInHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const staffId = req.user?._id?.toString();
    const booking = await BookingService.checkInById(id, staffId!);

    res.status(200).json({
      status: 'success',
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};