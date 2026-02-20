import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });
import { UserModel, UserRole } from '../modules/users/user.model.js';

async function test() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const instructors = await UserModel.find({ role: UserRole.INSTRUCTOR });
  console.log('Instructors:', instructors.map(i => i.email));
  process.exit(0);
}
test();
