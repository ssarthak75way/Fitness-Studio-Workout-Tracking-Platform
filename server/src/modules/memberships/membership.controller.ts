import { Request, Response, NextFunction } from 'express';
import { MembershipModel } from './membership.model.js';
import { PaymentModel, PaymentStatus } from '../payment/payment.model.js';
import { AppError } from '../../utils/AppError.js';

import { RazorpayService } from '../payment/razorpay.service.js';

export const createMembershipOrderHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;

        let amount = 0;
        if (type === 'MONTHLY') amount = 9;
        else if (type === 'ANNUAL') amount = 99;
        else if (type === 'CLASS_PACK_10') amount = 50;
        else throw new AppError('Invalid plan type', 400);

        const order = await RazorpayService.createOrder(amount);

        res.status(200).json({
            status: 'success',
            data: { order, key: process.env.RAZORPAY_KEY_ID },
        });
    } catch (error) {
        next(error);
    }
};

export const verifyMembershipPaymentHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type } = req.body;
        const userId = req.user?._id;

        // 1. Verify Signature
        RazorpayService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        // 2. Deactivate existing memberships
        await MembershipModel.updateMany(
            { user: userId, isActive: true },
            { isActive: false }
        );

        // 3. Calculate end date
        let endDate;
        if (type === 'MONTHLY') {
            endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);
        } else if (type === 'ANNUAL') {
            endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 1);
        }

        // 4. Create Active Membership
        const membership = await MembershipModel.create({
            user: userId,
            type,
            endDate,
            creditsRemaining: type === 'CLASS_PACK_10' ? 10 : undefined,
            isActive: true,
            paymentId: razorpay_payment_id,
            paymentOrderId: razorpay_order_id,
        });

        // 5. Create Payment Record
        let amount = 0;
        if (type === 'MONTHLY') amount = 9;
        else if (type === 'ANNUAL') amount = 99;
        else if (type === 'CLASS_PACK_10') amount = 50;

        await PaymentModel.create({
            user: userId,
            amount,
            planType: type,
            status: PaymentStatus.SUCCESS,
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
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
