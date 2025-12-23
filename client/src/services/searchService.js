import api from './api';

export const searchService = {
  searchSkills: async (params = {}) => {
    const response = await api.get('/search/skills', { params });
    return response.data;
  },

  getSuggestions: async () => {
    const response = await api.get('/search/suggestions');
    return response.data;
  },
};
