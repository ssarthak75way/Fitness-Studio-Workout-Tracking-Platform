import { z } from 'zod';

// Register Schema
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    role: z.enum(['STUDIO_ADMIN', 'INSTRUCTOR', 'MEMBER']).optional().default('MEMBER'),
  }),
});

// Login Schema
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// Update Password Schema
export const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>['body'];