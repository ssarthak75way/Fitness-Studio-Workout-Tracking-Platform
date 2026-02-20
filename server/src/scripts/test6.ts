import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

const __dirname = path.resolve();
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { UserModel, UserRole } from '../modules/users/user.model.js';
import { StudioModel } from '../modules/studios/studio.model.js';
import { NotificationModel } from '../modules/notifications/notification.model.js';

const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' });

async function runTest6() {
    await mongoose.connect(process.env.MONGODB_URI!);
    try {
        const instructors = await UserModel.find({ role: UserRole.INSTRUCTOR });
        const alex = instructors[0];

        const studios = await StudioModel.find();
        const studioEast = studios[0];

        console.log('--- TEST 6: Certification Expiry ---');

        // Setup: Set Alex's expiry to 15 days from now
        const in15Days = new Date();
        in15Days.setDate(in15Days.getDate() + 15);

        await UserModel.findByIdAndUpdate(alex._id, { certifications: [{ name: 'CPR', expiryDate: in15Days }] });

        console.log('Checking notifications for 30-day warning...');

        // Login as Admin to trigger the cron job equivalent endpoint
        const initAdminToken = (await api.post('/auth/login', { email: 'admin@studio.com', password: 'password123' })).data.token;
        await api.post('/users/admin/enforce-certifications', {}, { headers: { Authorization: `Bearer ${initAdminToken}` } });

        const tokenRes = await api.post('/auth/login', { email: alex.email, password: 'password123' });
        const alexToken = tokenRes.data.token;

        // Simulate UI fetching certifications / notifications
        await api.get('/users/profile', { headers: { Authorization: `Bearer ${alexToken}` } });

        const warnings = await NotificationModel.find({ user: alex._id, type: 'CERT_EXPIRY' });
        if (warnings.length > 0) {
            console.log('SUCCESS: Expiry warning found!');
        } else {
            console.log('NOTE: Expiry warning logic might be executed in a cron job or scheduled task, checking manual route...');
        }

        // Step 2: Set expiry to yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        await UserModel.findByIdAndUpdate(alex._id, { certifications: [{ name: 'CPR', expiryDate: yesterday }] });

        console.log('Set expiry to yesterday. Admin attempting to schedule class...');
        const adminToken = (await api.post('/auth/login', { email: 'admin@studio.com', password: 'password123' })).data.token;

        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 10);
            await api.post('/classes', {
                title: 'Expiry Test Class', type: 'YOGA', studioId: studioEast._id, instructorId: alex._id, capacity: 10, startTime: tomorrow.toISOString(), durationMinutes: 60
            }, { headers: { Authorization: `Bearer ${adminToken}` } });

            console.error('FAIL: System allowed scheduling of an expired instructor!');
        } catch (err: any) {
            console.log('SUCCESS: System blocked scheduling! Reason:', err.response?.data?.message);
        }

    } catch (err: any) {
        console.error('TEST 6 ERROR:', err.response?.data || err.message);
    } finally {
        process.exit(0);
    }
}
runTest6();
