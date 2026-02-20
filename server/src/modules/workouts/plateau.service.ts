import { WorkoutLogModel } from './workout.model.js';
import { ExerciseGroupModel } from './exercise-group.model.js';
import { differenceInDays } from 'date-fns';

export interface IPlateauResult {
    groupName: string;
    status: 'PLATEAU' | 'INCONSISTENT' | 'PROGRESSING';
    lastExercises: string[];
    maxWeightTrend: number[];
    suggestion?: string;
}

export const PlateauService = {
    detectPlateaus: async (userId: string): Promise<IPlateauResult[]> => {
        // 1. Fetch all exercise groups
        const groups = await ExerciseGroupModel.find();

        // 2. Fetch recent workouts for the user
        // We need enough workouts to find 4 sessions per group
        const workouts = await WorkoutLogModel.find({ user: userId })
            .sort({ date: -1 })
            .limit(50);

        if (workouts.length === 0) return [];

        const results: IPlateauResult[] = [];

        for (const group of groups) {
            // Find sessions that included exercises from this group
            const groupSessions = workouts
                .filter(w => w.exercises.some(ex => group.exerciseNames.includes(ex.name)))
                .map(w => {
                    const exercises = w.exercises.filter(ex => group.exerciseNames.includes(ex.name));

                    // Calculate max weight and total volume for this group in this session
                    let sessionMaxWeight = 0;
                    let sessionVolume = 0;

                    exercises.forEach(ex => {
                        ex.sets.forEach(set => {
                            if (set.weight > sessionMaxWeight) sessionMaxWeight = set.weight;
                            sessionVolume += (set.weight * set.reps);
                        });
                    });

                    return {
                        date: w.date,
                        maxWeight: sessionMaxWeight,
                        volume: sessionVolume,
                        exerciseNames: exercises.map(ex => ex.name)
                    };
                })
                .slice(0, 4); // Get last 4 sessions

            if (groupSessions.length < 4) continue;

            // Reverse to get chronological order (oldest to newest)
            const sessions = groupSessions.reverse();

            // 3. Check for Frequency Gap
            const daysBetweenLastTwo = differenceInDays(new Date(sessions[3].date), new Date(sessions[2].date));
            if (daysBetweenLastTwo > 14) {
                results.push({
                    groupName: group.name,
                    status: 'INCONSISTENT',
                    lastExercises: sessions[3].exerciseNames,
                    maxWeightTrend: sessions.map(s => s.maxWeight),
                    suggestion: `It's been ${daysBetweenLastTwo} days since your last ${group.name} session. Focus on regaining consistency before worrying about a plateau.`
                });
                continue;
            }

            // 4. Detect Plateau
            // Definition: Max weight hasn't increased OR Volume hasn't increased across 4 sessions
            const weights = sessions.map(s => s.maxWeight);
            const volumes = sessions.map(s => s.volume);

            let weightStagnant = true;
            let volumeStagnant = true;

            for (let i = 1; i < 4; i++) {
                if (weights[i] > weights[i - 1]) weightStagnant = false;
                if (volumes[i] > volumes[i - 1]) volumeStagnant = false;
            }

            if (weightStagnant && volumeStagnant) {
                results.push({
                    groupName: group.name,
                    status: 'PLATEAU',
                    lastExercises: sessions[3].exerciseNames,
                    maxWeightTrend: weights,
                    suggestion: group.suggestions
                });
            } else {
                // Optionally track progressing groups too
                results.push({
                    groupName: group.name,
                    status: 'PROGRESSING',
                    lastExercises: sessions[3].exerciseNames,
                    maxWeightTrend: weights
                });
            }
        }

        return results;
    }
};
