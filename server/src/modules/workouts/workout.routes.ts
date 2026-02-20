import { Router } from 'express';
import { protect, restrictTo } from '../../middlewares/auth.middleware';
import * as workoutController from './workout.controller';

const router = Router();

// All routes require authentication
router.use(protect);

// Workout logging
router.post('/', workoutController.logWorkout);
router.get('/history', workoutController.getWorkoutHistory);
router.get('/records', workoutController.getPersonalRecords);
router.get('/streak', workoutController.getWorkoutStreak);
router.get('/analytics', workoutController.getAnalytics);
router.get('/plateaus', workoutController.getPlateaus);

// Workout templates
router.get('/templates', workoutController.getTemplates);
router.post('/templates', restrictTo('INSTRUCTOR', 'STUDIO_ADMIN'), workoutController.createTemplate);
router.get('/templates/:id', workoutController.getTemplateById);
router.put('/templates/:id', restrictTo('INSTRUCTOR', 'STUDIO_ADMIN'), workoutController.updateTemplate);
router.delete('/templates/:id', restrictTo('INSTRUCTOR', 'STUDIO_ADMIN'), workoutController.deleteTemplate);

export default router;