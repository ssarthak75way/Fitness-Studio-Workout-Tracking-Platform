import { Router } from 'express';
import { protect, restrictTo } from '../../middlewares/auth.middleware';
import * as userController from './user.controller';

const router = Router();

// All routes require authentication
router.use(protect);

// Admin routes
router.get('/', restrictTo('STUDIO_ADMIN'), userController.getAllUsers);

import { uploadProfile } from '../../middlewares/upload.middleware';

// User profile
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.post('/profile-image', uploadProfile.single('profileImage'), userController.uploadProfileImage);
router.patch('/password', userController.updatePassword);

// Instructors
router.get('/instructors', userController.getInstructors);
router.get('/instructors/:id', userController.getInstructorProfile);

router.patch('/:id/toggle-status', restrictTo('STUDIO_ADMIN'), userController.toggleUserStatus);

export default router;