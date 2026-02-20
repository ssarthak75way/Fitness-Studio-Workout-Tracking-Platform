import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
    user: Types.ObjectId;
    type: 'CLASS_REMINDER' | 'CLASS_CANCELLED' | 'WAITLIST_NOTIFICATION' | 'PROMOTION' | 'BOOKING_CONFIRMATION' | 'IMPERSONATION_STARTED' | 'CERT_EXPIRY';
    message: string;
    relatedClass?: Types.ObjectId;
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        type: {
            type: String,
            enum: ['CLASS_REMINDER', 'CLASS_CANCELLED', 'WAITLIST_NOTIFICATION', 'PROMOTION', 'BOOKING_CONFIRMATION', 'IMPERSONATION_STARTED', 'CERT_EXPIRY'],
            required: true,
        },


        message: { type: String, required: true },
        relatedClass: { type: Schema.Types.ObjectId, ref: 'ClassSession' },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);
