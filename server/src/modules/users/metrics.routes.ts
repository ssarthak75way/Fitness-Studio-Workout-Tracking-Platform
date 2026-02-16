import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { addBodyMetricsHandler, getBodyMetricsHandler } from './metrics.controller.js';

const router = Router();

router.use(protect);

router.post('/', addBodyMetricsHandler);
router.get('/', getBodyMetricsHandler);

export default router;