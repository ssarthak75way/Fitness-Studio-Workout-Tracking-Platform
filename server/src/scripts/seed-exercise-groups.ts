import mongoose from 'mongoose';
import { ExerciseGroupModel } from '../modules/workouts/exercise-group.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const groups = [
    {
        name: "Horizontal Push",
        exerciseNames: ["Bench Press", "Dumbbell Press", "Incline Bench Press", "Chest Press Machine"],
        suggestions: "Your chest pressing strength has stalled. Try a deload week by reducing weight by 10%, or swap the main movement for a variation like Weighted Dips or Close Grip Bench Press."
    },
    {
        name: "Vertical Push",
        exerciseNames: ["Overhead Press", "Military Press", "Dumbbell Shoulder Press", "Arnold Press"],
        suggestions: "Shoulder progress is stagnant. Focus on overhead stability with Handstand Pushups, or try a different rep range (e.g., 3x5 instead of 3x10)."
    },
    {
        name: "Horizontal Pull",
        exerciseNames: ["Bent Over Row", "Seated Cable Row", "Dumbbell Row", "One Arm Row"],
        suggestions: "Back volume might be the plateau cause. Try Meadow Rows or Seal Rows to isolate the lats better, or add more isometric holds at the top of the rep."
    },
    {
        name: "Vertical Pull",
        exerciseNames: ["Pull Ups", "Chin Ups", "Lat Pulldown", "Wide Grip Pulldown"],
        suggestions: "Pulling strength is stuck. Try weighted variations if you do bodyweight, or switch to Neutral Grip Pull Ups. Consider adding 'Dead Hangs' to improve grip."
    },
    {
        name: "Knee Dominant (Quads)",
        exerciseNames: ["Barbell Back Squat", "Front Squat", "Leg Press", "Hack Squat", "Goblet Squat"],
        suggestions: "Leg strength has hit a wall. Incorporate pause squats to build explosive power from the hole, or try high-volume Bulgarian Split Squats for a few sessions."
    },
    {
        name: "Hip Dominant (Hamstrings/Glutes)",
        exerciseNames: ["Deadlift", "Romanian Deadlift", "Sumo Deadlift", "Glute Ham Raise", "Leg Curl"],
        suggestions: "Your posterior chain needs a change. Try Deficit Deadlifts for better pull off the floor, or focus on Hip Thrusts to maximize glute engagement."
    }
];

const seedExerciseGroups = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to MongoDB');

        await ExerciseGroupModel.deleteMany({});
        console.log('Cleared existing exercise groups');

        await ExerciseGroupModel.insertMany(groups);
        console.log('Successfully seeded exercise groups!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding exercise groups:', error);
        process.exit(1);
    }
};

seedExerciseGroups();
