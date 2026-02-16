import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { createMembershipHandler, getMembershipHandler } from './membership.controller.js';

const router = Router();

router.use(protect);
import { restrictTo } from '../../middlewares/auth.middleware.js';

router.post('/', restrictTo('STUDIO_ADMIN'), createMembershipHandler);
router.get('/my-membership', getMembershipHandler);

export default router;
