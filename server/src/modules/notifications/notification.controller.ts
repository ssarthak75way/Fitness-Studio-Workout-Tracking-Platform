import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service.js';

export const getNotificationsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;
        const notifications = await NotificationService.getUserNotifications(userId!.toString());

        res.status(200).json({
            status: 'success',
            results: notifications.length,
            data: { notifications },
        });
    } catch (error) {
        next(error);
    }
};

export const markAsReadHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const notification = await NotificationService.markAsRead(id, userId!.toString());

        res.status(200).json({
            status: 'success',
            data: { notification },
        });
    } catch (error) {
        next(error);
    }
};

export const markAllAsReadHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;
        await NotificationService.markAllAsRead(userId!.toString());

        res.status(200).json({
            status: 'success',
            message: 'All notifications marked as read',
        });
    } catch (error) {
        next(error);
    }
};
