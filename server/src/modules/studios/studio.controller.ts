import { Request, Response, NextFunction } from 'express';
import { StudioModel } from './studio.model.js';
import { AppError } from '../../utils/AppError.js';

export const createStudioHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const studio = await StudioModel.create(req.body);
        res.status(201).json({
            status: 'success',
            data: { studio },
        });
    } catch (error) {
        next(error);
    }
};

export const getAllStudiosHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const studios = await StudioModel.find({ isActive: true });
        res.status(200).json({
            status: 'success',
            results: studios.length,
            data: { studios },
        });
    } catch (error) {
        next(error);
    }
};

export const getStudioByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const studio = await StudioModel.findById(req.params.id);
        if (!studio) {
            return next(new AppError('Studio not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: { studio },
        });
    } catch (error) {
        next(error);
    }
};

export const updateStudioHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const studio = await StudioModel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!studio) {
            return next(new AppError('Studio not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: { studio },
        });
    } catch (error) {
        next(error);
    }
};

export const deleteStudioHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const studio = await StudioModel.findByIdAndUpdate(req.params.id, { isActive: false });
        if (!studio) {
            return next(new AppError('Studio not found', 404));
        }
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

export const getReconciliationReportHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const studioId = req.params.id;

        // Date range from query params, default to current month
        const now = new Date();
        const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : defaultStart;
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : now;
        endDate.setHours(23, 59, 59, 999); // include full end day

        const { ReconciliationLogModel } = await import('./reconciliation-log.model.js');
        const { PaymentModel, PaymentStatus } = await import('../payment/payment.model.js');
        const { ClassSessionModel } = await import('../classes/class.model.js');
        const { BookingModel, BookingStatus } = await import('../bookings/booking.model.js');

        // ── 1. GROSS REVENUE: all successful payments within the period ──────────
        // We associate payments by members who booked at least one class at this studio.
        // For simplicity (no direct studio link on Payment), we sum ALL successful payments
        // in the period and attribute equally per studio. A production system would link
        // via a studioId on payment. Here we compute studio-level revenue from bookings.
        const bookedUserIds = await BookingModel.distinct('user', {
            classSession: {
                $in: await ClassSessionModel.distinct('_id', { studio: studioId })
            },
            status: { $in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
        });

        const successfulPayments = await PaymentModel.find({
            user: { $in: bookedUserIds },
            status: PaymentStatus.SUCCESS,
            createdAt: { $gte: startDate, $lte: endDate },
        });

        const totalRevenue = successfulPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        // ── 2. INSTRUCTOR PAYOUT BREAKDOWN ────────────────────────────────────────
        // Find all class sessions at this studio in the period
        const sessions = await ClassSessionModel.find({
            studio: studioId,
            startTime: { $gte: startDate, $lte: endDate },
            instructor: { $ne: null },
        }).populate('instructor', 'fullName');

        // Group by instructor
        const instructorMap = new Map<string, { name: string; sessions: number; payment: number }>();
        const INSTRUCTOR_PAY_PER_SESSION = 400; // ₹400 per session (platform constant)

        for (const session of sessions) {
            if (!session.instructor) continue;
            const inst = session.instructor as unknown as { _id: { toString(): string }; fullName: string };
            const key = inst._id.toString();
            if (!instructorMap.has(key)) {
                instructorMap.set(key, { name: inst.fullName, sessions: 0, payment: 0 });
            }
            const entry = instructorMap.get(key)!;
            entry.sessions += 1;
            entry.payment += INSTRUCTOR_PAY_PER_SESSION;
        }

        const breakdown = Array.from(instructorMap.values()).map(e => ({
            instructor: e.name,
            sessions: e.sessions,
            payment: e.payment,
        }));

        const instructorShare = breakdown.reduce((sum, b) => sum + b.payment, 0);
        const netRevenue = totalRevenue - instructorShare;

        // ── 3. CROSS-LOCATION RECONCILIATION ─────────────────────────────────────
        const [payables, receivables] = await Promise.all([
            ReconciliationLogModel.find({
                homeStudio: studioId,
                createdAt: { $gte: startDate, $lte: endDate },
            }).populate('hostStudio', 'name').populate('user', 'fullName email'),
            ReconciliationLogModel.find({
                hostStudio: studioId,
                createdAt: { $gte: startDate, $lte: endDate },
            }).populate('homeStudio', 'name').populate('user', 'fullName email'),
        ]);

        const totalPayable = payables.reduce((sum, l) => sum + l.amount, 0);
        const totalReceivable = receivables.reduce((sum, l) => sum + l.amount, 0);

        // ── 4. STUDIO INFO ────────────────────────────────────────────────────────
        const studio = await StudioModel.findById(studioId, 'name');

        res.status(200).json({
            status: 'success',
            data: {
                report: {
                    studio: { _id: studioId, name: studio?.name || '' },
                    period: {
                        start: startDate.toISOString(),
                        end: endDate.toISOString(),
                    },
                    totalRevenue,
                    instructorShare,
                    netRevenue,
                    breakdown,
                    crossLocation: {
                        totalPayable,
                        totalReceivable,
                        netBalance: totalReceivable - totalPayable,
                        payables,
                        receivables,
                    },
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

