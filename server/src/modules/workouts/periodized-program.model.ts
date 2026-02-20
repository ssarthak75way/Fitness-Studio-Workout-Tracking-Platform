import mongoose, { Schema, Document, Types } from 'mongoose';

export enum PhaseType {
    HYPERTROPHY = 'HYPERTROPHY',
    STRENGTH = 'STRENGTH',
    PEAKING = 'PEAKING',
}

export interface IPeriodizedProgram extends Document {
    user: Types.ObjectId;
    startDate: Date;
    currentWeek: number;
    phases: {
        type: PhaseType;
        startWeek: number;
        endWeek: number;
    }[];
    isActive: boolean;
}

const PeriodizedProgramSchema = new Schema<IPeriodizedProgram>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        startDate: { type: Date, default: Date.now },
        currentWeek: { type: Number, default: 1 },
        phases: [
            {
                type: { type: String, enum: Object.values(PhaseType), required: true },
                startWeek: { type: Number, required: true },
                endWeek: { type: Number, required: true },
            },
        ],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Only one active program per user
PeriodizedProgramSchema.index({ user: 1, isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

export const PeriodizedProgramModel = mongoose.model<IPeriodizedProgram>('PeriodizedProgram', PeriodizedProgramSchema);
export default PeriodizedProgramModel;

