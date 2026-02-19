import mongoose, { Schema, Document, Types } from 'mongoose';

export enum PaymentStatus {
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    PENDING = 'PENDING',
}

export interface IPayment extends Document {
    user: Types.ObjectId;
    amount: number;
    currency: string;
    planType: string;
    status: PaymentStatus;
    razorpayPaymentId?: string;
    razorpayOrderId: string;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'INR' },
        planType: { type: String, required: true },
        status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
        razorpayPaymentId: { type: String },
        razorpayOrderId: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

export const PaymentModel = mongoose.model<IPayment>('Payment', PaymentSchema);
