import { Router } from 'express';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';
import {
  createClassHandler,
  getClassesHandler,
  getClassByIdHandler,
  updateClassHandler,
  deleteClassHandler,
  cancelClassHandler,
} from './class.controller.js';

const router = Router();

// Public routes
router.get('/', getClassesHandler);
router.get('/:id', getClassByIdHandler);

// Protected routes (Instructor and Admin only)
router.use(protect);
router.post('/', restrictTo('STUDIO_ADMIN', 'INSTRUCTOR'), createClassHandler);
router.patch('/:id', restrictTo('STUDIO_ADMIN', 'INSTRUCTOR'), updateClassHandler);
router.delete('/:id', restrictTo('STUDIO_ADMIN', 'INSTRUCTOR'), deleteClassHandler);
router.patch('/:id/cancel', restrictTo('STUDIO_ADMIN', 'INSTRUCTOR'), cancelClassHandler);

export default router;