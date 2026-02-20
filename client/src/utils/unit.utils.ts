/**
 * High-precision constants and methods for lossless unit conversion.
 * Mirrors the server-side utility for consistency.
 */

export const UNIT_CONSTANTS = {
    KG_TO_LBS: 2.2046226218488,
    CM_TO_IN: 0.39370078740157,
};

export type UnitSystem = 'METRIC' | 'IMPERIAL';

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

    formatDisplay: (value: number, decimals: number = 1): string => {
        return value.toFixed(decimals);
    },

    // Helper to convert a whole metric object based on preferred unit
    convertValue: (value: number, type: 'WEIGHT' | 'MEASUREMENT', toUnit: UnitSystem): number => {
        if (toUnit === 'METRIC') return value; // Already metric in DB
        if (type === 'WEIGHT') return UnitConverter.kgToLbs(value);
        return UnitConverter.cmToIn(value);
    },

    // Helper to convert input back to metric for DB storage
    toMetric: (value: number, type: 'WEIGHT' | 'MEASUREMENT', fromUnit: UnitSystem): number => {
        if (fromUnit === 'METRIC') return value;
        if (type === 'WEIGHT') return UnitConverter.lbsToKg(value);
        return UnitConverter.inToCm(value);
    }
};
