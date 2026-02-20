import { Router } from 'express';
import { registerHandler, loginHandler, impersonateHandler, stopImpersonationHandler } from './auth.controller.js';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);

// Admin Impersonation Routes
router.post('/impersonate/:userId', protect, restrictTo('STUDIO_ADMIN'), impersonateHandler);
router.post('/stop-impersonation', protect, stopImpersonationHandler);

export default router;

