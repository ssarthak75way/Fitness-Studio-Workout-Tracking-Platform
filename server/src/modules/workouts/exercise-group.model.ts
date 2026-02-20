import mongoose, { Schema, Document } from 'mongoose';

export interface IExerciseGroup extends Document {
    name: string; // e.g., "Horizontal Push"
    exerciseNames: string[]; // e.g., ["Bench Press", "Dumbbell Press", "Chest Press"]
    suggestions: string; // e.g., "Try Incline Press or a deload week"
}

const ExerciseGroupSchema = new Schema<IExerciseGroup>({
    name: { type: String, required: true, unique: true },
    exerciseNames: [{ type: String, required: true }],
    suggestions: { type: String, required: true },
});

// Index for quick lookup of group by exercise name
ExerciseGroupSchema.index({ exerciseNames: 1 });

export const ExerciseGroupModel = mongoose.model<IExerciseGroup>('ExerciseGroup', ExerciseGroupSchema);
