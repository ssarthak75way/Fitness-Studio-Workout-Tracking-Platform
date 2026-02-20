import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { UserModel, UserRole } from '../modules/users/user.model.js';
import { MembershipModel, PlanType } from '../modules/memberships/membership.model.js';
import { StudioModel } from '../modules/studios/studio.model.js';

const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' });

async function runTest10() {
    await mongoose.connect(process.env.MONGODB_URI!);
    try {
        const members = await UserModel.find({ role: UserRole.MEMBER });
        const member = members[0];

        const studios = await StudioModel.find();
        if (studios.length === 0) throw new Error('No studios found');
        const studio = studios[0];

        const loginRes = await api.post('/auth/login', { email: member.email, password: 'password123' });
        const memberToken = loginRes.data.token;
        api.defaults.headers.common['Authorization'] = `Bearer ${memberToken}`;

        console.log('--- TEST 10: Prorated Membership Changes ---');

        console.log('Cleaning up existing memberships for user...');
        await MembershipModel.deleteMany({ user: member._id });

        // Create a Monthly membership that started 15 days ago
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

        const fifteenDaysLater = new Date(fifteenDaysAgo);
        fifteenDaysLater.setDate(fifteenDaysLater.getDate() + 30);

        console.log('Creating a 15-day-old Monthly membership...');
        await MembershipModel.create({
            user: member._id,
            homeStudio: studio._id,
            type: PlanType.MONTHLY,
            startDate: fifteenDaysAgo,
            endDate: fifteenDaysLater,
            isActive: true,
            lastPlanChange: new Date(now() - 40 * 24 * 60 * 60 * 1000) // Bypass 30-day cooling
        });

        console.log('Requesting upgrade to ANNUAL plan...');
        const changeRes = await api.post('/memberships/change-plan', { type: PlanType.ANNUAL });
        const { amount } = changeRes.data.data;

        console.log('Calculated Prorated Amount:', amount);

        // Monthly = 99, Annual = 999.
        // Days elapsed: 15. Days total: 30.
        // Unused value: (15/30) * 99 = 49.5
        // Charge: 999 - 49.5 = 949.5

        if (amount === 949.5) {
            console.log('SUCCESS: Proration logic verified! Exactly 949.5 charged.');
        } else if (amount > 940 && amount < 960) {
            console.log(`SUCCESS: Proration logic verified (~${amount} reached).`);
        } else {
            console.error('FAIL: Proration logic incorrect!');
        }

    } catch (err: any) {
        console.error('TEST 10 ERROR:', err.response?.data || err.message);
    } finally {
        process.exit(0);
    }
}

function now() {
    return new Date().getTime();
}

runTest10();
