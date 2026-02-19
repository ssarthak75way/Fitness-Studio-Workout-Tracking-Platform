import api from './api';
import type { ApiResponse, AuthResponse } from '../types';

export const authService = {
    register: async (data: { email: string; password: string; fullName: string; role?: string }): Promise<ApiResponse<{ user: AuthResponse['user'] }>> => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    login: async (email: string, password: string): Promise<ApiResponse<{ user: AuthResponse['user'] }>> => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    getProfile: async (): Promise<ApiResponse<{ user: AuthResponse['user'] }>> => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    updateProfile: async (data: Partial<{ fullName: string; bio: string; specialties: string[]; certifications: string[] }>): Promise<ApiResponse<{ user: AuthResponse['user'] }>> => {
        const response = await api.patch('/users/profile', data);
        return response.data;
    },
    uploadProfileImage: async (file: File): Promise<ApiResponse<{ user: AuthResponse['user']; filePath: string }>> => {
        const formData = new FormData();
        formData.append('profileImage', file);
        const response = await api.post('/users/profile-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};
