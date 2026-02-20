export type UserRole = 'STUDIO_ADMIN' | 'INSTRUCTOR' | 'MEMBER';

export const UserRole = {
    STUDIO_ADMIN: 'STUDIO_ADMIN' as UserRole,
    INSTRUCTOR: 'INSTRUCTOR' as UserRole,
    MEMBER: 'MEMBER' as UserRole,
};

export interface User {
    _id: string;
    email: string;
    fullName: string;
    role: UserRole;
    profileImage?: string;
    bio?: string;
    specialties?: string[];
    certifications?: Array<{ name: string; expiryDate: string }>;

    averageRating?: number;
    totalRatings?: number;
    unitPreference: 'METRIC' | 'IMPERIAL';
    timezone?: string;
    notificationPreferences?: {
        category: 'CLASS_REMINDER' | 'CLASS_CANCELLED' | 'WAITLIST_NOTIFICATION' | 'PROMOTION' | 'BOOKING_CONFIRMATION' | 'IMPERSONATION_STARTED' | 'CERT_EXPIRY';
        quietHoursStart: string;
        quietHoursEnd: string;
        enabled: boolean;
    }[];
    isActive?: boolean;
    createdAt: string;
}



export interface ApiResponse<T> {
    status: 'success' | 'fail' | 'error';
    message?: string;
    data: T;
    token?: string;
}

export interface AuthResponse {
    user: User;
}

export interface Studio {
    _id: string;
    name: string;
    address: string;
    description?: string;
    isActive?: boolean;
}

export interface ClassSession {
    _id: string;
    title: string;
    description?: string;
    type: string;
    instructor?: User | string; // Optional for gaps
    instructorId?: string; // For updates
    studio: Studio | string;
    studioId?: string; // For updates
    startTime: string;
    endTime: string;
    capacity: number;
    enrolledCount: number;
    location: string;
    recurrence?: string;
}



export interface Booking {
    _id: string;
    user: string | User;
    classSession: string | ClassSession;
    status: 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED' | 'CHECKED_IN';
    bookedAt: string;
    qrCode?: string;
    qrCodeUrl?: string;
}

export interface WorkoutSet {
    reps: number;
    weight: number;
    duration?: number;
}

export interface WorkoutExercise {
    name: string;
    sets: WorkoutSet[];
}

export interface WorkoutLog {
    _id: string;
    user: string;
    title: string;
    exercises: WorkoutExercise[];
    duration?: number;
    date: string;
}

export interface DashboardStats {
    upcomingBookings?: Booking[];
    recentWorkouts?: WorkoutLog[];
    totalWorkouts?: number;
    workoutStreak?: number;
    todaysClasses?: ClassSession[];
    upcomingClasses?: ClassSession[];
    totalClasses?: number;
    averageRating?: number | string;
    totalUsers?: number;
    totalMembers?: number;
    totalInstructors?: number;
    totalBookings?: number;
    recentUsers?: User[];
}

export interface BodyMetric {
    _id: string;
    user: string;
    weight?: number;
    height?: number;
    bodyFatPercentage?: number;
    measurements?: {
        neck?: number;
        chest?: number;
        waist?: number;
        hips?: number;
        biceps?: number;
        thighs?: number;
    };
    date: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Membership {
    _id: string;
    user: string;
    type: string;
    startDate: string;
    endDate?: string;
    isActive: boolean;
    creditsRemaining?: number;
}

export interface Notification {
    _id: string;
    user: string;
    type: 'CLASS_REMINDER' | 'CLASS_CANCELLED' | 'WAITLIST_NOTIFICATION' | 'PROMOTION' | 'BOOKING_CONFIRMATION';
    message: string;
    isRead: boolean;
    relatedClass?: string;
    createdAt: string;
}
export interface Rating {
    _id: string;
    user: string | User;
    targetType: 'CLASS' | 'INSTRUCTOR';
    targetId: string;
    rating: number;
    review?: string;
    createdAt: string;
}

export interface RatingResponse {
    ratings: Rating[];
    trimmedMean: string;
    distribution: { [key: number]: number };
    canReview: boolean;
}

export interface TemplateExercise {
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    notes?: string;
}

export interface WorkoutTemplate {
    _id: string;
    name: string;
    description: string;
    category: string;
    difficulty: string;
    exercises: TemplateExercise[];
    createdBy: string;
    reps?: number;
    weight?: number;
    isPublic: boolean;
    createdAt: string;
}

export interface PersonalRecord {
    weight: number;
    reps: number;
    date: string;
}

export interface WorkoutAnalytics {
    volumeHistory: Array<{ date: string; volume: number; name: string }>;
    exerciseProgression: Record<string, Array<{ date: string; weight: number }>>;
    monthlyConsistency: Array<{ month: string; count: number }>;
}

export interface AdvancedAnalytics {
    exerciseName: string;
    current1RM: number;
    rateOfGain: number;
    rSquared: number;
    marginOfError: number;
    isDecelerating: boolean;
    prediction: {
        targetWeight?: number;
        daysToGoal: number | null;
        predictedDate: string | null;
        forecast30Days: number;
        forecast60Days: number;
        forecast90Days: number;
    };
    history: Array<{ date: string; weight: number }>;
}


export interface WorkoutFormValues {
    title: string;
    templateId?: string;
    durationMinutes?: number;
    exercises: {

        name: string;
        sets: {
            reps: number;
            weight: number;
        }[];
        notes?: string;
    }[];
    notes?: string;
}
export interface Payment {
    _id: string;
    user: string | User;
    amount: number;
    currency: string;
    planType: string;
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    razorpayPaymentId?: string;
    razorpayOrderId: string;
    createdAt: string;
    updatedAt: string;
}

export type PhaseType = 'HYPERTROPHY' | 'STRENGTH' | 'PEAKING';

export const PhaseType = {
    HYPERTROPHY: 'HYPERTROPHY' as PhaseType,
    STRENGTH: 'STRENGTH' as PhaseType,
    PEAKING: 'PEAKING' as PhaseType,
} as const;


export interface PeriodizedProgram {
    _id: string;
    user: string;
    startDate: string;
    currentWeek: number;
    phases: {
        type: PhaseType;
        startWeek: number;
        endWeek: number;
    }[];
    isActive: boolean;
}

export interface PlateauResult {

    groupName: string;
    status: 'PLATEAU' | 'INCONSISTENT' | 'PROGRESSING';
    lastExercises: string[];
    maxWeightTrend: number[];
    suggestion?: string;
}

