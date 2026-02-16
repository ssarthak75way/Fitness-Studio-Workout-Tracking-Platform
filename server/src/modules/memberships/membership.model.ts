import mongoose, { Schema, Document, Types } from 'mongoose';

export enum PlanType {
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
  CLASS_PACK_10 = 'CLASS_PACK_10',
}

export interface IMembership extends Document {
  user: Types.ObjectId;
  type: PlanType;
  startDate: Date;
  endDate?: Date; // For subscriptions
  creditsRemaining?: number; // For class packs
  isActive: boolean;
}

const MembershipSchema = new Schema<IMembership>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: Object.values(PlanType), required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  creditsRemaining: { type: Number }, // Only for packs
  isActive: { type: Boolean, default: true },
});

export const MembershipModel = mongoose.model<IMembership>('Membership', MembershipSchema);