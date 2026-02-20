import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { UserModel, UserRole } from '../modules/users/user.model.js';
import { NotificationService } from '../modules/notifications/notification.service.js';
import { NotificationModel } from '../modules/notifications/notification.model.js';

async function runTest8() {
    await mongoose.connect(process.env.MONGODB_URI!);
    try {
        console.log('--- TEST 8: Notification Quiet Hours ---');

        // Find a member
        const member = await UserModel.findOne({ role: UserRole.MEMBER });
        if (!member) throw new Error('No member found for test');

        console.log(`Setting quiet hours for user: ${member.email}`);

        // Current UTC time
        const nowUTC = new Date();
        const hour = nowUTC.getUTCHours();

        // Define quiet range that definitely contains "now" in UTC
        const startHour = (hour - 1 + 24) % 24;
        const endHour = (hour + 1) % 24;

        const quietStart = `${startHour.toString().padStart(2, '0')}:00`;
        const quietEnd = `${endHour.toString().padStart(2, '0')}:00`;

        console.log(`Current UTC Hour: ${hour}`);
        console.log(`Setting Quiet Hours: ${quietStart} to ${quietEnd} (UTC)`);

        await UserModel.findByIdAndUpdate(member._id, {
            timezone: 'UTC',
            notificationPreferences: [
                {
                    category: 'CLASS_REMINDER',
                    quietHoursStart: quietStart,
                    quietHoursEnd: quietEnd,
                    enabled: true
                }
            ]
        });

        // 1. Attempt notification inside quiet hours
        console.log('Attempting to send CLASS_REMINDER during quiet hours...');
        const resultQuiet = await NotificationService.createNotification(
            member._id.toString(),
            'CLASS_REMINDER',
            'This should be suppressed'
        );

        if (resultQuiet === null) {
            console.log('SUCCESS: Notification suppressed during quiet hours.');
        } else {
            console.error('FAIL: Notification was NOT suppressed during quiet hours!');
        }

        // 2. Attempt notification outside quiet hours
        const loudStart = `${(hour + 2) % 24}:00`;
        const loudEnd = `${(hour + 4) % 24}:00`;
        console.log(`Updating Quiet Hours to ${loudStart} to ${loudEnd} (UTC) to test loud period...`);

        await UserModel.findByIdAndUpdate(member._id, {
            'notificationPreferences.0.quietHoursStart': loudStart,
            'notificationPreferences.0.quietHoursEnd': loudEnd
        });

        console.log('Attempting to send CLASS_REMINDER outside quiet hours...');
        const resultLoud = await NotificationService.createNotification(
            member._id.toString(),
            'CLASS_REMINDER',
            'This should be delivered'
        );

        if (resultLoud !== null) {
            console.log('SUCCESS: Notification delivered outside quiet hours.');
            // Cleanup: delete the test notification
            await NotificationModel.findByIdAndDelete(resultLoud._id);
        } else {
            console.error('FAIL: Notification was suppressed outside quiet hours!');
        }

    } catch (err: any) {
        console.error('TEST 8 ERROR:', err.message);
    } finally {
        process.exit(0);
    }
}

runTest8();
