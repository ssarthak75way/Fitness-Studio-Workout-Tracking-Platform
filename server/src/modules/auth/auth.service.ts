import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, IUser, UserRole } from '../users/user.model';
import { RegisterInput, LoginInput } from './auth.schema'; // We need to define LoginInput
import { AppError } from '../../utils/AppError'; // Assume a simple error class wrapper

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRES_IN = '1d';

export const AuthService = {
  /**
   * Register a new user
   */
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

  /**
   * Login user
   */
  login: async (input: LoginInput): Promise<{ user: IUser; token: string }> => {
    const user = await UserModel.findOne({ email: input.email }).select('+passwordHash'); // explicitly select password
    
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return { user, token };
  },
};