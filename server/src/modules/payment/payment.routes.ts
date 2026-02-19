import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { getMyPaymentsHandler, getPaymentDetailsHandler } from './payment.controller.js';

const router = Router();

router.use(protect);

router.get('/my-payments', getMyPaymentsHandler);
router.get('/:id', getPaymentDetailsHandler);

export default router;
