import { NotificationModel } from './notification.model.js';
import { UserModel } from '../users/user.model.js';
import { isWithinQuietHours } from '../../utils/time.utils.js';


export const NotificationService = {
    //Create a notification
    createNotification: async (
        userId: string,
        type: 'CLASS_REMINDER' | 'CLASS_CANCELLED' | 'WAITLIST_NOTIFICATION' | 'PROMOTION' | 'BOOKING_CONFIRMATION' | 'IMPERSONATION_STARTED' | 'CERT_EXPIRY',
        message: string,
        relatedClass?: string
    ) => {
        // Check quiet hours preferences
        const user = await UserModel.findById(userId).select('timezone notificationPreferences');
        if (user && user.notificationPreferences) {
            const preference = user.notificationPreferences.find(p => p.category === type);
            if (preference?.enabled && preference.quietHoursStart && preference.quietHoursEnd) {
                if (isWithinQuietHours(user.timezone || 'UTC', preference.quietHoursStart, preference.quietHoursEnd)) {
                    console.log(`🔇 Notification suppressed for user ${userId} due to quiet hours (${type}).`);
                    return null; // Suppress notification
                }
            }
        }

        const notification = await NotificationModel.create({
            user: userId,
            type,
            message,
            relatedClass,
        });


        // TODO: Integrate with push notification service (Firebase/OneSignal)
        console.log(`📱 Notification sent to user ${userId}: ${message}`);

        return notification;
    },

    // Get user notifications
    getUserNotifications: async (userId: string) => {
        return NotificationModel.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(50);
    },

    // Mark notification as read
    markAsRead: async (notificationId: string, userId: string) => {
        return NotificationModel.findOneAndUpdate(
            { _id: notificationId, user: userId },
            { isRead: true },
            { new: true }
        );
    },

    // Send notification to multiple users
    sendBulkNotification: async (
        userIds: string[],
        type: 'CLASS_REMINDER' | 'CLASS_CANCELLED' | 'WAITLIST_NOTIFICATION' | 'PROMOTION' | 'BOOKING_CONFIRMATION' | 'IMPERSONATION_STARTED' | 'CERT_EXPIRY',
        message: string,
        relatedClass?: string
    ) => {
        // Fetch all users to check preferences
        const users = await UserModel.find({ _id: { $in: userIds } }).select('timezone notificationPreferences');

        const eligibleUserIds = users.filter(user => {
            if (!user.notificationPreferences) return true;

            const preference = user.notificationPreferences.find(p => p.category === type);
            if (preference?.enabled && preference.quietHoursStart && preference.quietHoursEnd) {
                if (isWithinQuietHours(user.timezone || 'UTC', preference.quietHoursStart, preference.quietHoursEnd)) {
                    return false; // Suppress
                }
            }
            return true; // Eligible
        }).map(u => u._id.toString());

        if (eligibleUserIds.length === 0) {
            console.log(`🔇 Bulk notifications (${type}) suppressed for all ${userIds.length} users due to quiet hours.`);
            return;
        }

        const notifications = eligibleUserIds.map(userId => ({
            user: userId,
            type,
            message,
            relatedClass,
        }));

        await NotificationModel.insertMany(notifications);
        console.log(`📱 Bulk notifications sent to ${eligibleUserIds.length} users (${userIds.length - eligibleUserIds.length} suppressed): ${message}`);
    },


    /**
     * Mark all as read
     */
    markAllAsRead: async (userId: string) => {
        return NotificationModel.updateMany(
            { user: userId, isRead: false },
            { isRead: true }
        );
    },
};
