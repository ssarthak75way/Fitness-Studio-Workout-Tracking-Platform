import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { createMembershipOrderHandler, verifyMembershipPaymentHandler, getMembershipHandler, requestPlanChangeHandler } from './membership.controller.js';


const router = Router();

router.use(protect);
import { restrictTo } from '../../middlewares/auth.middleware.js';

router.post('/create-order', createMembershipOrderHandler);
router.post('/verify-payment', verifyMembershipPaymentHandler);
router.post('/change-plan', requestPlanChangeHandler);
router.get('/my-membership', getMembershipHandler);

export default router;

