import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkoutTemplate extends Document {
    name: string;
    description: string;
    category: 'STRENGTH' | 'CARDIO' | 'FLEXIBILITY' | 'HIIT' | 'MIXED';
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    exercises: {
        name: string;
        sets: number;
        reps: number;
        weight?: number;
        duration?: number;
        notes?: string;
    }[];
    createdBy: mongoose.Types.ObjectId;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const workoutTemplateSchema = new Schema<IWorkoutTemplate>(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        category: {
            type: String,
            enum: ['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'HIIT', 'MIXED'],
            required: true,
        },
        difficulty: {
            type: String,
            enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
            required: true,
        },
        exercises: [
            {
                name: { type: String, required: true },
                sets: { type: Number, required: true },
                reps: { type: Number, required: true },
                weight: Number,
                duration: Number,
                notes: String,
            },
        ],
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        isPublic: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<IWorkoutTemplate>('WorkoutTemplate', workoutTemplateSchema);
