import { IMembership, PlanType } from './membership.model.js';
import { differenceInDays, endOfDay, startOfDay } from 'date-fns';

export const PRICING = {
    [PlanType.MONTHLY]: 99,
    [PlanType.ANNUAL]: 999,
    [PlanType.CLASS_PACK_10]: 150,
    [PlanType.CORPORATE]: 0, // Paid externally
};

export const ProrationService = {
    /**
     * Calculates the prorated amount (or credit) for switching from one plan to another.
     * @returns Positive value if a payment is required, negative if a credit remains.
     */
    calculateProration: (current: IMembership, targetType: PlanType): number => {
        const today = new Date();
        const targetPrice = PRICING[targetType];

        // 1. Calculate Unused Value of Current Plan
        let unusedValue = 0;

        if (current.type === PlanType.CLASS_PACK_10) {
            // Class Pack: Credit based on remaining credits
            const totalCredits = 10;
            const remainingCredits = current.creditsRemaining || 0;
            unusedValue = (remainingCredits / totalCredits) * PRICING[PlanType.CLASS_PACK_10];
        } else if (current.type === PlanType.CORPORATE) {
            unusedValue = 0; // Corporate accounts are not individually prorated
        } else {
            // Subscription: Credit based on remaining time
            if (current.endDate) {
                const totalDays = differenceInDays(current.endDate, current.startDate) || 30; // Fallback to 30
                const remainingDays = Math.max(0, differenceInDays(current.endDate, today));
                unusedValue = (remainingDays / totalDays) * PRICING[current.type];
            }
        }

        // 2. Final Price Calculation
        // For upgrades (Monthly -> Annual), we charge the difference
        // For switches (Pack <-> Unlimited), we apply credit
        const amountToCharge = targetPrice - unusedValue;

        // Safety: No negative charges (we don't handle refunds here, just credit/zero charge)
        return Math.max(0, Math.round(amountToCharge * 100) / 100);
    },

    /**
     * Enforces a 30-day cooling period for plan changes to prevent abuse.
     */
    checkCoolingPeriod: (lastChange: Date | undefined): boolean => {
        if (!lastChange) return true;
        const thirtyDaysAgo = differenceInDays(new Date(), lastChange);
        return thirtyDaysAgo >= 30;
    }
};
