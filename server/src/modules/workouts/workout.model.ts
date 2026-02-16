import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISet {
  reps: number;
  weight: number; // in kg or lbs
  rpe?: number; // Rate of Perceived Exertion (1-10)
}

export interface IExercise {
  name: string;
  sets: ISet[];
  notes?: string;
}

export interface IWorkoutLog extends Document {
  user: Types.ObjectId;
  title: string; // e.g., "Leg Day" or "Morning Cardio"
  date: Date;
  durationMinutes: number;
  exercises: IExercise[];
  notes?: string;
}

const SetSchema = new Schema<ISet>({
  reps: { type: Number, required: true },
  weight: { type: Number, required: true },
  rpe: { type: Number },
}, { _id: false }); // No ID needed for sub-documents

const ExerciseSchema = new Schema<IExercise>({
  name: { type: String, required: true },
  sets: [SetSchema],
  notes: { type: String },
}, { _id: false });

const WorkoutLogSchema = new Schema<IWorkoutLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    date: { type: Date, default: Date.now },
    durationMinutes: { type: Number },
    exercises: [ExerciseSchema],
    notes: { type: String },
  },
  { timestamps: true }
);

export const WorkoutLogModel = mongoose.model<IWorkoutLog>('WorkoutLog', WorkoutLogSchema);