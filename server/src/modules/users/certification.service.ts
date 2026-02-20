import { UserModel as User } from './user.model.js';
import { ClassSessionModel } from '../classes/class.model.js';
import { NotificationService } from '../notifications/notification.service.js';
import { BookingModel, BookingStatus } from '../bookings/booking.model.js';
import { addDays, startOfDay, endOfDay } from 'date-fns';

export const CertificationService = {
    /**
     * Enforces instructor certification status by:
     * 1. Sending 30-day warnings for expiring certifications.
     * 2. Auto-removing instructors with expired certifications from future classes.
     * 3. Notifying affected members and suggesting replacements.
     */
    enforceCertifications: async () => {
        const today = startOfDay(new Date());
        const thirtyDaysFromNow = startOfDay(addDays(today, 30));

        // 1. Handle 30-Day Warnings
        const expiringInstructors = await User.find({
            role: 'INSTRUCTOR',
            certifications: {
                $elemMatch: {
                    expiryDate: { $gte: thirtyDaysFromNow, $lt: addDays(thirtyDaysFromNow, 1) }
                }
            }
        });

        for (const instructor of expiringInstructors) {
            const expiringCerts = instructor.certifications?.filter(c =>
                startOfDay(c.expiryDate).getTime() === thirtyDaysFromNow.getTime()
            ) || [];

            for (const cert of expiringCerts) {
                await NotificationService.createNotification(
                    instructor._id.toString(),
                    'CERT_EXPIRY',
                    `Proactive Warning: Your certification "${cert.name}" expires in 30 days (${cert.expiryDate.toLocaleDateString()}). Please renew it to avoid being removed from your future classes.`
                );
            }
        }

        // 2. Handle Expired Certifications
        const instructorsWithExpiredCerts = await User.find({
            role: 'INSTRUCTOR',
            certifications: {
                $elemMatch: {
                    expiryDate: { $lt: today }
                }
            }
        });

        const results = {
            instructorsProcessed: instructorsWithExpiredCerts.length,
            classesAffected: 0,
            notificationsSent: 0
        };

        for (const instructor of instructorsWithExpiredCerts) {
            // Find classes for this instructor in the future
            const futureClasses = await ClassSessionModel.find({
                instructor: instructor._id,
                startTime: { $gte: today },
                isCancelled: false
            }).populate('studio');

            for (const session of futureClasses) {
                // Clear instructor
                session.instructor = undefined;
                await session.save();
                results.classesAffected++;

                // Notify Instructor
                await NotificationService.createNotification(
                    instructor._id.toString(),
                    'CERT_EXPIRY',
                    `Enforcement Alert: Your certification has expired. You have been removed from your class "${session.title}" on ${session.startTime.toLocaleDateString()}.`
                );

                // Find and Notify Booked Members
                const bookings = await BookingModel.find({
                    classSession: session._id,
                    status: { $in: [BookingStatus.CONFIRMED, BookingStatus.WAITLISTED] }
                });

                const memberIds = bookings.map(b => b.user.toString());
                if (memberIds.length > 0) {
                    // Find candidates for replacement at the same studio
                    const replacementCandidates = await User.find({
                        role: 'INSTRUCTOR',
                        _id: { $ne: instructor._id },
                        isActive: true,
                        // Optimization: Could check specialties here if session had a 'requiredSpecialty'
                    });

                    // Basic candidate filtering (at least one valid cert)
                    const validCandidates = replacementCandidates.filter(cand =>
                        cand.certifications?.some(c => c.expiryDate >= today)
                    );

                    // Find a candidate who is NOT busy during this class time
                    let suggestedReplacement = "a different elite instructor";
                    for (const cand of validCandidates) {
                        const conflict = await ClassSessionModel.findOne({
                            instructor: cand._id,
                            isCancelled: false,
                            $or: [
                                { startTime: { $lt: session.endTime }, endTime: { $gt: session.startTime } }
                            ]
                        });

                        if (!conflict) {
                            suggestedReplacement = cand.fullName;
                            break;
                        }
                    }

                    await NotificationService.sendBulkNotification(
                        memberIds,
                        'CLASS_CANCELLED', // Using existing type for "Instructor changed/cancelled" notification
                        `Update: The instructor for "${session.title}" on ${session.startTime.toLocaleDateString()} has been updated. We recommend checking out ${suggestedReplacement} as a great alternative!`,
                        session._id.toString()
                    );
                    results.notificationsSent += memberIds.length;
                }
            }
        }

        return results;
    }
};
