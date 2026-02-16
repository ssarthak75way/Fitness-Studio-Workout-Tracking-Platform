import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, IUser, UserRole } from '../users/user.model';
import { RegisterInput, LoginInput } from './auth.schema'; // We need to define LoginInput
import { AppError } from '../../utils/AppError'; // Assume a simple error class wrapper
import logger from '../../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRES_IN = '1d';

export const AuthService = {
  register: async (input: RegisterInput): Promise<{ user: IUser; token: string }> => {
    const existingUser = await UserModel.findOne({ email: input.email });
    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const newUser = await UserModel.create({
      ...input,
      passwordHash,
    });

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return { user: newUser, token };
  },

  // Login user
  login: async (input: LoginInput): Promise<{ user: IUser; token: string }> => {
    logger.debug('Login Attempt: email=%s', input.email);
    const user = await UserModel.findOne({ email: input.email }).select('+passwordHash'); // explicitly select password

    if (!user) {
      logger.debug('Login Failure: User not found for email=%s', input.email);
      throw new AppError('Invalid email or password', 401);
    }

    logger.debug('Login Debug: hasHash=%s, hashPrefix=%s', !!user.passwordHash, user.passwordHash?.substring(0, 10));

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    logger.debug('Login Debug: isMatch=%s', isMatch);

    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return { user, token };
  },

  updatePassword: async (userId: string, input: { currentPassword: string, newPassword: string }): Promise<void> => {
    const user = await UserModel.findById(userId).select('+passwordHash');
    if (!user) {
      logger.error('UpdatePassword Debug: User NOT found %s', userId);
      throw new AppError('User not found', 404);
    }

    logger.debug('UpdatePassword Debug: userId=%s, hasHash=%s, inputPassLength=%d, storedHashPrefix=%s',
      userId, !!user.passwordHash, input.currentPassword?.length, user.passwordHash?.substring(0, 10));

    const isMatch = await bcrypt.compare(input.currentPassword, user.passwordHash);
    logger.debug('UpdatePassword Debug: isMatch = %s', isMatch);

    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401);
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(input.newPassword, salt);
    await user.save();
  },
};