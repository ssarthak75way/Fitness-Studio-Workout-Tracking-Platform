import { NotificationModel } from './notification.model.js';

export const NotificationService = {
     //Create a notification
    createNotification: async (
        userId: string,
        type: string,
        message: string,
        relatedClass?: string
    ) => {
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
        type: string,
        message: string,
        relatedClass?: string
    ) => {
        const notifications = userIds.map(userId => ({
            user: userId,
            type,
            message,
            relatedClass,
        }));

        await NotificationModel.insertMany(notifications);
        console.log(`📱 Bulk notifications sent to ${userIds.length} users: ${message}`);
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
