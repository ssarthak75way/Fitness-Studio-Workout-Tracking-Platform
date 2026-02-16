import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import {
    getNotificationsHandler,
    markAsReadHandler,
    markAllAsReadHandler,
} from './notification.controller.js';

const router = Router();

router.use(protect);

router.get('/', getNotificationsHandler);
router.patch('/:id/read', markAsReadHandler);
router.patch('/mark-all-read', markAllAsReadHandler);

export default router;
