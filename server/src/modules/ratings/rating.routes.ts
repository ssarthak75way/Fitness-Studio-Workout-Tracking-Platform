import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { submitRatingHandler, getRatingsHandler } from './rating.controller.js';

const router = Router();

router.use(protect);

router.post('/', submitRatingHandler);
router.get('/', getRatingsHandler);

export default router;
