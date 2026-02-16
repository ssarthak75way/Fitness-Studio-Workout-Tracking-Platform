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

    checkIn: async (qrCode: string) => {
        const response = await api.post('/bookings/check-in', { qrCode });
        return response.data;
    },
};
