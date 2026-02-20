import api from './api';

export interface Studio {
    _id: string;
    name: string;
    address: string;
    description?: string;
}

export const studioService = {
    getStudios: async () => {
        const response = await api.get('/studios');
        return response.data;
    },
    getStudio: async (id: string) => {
        const response = await api.get(`/studios/${id}`);
        return response.data;
    }
};
