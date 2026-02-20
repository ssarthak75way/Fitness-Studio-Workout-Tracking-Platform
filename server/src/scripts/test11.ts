import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { UserModel, UserRole } from '../modules/users/user.model.js';
import { ClassSessionModel } from '../modules/classes/class.model.js';
import { BookingModel, BookingStatus } from '../modules/bookings/booking.model.js';
import { RatingModel } from '../modules/ratings/rating.model.js';
import { StudioModel } from '../modules/studios/studio.model.js';

const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' });

async function runTest11() {
    await mongoose.connect(process.env.MONGODB_URI!);
    try {
        const members = await UserModel.find({ role: UserRole.MEMBER });
        const member = members[0];

        const instructors = await UserModel.find({ role: UserRole.INSTRUCTOR });
        const instructor = instructors[0];

        const studios = await StudioModel.find();
        const studio = studios[0];

        const memberToken = (await api.post('/auth/login', { email: member.email, password: 'password123' })).data.token;
        api.defaults.headers.common['Authorization'] = `Bearer ${memberToken}`;

        console.log('--- TEST 11: Tamper-Resistant Ratings ---');

        // 1. Create a class that ended 1 hour ago
        console.log('Creating a past class...');
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
        const twoHoursAgo = new Date(oneHourAgo);
        twoHoursAgo.setHours(twoHoursAgo.getHours() - 1);

        const pastClass = await ClassSessionModel.create({
            title: 'Past Yoga',
            type: 'YOGA',
            studio: studio._id,
            instructor: instructor._id,
            startTime: twoHoursAgo,
            endTime: oneHourAgo,
            capacity: 10,
        });

        // 2. Try to rate without booking
        console.log('Attempting to rate without attendance...');
        try {
            await api.post('/ratings', {
                targetType: 'CLASS',
                targetId: pastClass._id,
                rating: 5,
                review: 'Fake review'
            });
            console.error('FAIL: Allowed rating without attendance!');
        } catch (err: any) {
            console.log('SUCCESS: Blocked rating without attendance. Reason:', err.response?.data?.message);
        }

        // 3. Create a confirmed booking
        console.log('Creating confirmed booking for attendance...');
        await BookingModel.create({
            user: member._id,
            classSession: pastClass._id,
            status: BookingStatus.CONFIRMED,
            bookingDate: new Date()
        });

        // 4. Rate now
        console.log('Attempting to rate with attendance...');
        const rateRes = await api.post('/ratings', {
            targetType: 'CLASS',
            targetId: pastClass._id,
            rating: 5,
            review: 'Real review'
        });
        console.log('SUCCESS: Rating accepted with attendance.');

        // 5. Test Trimmed Mean
        console.log('Verifying Trimmed Mean logic...');
        const fakeInstructorId = new mongoose.Types.ObjectId();

        const ratingsData = [1, 5, 5, 5, 5, 5, 5, 5, 5, 5]; // 10% trim of 10 is 1. Trimmed: [5, 5, 5, 5, 5, 5, 5, 5]. Mean: 5.0.

        await RatingModel.deleteMany({ targetId: fakeInstructorId });
        for (let i = 0; i < ratingsData.length; i++) {
            await RatingModel.create({
                user: new mongoose.Types.ObjectId(), // Distinct user per rating
                targetType: 'INSTRUCTOR',
                targetId: fakeInstructorId,
                rating: ratingsData[i],
                review: 'Test'
            });
        }

        const getRes = await api.get(`/ratings?targetType=INSTRUCTOR&targetId=${fakeInstructorId}`);
        const { trimmedMean, distribution } = getRes.data.data;

        console.log('Trimmed Mean (Calculated):', trimmedMean);
        console.log('Distribution:', distribution);

        if (trimmedMean === '5.0') {
            console.log('SUCCESS: Trimmed Mean successfully ignored outliers (1.0 stars).');
        } else {
            console.error(`FAIL: Trimmed Mean calculation incorrect! Expected 5.0, got ${trimmedMean}`);
        }

    } catch (err: any) {
        console.error('TEST 11 ERROR:', err.response?.data || err.message);
    } finally {
        process.exit(0);
    }
}
runTest11();
