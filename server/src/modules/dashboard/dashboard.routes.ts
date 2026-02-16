import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { getDashboardStatsHandler } from './dashboard.controller.js';

const router = Router();

router.use(protect);

router.get('/', getDashboardStatsHandler);

export default router;
