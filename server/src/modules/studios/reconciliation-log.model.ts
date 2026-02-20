import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReconciliationLog extends Document {
    user: Types.ObjectId;
    booking: Types.ObjectId;
    homeStudio: Types.ObjectId;
    hostStudio: Types.ObjectId;
    amount: number;
    description: string;
    resolved: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ReconciliationLogSchema = new Schema<IReconciliationLog>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
        homeStudio: { type: Schema.Types.ObjectId, ref: 'Studio', required: true },
        hostStudio: { type: Schema.Types.ObjectId, ref: 'Studio', required: true },
        amount: { type: Number, required: true }, // The dropInRate requested by the host Studio
        description: { type: String, required: true },
        resolved: { type: Boolean, default: false }, // Becomes true when monthly payment settled
    },
    { timestamps: true, versionKey: false }
);

// Prevent duplicate reconciliation records per booking
ReconciliationLogSchema.index({ booking: 1 }, { unique: true });
// Index for fast studio accounting queries
ReconciliationLogSchema.index({ homeStudio: 1, hostStudio: 1, resolved: 1 });

export const ReconciliationLogModel = mongoose.model<IReconciliationLog>('ReconciliationLog', ReconciliationLogSchema);
