import { ClassSessionModel } from '../modules/classes/class.model.js';
import { BookingModel, BookingStatus } from '../modules/bookings/booking.model.js';
import { NotificationService } from '../modules/notifications/notification.service.js';
import { addHours, subHours } from 'date-fns';

/**
 * Job to send reminders for classes starting in 24 hours
 */
export const runReminderJob = async () => {
    try {
        console.log('Running Class Reminder Job...');

        const tomorrow = addHours(new Date(), 24);
        const windowStart = subHours(tomorrow, 1);
        const windowEnd = addHours(tomorrow, 1);

        // Find classes starting in roughly 24 hours
        const classes = await ClassSessionModel.find({
            startTime: { $gte: windowStart, $lte: windowEnd },
            isCancelled: false
        });

        for (const session of classes) {
            // Find confirmed bookings
            const bookings = await BookingModel.find({
                classSession: session._id,
                status: BookingStatus.CONFIRMED
            });

            const userIds = bookings.map(b => b.user.toString());

            if (userIds.length > 0) {
                await NotificationService.sendBulkNotification(
                    userIds,
                    'CLASS_REMINDER',
                    `Reminder: Your class "${session.title}" starts in 24 hours at ${session.startTime.toLocaleTimeString()}!`,
                    session._id.toString()
                );
            }
        }

        console.log(`Reminder job finished. Processed ${classes.length} classes.`);
    } catch (error) {
        console.error('Error in reminder job:', error);
    }
};

// Start job every hour
setInterval(runReminderJob, 60 * 60 * 1000);
