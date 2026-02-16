import mongoose from 'mongoose';
import WorkoutTemplate from '../modules/workouts/workout-template.model.js';
import { UserModel } from '../modules/users/user.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const templates = [
    {
        name: 'Full Body Power',
        description: 'A comprehensive full-body workout focused on compound movements to build strength and muscle.',
        category: 'STRENGTH',
        difficulty: 'INTERMEDIATE',
        exercises: [
            { name: 'Barbell Back Squat', sets: 4, reps: 8, weight: 60, notes: 'Focus on depth and form.' },
            { name: 'Bench Press', sets: 4, reps: 8, weight: 50, notes: 'Full range of motion.' },
            { name: 'Deadlift', sets: 3, reps: 5, weight: 80, notes: 'Keep back flat.' },
            { name: 'Overhead Press', sets: 3, reps: 10, weight: 30 },
            { name: 'Pull Ups', sets: 3, reps: 8 }
        ],
        isPublic: true
    },
    {
        name: 'HIIT Cardio Blast',
        description: 'High Intensity Interval Training to maximize calorie burn and improve cardiovascular fitness.',
        category: 'HIIT',
        difficulty: 'ADVANCED',
        exercises: [
            { name: 'Burpees', sets: 4, reps: 15, duration: 60, notes: 'Max effort.' },
            { name: 'Mountain Climbers', sets: 4, reps: 30, duration: 60 },
            { name: 'Jump Squats', sets: 4, reps: 20, duration: 60 },
            { name: 'Plank Jacks', sets: 4, reps: 20, duration: 60 },
            { name: 'High Knees', sets: 4, reps: 50, duration: 60 }
        ],
        isPublic: true
    },
    {
        name: 'Morning Yoga Flow',
        description: 'A gentle yoga sequence to improve flexibility and start your day with mindfulness.',
        category: 'FLEXIBILITY',
        difficulty: 'BEGINNER',
        exercises: [
            { name: 'Sun Salutations', sets: 5, reps: 1, duration: 300 },
            { name: 'Warrior I & II', sets: 2, reps: 1, duration: 120 },
            { name: 'Downwards Dog', sets: 3, reps: 1, duration: 60 },
            { name: 'Child\'s Pose', sets: 1, reps: 1, duration: 180 }
        ],
        isPublic: true
    },
    {
        name: 'Upper Body Pump',
        description: 'Focused workout on chest, back, shoulders, and arms.',
        category: 'STRENGTH',
        difficulty: 'INTERMEDIATE',
        exercises: [
            { name: 'Incline Dumbbell Press', sets: 3, reps: 12, weight: 20 },
            { name: 'Bent Over Rows', sets: 3, reps: 12, weight: 40 },
            { name: 'Lateral Raises', sets: 3, reps: 15, weight: 7.5 },
            { name: 'Bicep Curls', sets: 3, reps: 12, weight: 12.5 },
            { name: 'Tricep Pushdowns', sets: 3, reps: 12, weight: 25 }
        ],
        isPublic: true
    }
];

const seedTemplates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to MongoDB');

        // Find an admin or instructor to "own" these templates
        const admin = await UserModel.findOne({ role: { $in: ['STUDIO_ADMIN', 'INSTRUCTOR'] } });
        if (!admin) {
            console.error('No admin found to create templates. Please create an admin user first.');
            process.exit(1);
        }

        await WorkoutTemplate.deleteMany({ isPublic: true });
        console.log('Cleared existing public templates');

        const templatesToCreate = templates.map(t => ({
            ...t,
            createdBy: admin._id
        }));

        await WorkoutTemplate.insertMany(templatesToCreate);
        console.log('Successfully seeded workout templates!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding templates:', error);
        process.exit(1);
    }
};

seedTemplates();
