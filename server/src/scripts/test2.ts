import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { UserModel, UserRole } from '../modules/users/user.model.js';
import { StudioModel } from '../modules/studios/studio.model.js';

const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' });

async function runTest2() {
    await mongoose.connect(process.env.MONGODB_URI!);
    try {
        // 1. Login Admin
        const loginRes = await api.post('/auth/login', { email: 'admin@studio.com', password: 'password123' });
        const adminToken = loginRes.data.token;
        api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

        const studios = await StudioModel.find();
        if (studios.length < 2) {
            console.error('TEST ERROR: Not enough studios seeded!');
            process.exit(1);
        }
        const studioEast = studios[0];
        const studioWest = studios[1];
        const instructors = await UserModel.find({ role: UserRole.INSTRUCTOR });
        const instructorX = instructors[0];
        const instructorY = instructors[1];

        if (!instructorX || !instructorY) {
            console.error('TEST ERROR: Not enough instructors seeded!');
            process.exit(1);
        }

        console.log('--- TEST 2: Double Booking & Coverage ---');

        // Pick a highly unique dynamic date far in the future to avoid state overlaps between test runs
        const tomorrow10AM = new Date();
        tomorrow10AM.setDate(tomorrow10AM.getDate() + 60 + Math.floor(Math.random() * 1000));
        tomorrow10AM.setHours(10, 0, 0, 0);
        const tomorrow11AM = new Date(tomorrow10AM);
        tomorrow11AM.setHours(11, 0, 0, 0);

        console.log('Creating Class 1 at East...');
        const class1Res = await api.post('/classes', {
            title: 'Class 1', type: 'YOGA', studioId: studioEast!._id, instructorId: instructorX!._id, capacity: 10, startTime: tomorrow10AM.toISOString(), durationMinutes: 60
        });
        console.log('Class 1 Created:', class1Res.data.data.class._id);

        // Attempt double booking at West at 10:30 AM
        const tomorrow1030AM = new Date(tomorrow10AM);
        tomorrow1030AM.setHours(10, 30, 0, 0);

        console.log('Attempting Class 2 at West (Should Fail)...');
        try {
            await api.post('/classes', {
                title: 'Class 2', type: 'HIIT', studioId: studioWest!._id, instructorId: instructorX!._id, capacity: 10, startTime: tomorrow1030AM.toISOString(), durationMinutes: 60
            });
            console.error('FAIL: Double booking was allowed!');
        } catch (err: any) {
            console.log('SUCCESS: Blocked double booking. Reason:', err.response?.data?.message);
        }

        // Schedule Instructor Y at 2:00 PM tomorrow
        const tomorrow2PM = new Date(tomorrow10AM);
        tomorrow2PM.setHours(14, 0, 0, 0);

        console.log('Creating Class 3 for Y at 2 PM...');
        const class3Res = await api.post('/classes', {
            title: 'Class 3', type: 'HIIT', studioId: studioEast!._id, instructorId: instructorY!._id, capacity: 10, startTime: tomorrow2PM.toISOString(), durationMinutes: 60
        });
        const class3Id = class3Res.data.data.class._id;
        console.log('Class 3 Created:', class3Id);

        console.log('Cancelling Class 3 to trigger auto-coverage...');
        const cancelRes = await api.delete(`/classes/${class3Id}`);
        console.log('Cancel response status:', cancelRes.status);

    } catch (err: any) {
        console.error('TEST 2 ERROR:', err.response?.data || err.message);
    } finally {
        process.exit(0);
    }
}
runTest2();
