import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { UserModel, UserRole } from '../modules/users/user.model.js';
import { CorporateAccountModel } from '../modules/memberships/corporate-account.model.js';
import { MembershipModel, PlanType } from '../modules/memberships/membership.model.js';
import { StudioModel } from '../modules/studios/studio.model.js';
import { ClassSessionModel } from '../modules/classes/class.model.js';

const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' });

async function runTest13() {
    await mongoose.connect(process.env.MONGODB_URI!);
    try {
        const admins = await UserModel.find({ role: 'STUDIO_ADMIN' });
        const admin = admins[0];

        const members = await UserModel.find({ role: UserRole.MEMBER });
        const member = members[0];

        const instructors = await UserModel.find({ role: UserRole.INSTRUCTOR });
        const instructor = instructors[0];

        const studios = await StudioModel.find();
        const studio = studios[0];

        if (!member || !instructor || !studio || !admin) {
            throw new Error(`Missing required data: member=${!!member}, instructor=${!!instructor}, studio=${!!studio}, admin=${!!admin}`);
        }

        const adminToken = (await api.post('/auth/login', { email: admin.email, password: 'password123' })).data.token;
        const memberToken = (await api.post('/auth/login', { email: member.email, password: 'password123' })).data.token;

        // 0. Cleanup and Renew instructor certification to allow scheduling
        console.log('Cleaning up instructor schedule and renewing certifications...');
        await ClassSessionModel.deleteMany({ instructor: instructor._id });

        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        await UserModel.findByIdAndUpdate(instructor._id, {
            certifications: [{ name: 'Certified Specialist', expiryDate: nextYear }]
        });

        console.log('--- TEST 13: Corporate Wellness Programs ---');

        // 1. Setup Corporate Account
        console.log('Setting up Corporate Account...');
        const corpAccount = await CorporateAccountModel.findOneAndUpdate(
            { name: 'ACME Corp' },
            { billingContactEmail: 'hr@acme.com', monthlyCapPerEmployee: 2, isActive: true },
            { upsert: true, new: true }
        );

        // 2. Setup Membership and set renewal date to YESTERDAY (trigger reset)
        console.log('Creating corporate membership with expired renewal date...');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        await MembershipModel.deleteMany({ user: member._id });
        const membership = await MembershipModel.create({
            user: member._id,
            homeStudio: studio._id,
            type: PlanType.CORPORATE,
            corporateAccountId: corpAccount._id,
            creditsRemaining: 0,
            billingCycleRenewalDate: yesterday,
            isActive: true
        });

        // 3. Create a class via API
        console.log('Creating a future class via API...');
        const futureTime = new Date();
        futureTime.setHours(futureTime.getHours() + 4);

        const classRes = await api.post('/classes', {
            title: 'Corporate Yoga',
            type: 'YOGA',
            instructorId: instructor._id.toString(),
            studioId: studio._id.toString(),
            startTime: futureTime.toISOString(),
            durationMinutes: 60,
            capacity: 10
        }, { headers: { Authorization: `Bearer ${adminToken}` } });

        const classId = classRes.data.data.class._id;
        console.log(`Class created via API: ${classId}`);

        // 4. Try to book -> Should trigger LAZY RESET
        console.log('Booking class via API (Member Token)...');
        await api.post('/bookings', { classSessionId: classId }, { headers: { Authorization: `Bearer ${memberToken}` } });
        console.log('SUCCESS: Booking created.');

        // 5. Verify results
        const updatedMembership = await MembershipModel.findById(membership._id);
        console.log('Credits Remaining:', updatedMembership?.creditsRemaining);

        if (updatedMembership?.creditsRemaining === 1) {
            console.log('SUCCESS: Corporate credits lazy reset and deduction verified.');
        } else {
            console.error(`FAIL: Credits incorrect! Expected 1, got ${updatedMembership?.creditsRemaining}`);
        }

    } catch (err: any) {
        console.error('TEST 13 ERROR:', err.response?.data || err.message);
    } finally {
        process.exit(0);
    }
}
runTest13();
