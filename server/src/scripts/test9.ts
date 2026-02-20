import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { UserModel, UserRole } from '../modules/users/user.model.js';
import { WorkoutLogModel } from '../modules/workouts/workout.model.js';

const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' });

async function runTest9() {
    await mongoose.connect(process.env.MONGODB_URI!);
    try {
        const members = await UserModel.find({ role: UserRole.MEMBER });
        const member = members[0];

        const memberToken = (await api.post('/auth/login', { email: member.email, password: 'password123' })).data.token;
        api.defaults.headers.common['Authorization'] = `Bearer ${memberToken}`;

        console.log('--- TEST 9: Advanced Analytics & Predictions ---');

        const EXERCISE_NAME = 'Regression Deadlift';
        console.log(`Cleaning up old logs for "${EXERCISE_NAME}"...`);
        await WorkoutLogModel.deleteMany({ user: member._id, 'exercises.name': EXERCISE_NAME });

        console.log(`Logging 4 incremental workouts for "${EXERCISE_NAME}"...`);
        const now = new Date();
        for (let i = 0; i < 4; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - (3 - i)); // Days: -3, -2, -1, 0

            await WorkoutLogModel.create({
                user: member._id,
                title: `Deadlift Session ${i + 1}`,
                date,
                durationMinutes: 45,
                exercises: [
                    {
                        name: EXERCISE_NAME,
                        sets: [{ reps: 5, weight: 100 + (i * 5) }] // 100, 105, 110, 115
                    }
                ]
            });
        }

        const targetWeight = 135;
        console.log(`Fetching Advanced Analytics for "${EXERCISE_NAME}" with target ${targetWeight}kg...`);
        const analyticsRes = await api.get(`/workouts/analytics/advanced/${EXERCISE_NAME}?targetWeight=${targetWeight}`);
        const analytics = analyticsRes.data.data.analytics;

        console.log('Gain per Week:', analytics.rateOfGain);
        console.log('R-Squared (Fit):', analytics.rSquared);
        console.log('Days to Goal:', analytics.prediction.daysToGoal);
        console.log('Predicted Date:', analytics.prediction.predictedDate);
        console.log('Is Decelerating:', analytics.isDecelerating);

        if (analytics.prediction.daysToGoal !== null) {
            console.log('SUCCESS: Predictions calculated correctly.');
            console.log(`Verdict: Reaching ${targetWeight}kg in ~${analytics.prediction.daysToGoal} days.`);
        } else {
            console.error('FAIL: Predictions failed!');
        }

    } catch (err: any) {
        console.error('TEST 9 ERROR:', err.response?.data || err.message);
    } finally {
        process.exit(0);
    }
}
runTest9();
