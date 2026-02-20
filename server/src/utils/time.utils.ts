import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { parse, isWithinInterval } from 'date-fns';

/**
 * Checks if the current time in the given timezone falls within the specified quiet hours.
 * 
 * @param timezone The user's timezone (e.g., 'America/New_York')
 * @param start Quiet hours start time in "HH:mm" format (e.g., "22:00")
 * @param end Quiet hours end time in "HH:mm" format (e.g., "08:00")
 * @returns boolean True if current time is within quiet hours, false otherwise.
 */
export const isWithinQuietHours = (timezone: string, start: string, end: string): boolean => {
    try {
        const now = new Date();
        const zonedNow = toZonedTime(now, timezone);

        // Parse start and end times today in the user's timezone
        const startTime = parse(start, 'HH:mm', zonedNow);
        let endTime = parse(end, 'HH:mm', zonedNow);

        // If end time is before start time, quiet hours span across midnight
        if (endTime < startTime) {
            // Check if now is after start time OR before end time
            const startOfToday = new Date(zonedNow);
            startOfToday.setHours(0, 0, 0, 0);

            const endOfToday = new Date(zonedNow);
            endOfToday.setHours(23, 59, 59, 999);

            return isWithinInterval(zonedNow, { start: startTime, end: endOfToday }) ||
                isWithinInterval(zonedNow, { start: startOfToday, end: endTime });
        } else {
            // Standard interval within the same day
            return isWithinInterval(zonedNow, { start: startTime, end: endTime });
        }
    } catch (error) {
        // Fallback: If timezone parsing fails, allow notification to prevent silent failures
        console.error(`Error calculating quiet hours for timezone ${timezone}:`, error);
        return false;
    }
};
