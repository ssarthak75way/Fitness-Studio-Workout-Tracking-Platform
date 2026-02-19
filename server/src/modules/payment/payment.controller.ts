import { Request, Response, NextFunction } from 'express';
import { PaymentModel } from './payment.model.js';
import { AppError } from '../../utils/AppError.js';

export const getMyPaymentsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;

        const payments = await PaymentModel.find({ user: userId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            results: payments.length,
            data: { payments },
        });
    } catch (error) {
        next(error);
    }
};

export const getPaymentDetailsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;
        const { id } = req.params;

        const payment = await PaymentModel.findOne({ _id: id, user: userId });

        if (!payment) {
            return next(new AppError('Payment not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { payment },
        });
    } catch (error) {
        next(error);
    }
};
