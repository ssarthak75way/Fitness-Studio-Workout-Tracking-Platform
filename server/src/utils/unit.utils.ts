/**
 * High-precision constants and methods for lossless unit conversion.
 * Storing in canonical Metric (kg, cm) and converting for display/UI.
 */

export const UNIT_CONSTANTS = {
    // Use high-precision constants to minimize drift
    KG_TO_LBS: 2.2046226218488,
    CM_TO_IN: 0.39370078740157,
};

export const UnitConverter = {
    // Weight: KG <-> LBS
    kgToLbs: (kg: number): number => {
        return Number((kg * UNIT_CONSTANTS.KG_TO_LBS).toFixed(4));
    },
    lbsToKg: (lbs: number): number => {
        return Number((lbs / UNIT_CONSTANTS.KG_TO_LBS).toFixed(4));
    },

    // Distance: CM <-> IN
    cmToIn: (cm: number): number => {
        return Number((cm * UNIT_CONSTANTS.CM_TO_IN).toFixed(4));
    },
    inToCm: (inches: number): number => {
        return Number((inches / UNIT_CONSTANTS.CM_TO_IN).toFixed(4));
    },

    /**
     * Safe rounding to avoid UI jitter while maintaining precision in round-trips.
     * We store with 4 decimal places in the object but usually display 1 or 2.
     */
    formatDisplay: (value: number, decimals: number = 1): string => {
        return value.toFixed(decimals);
    }
};
