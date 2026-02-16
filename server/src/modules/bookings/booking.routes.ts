import { Router } from 'express';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';
import {
    createBookingHandler,
    getUserBookingsHandler,
    cancelBookingHandler,
    checkInHandler,
    getClassBookingsHandler,
    manualCheckInHandler,
} from './booking.controller.js';

const router = Router();

router.use(protect);

router.post('/', createBookingHandler);
router.get('/my-bookings', getUserBookingsHandler);
router.patch('/:id/cancel', cancelBookingHandler);
router.post('/check-in', restrictTo('STUDIO_ADMIN', 'INSTRUCTOR'), checkInHandler);
router.get('/class/:classSessionId', restrictTo('STUDIO_ADMIN', 'INSTRUCTOR'), getClassBookingsHandler);
router.post('/:id/manual-check-in', restrictTo('STUDIO_ADMIN', 'INSTRUCTOR'), manualCheckInHandler);

export default router;