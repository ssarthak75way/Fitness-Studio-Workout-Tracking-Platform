import { IUser } from '../../modules/users/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Attach the full user model or just the payload
    }
  }
}