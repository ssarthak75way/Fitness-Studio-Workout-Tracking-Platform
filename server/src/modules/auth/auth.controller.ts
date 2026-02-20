import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { loginSchema, registerSchema } from './auth.schema';

export const registerHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = registerSchema.safeParse(req);
    if (!result.success) return next(result.error);

    const { user, token } = await AuthService.register(result.data.body);

    res.status(201).json({
      status: 'success',
      token,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const loginHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = loginSchema.safeParse(req);
    if (!result.success) return next(result.error);

    const { user, token } = await AuthService.login(result.data.body);

    res.status(200).json({
      status: 'success',
      token,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const impersonateHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = (req.user?._id as any)?.toString() || '';
    const targetUserId = req.params.userId;

    const { user, token } = await AuthService.impersonateUser(adminId, targetUserId);

    // Notify the user
    const { NotificationService } = await import('../notifications/notification.service');
    await NotificationService.createNotification(
      targetUserId,
      'IMPERSONATION_STARTED',
      'A Studio Admin has started a support session by impersonating your account. All actions are logged.'
    );

    res.status(200).json({
      status: 'success',
      token,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const stopImpersonationHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.realUser) {
      return next(new AppError('You are not in an impersonation session', 400));
    }

    // Re-generate Admin token
    const token = jwt.sign(
      { id: req.realUser._id, role: req.realUser.role },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      status: 'success',
      token,
      data: { user: req.realUser },
    });
  } catch (error) {
    next(error);
  }
};

// Add missing AppError and jwt imports if needed, but they should be in the file or we can use AuthService to sign
import jwt from 'jsonwebtoken';
import { AppError } from '../../utils/AppError';