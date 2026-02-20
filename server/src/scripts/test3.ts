import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

const __dirname = path.resolve()
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { UserModel, UserRole } from '../modules/users/user.model.js';
import { StudioModel } from '../modules/studios/studio.model.js';
import { MembershipModel } from '../modules/memberships/membership.model.js';
import { ClassSessionModel } from '../modules/classes/class.model.js';

const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' });

async function runTest3() {
    await mongoose.connect(process.env.MONGODB_URI!);
    try {
        const loginRes = await api.post('/auth/login', { email: 'admin@studio.com', password: 'password123' });
        const adminToken = loginRes.data.token;
        api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

        const studios = await StudioModel.find();
        if (studios.length < 1) throw new Error('No studios');
        const studioEast = studios[0];

        const instructors = await UserModel.find({ role: UserRole.INSTRUCTOR });
        const instructorX = instructors[0];
        const instructorY = instructors[1];

        const members = await UserModel.find({ role: UserRole.MEMBER });
        const memberA = members[2];
        const memberB = members[3];

        console.log('--- TEST 3: Late Cancel & Waitlist ---');

        // Cleanup any orphaned classes from previous aborted test runs
        await ClassSessionModel.deleteMany({ instructor: { $in: [instructorX._id, instructorY._id] }, startTime: { $gt: new Date() } });

        // Create Class 1 starting in exactly 1 hour (Late Cancel Window)
        const in1Hour = new Date();
        in1Hour.setHours(in1Hour.getHours() + 1);

        console.log('Creating Class with Capacity 1 starting in 1 hr...');
        const classRes = await api.post('/classes', {
            title: 'Waitlist Test', type: 'HIIT', studioId: studioEast._id, instructorId: instructorX._id, capacity: 1, startTime: in1Hour.toISOString(), durationMinutes: 60
        });
        const classId = classRes.data.data.class._id;

        console.log('Member A books..');
        const memberAToken = (await api.post('/auth/login', { email: memberA.email, password: 'password123' })).data.token;
        await api.post('/bookings', { classSessionId: classId }, { headers: { Authorization: `Bearer ${memberAToken}` } });

        console.log('Member B joins waitlist..');
        const memberBToken = (await api.post('/auth/login', { email: memberB.email, password: 'password123' })).data.token;
        await api.post('/bookings', { classSessionId: classId }, { headers: { Authorization: `Bearer ${memberBToken}` } });

        const memABefore = await MembershipModel.findOne({ user: memberA._id });
        console.log('Member A credits before cancel:', memABefore?.creditsRemaining);

        console.log('Member A late cancels (should waive penalty because B is promoted)...');

        // Find booking ID for Member A
        const bookingsRes = await api.get('/bookings/my-bookings', { headers: { Authorization: `Bearer ${memberAToken}` } });
        const bookingA = bookingsRes.data.data.bookings.find((b: any) => String(b.classSession._id || b.classSession) === String(classId));

        await api.patch(`/bookings/${bookingA._id}/cancel`, {}, { headers: { Authorization: `Bearer ${memberAToken}` } });

        const memAAfter = await MembershipModel.findOne({ user: memberA._id });
        console.log('Member A credits after cancel:', memAAfter?.creditsRemaining);
        if ((memAAfter?.creditsRemaining || 0) > (memABefore?.creditsRemaining || 0)) console.log('SUCCESS: Credit refunded (waived)');
        else console.error('FAIL: Credit was deducted despite waitlist promotion!');

        // Check Member B status
        const bBookings = await api.get('/bookings/my-bookings', { headers: { Authorization: `Bearer ${memberBToken}` } });
        const bookingB = bBookings.data.data.bookings.find((b: any) => String(b.classSession._id || b.classSession) === String(classId));
        console.log('Member B final status:', bookingB.status);

        console.log('=== SCENARIO 2: No Waitlist - Strict Penalty ===');
        const class2Res = await api.post('/classes', {
            title: 'No Waitlist Test', type: 'HIIT', studioId: studioEast._id, instructorId: instructorY._id, capacity: 1, startTime: in1Hour.toISOString(), durationMinutes: 60
        });
        const class2Id = class2Res.data.data.class._id;

        console.log('Member A books..');
        await api.post('/bookings', { classSessionId: class2Id }, { headers: { Authorization: `Bearer ${memberAToken}` } });

        const memA2Before = await MembershipModel.findOne({ user: memberA._id });
        console.log('Member A credits before cancel #2:', memA2Before?.creditsRemaining);

        // Find booking ID for Member A
        const bookings2Res = await api.get('/bookings/my-bookings', { headers: { Authorization: `Bearer ${memberAToken}` } });
        const bookingA2 = bookings2Res.data.data.bookings.find((b: any) => String(b.classSession._id || b.classSession) === String(class2Id));

        await api.patch(`/bookings/${bookingA2._id}/cancel`, {}, { headers: { Authorization: `Bearer ${memberAToken}` } });

        const memA2After = await MembershipModel.findOne({ user: memberA._id });
        console.log('Member A credits after cancel #2 (Should permanently lose credit):', memA2After?.creditsRemaining);
        if (memA2Before?.creditsRemaining === memA2After?.creditsRemaining) {
            console.log('SUCCESS: Credit permanently deducted (strict penalty enforced)');
        } else {
            console.error('FAIL: Credit was NOT deducted! Penalty missing!');
        }

    } catch (err: any) {
        console.error('TEST 3 ERROR:', err.response?.data || err.message);
    } finally {
        process.exit(0);
    }
}
runTest3();
