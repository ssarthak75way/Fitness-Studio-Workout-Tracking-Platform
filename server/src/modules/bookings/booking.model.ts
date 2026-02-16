import mongoose, { Schema, Document, Types } from 'mongoose';

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  WAITLISTED = 'WAITLISTED',
  CANCELLED = 'CANCELLED',
  CHECKED_IN = 'CHECKED_IN', // For QR Code scan
}

export interface IBooking extends Document {
  user: Types.ObjectId;
  classSession: Types.ObjectId;
  status: BookingStatus;
  bookedAt: Date;
  qrCode?: string; // Could be a generated string/hash
}

const BookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    classSession: { type: Schema.Types.ObjectId, ref: 'ClassSession', required: true },
    status: { 
      type: String, 
      enum: Object.values(BookingStatus), 
      default: BookingStatus.CONFIRMED 
    },
    qrCode: { type: String },
    bookedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicate bookings for the same user in the same class
BookingSchema.index({ user: 1, classSession: 1 }, { unique: true });

export const BookingModel = mongoose.model<IBooking>('Booking', BookingSchema);