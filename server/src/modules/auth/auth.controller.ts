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