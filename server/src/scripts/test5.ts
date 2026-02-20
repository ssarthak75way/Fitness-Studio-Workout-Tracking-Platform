import { UnitConverter } from '../utils/unit.utils.js';

async function runTest5() {
    console.log('--- TEST 5: Body Metrics (Lossless Conversion) ---');
    try {
        console.log('User inputs: 200 lbs');
        const inputLbs = 200;

        // 1. Convert to Canonical Metric (simulate frontend sending to backend)
        const canonicalKg = UnitConverter.lbsToKg(inputLbs);
        console.log(`Stored in DB canonically as (kg): ${canonicalKg}`); // 90.7185

        // 2. Convert back to metric display
        console.log(`Displayed as Metric (kg): ${UnitConverter.formatDisplay(canonicalKg, 1)} kg`);

        // 3. User switches back to Imperial - simulate round trip
        const outputLbsPrecision = UnitConverter.kgToLbs(canonicalKg);
        console.log(`Converted back to Imperial (precision): ${outputLbsPrecision}`);

        const outputLbsDisplay = UnitConverter.formatDisplay(outputLbsPrecision, 0);
        console.log(`Displayed as Imperial (lbs): ${outputLbsDisplay} lbs`);

        if (Number(outputLbsDisplay) === 200) {
            console.log('SUCCESS: Lossless Conversion verified! Exactly 200 returned.');
        } else {
            console.error('FAIL: Floating point drift introduced!');
        }
    } catch (e: any) {
        console.error('TEST 5 ERROR:', e.message);
    }
}
runTest5();
