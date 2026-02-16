
import mongoose from 'mongoose';
import { UserModel } from '../modules/users/user.model.js';
import { MembershipModel } from '../modules/memberships/membership.model.js';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-studio';
        await mongoose.connect(mongoUri);
        console.log('Connected to DB');

        const userId = '6993206d4704e34ea5c63e06';

        console.log(`Checking User: ${userId}`);
        const user = await UserModel.findById(userId);
        console.log('User found:', user);

        console.log(`Checking Memberships for User: ${userId}`);
        const memberships = await MembershipModel.find({ user: userId });
        console.log('Memberships found:', JSON.stringify(memberships, null, 2));

        console.log('Checking ALL memberships (limit 5):');
        const allMemberships = await MembershipModel.find().limit(5);
        console.log('Sample memberships:', JSON.stringify(allMemberships, null, 2));

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
