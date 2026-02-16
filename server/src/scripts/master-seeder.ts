import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Models
import { UserModel, UserRole } from '../modules/users/user.model.js';
import { ClassSessionModel, ClassType } from '../modules/classes/class.model.js';
import { MembershipModel, PlanType } from '../modules/memberships/membership.model.js';
import { BookingModel, BookingStatus } from '../modules/bookings/booking.model.js';
import WorkoutTemplate from '../modules/workouts/workout-template.model.js';
import { WorkoutLogModel } from '../modules/workouts/workout.model.js';
import { RatingModel } from '../modules/ratings/rating.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 12);
};

const getRandomItem = <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
};

const seed = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected!');

        // Clear existing data (optional, but good for a fresh start)
        console.log('Cleaning existing data...');
        await Promise.all([
            UserModel.deleteMany({ email: { $ne: 'admin@studio.com' } }), // Keep a main admin if you want, or clear all
            ClassSessionModel.deleteMany({}),
            MembershipModel.deleteMany({}),
            BookingModel.deleteMany({}),
            WorkoutTemplate.deleteMany({}),
            WorkoutLogModel.deleteMany({}),
            RatingModel.deleteMany({})
        ]);

        const passwordHash = await hashPassword('password123');

        // 1. Seed Users
        console.log('Seeding Users...');
        const instructorsData = [
            { fullName: 'Alex Rivers', email: 'alex@studio.com', role: UserRole.INSTRUCTOR, bio: 'Yoga and mindfulness expert with 10 years experience.', specialties: ['Yoga', 'Meditation'], certifications: ['RYT 500'] },
            { fullName: 'Sarah Chen', email: 'sarah@studio.com', role: UserRole.INSTRUCTOR, bio: 'HIIT and high-energy cardio specialist.', specialties: ['HIIT', 'Cardio'], certifications: ['NASM CPT'] },
            { fullName: 'Marcus Thorne', email: 'marcus@studio.com', role: UserRole.INSTRUCTOR, bio: 'Strength coach focused on powerlifting and hypertrophy.', specialties: ['Strength', 'Powerlifting'], certifications: ['NSCA CSCS'] },
            { fullName: 'Elena Rodriguez', email: 'elena@studio.com', role: UserRole.INSTRUCTOR, bio: 'Pilates instructor specializing in core stability.', specialties: ['Pilates', 'Core'], certifications: ['PMA Certified'] },
            { fullName: 'David Wu', email: 'david@studio.com', role: UserRole.INSTRUCTOR, bio: 'Functional training and mobility specialist.', specialties: ['Functional', 'Mobility'] }
        ];

        const membersData = Array.from({ length: 15 }).map((_, i) => ({
            fullName: `Member ${i + 1}`,
            email: `member${i + 1}@example.com`,
            role: UserRole.MEMBER,
            passwordHash,
            metrics: [
                { weight: 70 + Math.random() * 20, height: 160 + Math.random() * 30, bodyFatPercentage: 15 + Math.random() * 15 }
            ]
        }));

        const adminsData = [
            { fullName: 'Studio Owner', email: 'admin@studio.com', role: UserRole.ADMIN, passwordHash }
        ];

        const instructors = await UserModel.insertMany(instructorsData.map(u => ({ ...u, passwordHash })));
        const members = await UserModel.insertMany(membersData);
        const admin = await UserModel.findOne({ role: UserRole.ADMIN }) || await UserModel.create(adminsData[0]);

        console.log(`Seeded ${instructors.length} instructors, ${members.length} members, and 1 admin.`);

        // 2. Seed Memberships
        console.log('Seeding Memberships...');
        const memberships = await MembershipModel.insertMany(members.slice(0, 12).map((member, i) => ({
            user: member._id,
            type: getRandomItem(Object.values(PlanType)),
            startDate: new Date(),
            endDate: i % 2 === 0 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 * 12) : undefined,
            isActive: true
        })));
        console.log(`Seeded ${memberships.length} memberships.`);

        // 3. Seed Class Sessions
        console.log('Seeding Classes...');
        const classTitles = ['Sunrise Yoga', 'Power Pilates', 'HIIT Blast', 'Iron Strength', 'Cardio Burn', 'Evening Flow', 'Core Crusher', 'Mobility Workshop'];
        const locations = ['Studio A', 'Studio B', 'Virtual Room', 'Outdoor Park'];

        const classes = [];
        for (let i = 0; i < 20; i++) {
            const instructor = getRandomItem(instructors);
            const startTime = new Date();
            startTime.setDate(startTime.getDate() + (i % 7)); // Spread over next 7 days
            startTime.setHours(8 + (i % 10), 0, 0, 0);

            const endTime = new Date(startTime);
            endTime.setHours(startTime.getHours() + 1);

            classes.push({
                title: `${getRandomItem(classTitles)} with ${instructor.fullName.split(' ')[0]}`,
                description: 'Join us for an amazing workout experience!',
                type: getRandomItem(Object.values(ClassType)),
                instructor: instructor._id,
                startTime,
                endTime,
                capacity: 15 + Math.floor(Math.random() * 15),
                location: getRandomItem(locations),
                enrolledCount: 0
            });
        }
        const seededClasses = await ClassSessionModel.insertMany(classes);
        console.log(`Seeded ${seededClasses.length} class sessions.`);

        // 4. Seed Bookings
        console.log('Seeding Bookings...');
        const bookings = [];
        for (const cls of seededClasses) {
            const maxBookings = Math.min(cls.capacity - 2, members.length);
            const numBookings = Math.floor(Math.random() * (maxBookings - 3)) + 3;
            cls.enrolledCount = numBookings;
            await cls.save();

            const shuffledMembers = [...members].sort(() => 0.5 - Math.random());
            for (let i = 0; i < numBookings; i++) {
                bookings.push({
                    user: shuffledMembers[i]._id,
                    classSession: cls._id,
                    status: i < 2 ? BookingStatus.CHECKED_IN : BookingStatus.CONFIRMED,
                    bookedAt: new Date(cls.startTime.getTime() - (24 * 60 * 60 * 1000 * Math.random())),
                    qrCode: `QR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
                });
            }
        }
        await BookingModel.insertMany(bookings);
        console.log(`Seeded ${bookings.length} bookings.`);

        // 5. Seed Workout Templates
        console.log('Seeding Workout Templates...');
        const templates = [
            { name: 'Push Day Alpha', description: 'Focus on chest, shoulders, and triceps with compound movements.', category: 'STRENGTH', difficulty: 'INTERMEDIATE', exercises: [{ name: 'Bench Press', sets: 4, reps: 10, weight: 60 }, { name: 'Shoulder Press', sets: 3, reps: 12, weight: 40 }] },
            { name: 'Pull Day Beta', description: 'Targeting back and biceps for a balanced upper body pull session.', category: 'STRENGTH', difficulty: 'INTERMEDIATE', exercises: [{ name: 'Deadlift', sets: 3, reps: 5, weight: 100 }, { name: 'Lat Pulldown', sets: 4, reps: 10, weight: 50 }] },
            { name: 'Leg Destroyer', description: 'A high-volume lower body workout for serious strength gains.', category: 'STRENGTH', difficulty: 'ADVANCED', exercises: [{ name: 'Squats', sets: 5, reps: 8, weight: 80 }, { name: 'Leg Press', sets: 3, reps: 15, weight: 120 }] },
            { name: 'Beginner HIIT', description: 'Quick intervals to get your heart rate up and burn calories fast.', category: 'HIIT', difficulty: 'BEGINNER', exercises: [{ name: 'Jumping Jacks', sets: 4, reps: 0, duration: 45 }, { name: 'Burpees', sets: 4, reps: 0, duration: 30 }] },
            { name: 'Recovery Flow', description: 'Gentle movements to improve mobility and speed up recovery.', category: 'FLEXIBILITY', difficulty: 'BEGINNER', exercises: [{ name: 'Cat Cow', sets: 3, reps: 0, duration: 60 }, { name: 'Childs Pose', sets: 1, reps: 0, duration: 180 }] }
        ];

        const seededTemplates = await WorkoutTemplate.insertMany(templates.map(t => ({ ...t, createdBy: admin._id, isPublic: true })));
        console.log(`Seeded ${seededTemplates.length} workout templates.`);

        // 6. Seed Workout Logs
        console.log('Seeding Workout Logs...');
        const logs = members.slice(0, 5).map(member => ({
            user: member._id,
            title: 'Logged Workout',
            date: new Date(),
            durationMinutes: 45 + Math.floor(Math.random() * 45),
            exercises: [
                { name: 'Bench Press', sets: [{ reps: 10, weight: 50 }, { reps: 8, weight: 55 }] }
            ]
        }));
        await WorkoutLogModel.insertMany(logs);
        console.log(`Seeded ${logs.length} workout logs.`);

        // 7. Seed Ratings
        console.log('Seeding Ratings...');
        const ratings = [];
        for (let i = 0; i < 15; i++) {
            const member = getRandomItem(members);
            const isInstructorRating = Math.random() > 0.5;
            const target = isInstructorRating ? getRandomItem(instructors) : getRandomItem(seededClasses);

            ratings.push({
                user: member._id,
                targetType: isInstructorRating ? 'INSTRUCTOR' : 'CLASS',
                targetId: target._id,
                rating: 4 + Math.floor(Math.random() * 2),
                review: 'Absolutely loved the session! Very professional and helpful.'
            });
        }
        // Filter out duplicates based on index
        const uniqueRatings = ratings.filter((v, i, a) => a.findIndex(t => t.user.toString() === v.user.toString() && t.targetId.toString() === v.targetId.toString()) === i);
        await RatingModel.insertMany(uniqueRatings);
        console.log(`Seeded ${uniqueRatings.length} ratings.`);

        console.log('\n--- SEEDING COMPLETE ---');
        process.exit(0);
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
};

seed();
