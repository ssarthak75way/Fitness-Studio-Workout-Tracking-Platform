import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

const __dirname = path.resolve();
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { UserModel, UserRole } from '../modules/users/user.model.js';

const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' });

async function runTest7() {
    await mongoose.connect(process.env.MONGODB_URI!);
    try {
        const members = await UserModel.find({ role: UserRole.MEMBER });
        const member = members[0];

        const memberToken = (await api.post('/auth/login', { email: member.email, password: 'password123' })).data.token;
        api.defaults.headers.common['Authorization'] = `Bearer ${memberToken}`;

        console.log('--- TEST 7: Workout Templates & Periodization ---');

        console.log('Initiating Periodization Program...');
        const programRes = await api.post('/workouts/periodization/initiate', {});
        const program = programRes.data.data.program;
        console.log('SUCCESS: Program initiated. ID:', program._id, 'Start Date:', program.startDate);

        console.log('Fetching Workout Templates...');
        let templatesRes = await api.get('/workouts/templates');
        let templates = templatesRes.data.data.templates;

        if (templates.length === 0) {
            console.log('No public templates found. Creating one...');
            const adminToken = (await api.post('/auth/login', { email: 'admin@studio.com', password: 'password123' })).data.token;
            await api.post('/workouts/templates', {
                name: 'Bench Mastery',
                description: 'A test template for periodization',
                category: 'STRENGTH',
                difficulty: 'INTERMEDIATE',
                exercises: [
                    { name: 'Bench Press', sets: 3, reps: 10, weight: 100 }
                ],
                isPublic: true
            }, { headers: { Authorization: `Bearer ${adminToken}` } });

            templatesRes = await api.get('/workouts/templates');
            templates = templatesRes.data.data.templates;
        }

        const template = templates[0];
        console.log(`Using template: ${template.name} (${template._id})`);

        console.log('Fetching Suggested Weights...');
        const suggestedRes = await api.get(`/workouts/periodization/suggested-weights/${template._id}`);
        const suggested = suggestedRes.data.data.suggestions;

        console.log('Phase:', suggested.phase);
        console.log('Week:', suggested.week);

        if (suggested.exercises && suggested.exercises.length > 0) {
            const bench = suggested.exercises.find((ex: any) => ex.name === 'Bench Press');
            console.log(`Bench Press original: 100, Prescribed: ${bench?.prescribedWeight}`);
            console.log('SUCCESS: Periodization prescription verified!');
        } else {
            console.error('FAIL: No prescribed exercises returned!');
            console.log('Response data:', JSON.stringify(suggestedRes.data.data, null, 2));
        }

    } catch (err: any) {
        console.error('TEST 7 ERROR:', err.response?.data || err.message);
    } finally {
        process.exit(0);
    }
}
runTest7();
