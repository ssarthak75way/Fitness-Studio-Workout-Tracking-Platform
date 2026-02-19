import mongoose from 'mongoose';
import WorkoutTemplate from '../modules/workouts/workout-template.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const checkTemplates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to MongoDB');

        const templates = await WorkoutTemplate.find({});
        console.log(`Found ${templates.length} templates in total.`);

        const publicTemplates = await WorkoutTemplate.find({ isPublic: true });
        console.log(`Found ${publicTemplates.length} PUBLIC templates.`);

        if (templates.length > 0) {
            console.log('Sample Template:', JSON.stringify(templates[0], null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('Error checking templates:', error);
        process.exit(1);
    }
};

checkTemplates();
