import mongoose, { Schema, Document } from 'mongoose';

export interface IStudio extends Document {
    name: string;
    address: string;
    location: {
        lat: number;
        lng: number;
    };
    description?: string;
    isActive: boolean;
    dropInRate: number; // For inter-studio financial reconciliation
    createdAt: Date;
    updatedAt: Date;
}



const StudioSchema = new Schema<IStudio>(
    {
        name: { type: String, required: true, unique: true },
        address: { type: String, required: true },
        location: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        },
        description: { type: String },
        isActive: { type: Boolean, default: true },
        dropInRate: { type: Number, required: true, default: 25 }, // Default $25 per cross-visit
    },

    { timestamps: true, versionKey: false }
);

export const StudioModel = mongoose.model<IStudio>('Studio', StudioSchema);
