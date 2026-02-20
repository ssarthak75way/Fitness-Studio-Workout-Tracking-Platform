import { Router } from 'express';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';
import * as studioController from './studio.controller.js';

const router = Router();

// Publicly available studios list (or at least for authenticated users)
router.get('/', protect, studioController.getAllStudiosHandler);
router.get('/:id', protect, studioController.getStudioByIdHandler);

// Admin only management
router.post('/', protect, restrictTo('STUDIO_ADMIN'), studioController.createStudioHandler);
router.patch('/:id', protect, restrictTo('STUDIO_ADMIN'), studioController.updateStudioHandler);
router.delete('/:id', protect, restrictTo('STUDIO_ADMIN'), studioController.deleteStudioHandler);

// Financial Reconciliation Routes
router.get('/:id/reconciliation', protect, restrictTo('STUDIO_ADMIN'), studioController.getReconciliationReportHandler);

export default router;
