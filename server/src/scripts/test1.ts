import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { UserModel, UserRole } from '../modules/users/user.model.js';
import { AuditLogModel } from '../modules/audit/auditLog.model.js';
import { NotificationModel } from '../modules/notifications/notification.model.js';

const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' });

async function runTest1() {
    await mongoose.connect(process.env.MONGODB_URI!);
    try {
        const admins = await UserModel.find({ role: 'STUDIO_ADMIN' });
        const admin = admins[0];

        const members = await UserModel.find({ role: UserRole.MEMBER });
        const member = members[0];

        if (!admin || !member) {
            throw new Error('Admin or member not found. Run master seeder.');
        }

        console.log('--- TEST 1: Admin Impersonation & Audit Logging ---');

        // 1. Admin Login
        console.log(`Logging in as Admin: ${admin.email}`);
        const loginRes = await api.post('/auth/login', { email: admin.email, password: 'password123' });
        const adminToken = loginRes.data.token;

        // 2. Impersonate Member
        console.log(`Impersonating Member: ${member.email} (ID: ${member._id})`);
        const impRes = await api.post(`/auth/impersonate/${member._id}`, {}, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const impersonationToken = impRes.data.token;

        // 3. User Member Token for action
        console.log('Using impersonation token to fetch profile...');
        await api.get('/users/profile', {
            headers: { Authorization: `Bearer ${impersonationToken}` }
        });

        // 4. Verify Audit Log
        console.log('Verifying Audit Log creation...');
        // Wait a small bit for async log creation if it were async (it's awaited in middleware though)
        const auditLogs = await AuditLogModel.find({
            adminId: admin._id,
            impersonatedUserId: member._id
        });

        console.log('Found Logs count:', auditLogs.length);
        auditLogs.forEach(l => console.log(` - Action: ${l.action}, Path: ${l.path}`));

        const profileLog = auditLogs.find(l => l.path.includes('profile'));

        if (profileLog) {
            console.log('SUCCESS: Audit Log entry found for impersonated action.');
        } else {
            console.error('FAIL: No Audit Log entry found for path containing "profile"!');
        }

        // 5. Verify Notification to Member
        console.log('Verifying Notification to Member...');
        const notification = await NotificationModel.findOne({
            user: member._id,
            type: 'IMPERSONATION_STARTED'
        });

        if (notification) {
            console.log('SUCCESS: Notification sent to member about impersonation.');
        } else {
            console.error(`FAIL: Member was not notified! Current member notifications: ${await NotificationModel.countDocuments({ user: member._id })}`);
            const allNotes = await NotificationModel.find({ user: member._id });
            allNotes.forEach(n => console.log(` - Type: ${n.type}, Msg: ${n.message}`));
        }

    } catch (err: any) {
        console.error('TEST 1 ERROR:', err.response?.data || err.message);
    } finally {
        process.exit(0);
    }
}
runTest1();
