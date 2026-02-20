import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

const __dirname = path.resolve();
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { UserModel, UserRole } from '../modules/users/user.model.js';

const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' });

async function runTest4() {
    await mongoose.connect(process.env.MONGODB_URI!);
    try {
        const members = await UserModel.find({ role: UserRole.MEMBER });
        const plateauMember = members[4]; // member5@example.com

        if (!plateauMember) throw new Error('Member 5 not found');

        const memberToken = (await api.post('/auth/login', { email: plateauMember.email, password: 'password123' })).data.token;
        api.defaults.headers.common['Authorization'] = `Bearer ${memberToken}`;

        console.log('--- TEST 4: Workout Plateau Detection ---');

        // Clean previous bench press logs
        const { WorkoutLogModel } = await import('../modules/workouts/workout.model.js');
        await WorkoutLogModel.deleteMany({ user: plateauMember._id });

        // Log 4 sessions on different days (simulated by setting date in DB or just logging sequentially)
        // Wait, the API might set the date automatically to `Date.now()`. But the plateau logic checks if there are 4 logs regardless of the exact day, as long as they are distinct logs. Let's see if the API allows setting `date`.

        for (let i = 0; i < 4; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (4 - i));

            await WorkoutLogModel.create({
                user: plateauMember._id,
                title: `Bench Press Session ${i + 1}`,
                date: d,
                exercises: [{
                    exerciseId: new mongoose.Types.ObjectId(), // Provide a valid ID or let the controller handle it? The WorkoutLog expects exerciseId. We should probably query for an exercise or just use string name if defined that way.
                    name: 'Bench Press',
                    sets: [{ reps: 10, weight: 100, completed: true }]
                }]
            });
            console.log(`Logged Session ${i + 1}: Bench Press 100 lbs x 10`);
        }

        console.log('Fetching Plateaus...');
        const plateausRes = await api.get('/workouts/plateaus');
        const plateausData = plateausRes.data.data;

        if (plateausData.plateaus && plateausData.plateaus.length > 0) {
            console.log('SUCCESS: Plateau detected!');
            console.log(plateausData.plateaus[0]);
        } else {
            console.error('FAIL: No plateaus detected!');
            console.log(plateausData);
        }
    } catch (err: any) {
        console.error('TEST 4 ERROR:', err.response?.data || err.message);
    } finally {
        process.exit(0);
    }
}
runTest4();
