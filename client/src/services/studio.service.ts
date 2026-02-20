import api from './api';

export interface Studio {
    _id: string;
    name: string;
    address: string;
    description?: string;
}

export interface ReconciliationReport {
    studio: { _id: string; name: string };
    period: { start: string; end: string };
    totalRevenue: number;
    instructorShare: number;
    netRevenue: number;
    breakdown: Array<{
        instructor: string;
        sessions: number;
        payment: number;
    }>;
    crossLocation?: {
        totalPayable: number;
        totalReceivable: number;
        netBalance: number;
    };
}

export const studioService = {
    getStudios: async () => {
        const response = await api.get('/studios');
        return response.data;
    },
    getStudio: async (id: string) => {
        const response = await api.get(`/studios/${id}`);
        return response.data;
    },
    getReconciliation: async (studioId: string, startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await api.get(`/studios/${studioId}/reconciliation?${params.toString()}`);
        return response.data;
    }
};
