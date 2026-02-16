import api from './api';
import type { ClassSession, ApiResponse } from '../types';

export const classService = {
    getClasses: async (params?: { startDate?: string; endDate?: string; type?: string }): Promise<ApiResponse<{ classes: ClassSession[] }>> => {
        const response = await api.get('/classes', { params });
        return response.data;
    },

    getClassById: async (id: string): Promise<ApiResponse<{ class: ClassSession }>> => {
        const response = await api.get(`/classes/${id}`);
        return response.data;
    },

    createClass: async (data: Partial<ClassSession>): Promise<ApiResponse<{ class: ClassSession }>> => {
        const response = await api.post('/classes', data);
        return response.data;
    },

    updateClass: async (id: string, data: Partial<ClassSession>): Promise<ApiResponse<{ class: ClassSession }>> => {
        const response = await api.patch(`/classes/${id}`, data);
        return response.data;
    },

    deleteClass: async (id: string): Promise<ApiResponse<void>> => {
        const response = await api.delete(`/classes/${id}`);
        return response.data;
    },
};
