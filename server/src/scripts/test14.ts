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
import { ClassSessionModel } from '../modules/classes/class.model.js';
import { BookingModel, BookingStatus } from '../modules/bookings/booking.model.js';

const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' });

async function runTest14() {
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
            throw new Error('Missing required data.');
        }

        // Set studio location to 0,0 for easy math
        await StudioModel.findByIdAndUpdate(studio._id, {
            location: { lat: 0, lng: 0 }
        });

        const adminToken = (await api.post('/auth/login', { email: admin.email, password: 'password123' })).data.token;
        api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

        console.log('--- TEST 14: GPS Check-In Fraud Prevention ---');

        // 1. Setup Class (In Window: Starts in 5 mins)
        console.log('Creating class within time window...');
        const inWindowStart = new Date();
        inWindowStart.setMinutes(inWindowStart.getMinutes() + 5);

        // Clean up
        await ClassSessionModel.deleteMany({ instructor: instructor._id });

        const class1 = await ClassSessionModel.create({
            title: 'Near Yoga',
            type: 'YOGA',
            studio: studio._id,
            instructor: instructor._id,
            startTime: inWindowStart,
            endTime: new Date(inWindowStart.getTime() + 60 * 60 * 1000),
            capacity: 10
        });

        const booking1 = await BookingModel.create({
            user: member._id,
            classSession: class1._id,
            status: BookingStatus.CONFIRMED,
            qrCode: `qr-${Date.now()}`
        });

        // 2. Try check-in from far away (1.0, 1.0 is ~157km)
        console.log('Attempting check-in from far location (expected failure)...');
        try {
            await api.post('/bookings/check-in', {
                qrCode: booking1.qrCode,
                lat: 1.0,
                lng: 1.0
            });
            console.error('FAIL: Allowed check-in from far away!');
        } catch (err: any) {
            console.log('SUCCESS: Blocked far check-in. Reason:', err.response?.data?.message);
        }

        // 3. Setup Class (Out of Window: Starts in 60 mins)
        console.log('Creating class OUTSIDE time window...');
        const outOfWindowStart = new Date();
        outOfWindowStart.setMinutes(outOfWindowStart.getMinutes() + 60);

        const class2 = await ClassSessionModel.create({
            title: 'Far Yoga',
            type: 'YOGA',
            studio: studio._id,
            instructor: instructor._id, // Distinguish from class1 if needed, but and instructor._id is fine if class1 is cleaned or distinct time.
            startTime: outOfWindowStart,
            endTime: new Date(outOfWindowStart.getTime() + 60 * 60 * 1000),
            capacity: 10
        });

        const booking2 = await BookingModel.create({
            user: member._id,
            classSession: class2._id,
            status: BookingStatus.CONFIRMED,
            qrCode: `qr2-${Date.now()}`
        });

        // 4. Try check-in from correct location but wrong time
        console.log('Attempting check-in outside time window (expected failure)...');
        try {
            await api.post('/bookings/check-in', {
                qrCode: booking2.qrCode,
                lat: 0,
                lng: 0
            });
            console.error('FAIL: Allowed check-in outside time window!');
        } catch (err: any) {
            console.log('SUCCESS: Blocked early check-in. Reason:', err.response?.data?.message);
        }

        // 5. Success Case
        console.log('Attempting valid check-in (In window, correct location)...');
        const validRes = await api.post('/bookings/check-in', {
            qrCode: booking1.qrCode,
            lat: 0.001, // ~111m
            lng: 0.001
        });
        if (validRes.data.status === 'success') {
            console.log('SUCCESS: Valid check-in accepted.');
        } else {
            console.error('FAIL: Valid check-in rejected!', validRes.data);
        }

    } catch (err: any) {
        console.error('TEST 14 ERROR:', err.response?.data || err.message);
    } finally {
        process.exit(0);
    }
}
runTest14();
