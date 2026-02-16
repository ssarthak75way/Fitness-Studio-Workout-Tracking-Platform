import { Request, Response, NextFunction } from 'express';
import { MembershipModel } from './membership.model.js';
import { AppError } from '../../utils/AppError.js';

export const createMembershipHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, creditsRemaining } = req.body;
        const userId = req.user?._id;

        // Deactivate existing memberships
        await MembershipModel.updateMany(
            { user: userId, isActive: true },
            { isActive: false }
        );

        // Calculate end date for subscriptions
        let endDate;
        if (type === 'MONTHLY') {
            endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);
        } else if (type === 'ANNUAL') {
            endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 1);
        }

        const membership = await MembershipModel.create({
            user: userId,
            type,
            endDate,
            creditsRemaining: type === 'CLASS_PACK_10' ? 10 : undefined,
            isActive: true,
        });

        res.status(201).json({
            status: 'success',
            data: { membership },
        });
    } catch (error) {
        next(error);
    }
};

export const getMembershipHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;
        let membership = await MembershipModel.findOne({ user: userId, isActive: true });

        if (!membership) {
            return res.status(200).json({
                status: 'success',
                data: { membership: null },
            });
        }

        // Check for expiration
        if (membership.endDate && membership.endDate < new Date()) {
            membership.isActive = false;
            await membership.save();
            return res.status(200).json({
                status: 'success',
                data: { membership },
            });
        }

        res.status(200).json({
            status: 'success',
            data: { membership },
        });
    } catch (error) {
        next(error);
    }
};
