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
    certifications?: string[];
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

export interface ClassSession {
    _id: string;
    title: string;
    type: string;
    instructor: User | string;
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
    weight?: number;
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

export interface WorkoutTemplate {
    _id: string;
    name: string;
    description: string;
    category: string;
    difficulty: string;
    exercises: WorkoutExercise[];
    createdBy: string;
    isPublic: boolean;
    createdAt: string;
}

export interface WorkoutAnalytics {
    totalWorkouts: number;
    totalDuration: number;
    averageIntensity?: number;
    muscleGroupDistribution: Record<string, number>;
}
