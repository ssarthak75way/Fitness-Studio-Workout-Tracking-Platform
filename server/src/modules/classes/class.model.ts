import mongoose, { Schema, Document, Types } from 'mongoose';

export enum ClassType {
  YOGA = 'YOGA',
  PILATES = 'PILATES',
  HIIT = 'HIIT',
  STRENGTH = 'STRENGTH',
  CARDIO = 'CARDIO',
}

export interface IClassSession extends Document {
  title: string;
  description?: string;
  type: ClassType;
  instructor: Types.ObjectId; // Reference to User
  startTime: Date;
  endTime: Date;
  capacity: number;
  enrolledCount: number; // Optimization: Denormalized count
  location?: string; // Room A, Virtual, etc.
  recurrenceRule?: string; // Optional: RRule string for repeating classes
  isCancelled: boolean;
}

const ClassSessionSchema = new Schema<IClassSession>(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: Object.values(ClassType), required: true },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true, index: true }, // Indexed for calendar queries
    endTime: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    enrolledCount: { type: Number, default: 0 },
    location: { type: String },
    recurrenceRule: { type: String },
    isCancelled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Middleware to prevent double booking an instructor
ClassSessionSchema.index({ instructor: 1, startTime: 1 }, { unique: true });

export const ClassSessionModel = mongoose.model<IClassSession>('ClassSession', ClassSessionSchema);