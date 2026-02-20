import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { UserModel, UserRole } from '../modules/users/user.model.js';
import { StudioModel } from '../modules/studios/studio.model.js';
import { MembershipModel, PlanType } from '../modules/memberships/membership.model.js';
import { ClassSessionModel } from '../modules/classes/class.model.js';
import { BookingModel, BookingStatus } from '../modules/bookings/booking.model.js';
import { ReconciliationLogModel } from '../modules/studios/reconciliation-log.model.js';

const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' });

async function runTest12() {
    await mongoose.connect(process.env.MONGODB_URI!);
    try {
        const admins = await UserModel.find({ role: 'STUDIO_ADMIN' });
        const admin = admins[0];

        const members = await UserModel.find({ role: UserRole.MEMBER });
        const member = members[0];

        const adminToken = (await api.post('/auth/login', { email: admin.email, password: 'password123' })).data.token;
        api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

        console.log('--- TEST 12: Cross-Location Financial Reconciliation ---');

        // 1. Setup Studios
        console.log('Setting up Home and Host Studios...');
        const homeStudio = await StudioModel.findOneAndUpdate(
            { name: 'Home Base' },
            { address: '123 Home St', location: { lat: 0, lng: 0 }, dropInRate: 20 },
            { upsert: true, new: true }
        );
        const hostStudio = await StudioModel.findOneAndUpdate(
            { name: 'Host Location' },
            { address: '456 Host Ave', location: { lat: 0.1, lng: 0.1 }, dropInRate: 35 },
            { upsert: true, new: true }
        );

        // 2. Setup Membership
        console.log('Assigning Home Studio to member...');
        await MembershipModel.findOneAndUpdate(
            { user: member._id },
            { homeStudio: homeStudio._id, type: PlanType.ANNUAL, isActive: true },
            { upsert: true }
        );

        // 3. Create Class at Host Studio
        console.log('Creating class at Host Location...');
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

        // Cleanup old classes to avoid instructor conflicts
        await ClassSessionModel.deleteMany({ instructor: admin._id });

        const hostClass = await ClassSessionModel.create({
            title: 'Host Yoga',
            type: 'YOGA',
            studio: hostStudio._id,
            instructor: admin._id,
            startTime,
            endTime,
            capacity: 20
        });

        // 4. Create Booking
        console.log('Creating confirmed booking...');
        const booking = await BookingModel.create({
            user: member._id,
            classSession: hostClass._id,
            status: BookingStatus.CONFIRMED,
            bookingDate: new Date()
        });

        // 5. Trigger Manual Check-in
        console.log('Performing manual check-in at Host Location...');
        await api.post(`/bookings/${booking._id}/manual-check-in`, {});

        // 6. Verify Reconciliation Log
        console.log('Verifying Reconciliation Log...');
        const log = await ReconciliationLogModel.findOne({ booking: booking._id });

        if (log) {
            console.log('SUCCESS: Reconciliation Log created.');
            console.log('Amount recorded:', log.amount);

            if (log.amount === 35 && log.hostStudio.toString() === hostStudio._id.toString()) {
                console.log('SUCCESS: Reconciliation amount and host studio verified.');
            } else {
                console.error(`FAIL: Log details incorrect! Expected amount 35, got ${log.amount}`);
            }
        } else {
            console.error('FAIL: No Reconciliation Log found after check-in!');
        }

    } catch (err: any) {
        console.error('TEST 12 ERROR:', err.response?.data || err.message);
    } finally {
        process.exit(0);
    }
}
runTest12();
