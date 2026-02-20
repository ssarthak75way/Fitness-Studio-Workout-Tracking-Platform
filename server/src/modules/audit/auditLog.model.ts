import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
    adminId: Types.ObjectId;
    impersonatedUserId: Types.ObjectId;
    action: string;
    method: string;
    path: string;
    payload?: unknown;
    timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        impersonatedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        action: { type: String, required: true },
        method: { type: String, required: true },
        path: { type: String, required: true },
        payload: { type: Schema.Types.Mixed },
        timestamp: { type: Date, default: Date.now },
    },
    { versionKey: false }
);

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
