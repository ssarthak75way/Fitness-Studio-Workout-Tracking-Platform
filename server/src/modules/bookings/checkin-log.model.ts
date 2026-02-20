import mongoose, { Schema, Document, Types } from 'mongoose';

export enum CheckInStatus {
    SUCCESS = 'SUCCESS',
    INVALID_WINDOW = 'INVALID_WINDOW',
    LOCATION_MISMATCH = 'LOCATION_MISMATCH',
    STAFF_OVERRIDE = 'STAFF_OVERRIDE',
    NOT_FOUND = 'NOT_FOUND',
}

export interface ICheckInLog extends Document {
    booking?: Types.ObjectId;
    user?: Types.ObjectId;
    classSession?: Types.ObjectId;
    studio?: Types.ObjectId;
    status: CheckInStatus;
    memberLocation?: {
        lat: number;
        lng: number;
    };
    distance?: number; // In meters
    timestamp: Date;
    staffId?: Types.ObjectId;
    errorDetails?: string;
}

const CheckInLogSchema = new Schema<ICheckInLog>(
    {
        booking: { type: Schema.Types.ObjectId, ref: 'Booking' },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        classSession: { type: Schema.Types.ObjectId, ref: 'ClassSession' },
        studio: { type: Schema.Types.ObjectId, ref: 'Studio' },
        status: { type: String, enum: Object.values(CheckInStatus), required: true },
        memberLocation: {
            lat: Number,
            lng: Number,
        },
        distance: Number,
        timestamp: { type: Date, default: Date.now },
        staffId: { type: Schema.Types.ObjectId, ref: 'User' },
        errorDetails: String,
    },
    { timestamps: true }
);

export const CheckInLogModel = mongoose.model<ICheckInLog>('CheckInLog', CheckInLogSchema);
