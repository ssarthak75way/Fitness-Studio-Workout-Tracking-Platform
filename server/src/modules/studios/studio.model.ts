import mongoose, { Schema, Document } from 'mongoose';

export interface IStudio extends Document {
    name: string;
    address: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const StudioSchema = new Schema<IStudio>(
    {
        name: { type: String, required: true, unique: true },
        address: { type: String, required: true },
        description: { type: String },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true, versionKey: false }
);

export const StudioModel = mongoose.model<IStudio>('Studio', StudioSchema);
