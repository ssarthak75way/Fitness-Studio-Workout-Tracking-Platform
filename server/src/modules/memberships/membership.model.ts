import mongoose, { Schema, Document, Types } from 'mongoose';

export enum PlanType {
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
  CLASS_PACK_10 = 'CLASS_PACK_10',
  CORPORATE = 'CORPORATE',
}

export interface IMembership extends Document {
  user: Types.ObjectId;
  homeStudio: Types.ObjectId;
  type: PlanType;
  startDate: Date;
  endDate?: Date; // For subscriptions
  creditsRemaining?: number; // For class packs and corporate
  isActive: boolean;
  paymentId?: string;
  paymentOrderId?: string;
  lastPlanChange?: Date;
  scheduledChange?: {
    type: PlanType;
    effectiveDate: Date;
  };
  corporateAccountId?: Types.ObjectId;
  billingCycleRenewalDate?: Date; // When corporate credits reset without rollover
}


const MembershipSchema = new Schema<IMembership>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  homeStudio: { type: Schema.Types.ObjectId, ref: 'Studio' },
  type: { type: String, enum: Object.values(PlanType), required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  creditsRemaining: { type: Number }, // Only for packs and corporate
  isActive: { type: Boolean, default: true },
  paymentId: { type: String },
  paymentOrderId: { type: String },
  lastPlanChange: { type: Date, default: Date.now },
  scheduledChange: {
    type: { type: String, enum: Object.values(PlanType) },
    effectiveDate: { type: Date },
  },
  corporateAccountId: { type: Schema.Types.ObjectId, ref: 'CorporateAccount' },
  billingCycleRenewalDate: { type: Date }
});


export const MembershipModel = mongoose.model<IMembership>('Membership', MembershipSchema);