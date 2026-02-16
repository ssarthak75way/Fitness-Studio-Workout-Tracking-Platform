import { IWorkoutLog, WorkoutLogModel } from './workout.model.js';

export const WorkoutService = {
    /**
     * Log a workout
     */
    logWorkout: async (userId: string, workoutData: IWorkoutLog) => {
        const workout = await WorkoutLogModel.create({
            ...workoutData,
            user: userId as string,
        });
        return workout;
    },

    //Get workout history
    getWorkoutHistory: async (userId: string) => {
        return WorkoutLogModel.find({ user: userId as string }).sort({ date: -1 }).limit(50);
    },

    //Calculate personal records (max weight for each exercise)
    getPersonalRecords: async (userId: string) => {
        const workouts = await WorkoutLogModel.find({ user: userId as string });

        const records: Record<string, { weight: number; reps: number; date: Date }> = {};

        workouts.forEach((workout) => {
            workout.exercises.forEach((exercise) => {
                const maxSet = exercise.sets.reduce((max, set) =>
                    set.weight > max.weight ? set : max
                );

                if (!records[exercise.name] || maxSet.weight > records[exercise.name].weight) {
                    records[exercise.name] = {
                        weight: maxSet.weight,
                        reps: maxSet.reps,
                        date: workout.date,
                    };
                }
            });
        });

        return records;
    },

    //Calculate workout streak (consecutive days)
    calculateWorkoutStreak: async (userId: string) => {
        const workouts = await WorkoutLogModel.find({ user: userId as string })
            .sort({ date: -1 })
            .select('date');

        if (workouts.length === 0) return 0;

        let streak = 1;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if most recent workout was today or yesterday
        const lastWorkout = new Date(workouts[0].date);
        lastWorkout.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff > 1) return 0; // Streak broken

        for (let i = 1; i < workouts.length; i++) {
            const current = new Date(workouts[i - 1].date);
            const previous = new Date(workouts[i].date);
            current.setHours(0, 0, 0, 0);
            previous.setHours(0, 0, 0, 0);

            const diff = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));

            if (diff === 1) {
                streak++;
            } else if (diff > 1) {
                break;
            }
        }

        return streak;
    },

    // Get comprehensive workout analytics
    getWorkoutAnalytics: async (userId: string) => {
        const workouts = await WorkoutLogModel.find({ user: userId }).sort({ date: 1 });

        // 1. Volume History (Total weight lifted per workout)
        const volumeHistory = workouts.map(workout => {
            let totalVolume = 0;
            workout.exercises.forEach(ex => {
                ex.sets.forEach(set => {
                    totalVolume += (set.weight || 0) * (set.reps || 0);
                });
            });
            return {
                date: workout.date,
                volume: totalVolume,
                name: workout.title || 'Workout'
            };
        });

        // 2. Exercise Progression (Max weight per exercise over time)
        const exerciseProgression: Record<string, { date: Date; weight: number }[]> = {};
        workouts.forEach(workout => {
            workout.exercises.forEach(ex => {
                if (!exerciseProgression[ex.name]) {
                    exerciseProgression[ex.name] = [];
                }
                const maxWeight = Math.max(...ex.sets.map(s => s.weight || 0));
                exerciseProgression[ex.name].push({
                    date: workout.date,
                    weight: maxWeight
                });
            });
        });

        // 3. Monthly Consistency (Workouts per month)
        const monthlyConsistency: Record<string, number> = {};
        workouts.forEach(workout => {
            const monthYear = new Date(workout.date).toLocaleString('default', { month: 'short', year: '2-digit' });
            monthlyConsistency[monthYear] = (monthlyConsistency[monthYear] || 0) + 1;
        });

        const consistencyData = Object.entries(monthlyConsistency).map(([month, count]) => ({
            month,
            count
        }));

        return {
            volumeHistory,
            exerciseProgression,
            monthlyConsistency: consistencyData
        };
    }
};
