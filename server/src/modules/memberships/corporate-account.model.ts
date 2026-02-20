import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICorporateAccount extends Document {
    name: string;
    billingContactEmail: string;
    monthlyCapPerEmployee: number; // The strict monthly limit of credits (e.g., 5)
    domain?: string; // Optional: auto-verify employees via email domain
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CorporateAccountSchema = new Schema<ICorporateAccount>(
    {
        name: { type: String, required: true, unique: true },
        billingContactEmail: { type: String, required: true },
        monthlyCapPerEmployee: { type: Number, required: true, min: 1 },
        domain: { type: String }, // e.g., "@acmecorp.com"
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true, versionKey: false }
);

export const CorporateAccountModel = mongoose.model<ICorporateAccount>('CorporateAccount', CorporateAccountSchema);
