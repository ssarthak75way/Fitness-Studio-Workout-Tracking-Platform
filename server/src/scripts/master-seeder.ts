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
import { StudioModel } from '../modules/studios/studio.model.js';
import { CorporateAccountModel } from '../modules/memberships/corporate-account.model.js';
import { ReconciliationLogModel } from '../modules/studios/reconciliation-log.model.js';
import { ExerciseGroupModel } from '../modules/workouts/exercise-group.model.js';
import { PeriodizedProgramModel, PhaseType } from '../modules/workouts/periodized-program.model.js';
import { NotificationModel } from '../modules/notifications/notification.model.js';
import { AuditLogModel } from '../modules/audit/auditLog.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const hashPassword = async (password: string) => bcrypt.hash(password, 12);
const getRandomItem = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

const seed = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected! Initiating full wipe...');

        // 0. Wipe Database
        await Promise.all([
            UserModel.deleteMany({ email: { $ne: 'admin@studio.com' } }),
            ClassSessionModel.deleteMany({}),
            MembershipModel.deleteMany({}),
            BookingModel.deleteMany({}),
            WorkoutTemplate.deleteMany({}),
            WorkoutLogModel.deleteMany({}),
            RatingModel.deleteMany({}),
            StudioModel.deleteMany({}),
            CorporateAccountModel.deleteMany({}),
            ReconciliationLogModel.deleteMany({}),
            ExerciseGroupModel.deleteMany({}),
            PeriodizedProgramModel.deleteMany({}),
            NotificationModel.deleteMany({}),
            AuditLogModel.deleteMany({})
        ]);

        const passwordHash = await hashPassword('password123');
        const admin = await UserModel.findOne({ role: UserRole.ADMIN }) || await UserModel.create({ fullName: 'Studio Admin', email: 'admin@studio.com', role: UserRole.ADMIN, passwordHash });

        // 1. Seed Studios (Feature: Cross-Location)
        console.log('Seeding Studios...');
        const studios = await StudioModel.insertMany([
            { name: 'Studio East', location: { type: 'Point', lat: 40.73, lng: -73.98 }, address: '123 East St', dropInRate: 25, isActive: true },
            { name: 'Studio West', location: { type: 'Point', lat: 40.71, lng: -74.01 }, address: '456 West Blvd', dropInRate: 30, isActive: true }
        ]);

        // 2. Seed Corporate Accounts (Feature: Corporate Wellness)
        console.log('Seeding Corporate Accounts...');
        const corpAccounts = await CorporateAccountModel.insertMany([
            { name: 'Acme Corp', billingContactEmail: 'hr@acmecorp.com', monthlyCapPerEmployee: 5, pricePerEmployee: 100, billingCycleDay: 1, isActive: true }
        ]);

        // 3. Seed Users
        console.log('Seeding Users...');
        const instructorsData = [
            { fullName: 'Alex Rivers', email: 'alex@studio.com', role: UserRole.INSTRUCTOR, certifications: [{ name: 'RYT 500', expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) }] }, // Expiry testing
            { fullName: 'Sarah Chen', email: 'sarah@studio.com', role: UserRole.INSTRUCTOR, certifications: [{ name: 'NASM CPT', expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }] }
        ];

        let membersData = Array.from({ length: 8 }).map((_, i) => ({
            fullName: `Member ${i + 1}`,
            email: `member${i + 1}@example.com`,
            role: UserRole.MEMBER,
            passwordHash,
            preferredUnit: i % 2 === 0 ? 'METRIC' : 'IMPERIAL' // Unit Conversion testing
        }));

        const instructors = await UserModel.insertMany(instructorsData.map(u => ({ ...u, passwordHash })));
        const members = await UserModel.insertMany(membersData);

        // 4. Seed Memberships (Cross-Location & Corporate)
        console.log('Seeding Memberships...');
        const parsedMemberships = members.map((member, i) => {
            if (i === 0) { // Corporate Member
                return { user: member._id, type: PlanType.CORPORATE, homeStudio: studios[0]._id, corporateAccountId: corpAccounts[0]._id, creditsRemaining: 5, billingCycleRenewalDate: new Date(Date.now() - 24 * 60 * 60 * 1000), isActive: true }; // Trigger Lazy Reset
            } else if (i === 1) { // Cross-loc Member
                return { user: member._id, type: PlanType.MONTHLY, homeStudio: studios[0]._id, isActive: true };
            } else {
                return { user: member._id, type: PlanType.CLASS_PACK_10, homeStudio: studios[i % 2 === 0 ? 0 : 1]._id, creditsRemaining: 10, isActive: true };
            }
        });
        await MembershipModel.insertMany(parsedMemberships);

        // 5. Seed Class Sessions (Double-Booking Prevention)
        console.log('Seeding Classes...');
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(10, 0, 0, 0);
        const classes = await ClassSessionModel.insertMany([
            { title: 'Morning HIIT', type: ClassType.HIIT, instructor: instructors[0]._id, studio: studios[0]._id, startTime: tomorrow, endTime: new Date(tomorrow.getTime() + 3600000), capacity: 5, enrolledCount: 2 },
            { title: 'Evening Yoga', type: ClassType.YOGA, instructor: instructors[1]._id, studio: studios[1]._id, startTime: tomorrow, endTime: new Date(tomorrow.getTime() + 3600000), capacity: 1, enrolledCount: 1 }
        ]);

        // 6. Seed Bookings & Reconciliation Logs (Cross-Location Check-In)
        console.log('Seeding Bookings & Cross-Location Financial Tracking...');
        const memberTwo = members[1]; // Home Studio: East
        const classWest = classes[1]; // Host Studio: West

        const booking = await BookingModel.create({
            user: memberTwo._id,
            classSession: classWest._id,
            status: BookingStatus.CHECKED_IN, // Checked In triggers reconciliation
            qrCode: 'TEST-QR'
        });

        await ReconciliationLogModel.create({
            booking: booking._id,
            user: memberTwo._id,
            homeStudio: studios[0]._id,
            hostStudio: classWest.studio, // West
            amount: studios[1].dropInRate, // 30
            description: `Cross-location attendance seeded test.`
        });

        // 7. Seed Waitlist (Penalty Waiver logic testing)
        await BookingModel.insertMany([
            { user: members[2]._id, classSession: classWest._id, status: BookingStatus.CONFIRMED },
            { user: members[3]._id, classSession: classWest._id, status: BookingStatus.WAITLISTED } // Should atomically promote if #2 cancels
        ]);

        // 8. Seed Exercise Groups (Plateau Detection)
        console.log('Seeding Plateau Tracking & Periodization...');
        const groups = await ExerciseGroupModel.insertMany([
            { name: 'Horizontal Push', exerciseNames: ['Bench Press', 'Dumbbell Press', 'Chest Press'], suggestions: 'Try Incline Press or a deload week' },
            { name: 'Vertical Pull', exerciseNames: ['Pull-up', 'Lat Pulldown'], suggestions: 'Focus on Chin-ups or Single Arm Rows' },
            { name: 'Squat Pattern', exerciseNames: ['Barbell Squat', 'Goblet Squat'], suggestions: 'Substitute with Front Squat or Leg Press' }
        ]);

        // Seed 4 consecutive identical logs to trigger Plateau
        const plateauMember = members[4];
        for (let i = 0; i < 4; i++) {
            await WorkoutLogModel.create({
                user: plateauMember._id,
                title: `Plateau Test Day ${i + 1}`,
                date: new Date(Date.now() - (4 - i) * 86400000),
                durationMinutes: 60,
                exercises: [{ name: 'Bench Press', sets: [{ weight: 100, reps: 5 }] }]
            });
        }

        // 9. Seed Ratings (Tamper-Resistant)
        console.log('Seeding Tamper-Resistant Ratings...');
        await RatingModel.insertMany([
            { user: members[0]._id, targetType: 'CLASS', targetId: classes[0]._id, rating: 5, review: 'Perfect' },
            { user: members[1]._id, targetType: 'CLASS', targetId: classes[0]._id, rating: 4, review: 'Good' },
            { user: members[2]._id, targetType: 'CLASS', targetId: classes[0]._id, rating: 1, review: 'Terrible! Outlier!' } // Will be trimmed
        ]);

        // 10. Seed Workout Templates
        console.log('Seeding Workout Templates...');
        const templates = await WorkoutTemplate.insertMany([
            {
                name: 'Hypertrophy Mastery: Push Day',
                description: 'High volume push workout optimized for muscle growth.',
                category: 'STRENGTH',
                difficulty: 'INTERMEDIATE',
                exercises: [
                    { name: 'Bench Press', sets: 4, reps: 10, weight: 60, notes: 'Focus on full range of motion' },
                    { name: 'Overhead Press', sets: 3, reps: 12, weight: 40 },
                    { name: 'Triceps Pushdown', sets: 3, reps: 15, weight: 20 }
                ],
                createdBy: instructors[0]._id,
                isPublic: true
            },
            {
                name: 'Full Body HIIT Blast',
                description: 'Explosive workout to maximize calorie burn.',
                category: 'HIIT',
                difficulty: 'ADVANCED',
                exercises: [
                    { name: 'Burpees', sets: 5, reps: 20, notes: 'Maximum intensity' },
                    { name: 'Mountain Climbers', sets: 5, reps: 40 },
                    { name: 'Jump Squats', sets: 5, reps: 15 }
                ],
                createdBy: instructors[1]._id,
                isPublic: true
            }
        ]);

        // 11. Seed Periodized Program
        console.log('Seeding Periodization Roadmap...');
        await PeriodizedProgramModel.create({
            user: plateauMember._id,
            startDate: new Date(Date.now() - 14 * 86400000), // Started 2 weeks ago
            currentWeek: 3,
            phases: [
                { type: PhaseType.HYPERTROPHY, startWeek: 1, endWeek: 4 },
                { type: PhaseType.STRENGTH, startWeek: 5, endWeek: 8 },
                { type: PhaseType.PEAKING, startWeek: 9, endWeek: 12 }
            ],
            isActive: true
        });

        // 12. Seed Body Metrics (Unit Conversion Testing)
        console.log('Seeding Body Metrics...');
        const metricMember = members[0];
        await UserModel.findByIdAndUpdate(metricMember._id, {
            metrics: [
                { weight: 80, height: 180, bodyFatPercentage: 15, updatedAt: new Date(Date.now() - 30 * 86400000) },
                { weight: 78, height: 180, bodyFatPercentage: 14, updatedAt: new Date() }
            ]
        });

        // 13. Seed Historical Notifications
        console.log('Seeding Notifications...');
        await NotificationModel.insertMany([
            { user: members[0]._id, type: 'CLASS_REMINDER', message: 'Reminder: Morning HIIT tomorrow at 10 AM', isRead: false },
            { user: instructors[0]._id, type: 'CERT_EXPIRY', message: 'Warning: Your RYT 500 certification expires in 15 days', isRead: false }
        ]);

        // 14. Seed Audit Logs for Admin
        console.log('Seeding Admin Audit Logs...');
        await AuditLogModel.create({
            adminId: admin._id,
            impersonatedUserId: members[0]._id,
            action: 'IMPERSONATION_START',
            method: 'POST',
            path: `/auth/impersonate/${members[0]._id}`,
            timestamp: new Date()
        });

        console.log('--- MASTER FIXTURES SEEDING COMPLETE ---');
        console.log('Login mapping:');
        console.log('Admin: admin@studio.com');
        console.log('Instructor (Near Expiry): alex@studio.com');
        console.log('Member (Corporate needs reset): member1@example.com');
        console.log('Member (Cross-location check-in): member2@example.com');
        console.log('Member (Plateaued Bench Press): member5@example.com');
        console.log('Password for all users: password123');

        process.exit(0);
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
};

seed();
