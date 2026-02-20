import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../modules/users/user.model';
import { AppError } from '../utils/AppError';
import { AuditLogModel } from '../modules/audit/auditLog.model';

const getJwtSecret = () => process.env.JWT_SECRET || 'supersecretkey';

interface JwtPayload {
  id: string;
  role: string;
  adminId?: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    // 2. Verify token
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;

    // 3. Check if user still exists
    const currentUser = await UserModel.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 4. Grant Access & Attach User to Request
    req.user = currentUser;

    // 5. Check if it's an impersonation token
    if (decoded.adminId) {
      const adminUser = await UserModel.findById(decoded.adminId);
      if (adminUser) {
        req.realUser = adminUser;

        // Automatically log impersonated actions
        await AuditLogModel.create({
          adminId: adminUser._id,
          impersonatedUserId: currentUser._id,
          action: `${req.method} ${req.path}`,
          method: req.method,
          path: req.path,
          payload: req.method !== 'GET' ? req.body : undefined,
        });
      }
    }

    next();
  } catch (error: unknown) {
    console.error('JWT VERIFY FAILED. Error:', (error as Error).message);
    console.error('Token causing error:', req.headers.authorization);
    return next(new AppError('Invalid Token', 401));
  }
};

// Role-Based Access Control (RBAC)
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // We can assume req.user is set because 'protect' runs first
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Removed separate auditLog middleware as it's now integrated into protect