import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRating extends Document {
    user: Types.ObjectId;
    targetType: 'CLASS' | 'INSTRUCTOR';
    targetId: Types.ObjectId;
    rating: number;
    review?: string;
    createdAt: Date;
}

const RatingSchema = new Schema<IRating>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        targetType: { type: String, enum: ['CLASS', 'INSTRUCTOR'], required: true },
        targetId: { type: Schema.Types.ObjectId, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        review: { type: String, maxlength: 500 },
    },
    { timestamps: true }
);

// Prevent duplicate ratings
RatingSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

export const RatingModel = mongoose.model<IRating>('Rating', RatingSchema);
