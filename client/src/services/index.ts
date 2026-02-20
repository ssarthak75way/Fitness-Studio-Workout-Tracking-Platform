import api from './api';
import type {
    ApiResponse, User,
    Booking, DashboardStats, BodyMetric, Membership,
    Notification, Rating, WorkoutTemplate, WorkoutLog,
    AdvancedAnalytics, PeriodizedProgram,
    PlateauResult,
    WorkoutAnalytics,
    PersonalRecord
} from '../types';


export const dashboardService = {
    getDashboardStats: async (): Promise<ApiResponse<{ stats: DashboardStats }>> => {
        const response = await api.get('/dashboard');
        return response.data;
    },
};

export const metricsService = {
    addBodyMetrics: async (data: Partial<BodyMetric>): Promise<ApiResponse<{ metrics: BodyMetric[] }>> => {
        const response = await api.post('/metrics', data);
        return response.data;
    },

    getBodyMetrics: async (): Promise<ApiResponse<{ metrics: BodyMetric[] }>> => {
        const response = await api.get('/metrics');
        return response.data;
    },
};

export const membershipService = {
    createOrder: async (type: string): Promise<ApiResponse<{ order: any; key: string }>> => {
        const response = await api.post('/memberships/create-order', { type });
        return response.data;
    },

    verifyPayment: async (data: any): Promise<ApiResponse<{ membership: Membership }>> => {
        const response = await api.post('/memberships/verify-payment', data);
        return response.data;
    },

    changePlan: async (type: string): Promise<ApiResponse<{ order?: any; key?: string; membership?: Membership; amount?: number }>> => {
        const response = await api.post('/memberships/change-plan', { type });
        return response.data;
    },

    getMyMembership: async (): Promise<ApiResponse<{ membership: Membership }>> => {
        const response = await api.get('/memberships/my-membership');
        return response.data;
    },
};


export const ratingService = {
    submitRating: async (data: { targetType: string; targetId: string; rating: number; review?: string }): Promise<ApiResponse<{ rating: Rating }>> => {
        const response = await api.post('/ratings', data);
        return response.data;
    },

    getRatings: async (targetType: string, targetId: string): Promise<ApiResponse<{ ratings: Rating[]; averageRating: string }>> => {
        const response = await api.get('/ratings', { params: { targetType, targetId } });
        return response.data;
    },
};

export const workoutService = {
    logWorkout: async (data: Partial<WorkoutLog>): Promise<ApiResponse<{ workout: WorkoutLog }>> => {
        const response = await api.post('/workouts', data);
        return response.data;
    },

    getWorkoutHistory: async (): Promise<ApiResponse<{ workouts: WorkoutLog[] }>> => {
        const response = await api.get('/workouts/history');
        return response.data;
    },

    getPersonalRecords: async (): Promise<ApiResponse<{ records: Record<string, PersonalRecord> }>> => {
        const response = await api.get('/workouts/records');
        return response.data;
    },

    getWorkoutStreak: async (): Promise<ApiResponse<{ streak: number }>> => {
        const response = await api.get('/workouts/streak');
        return response.data;
    },
    getWorkoutTemplates: async (): Promise<ApiResponse<{ templates: WorkoutTemplate[] }>> => {
        const response = await api.get('/workouts/templates');
        return response.data;
    },
    getWorkoutAnalytics: async (): Promise<ApiResponse<{ analytics: WorkoutAnalytics }>> => {
        const response = await api.get('/workouts/analytics');
        return response.data;
    },
    getPlateaus: async (): Promise<ApiResponse<{ plateaus: PlateauResult[] }>> => {
        const response = await api.get('/workouts/plateaus');
        return response.data;
    },
    initiateProgram: async (): Promise<ApiResponse<{ program: any }>> => {
        const response = await api.post('/workouts/periodization/initiate');
        return response.data;
    },
    getActiveProgram: async (): Promise<ApiResponse<{ program: PeriodizedProgram }>> => {
        const response = await api.get('/workouts/periodization/active-program');
        return response.data;
    },

    getAdvancedAnalytics: async (exercise: string, targetWeight?: number): Promise<ApiResponse<{ analytics: AdvancedAnalytics }>> => {
        const response = await api.get(`/workouts/analytics/advanced/${exercise}`, {
            params: { targetWeight }
        });
        return response.data;
    },
    getSuggestedWeights: async (templateId: string): Promise<ApiResponse<{ suggestions: any }>> => {

        const response = await api.get(`/workouts/periodization/suggested-weights/${templateId}`);
        return response.data;
    },
};



export const notificationService = {
    getNotifications: (): Promise<ApiResponse<{ notifications: Notification[] }>> => api.get('/notifications').then(res => res.data),
    markAsRead: (id: string): Promise<ApiResponse<{ notification: Notification }>> => api.patch(`/notifications/${id}/read`).then(res => res.data),
    markAllAsRead: (): Promise<ApiResponse<{ message: string }>> => api.patch('/notifications/mark-all-read').then(res => res.data),
};

export const instructorService = {
    getInstructors: async (): Promise<ApiResponse<{ instructors: User[] }>> => {
        const response = await api.get('/users/instructors');
        return response.data;
    },
};

export const bookingService = {
    createBooking: async (classId: string): Promise<ApiResponse<{ booking: Booking }>> => {
        const response = await api.post('/bookings', { classSessionId: classId });
        return response.data;
    },
    getUserBookings: async (): Promise<ApiResponse<{ bookings: Booking[] }>> => {
        const response = await api.get('/bookings');
        return response.data;
    },
    cancelBooking: async (bookingId: string): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.patch(`/bookings/${bookingId}/cancel`);
        return response.data;
    },
    checkIn: async (qrCode: string): Promise<ApiResponse<{ booking: Booking }>> => {
        const response = await api.post('/bookings/check-in', { qrCode });
        return response.data;
    },
};

export * from './studio.service';

