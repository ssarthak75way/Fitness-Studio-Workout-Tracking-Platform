import api from './api';

export const paymentService = {
    getMyPayments: async () => {
        const response = await api.get('/payments/my-payments');
        return response.data;
    },

    getPaymentDetails: async (id: string) => {
        const response = await api.get(`/payments/${id}`);
        return response.data;
    }
};
