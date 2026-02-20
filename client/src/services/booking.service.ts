import api from './api';

export const bookingService = {
    createBooking: async (classSessionId: string) => {
        const response = await api.post('/bookings', { classSessionId });
        return response.data;
    },

    getMyBookings: async () => {
        const response = await api.get('/bookings/my-bookings');
        return response.data;
    },

    cancelBooking: async (id: string) => {
        const response = await api.patch(`/bookings/${id}/cancel`);
        return response.data;
    },

    checkIn: async (qrCode: string, location?: { lat: number; lng: number }, override: boolean = false) => {
        const response = await api.post('/bookings/check-in', {
            qrCode,
            lat: location?.lat,
            lng: location?.lng,
            override
        });
        return response.data;
    },

    getClassBookings: async (classSessionId: string) => {
        const response = await api.get(`/bookings/class/${classSessionId}`);
        return response.data;
    },

    manualCheckIn: async (id: string) => {
        const response = await api.post(`/bookings/${id}/manual-check-in`);
        return response.data;
    },
};
