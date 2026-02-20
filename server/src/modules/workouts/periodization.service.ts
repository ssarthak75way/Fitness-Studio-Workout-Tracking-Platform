import { WorkoutLogModel } from './workout.model.js';
import PeriodizedProgramModel, { PhaseType } from './periodized-program.model.js';

import WorkoutTemplate from './workout-template.model.js';
import { differenceInWeeks } from 'date-fns';

export const PeriodizationService = {
    /**
     * Estimates 1RM using Epley's formula: 1RM = weight * (1 + reps / 30)
     */
    calculateEstimated1RM: async (userId: string, exerciseName: string): Promise<number | null> => {
        const workouts = await WorkoutLogModel.find({
            user: userId,
            'exercises.name': exerciseName
        }).sort({ date: -1 }).limit(10);

        if (workouts.length === 0) return null;

        let max1RM = 0;
        workouts.forEach(workout => {
            const exercise = workout.exercises.find(ex => ex.name === exerciseName);
            if (exercise) {
                exercise.sets.forEach(set => {
                    const estimated1RM = set.weight * (1 + set.reps / 30);
                    if (estimated1RM > max1RM) max1RM = estimated1RM;
                });
            }
        });

        return max1RM > 0 ? Math.round(max1RM * 10) / 10 : null;
    },

    /**
     * Prescribes weights for a template based on the user's current program phase.
     */
    getPrescribedWeights: async (userId: string, templateId: string) => {
        const program = await PeriodizedProgramModel.findOne({ user: userId, isActive: true });
        if (!program) return null;

        const template = await WorkoutTemplate.findById(templateId);
        if (!template) return null;

        // Determine current phase
        const weeksSinceStart = differenceInWeeks(new Date(), program.startDate) + 1;
        const currentPhase = program.phases.find(p => weeksSinceStart >= p.startWeek && weeksSinceStart <= p.endWeek);

        if (!currentPhase) return null;

        // Intensity targets based on phase
        const intensityMap: Record<PhaseType, { minPct: number; maxPct: number }> = {
            [PhaseType.HYPERTROPHY]: { minPct: 0.60, maxPct: 0.75 },
            [PhaseType.STRENGTH]: { minPct: 0.80, maxPct: 0.90 },
            [PhaseType.PEAKING]: { minPct: 0.90, maxPct: 1.00 },
        };

        const target = intensityMap[currentPhase.type];

        const prescribedExercises = await Promise.all(template.exercises.map(async (ex) => {
            const oneRM = await PeriodizationService.calculateEstimated1RM(userId, ex.name);

            if (oneRM) {
                const prescribedWeight = (oneRM * (target.minPct + target.maxPct) / 2);
                return {
                    name: ex.name,
                    sets: ex.sets,
                    reps: ex.reps,
                    prescribedWeight: Math.round(prescribedWeight / 2.5) * 2.5, // Round to nearest 2.5kg/lbs
                    oneRM,
                    phase: currentPhase.type
                };
            }

            return {
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                prescribedWeight: ex.weight || 0,
                oneRM: null,
                phase: currentPhase.type
            };
        }));

        return {
            programId: program._id,
            week: weeksSinceStart,
            phase: currentPhase.type,
            exercises: prescribedExercises
        };
    },

    /**
     * Generates a standard 12-week program for a user.
     */
    generateProgram: async (userId: string) => {
        // Deactivate old programs
        await PeriodizedProgramModel.updateMany({ user: userId, isActive: true }, { isActive: false });

        const program = await PeriodizedProgramModel.create({
            user: userId,
            startDate: new Date(),
            phases: [
                { type: PhaseType.HYPERTROPHY, startWeek: 1, endWeek: 4 },
                { type: PhaseType.STRENGTH, startWeek: 5, endWeek: 8 },
                { type: PhaseType.PEAKING, startWeek: 9, endWeek: 12 },
            ],
            isActive: true
        });

        return program;
    }
};
